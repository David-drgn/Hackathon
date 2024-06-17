const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = require("./modules/router/router.js");

const Chat = require("./modules/chat/chatRequest.js");
const Connect = require("./modules/crm/connect.js");
const Mailler = require("./modules/mail/email.js");
const User = require("./modules/user/user.js");

let verifyEmail = [];

const app = express();
const port = 3300;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "9mb" }));

app.use("/", router);

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "view", "index.html"));
});

router.get("/:id", async (req, res) => {
  var id = req.params.id;
  let select = verifyEmail.find((e) => e.id === id);

  if (!select) {
    res.json({
      erro: true,
      message:
        "O código fornecido não existe ou foi excluído, por favor, faça a requisição novamente",
    });
  } else {
    const diferencaEmMilissegundos = new Date(select.createat) - new Date();

    verifyEmail = verifyEmail.filter((e) => e !== select);
    if (diferencaEmMilissegundos > 5 * 60 * 1000) {
      res.json({
        erro: true,
        message:
          "O código fornecido já tem mais de 5 minutos, por favor, faça a requisição do código novamente",
      });
    } else {
      if (select.type == 1) {
        const connect = await new Connect();
        await connect.initialize();

        const user = await new User(connect.token);
        user.create(...Object.values(select.new_user));
      } else if (select.type == 2) {
      }
    }
  }
});

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

app.post("/api/sendMail", async (req, res) => {
  try {
    const { email, name, dataUser } = req.body;

    const connect = await new Connect();
    await connect.initialize();

    const user = await new User(connect.token);

    const getUser = await user.getByEmail(email);

    const mailer = new Mailler(connect.token);
    if (!getUser) {
      const mail = await mailer.sendMail(
        "Código de verificação para a criação da sua conta, lembre que o código só é válido por 5 minutos, após esse tempo, ele será anulado",
        name,
        email,
        "Cadastro",
        "Entrar na sua conta"
      );
      if (mail.erro) {
        res.json({
          erro: true,
          message: "Ocorreu um erro inesperado, tente novamente",
        });
      }
      verifyEmail.push({
        type: 1,
        code: mail.new_code,
        email: mail.new_email,
        id: mail.new_url,
        new_user: dataUser,
        createat: new Date().toISOString(),
      });
    } else {
      const mail = await mailer.sendMail(
        "Código de verificação para a mudança de senha, lembre que o código só é válido por 5 minutos, após esse tempo, ele será anulado",
        name,
        email,
        "Troca de senha",
        "Clique para trocar de senha"
      );
      if (mail.erro) {
        res.json({
          erro: true,
          message: "Ocorreu um erro inesperado, tente novamente",
        });
      }
      verifyEmail.push({
        type: 2,
        code: mail.new_code,
        email: mail.new_email,
        id: mail.new_url,
        createat: new Date().toISOString(),
      });
    }
    res.json({
      erro: false,
      message: "Código enviado com sucesso!!",
    });
  } catch {
    res.json({
      erro: true,
      message: "Ocorreu um erro inesperado, tente novamente",
    });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try{
    const connect = await new Connect();
    await connect.initialize();
  
    const user = await new User(connect.token);
  
    const login = await user.login(email, password);
  
    return res.json({
      erro: false,
      message: "Login realizado com sucesso",
      token: login,
    });
  }
  catch(e){
    return res.json({
      erro: true,
      message: "Login ou senha incorretas",
    });
  }
});

app.listen(port, () => {
  console.log(`Rodando, porta: ${port}`);
});
