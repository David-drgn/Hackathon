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

const sendMessage = async (chatMessages, chatId, options = undefined) => {
  try {
    const client = sessions.get("bot");

    let chatRes = await Chat.chatBot(chatMessages);

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
          messageOut = await client.sendMessage(
            chatId,
            `Olá ${getter.name}`,
            options
          );
          chatMessage[chatId].push({
            role: "system",
            content: `Olá ${getter.name} (Agora você tem o cadastro, não peça o CPF novamente, PULE PARA A PRÓXIMA ETAPA QUE É VER O TIPO DA CONSULTA) \n\nQual seria o tipo da consulta que deseja?`,
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

chat.post("/request", async (req, res) => {
  try {
    const chat = await Chat.chatQuery(req.body.question);
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

chat.get("", async (req, res) => {
  res.json({ chatMessage });
});

// http://localhost:3000/client/sendMessage/bot

chat.post("/realize", async (req, res) => {
  const { sessionId, dataType, data } = req.body;

  if (
    sessionId == "bot" &&
    dataType == "message_create" &&
    data.message.type == "chat" &&
    data.message.to == "5511994844038@c.us" && // APENAS O DAVID
    data.message.from == "5511994844038@c.us" && // APENAS O DAVID
    !data.message.from.includes("@g.us")
  ) {
    if (
      chatMessage[data.message.from] &&
      chatMessage[data.message.from][chatMessage[data.message.from].length - 1]
        .role == "system"
    ) {
      console.log("Bot falando");
    } else {
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

            1° Caso tenha: Pule para o próximo estágio que é o de pedir o tipo da consulta; Caso ainda não tenha o seu cadastro: Peça o Cpf do requerente (assim que receber verifique o cpf e responda com: caso o cpf seja válido 'CPF VÁLIDO - cpf que foi validado no formato correto do CPF' somente e não pule para a próxima etapa, caso não seja válido peça para digitar um CPF válido)
            2° Tipo da consulta
            3° Data
            4° Achamos essas datas: (Escreva exatamente assim)
            
            Peça isso sempre na ordem apresentada

            exemplo:

            chat: Por favor, me informe o seu email
            usuario: fornece email

            chat: Agora, me mande a sua senha
            usuario: Manda a senha
          `,
        });

        chatMessage[data.message.from].push({
          role: "user",
          content: data.message.body,
        });
      }
      await sendMessage(chatMessage[data.message.from], data.message.from);
    }
  }

  res.json({
    mesage: "realizado",
  });
});

module.exports = chat;
