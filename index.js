const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const { baseWebhookURL } = require("./src/config");

if (!baseWebhookURL) {
  console.error(
    "BASE_WEBHOOK_URL environment variable is not available. Exiting..."
  );
  process.exit(1); // Terminate the application with an error code
}

require("dotenv").config();

const router = require("./modules/router/router.js");
const chat = require("./modules/chat/chatRoute.js");
const appWhatsapp = require("./src/app");

const { FileExcel, FileDocx } = require("./modules/files/fileParser.js");
const Connect = require("./modules/crm/connect.js");
const Mailler = require("./modules/mail/email.js");
const User = require("./modules/user/user.js");
const Validator = require("./modules/security/documentValidator.js");
const Token = require("./modules/security/token.js");

let verifyEmail = [];

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: "9mb" }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view", "pages"));

async function codeTrigger(select) {
  if (select.type == 1) {
    const connect = await new Connect();
    await connect.initialize();

    const user = await new User(connect.token);
    let response = await user.create(...Object.values(select.new_user));

    if (!response.erro) verifyEmail = verifyEmail.filter((e) => e !== select);

    return response;
  } else if (select.type == 2) {
    // if (!response.erro) verifyEmail = verifyEmail.filter((e) => e !== select);
  }
}

app.use("/", router);
app.use("/chat", chat);
app.use("", appWhatsapp);

app.get("/:code", async (req, res) => {
  var code = req.params.code;
  let select = verifyEmail.find((e) => e.code === code);

  if (!select) {
    return res.redirect("/systemErro?erro=400");
  } else {
    const diferencaEmMilissegundos = new Date(select.createat) - new Date();

    if (diferencaEmMilissegundos > 5 * 60 * 1000) {
      return res.redirect("/systemErro?erro=400");
    } else {
      let code = await codeTrigger(select);
      if (!code.erro) {
        res.cookie("token", login);
        return res.json({
          token: login,
        });
      }
    }
  }
});

app.post("/api/fileConvert", async (req, res) => {
  try {
    const base64 = req.body.base64;
    if (!base64) {
      return res
        .status(400)
        .json({ erro: true, mensagem: "Base64 não fornecido" });
    }

    const pdfBase64 = await new FileExcel().initialize(base64);
    res.json({
      file: pdfBase64,
      erro: false,
    });
  } catch (error) {
    console.error("Erro ao processar o arquivo:", error);
    res.status(500).json({
      erro: true,
      mensagem: "Erro ao processar o arquivo",
    });
  }
});

app.post("/api/validaCPF", async (req, res) => {
  try {
    const valid = await new Validator().validaCpf(req.body.cpf);
    if (valid) res.json(true);
    else res.json(false);
  } catch {
    res.json(false);
  }
});

app.post("/api/sendMail", async (req, res) => {
  try {
    const { email, name, dataUser, type } = req.body;

    const connect = await new Connect();
    await connect.initialize();

    const user = await new User(connect.token);

    const getUser = await user.getByEmail(email);

    const mailer = new Mailler(connect.token);
    if (!getUser && type == 0) {
      const mail = await mailer.sendMail(
        "Código de verificação para a criação da sua conta, lembre que o código só é válido por 5 minutos, após esse tempo, ele será anulado",
        name,
        email,
        "Cadastro",
        "Entrar na sua conta"
      );
      if (mail.erro) {
        return res.redirect("/systemErro?erro=400");
      }
      verifyEmail.push({
        type: 1,
        code: mail.new_code,
        email: mail.new_email,
        new_user: dataUser,
        createat: new Date().toISOString(),
      });
    } else if (type == 1) {
      const mail = await mailer.sendMail(
        "Código de verificação para a mudança de senha, lembre que o código só é válido por 5 minutos, após esse tempo, ele será anulado",
        getUser.name,
        email,
        "Troca de senha",
        "Clique para trocar de senha"
      );
      if (mail.erro) {
        return res.redirect("/systemErro?erro=400");
      }
      verifyEmail.push({
        type: 2,
        code: mail.new_code,
        email: mail.new_email,
        id: getUser.accountid,
        createat: new Date().toISOString(),
      });
    } else {
      return res.redirect("/systemErro?erro=400");
    }
    res.json({
      erro: false,
      message:
        "Código enviado com sucesso!! Verifique a sua caixa de email, lembre que o acesso é permitido apenas após 5 minutos",
    });
  } catch {
    return res.redirect("/systemErro?erro=400");
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password, check } = req.body;

  try {
    const connect = await new Connect();
    await connect.initialize();

    const user = await new User(connect.token);

    const login = await user.login(email, password, check);

    // res.cookie("token", login);
    return res.json({
      token: login,
    });
  } catch (e) {
    return res.redirect("/systemErro?erro=400");
  }
});

app.post("/api/verifyToken", async (req, res) => {
  res.json(await new Token().verifyToken(req.body.token));
});

app.listen(port, () => {
  console.log(`Rodando, porta: ${port}`);
});
