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
const Service = require("./modules/service/service.js");
const Validator = require("./modules/security/documentValidator.js");
const Token = require("./modules/security/token.js");
const Plan = require("./modules/plans/plans.js");

let verifyEmail = [];

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(bodyParser.json({ limit: "20mb" }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view", "pages", "erro"));

async function codeTrigger(select) {
  if (select.type == 1) {
    const user = await new User((await getConnect()).token);
    let response = await user.create(...Object.values(select.new_user));

    if (!response.erro) verifyEmail = verifyEmail.filter((e) => e !== select);

    return response;
  } else if (select.type == 2) {
    // if (!response.erro) verifyEmail = verifyEmail.filter((e) => e !== select);
  }
}

async function getConnect() {
  const connect = await new Connect();
  await connect.initialize();
  return connect;
}

async function tokenValid(token) {
  return new Promise(async (resolve, reject) => {
    const validate = await new Token().verifyToken(token);
    if (validate == null) resolve(true);
    resolve(false);
  });
}

app.use("/", router);
app.use("/chat", chat);
app.use("", appWhatsapp);

app.get("/:code", async (req, res) => {
  var code = req.params.code;
  let select = verifyEmail.find((e) => e.code === code);

  if (!select) {
    return res.redirect("/systemErro?erro=401");
  } else {
    const diferencaEmMilissegundos = new Date(select.createat) - new Date();

    if (diferencaEmMilissegundos > 5 * 60 * 1000) {
      return res.redirect("/systemErro?erro=401");
    } else {
      let code = await codeTrigger(select);
      if (!code.erro) {
        return res.json({
          token: code.token,
        });
      } else {
        return res.redirect("/systemErro?erro=401");
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

    if (req.body.type == "excel") {
      const pdfBase64 = await new FileExcel().initialize(base64);
      res.json({
        file: pdfBase64,
        erro: false,
      });
    }
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

    const user = await new User((await getConnect()).token);

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
    const user = await new User((await getConnect()).token);

    const login = await user.login(email, password, check);

    // res.cookie("token", login);
    return res.json({
      token: login,
    });
  } catch (e) {
    return res.redirect("/systemErro?erro=400");
  }
});

app.post("/api/update", async (req, res) => {
  const { userId, token, record } = req.body;
  if (await tokenValid(token)) {
    return res.json({ erro: true, message: "token expires" });
  } else {
    try {
      const user = await new User((await getConnect()).token);
      const response = await user.update(record, userId);
      return res.json({ erro: false, response });
    } catch (e) {
      return res.json({ erro: true });
    }
  }
});

app.post("/api/service/createRelation", async (req, res) => {
  try {
    const service = await new Service((await getConnect()).token);

    const response = await service.createRelation(
      req.body.accountId,
      req.body.serviceId
    );

    return res.json({ response });
  } catch (e) {
    return res.json({ e });
  }
});

app.post("/api/service/deleteRelation", async (req, res) => {
  try {
    const service = await new Service((await getConnect()).token);

    const response = await service.deleteRelation(
      req.body.accountId,
      req.body.serviceId
    );

    return res.json({ response });
  } catch (e) {
    return res.json({ e });
  }
});

app.post("/api/service/get", async (req, res) => {
  const token = req.body.token;
  if (await tokenValid(token)) {
    return res.json({ erro: true, message: "token expires" });
  } else {
    try {
      const service = await new Service((await getConnect()).token);
      const response = await service.getAll();
      return res.json({ erro: false, response });
    } catch (e) {
      return res.json({ erro: true });
    }
  }
});

app.post("/api/service/create", async (req, res) => {
  const token = req.body.token;
  if (await tokenValid(token)) {
    return res.json({ erro: true, message: "token expires" });
  } else {
    try {
      const service = await new Service((await getConnect()).token);
      req.body.record.new_tipodoservico = process.env.WEBSITE;
      const response = await service.create(req.body.record);
      if (response.erro) {
        return res.json({ erro: true });
      } else {
        const relate = await service.createRelation(
          req.body.userId,
          response.newId
        );
        if (relate.erro) {
          return res.json({ erro: true });
        }
        return res.json({ erro: false, response });
      }
    } catch (e) {
      return res.json({ erro: true });
    }
  }
});

app.post("/api/service/getAccounts", async (req, res) => {
  const token = req.body.token;
  const serviceId = req.body.serviceId;
  if (await tokenValid(token)) {
    return res.json({ erro: true, message: "token expires" });
  } else {
    try {
      const user = await new User((await getConnect()).token);
      const response = await user.getPrestadorByService(serviceId);
      return res.json({ erro: false, response });
    } catch (e) {
      return res.json({ erro: true });
    }
  }
});

app.post("/api/events/getByUser", async (req, res) => {
  if (await tokenValid(req.body.token)) {
    return res.json({ erro: true, message: "token expires" });
  } else {
    try {
      const user = await new User((await getConnect()).token);
      const response = await user.getEventsByUserId(req.body.id);
      return res.json({ erro: false, response });
    } catch (e) {
      return res.json({ erro: true });
    }
  }
});

app.post("/api/events/getById", async (req, res) => {
  const token = req.body.token;
  const id = req.body.id;

  if (await tokenValid(token)) {
    return res.json({ erro: true, message: "token expires" });
  } else {
    try {
      const user = await new User((await getConnect()).token);
      const response = await user.getEventsById(id);
      return res.json({ erro: false, response });
    } catch (e) {
      return res.json({ erro: true });
    }
  }
});

app.post("/api/events/livreRegister", async (req, res) => {
  if (await tokenValid(req.body.token)) {
    return res.json({ erro: true, message: "token expires" });
  } else {
    try {
      const user = await new User((await getConnect()).token);

      function subtrairHoras(dataStr, horas) {
        const data = new Date(dataStr); // Cria um objeto Date a partir da string
        data.setUTCHours(data.getUTCHours() - horas); // Subtrai as horas
        return data.toISOString(); // Retorna a data no formato ISO
      }

      req.body.record.new_data_agendada = subtrairHoras(
        req.body.record.new_data_agendada,
        3
      );
      req.body.record.new_dataterminoagenda = subtrairHoras(
        req.body.record.new_dataterminoagenda,
        3
      );

      //   req.body.record.new_data_agendada = new Date("2024-08-21 16:48").toISOString(); // Date Time
      //   req.body.record.new_dataterminoagenda = new Date("2024-08-14 16:48").toISOString(); // Date Time
      //   req.body.record["new_Prestador@odata.bind"] = "/accounts(e157301c-c84d-ef11-accd-000d3a5cdd3c)"; // Lookup
      //   req.body.record.new_tipohorario = 1; // Choice

      const response = await user.registerAgendaLivre(req.body.record);
      return res.json({ erro: false, response });
    } catch (e) {
      return res.json({ erro: true });
    }
  }
});

app.post("/api/events/agendaRegister", async (req, res) => {
  if (await tokenValid(req.body.token)) {
    return res.json({ erro: true, message: "token expires" });
  } else {
    try {
      const user = await new User((await getConnect()).token);

      function subtrairHoras(dataStr, horas) {
        const data = new Date(dataStr); // Cria um objeto Date a partir da string
        data.setUTCHours(data.getUTCHours() - horas); // Subtrai as horas
        return data.toISOString(); // Retorna a data no formato ISO
      }

      req.body.record.new_data_agendada = subtrairHoras(
        req.body.record.new_data_agendada,
        3
      );
      req.body.record.new_dataterminoagenda = subtrairHoras(
        req.body.record.new_dataterminoagenda,
        3
      );

      const response = await user.registerAgenda(req.body.record);
      return res.json({ erro: false, response });
    } catch (e) {
      return res.json({ erro: true });
    }
  }
});

app.get("/api/getPlan", async (req, res) => {
  try {
    const plan = await new Plan((await getConnect()).token);
    const response = await plan.getAll();
    return res.json({ erro: false, response });
  } catch {
    return res.json({ erro: true });
  }
});

app.post("/api/verifyToken", async (req, res) => {
  res.json(await new Token().verifyToken(req.body.token));
});

app.listen(port, () => {
  console.log(`Rodando, porta: ${port}`);
});
