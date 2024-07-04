const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const Chat = require("./chatRequest.js");

const chat = express.Router();

chat.use(express.json());
chat.use(cors());
chat.use(bodyParser.json({ limit: "9mb" }));

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

const dados = [];

chat.get("", async (req, res) => {
  res.json(dados);
});

chat.post("/realize", async (req, res) => {
  dados.push(req.body);
  res.json({
    mesage: "realizado",
  });
});

module.exports = chat;
