require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const http = require("http");
const router = require("./router/router");
const nunjucks = require("nunjucks");
const nunjucksConfig = require("./nunjucks-config");
const { connectToDb } = require("./router/middleware/connectToDb");
const upgradeServerWss = require("./helpers/upgradeServerWss");
const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ noServer: true });
const app = express();
const server = http.createServer(app);

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: nunjucksConfig,
});
app.set("view engine", "njk");
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(connectToDb);
app.use(router);

server.listen(process.env.PORT);

server.on("upgrade", upgradeServerWss);

module.exports.wss = wss;
