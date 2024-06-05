const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = require("./modules/router/router.js");

const Chat = require("./modules/chat/chatRequest.js");
const Connect = require("./modules/crm/connect.js");
const Mailler = require("./modules/user/email.js");
const User = require("./modules/user/user.js");

const verifyEmail = [];

const app = express();
const port = 3300;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "9mb" }));

app.use("/", router);

app.post("/api/requestChat", async (req, res) => {
  try {
    const chat = await Chat.chatQuery("OI");
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

app.post("/api/verifyEmail", async (req, res) => {
  try {
    const { email, desc, name } = req.body;

    const connect = await new Connect();
    await connect.initialize();

    const user = await new User(connect.token);

    const getUser = await user.getByEmail(email);

    const mailer = new Mailler(connect.token);
    if (!getUser) {
      mailer.sendMail("Código de verificação para a criação da sua conta", name, email, "Cadastro");
    }

    console.log(getUser);
  } catch {}
});

app.listen(port, () => {
  console.log(`Rodando, porta: ${port}`);
});
