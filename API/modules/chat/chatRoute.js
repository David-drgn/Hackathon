const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const Connect = require("../crm/connect.js");
const Service = require("../service/service.js");

const Chat = require("./chatRequest.js");
const User = require("../user/user.js");

const chat = express.Router();

const { sessions } = require("../../src/sessions");

chat.use(express.json());
chat.use(cors());
chat.use(bodyParser.json({ limit: '20mb' }));

const sendBotMessage = async (message, chatId) => {
  const client = sessions.get("bot");
  try {
    messageOut = await client.sendMessage(chatId, message);
    chatMessage[chatId].push({
      role: "system",
      content: message,
    });
  } catch {
    // messageOut = await client.sendMessage(
    //   chatId,
    //   "Estamos enfrentando um problema, por favor, espere"
    // );
  }
};

const appointmentCreate = (nextValue, id, step) => {
  if (appointments[id]) {
    switch (step) {
      case 1:
        appointments[id].id = nextValue;
        break;
      case 2:
        appointments[id].typeAppointment = nextValue;
        break;
      case 3:
        appointments[id].posibleDate = nextValue;
        break;
      case 4:
        appointments[id].typeService = nextValue;
        break;

      case 4:
        console.log("Concluir agendamento");
        break;
    }
  } else {
    appointments[id] = {};
    appointments[id].id = nextValue;
  }
};

const sendMessage = async (chatMessages, chatId, options = undefined) => {
  try {
    const client = sessions.get("bot");

    let chatRes = await Chat.chatQuery(chatMessages);

    if (chatRes.includes("CPF VÁLIDO")) {
      chatRes = chatRes.split("\n")[0];
      var cpfRequestBot = await Chat.chatQuery(
        `"${chatRes}" Me retorne apenas o cpf dessa frase`
      );
      chatRes = chatRes.split(" - ")[0];
    }

    let messageOut = "";
    switch (chatRes) {
      case "CPF VÁLIDO":
        messageOut = await client.sendMessage(
          chatId,
          "Por favor, espere enquanto a gente verifica o seu cadastro",
          options
        );
        const connect = await new Connect();
        await connect.initialize();
        const user = await new User(connect.token);

        const getter = await user.getByDocument(cpfRequestBot);
        if (getter) {
          delete getter.new_password;
          delete getter.new_salt;
          appointmentCreate(getter.accountid, chatId, 1);
          messageOut = await client.sendMessage(
            chatId,
            await Chat.chatQuery(
              `"Olá
*${getter.name}*
Qual seria o tipo da consulta que deseja realizar? \n\n
Temos as opções:
1. MÉDICO
2. BARBEARIA
3. RESTAURANTE
4. DELIVERY PARA IDOSO
5. FESTAS/EVENTOS

Lembrando que caso você queria cancelar a operação, é apenas avisar com um "Cancelar"

Escolha apenas uma das opções" Quero que você personalize essa mensagem e retorne ela personalizadas na forma de mensagem para whatsapp
            `,
              options
            )
          );
          chatMessage[chatId].push({
            role: "user",
            content: `Por favor, salve essas informações e utilize elas comigo
${JSON.stringify(getter)}
Lembre de sempre deixar anonimo o meu ID
            `,
          });
          chatMessage[chatId].push({
            role: "system",
            content: `Olá, *${getter.name}*

Qual seria o tipo da consulta que deseja realizar?


Temos as opções:
1. MÉDICO
2. BARBEARIA
3. RESTAURANTE
4. DELIVERY PARA IDOSO
5. FESTAS/EVENTOS

0. Cancelar

Escolha apenas uma das opções
            `,
          });
        } else {
          messageOut = await client.sendMessage(
            chatId,
            `Desculpe, porém, não encontramos o seu cadastro, por favor, tente novamente`,
            options
          );
          chatMessage[chatId].push({
            role: "system",
            content: `Desculpe, porém, não encontramos o seu cadastro, por favor, forneça o CPF novamente`,
          });
        }
        break;

      default:
        chatMessage[chatId].push({
          role: "system",
          content: chatRes,
        });

        messageOut = await client.sendMessage(chatId, chatRes, options);
        break;
    }

    return {
      erro: false,
      messageOut,
    };
  } catch {
    return {
      erro: true,
      message: "Bot failure",
    };
  }
};

let chatWeb = {};
chat.post("/request", async (req, res) => {
  try {
    if (chatWeb[req.body.id]) {
      chatWeb[req.body.id].push({
        role: "user",
        content: req.body.question,
      });
    } else {
      chatWeb[req.body.id] = [];

      chatWeb[req.body.id].push({
        role: "system",
        content: `
          Você é o Oswald, sempre se apresente por esse nome e não responda perguntas que não sejam relacionadas ao agendamento de consultas (médicas, em restaurante e etc) ou a informações do usuário
        `,
      });

      chatWeb[req.body.id].push({
        role: "user",
        content: req.body.question,
      });
    }

    const chat = await Chat.chatQuery(chatWeb[req.body.id]);

    chatWeb[req.body.id].push({
      role: "system",
      content: chat,
    });

    res.json({
      erro: false,
      anwser: chat,
    });
  } catch {
    res.json({
      erro: true,
      anwser: "Algo deu errado, por favor, tente novamente",
    });
  }
});

let chatMessage = {};
let appointments = {};

chat.get("", async (req, res) => {
  res.json({ chatMessage });
});

// http://localhost:3000/client/sendMessage/bot

chat.post("/realize", async (req, res) => {
  const { sessionId, dataType, data } = req.body;

  if (
    sessionId == "bot" &&
    dataType == "message" &&
    data.message.type == "chat" &&
    // data.message.to == "5511994844038@c.us" && // APENAS O DAVID
    // data.message.from == "5511994844038@c.us" && // APENAS O DAVID
    !data.message.from.includes("@g.us")
  ) {
    try {
      if (chatMessage[data.message.from]) {
        chatMessage[data.message.from].push({
          role: "user",
          content: data.message.body,
        });
      } else {
        chatMessage[data.message.from] = [];

        chatMessage[data.message.from].push({
          role: "system",
          content: `
              Você é o Oswald, um assistente pessoal para consultas e agendamentos, sempre se apresente por esse nome e não responda perguntas que não sejam relacionadas ao agendamento de reservas, consultas e etc (médicas, em restaurante e etc);
              Você pode tirar dúvidas sobre o sistema, mais especificamente do aplicativo web
              Você tem permissão para responder coisas básicas, como um "Tudo bem?" ou "Como está", sempre diga que está bem e corresponda com um "E você, como está" e não esqueça de responder o bom dia, boa noite e etc, normalmente
  
              TENTE PARECER O MÍNIMO POSSÍVEL UM BOT
  
              dúvidas frequentes (Exemplos): 
  
              - Como mudo a foto de perfil? 
                Resposta: É necessário que o usuário entre na sua conta, entre na aba de *_Configuração{exiba um emoji de configuração}_* e por fim realize a troca clicando na foto atual 
  
              Para agendar uma consulta, será preciso: 
  
              Peça o Cpf do requerente (assim que receber verifique o cpf e responda com: 
              - caso o cpf seja válido: 'CPF VÁLIDO - cpf que foi validado no formato correto do CPF' (SOMENTE ESSA RESPOSTA)
              - caso não seja válido: peça para digitar um CPF válido
              
              Peça isso sempre na ordem apresentada
  
              exemplo:
  
              chat: Por favor, me informe o seu cpf
              usuario: fornece cpf
            `,
        });

        chatMessage[data.message.from].push({
          role: "user",
          content: data.message.body,
        });
      }

      let cacelar = await Chat.chatQuery(
        `Estou insinuando que quero cancelar algo nessa frase? "${data.message.body}" 
        RESPONDA COM SIM OU NÃO 
        Lembre de considerar que caso "${data.message.body}" tenha apenas números uma resposta igual a "Não"`
      );
      if (cacelar.toLowerCase().includes("sim")) {
        sendBotMessage(
          `Muito bem, a sua operação foi cancelada, caso precise de alguma coisa, estarei sempre aqui ${await Chat.chatQuery(
            "Me mande somente um emoji sorrindo carinhosamente"
          )}`,
          data.message.from
        );
        delete appointments[data.message.from];
      } else if (
        appointments[data.message.from] &&
        !appointments[data.message.from].typeAppointment
      ) {
        switch (data.message.body) {
          case "1":
            appointmentCreate("1", data.message.from, 2);
            sendBotMessage(
              await Chat.chatQuery(
                `"Por favor, me forneça uma data que queira seja boa para a consulta \nGostaria de lembrar que não é certeza que tenha alguém disponível para a sua consulta no dia fornecido, porém fornecemos as melhores opções com as datas mais próximas", resuma essa frase e deixe ela mais amigável`
              ),
              data.message.from
            );
            break;

          case "2":
            appointmentCreate("2", data.message.from, 2);
            sendBotMessage(
              "Por favor, me forneça uma data que queira seja boa para a consulta \nGostaria de lembrar que não é certeza que tenha alguém disponível para a sua consulta no dia fornecido, porém fornecemos as melhores opções com as datas mais próximas",
              data.message.from
            );
            break;

          case "3":
            appointmentCreate("3", data.message.from, 2);
            sendBotMessage(
              "Por favor, me forneça uma data que queira seja boa para a consulta \nGostaria de lembrar que não é certeza que tenha alguém disponível para a sua consulta no dia fornecido, porém fornecemos as melhores opções com as datas mais próximas",
              data.message.from
            );
            break;

          case "4":
            appointmentCreate("4", data.message.from, 2);
            sendBotMessage(
              "Por favor, me forneça uma data que queira seja boa para a consulta \nGostaria de lembrar que não é certeza que tenha alguém disponível para a sua consulta no dia fornecido, porém fornecemos as melhores opções com as datas mais próximas",
              data.message.from
            );
            break;

          case "0":
            delete appointments[data.message.from];
            sendBotMessage(
              "A operação foi cancelada com sucesso!! Eu poderia ajudar em algo?",
              data.message.from
            );
            break;

          default:
            sendBotMessage(
              "Nenhuma das opções corresponde as opções fornecidas",
              data.message.from
            );
            break;
        }
      } else if (
        appointments[data.message.from] &&
        !appointments[data.message.from].posibleDate
      ) {
        const chat = await Chat.chatQuery(
          `Separe a data mencionada em ${
            data.message.body
          } e coloque no modelo yyyy-mm-dd e retorne apenas com a data, caso não venha com o ano, considere o ano da data: ${new Date()}`
        );

        if (new Date() > new Date(chat)) {
          sendBotMessage(
            "Desculpa, mas a data fornecida já passou \nPor favor, tente novamente",
            data.message.from
          );
        } else {
          appointmentCreate(new Date(chat), data.message.from, 3);

          const connect = await new Connect();
          await connect.initialize();

          const service = await new Service(connect.token);
          const response = await service.getAll(
            parseInt(appointments[data.message.from].typeAppointment)
          );

          let services = response.map((item) => {
            return {
              new_name: item.new_name,
              new_servicoid: item.new_servicoid,
              new_descricao: item.new_descricao || "Descrição não disponível",
            };
          });

          appointments[data.message.from].servicesOptions = services;

          sendBotMessage("Qual seria o tipo da agenda?", data.message.from);

          let message = await Chat.chatQuery(
            `Forneça uma lista de opções para o cliente, com as seguintes opções: 
            ${JSON.stringify(
              services
            )} Enumere cada coluna e não esqueça de estilizar os campos (Parecendo uma mensagem de whatsapp) e não forneça o new_servicoid de maneira alguma, lembre de avisar para o usuário responder apenas com os números de uma das opções
            `
          );

          sendBotMessage(message, data.message.from);
        }
      } else if (
        appointments[data.message.from] &&
        !appointments[data.message.from].typeService
      ) {
        try {
          if (
            appointments[data.message.from].servicesOptions[
              parseInt(data.message.body) - 1
            ]
          )
            sendBotMessage(
              "Irei verificar os nossos contatos com os requisitos que você selecionou, por favor, espere um pouco",
              data.message.from
            );

          const connect = await new Connect();
          await connect.initialize();
          const user = await new User(connect.token);

          let prestadores = await user.getPrestadorByService(
            appointments[data.message.from].servicesOptions[
              parseInt(data.message.body) - 1
            ].new_servicoid
          );

          prestadores = prestadores.slice(0, 20);

          let message = await Chat.chatQuery(`
            Enumere as opções dentro dos dados selecionados que forneça um horário disponível próximo da data ${
              appointments[data.message.from].posibleDate
            }, CASO TENHA DIAS NA DATA, DÊ PREFERENCIA A ESSES e retorne as agendas disponíveis(agendas do tipo = 1), caso tenha uma agenda do (Agendas do tipo = 2) que interfira na data disponível do prestador, retire esse horário da lista, NÃO A DATA, apenas diga que esse horário está ocupado 
            Faça a lista com horários de 30 em 30 minutos de acordo com as agendas e lembre de colocar o nome do Prestador e Sua descrição
            Faça como se fosse uma mensagem para o Whatsapp e avise para o usuário retribuir apenas com o dia, horário e o nome do prestador, coloque o endereço e também se o prestador atende em domicílio
            Caso não tenha ninguém disponível, avise que não temos horários

            LEMBRE QUE SE O HORÁRIO ESTÁ NO FORMATO 24-HOUR
            
            COLOQUE TODAS AS OPÇÕES DISPONÍVEIS PARA O AGENDAMENTO INCLUSIVE TODOS OS HORÁRIOS DE CADA PRESTADOR (TODOS OS HORÁRIOS)

            COLOQUE OS DIAS DA SEMANA EM PORTUGUÊS

            use esses dados para verificar a agenda dos prestadores: ${JSON.stringify(
              prestadores
            )}
            `);

          appointments[data.message.from].prestadores = prestadores;

          appointments[data.message.from].typeService =
            appointments[data.message.from].servicesOptions[
              parseInt(data.message.body) - 1
            ];
          sendBotMessage(message, data.message.from);
          appointments[data.message.from].lastMessage = message;
        } catch (error) {
          sendBotMessage(
            "Perdão, mas não reconheci a resposta, por favor, tente novamente",
            data.message.from
          );
        }
      } else if (
        appointments[data.message.from] &&
        !appointments[data.message.from].prestadorSelect
      ) {
        try {
          let chatRequest = await Chat.chatQuery(`
            ${appointments[data.message.from].lastMessage}
            
              De acordo com o texto, temos algumas opções

              retire os seguintes dados, da opção que me refiro: ${
                data.message.body
              }
              Caso tenha a opção, separe apenas os dados como: Data (no formato yyyy-mm-dd) , hora (no formato HH:mm) e nome do prestador 
              exemplo: (yyyy-mm-dd HH:mm / Nome do prestador)
              Caso não tenha retorne apenas um NULL
            `);

          if (chatRequest.toLowerCase().includes("null")) {
            sendBotMessage(
              "Perdão, mas não reconheci a resposta, por favor, tente novamente",
              data.message.from
            );
          } else {
            chatRequest = chatRequest.split(" / ");

            let selectPrestador = appointments[
              data.message.from
            ].prestadores.find((e) => e.name === chatRequest[1]);

            appointments[data.message.from].prestadorSelect = selectPrestador;

            appointments[data.message.from].data = `${chatRequest[0]}`;

            if (!selectPrestador.domicilio) {
              appointments[data.message.from].local = selectPrestador.local;

              sendBotMessage(
                "Estamos prontos para realizar o agendamento, os dados abaixo estão corretos?",
                data.message.from
              );

              appointments[data.message.from].end = {
                new_data_agendada: new Date(
                  appointments[data.message.from].data
                ).toISOString(),
                new_dataterminoagenda: new Date(
                  appointments[data.message.from].data
                ).toISOString(), //adicionar mais 30min
                ["new_Cliente@odata.bind"]: `/accounts(${
                  appointments[data.message.from].id
                })`,
                ["new_Prestador@odata.bind"]: `/accounts(${selectPrestador.id})`,
                new_local: appointments[data.message.from].local,
              };

              sendBotMessage(
                `
                ${await Chat.chatQuery(`
                    Envie apenas os dados necessários para o usuário verificar os dados do agendamento por completo, sem dados numéricos e etc
                    Passe em resumo apenas: data de inicio, data de fim, nome do prestador, local, telefone do prestador e email

                    retire esses dados desse JSON: ${JSON.stringify(
                      appointments[data.message.from]
                    )}
                  `)}
                `,
                data.mesage.from
              );
            } else {
              sendBotMessage(data.mesage.from)
            }
          }
        } catch (error) {
          sendBotMessage(
            "Algum erro ocorreu bem na última etapa, perdão pelo erro, vamos tentar novamente",
            data.message.from
          );
          delete appointments[data.message.from];
        }
      } else if (
        appointments[data.message.from] &&
        !appointments[data.message.from].local
      ) {
        sendBotMessage(
          "Estamos analisando o seu agendamento e assim que ele for realizado, iremos enviar uma mensagem",
          data.message.from
        );

        const connect = await new Connect();
        await connect.initialize();
        const user = await new User(connect.token);

        // record: {
        //   new_data_agendada: new Date(datas.dataInicial).toISOString(),
        //   new_dataterminoagenda: new Date(datas.dataFinal).toISOString(),
        //   ["new_Cliente@odata.bind"]: `/accounts(${user.accountid})`,
        //   ["new_Prestador@odata.bind"]: `/accounts(${idPrestador})`,
        //   new_local: document.getElementById("local").value,
        //   new_tipohorario: 2,
        // }

        let response = await user.registerAgenda(
          appointments[data.message.from].end
        );

        if (response.erro) {
          throw new Error("Bad request");
        }

        sendBotMessage(
          "Obrigado pela espera e agradecemos por escolher os nossos serviços, seu agendamento foi realizado",
          data.message.from
        );
      } else {
        await sendMessage(chatMessage[data.message.from], data.message.from);
      }
    } catch (error) {
      sendBotMessage(
        `Desculpa, tive certas dificuldades, poderiamos começar novamente? Meu nome é Oswald, é um prazer ${await Chat.chatQuery(
          "Me mande somente um emoji sorrindo carinhosamente"
        )}`,
        data.message.from
      );
      delete chatMessage[data.message.from];
    }
  }

  res.json({
    mesage: "realizado",
  });
});

module.exports = chat;
