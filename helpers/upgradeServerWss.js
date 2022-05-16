const { connectToDb } = require("../router/middleware/connectToDb");
const cookie = require("cookie");
const { wss } = require("../socket/wss");

const upgradeServerWss = async (req, socket, head) => {
  await connectToDb(req);

  const cookies = cookie.parse(req.headers["cookie"]);
  const sessionId = cookies?.["sessionId"] || "";

  const session = await req.sessionsCollection.findOne({ sessionId });

  if (!session) {
    socket.write("HTTP/1.1 401 Unauthorized");
    socket.destroy();
    return;
  }

  req.userId = session.userId;
  req.user = { _id: session.userId };

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
};

module.exports = upgradeServerWss;
