const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const Connect = require("../crm/connect.js");

const Chat = require("./chatRequest.js");
const User = require("../user/user.js");

const chat = express.Router();

const { sessions } = require("../../src/sessions");

chat.use(express.json());
chat.use(cors());
chat.use(bodyParser.json({ limit: "9mb" }));

const sendBotMessage = async (message, chatId) => {
  const client = sessions.get("bot");
  try {
    messageOut = await client.sendMessage(chatId, message);
    chatMessage[chatId].push({
      role: "system",
      content: message,
    });
  } catch {
    messageOut = await client.sendMessage(
      chatId,
      "Estamos enfrentando um problema, por favor, espere"
    );
  }
};

const agendamentoEmAndamentoFunction = (nextValue, id, etapa) => {
  if (agendamentoEmAndamento[id]) {
    switch (etapa) {
      case 1:
        agendamentoEmAndamento[id].id = nextValue;
        break;
      case 2:
        agendamentoEmAndamento[id].tipoConsulta = nextValue;
        break;
      case 3:
        agendamentoEmAndamento[id].dataConsulta = nextValue;
        break;
      case 4:
        console.log("Concluir agendamento");
        break;
    }
  } else {
    agendamentoEmAndamento[id] = {};
    agendamentoEmAndamento[id].id = nextValue;
  }
};

const sendMessage = async (chatMessages, chatId, options = undefined) => {
  try {
    const client = sessions.get("bot");

    let chatRes = await Chat.chatQuery(chatMessages);

    if (chatRes.includes("CPF VÁLIDO")) {
      chatRes = chatRes.split("\n")[0];
      var cpfRequestBot = chatRes.split(" - ")[1];
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
          agendamentoEmAndamentoFunction(getter.accountid, chatId, 1);
          messageOut = await client.sendMessage(
            chatId,
            `Olá
*${getter.name}*
Qual seria o tipo da consulta que deseja realizar? \n\n
Temos as opções:
1. MÉDICO
2. BARBEARIA
3. RESTAURANTE
4. DELIVERY PARA IDOSO
5. FESTAS/EVENTOS

0. Cancelar

Escolha apenas uma das opções
            `,
            options
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
let agendamentoEmAndamento = {};

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
            Você é o Oswald, sempre se apresente por esse nome e não responda perguntas que não sejam relacionadas ao agendamento de consultas (médicas, em restaurante e etc);
            Para agendar uma consulta, será preciso: 

            1° Peça o Cpf do requerente (assim que receber verifique o cpf e responda com: caso o cpf seja válido 'CPF VÁLIDO - cpf que foi validado no formato correto do CPF' somente e pule para a próxima etapa, caso não seja válido peça para digitar um CPF válido)
            2° Tipo da consulta
            3° Data
            4° Achamos essas datas: (Escreva exatamente assim)
            
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

    if (
      agendamentoEmAndamento[data.message.from] &&
      !agendamentoEmAndamento[data.message.from].tipoConsulta
    ) {
      switch (data.message.body) {
        case "1":
          agendamentoEmAndamentoFunction("1", data.message.from, 2);
          sendBotMessage(
            "Por favor, me forneça uma data que queira seja boa para a consulta",
            data.message.from
          );
          break;

        case "2":
          agendamentoEmAndamentoFunction("2", data.message.from, 2);
          sendBotMessage(
            "Por favor, me forneça uma data que queira seja boa para a consulta",
            data.message.from
          );
          break;

        case "3":
          agendamentoEmAndamentoFunction("3", data.message.from, 2);
          sendBotMessage(
            "Por favor, me forneça uma data que queira seja boa para a consulta",
            data.message.from
          );
          break;

        case "4":
          agendamentoEmAndamentoFunction("4", data.message.from, 2);
          sendBotMessage(
            "Por favor, me forneça uma data que queira seja boa para a consulta",
            data.message.from
          );
          break;

        case "0":
          delete agendamentoEmAndamento[data.message.from];
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
      agendamentoEmAndamento[data.message.from] &&
      !agendamentoEmAndamento[data.message.from].dataConsulta
    ) {
      const chat = await Chat.chatQuery(
        `Separe a data mencionada em ${
          data.message.body
        } e coloque no modelo yyyy-mm-dd e retorne apenas com a data, caso não venha com o ano, considere o ano da data: ${new Date()}`
      );

      if(new Date() > new Date(chat)){
        sendBotMessage("Desculpa, mas a data fornecida já passou \nPor favor, tente novamente", data.message.from);
      }
      else{
        
      }
    } else {
      await sendMessage(chatMessage[data.message.from], data.message.from);
    }
  }

  res.json({
    mesage: "realizado",
  });
});

module.exports = chat;
