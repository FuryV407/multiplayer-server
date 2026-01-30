const WebSocket = require("ws");

const wss = new WebSocket.Server({
  port: process.env.PORT || 3000
});

let players = {};
let blocks = [];

wss.on("connection", ws => {

  // send world when someone joins
  ws.send(JSON.stringify({ players, blocks }));

  ws.on("message", msg => {
    let data;
    try { data = JSON.parse(msg); }
    catch { return; }

    if (data.player) {
      players[data.player.id] = data.player;
    }

    if (data.blocks) {
      for (let b of data.blocks) {
        if (!blocks.some(x => x.x === b.x && x.y === b.y)) {
          blocks.push(b);
        }
      }
    }

    // send to everyone
    const payload = JSON.stringify({ players, blocks });

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(payload);
      }
    });
  });
});