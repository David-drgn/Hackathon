// router.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const Chat = require("../chat/chatRequest.js");

const router = express.Router();

router.use(express.json());
router.use(cors());
router.use(bodyParser.json({ limit: "9mb" }));

router.get("/", async (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "view", "pages", "index", "index.html")
  );
});

router.get("/home", async (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "view", "pages", "home", "home.html")
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
  "/assets/icon",
  express.static(path.join(__dirname, "..", "..", "view", "assets", "icon"))
);

router.use(
  "/assets/images",
  express.static(path.join(__dirname, "..", "..", "view", "assets", "images"))
);

router.use(
  "/controller",
  express.static(path.join(__dirname, "..", "..", "view", "controller"))
);

router.use(
  "/css",
  express.static(path.join(__dirname, "..", "..", "view", "css"))
);

router.use(
  "/pages",
  express.static(path.join(__dirname, "..", "..", "view", "pages"))
);

router.use(
  "/pages/headers",
  express.static(path.join(__dirname, "..", "..", "view", "pages", "headers"))
);

router.use(
  "/pages/headers/home",
  express.static(
    path.join(__dirname, "..", "..", "view", "pages", "headers", "home")
  )
);

router.use(
  "/pages/headers/main",
  express.static(
    path.join(__dirname, "..", "..", "view", "pages", "headers", "main")
  )
);

router.use(
  "/pages/hero",
  express.static(path.join(__dirname, "..", "..", "view", "pages", "hero"))
);

router.use(
  "/pages/home",
  express.static(path.join(__dirname, "..", "..", "view", "pages", "home"))
);

router.use(
  "/pages/index",
  express.static(path.join(__dirname, "..", "..", "view", "pages", "index"))
);

router.use(
  "/pages/load",
  express.static(path.join(__dirname, "..", "..", "view", "pages", "load"))
);

router.use(
  "/pages/PopUp",
  express.static(path.join(__dirname, "..", "..", "view", "pages", "PopUp"))
);

router.use(
  "/pages/PopUp/dialog",
  express.static(
    path.join(__dirname, "..", "..", "view", "pages", "PopUp", "dialog")
  )
);

router.use(
  "/pages/PopUp/forget",
  express.static(
    path.join(__dirname, "..", "..", "view", "pages", "PopUp", "forget")
  )
);

router.use(
  "/pages/PopUp/login",
  express.static(
    path.join(__dirname, "..", "..", "view", "pages", "PopUp", "login")
  )
);

router.use(
  "/pages/PopUp/register",
  express.static(
    path.join(
      __dirname,
      "..",
      "..",
      "view",
      "pages",
      "PopUp",
      "user",
      "register"
    )
  )
);

router.use(
  "/pages/PopUp/registerEnterprise",
  express.static(
    path.join(
      __dirname,
      "..",
      "..",
      "view",
      "pages",
      "PopUp",
      "enterprise",
      "register"
    )
  )
);

module.exports = router;
