// router.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const Chat = require("../chat/chatRequest.js");

const Token = require("../security/token.js");

const router = express.Router();

router.use(express.json());
router.use(cors());
router.use(bodyParser.json({ limit: "9mb" }));

const acess = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.redirect("/systemErro?erro=401");

  if (!(await new Token().verifyToken(token))) {
    return res.redirect("/systemErro?erro=401");
  }

  next();
};

const logado = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token || !(await new Token().verifyToken(token))) next();
  else return res.redirect("/home");
};

router.get("/", logado, async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "view", "index.html"));
});

router.get("/home", acess, async (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "view", "pages", "homePage.html")
  );
});

router.get("/systemErro", async (req, res) => {
  let erro = req.query.erro;

  let response = await Chat.chatQuery(`
      Quero que você informações deste erro http: ${erro}

      retorne APENAS: 

      POR EXEMPLO: 

      401
      Unauthorized
      A solicitação requer autenticação do usuário.
    `);

  res.render("erroPage", {
    erroCode: response.split("\n")[0],
    erro: response.split("\n")[1],
    message: response.split("\n")[2].split(" ").slice(1).join(" "),
  });
});

router.use(
  "/assets",
  express.static(path.join(__dirname, "..", "..", "view", "assets"))
);

router.use(
  "/css",
  express.static(path.join(__dirname, "..", "..", "view", "css"))
);

router.use(
  "/controller",
  express.static(path.join(__dirname, "..", "..", "view", "controller"))
);

router.use(
  "/pages",
  express.static(path.join(__dirname, "..", "..", "view", "pages"))
);

module.exports = router;
