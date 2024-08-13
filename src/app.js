require("./routes");
const { restoreSessions } = require("./sessions");
const { routes } = require("./routes");
const app = require("express")();
const bodyParser = require("body-parser");
const { maxAttachmentSize } = require("./config");

// Initialize Express app
app.disable("x-powered-by");

app.use(bodyParser.json({ limit: '20mb' }));

app.use("/", routes);

restoreSessions();

module.exports = app;
