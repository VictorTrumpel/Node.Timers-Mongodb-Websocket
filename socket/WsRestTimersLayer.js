class WsRestTimersLayer {
  #ws;

  constructor(ws) {
    this.#ws = ws;
  }

  status() {
    return this;
  }

  send() {
    return {
      status: this.status,
      json() {
        return this;
      },
    };
  }

  sendActiveTimers() {
    const ws = this.#ws;
    return {
      status: this.status,
      json(activeTimers) {
        ws.send(JSON.stringify({ activeTimers, type: "active_timers" }));
        return this;
      },
    };
  }

  sendAllTimers() {
    const ws = this.#ws;
    return {
      status: this.status,
      json(timers) {
        const activeTimers = [],
          oldTimers = [];
        timers.forEach((timer) =>
          timer.isActive ? activeTimers.push(timer) : oldTimers.push(timer)
        );
        ws.send(
          JSON.stringify({ activeTimers, oldTimers, type: "all_timers" })
        );
        return this;
      },
    };
  }
}

module.exports = WsRestTimersLayer;
