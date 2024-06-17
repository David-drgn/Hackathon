// router.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const router = express.Router();

router.use(express.json());
router.use(cors());
router.use(bodyParser.json({ limit: "9mb" }));

router.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "view", "index.html"));
});

router.use("/assets", express.static(path.join(__dirname, "..", "..", "view", "assets")));
router.use("/css", express.static(path.join(__dirname, "..", "..", "view", "css")));
router.use("/controller", express.static(path.join(__dirname, "..", "..", "view", "controller")));
router.use("/pages", express.static(path.join(__dirname, "..", "..", "view", "pages")));

module.exports = router;