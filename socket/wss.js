const { response } = require("express");
const { WebSocketServer } = require("ws");
const TimersController = require("../controllers/TimersController");
const WsRestTimersLayer = require("./WsRestTimersLayer");

const wss = new WebSocketServer({ noServer: true });
const timersController = new TimersController();

wss.on("connection", async (ws, req) => {
  const wsTimers = new WsRestTimersLayer(ws);

  await timersController.getTimerList(req, wsTimers.sendAllTimers());

  const timersTick = setInterval(async () => {
    await timersController.getTimerList(
      { ...req, query: { isActive: true } },
      wsTimers.sendActiveTimers()
    );
  }, 1000);

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "stop_timer") {
        await timersController.stopTimer(
          { ...req, path: `/${data.timerId}` },
          wsTimers.send()
        );
        await timersController.getTimerList(req, wsTimers.sendAllTimers());
      }

      if (data.type === "logout") {
        ws.close();
      }
    } catch (e) {
      console.log(e);
    }
  });

  ws.on("close", () => {
    clearInterval(timersTick);
  });
});

module.exports.wss = wss;
