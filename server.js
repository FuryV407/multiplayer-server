const WebSocket = require("ws");

const wss = new WebSocket.Server({
  port: process.env.PORT || 3000
});

let players = {};
let blocks = {};
let nextPlayerNumber = 1;

wss.on("connection", ws => {

  let playerId = null;
  let playerNumber = nextPlayerNumber++;
  
  // send world on join
  ws.send(JSON.stringify({
    players,
    blocks: Object.values(blocks)
  }));

  ws.on("message", msg => {
    let data;
    try { data = JSON.parse(msg); }
    catch { return; }

    // PLAYER UPDATE
    if (data.player) {
      playerId = data.player.id;
      players[playerId] = {...data.player, playerNumber};
    }

    // BLOCK UPDATE
    if (Array.isArray(data.blocks)) {
      for (let b of data.blocks) {
        const key = b.x + "," + b.y;
        blocks[key] = b;
      }
    }

    broadcast();
  });

  ws.on("close", () => {
    if (playerId) {
      delete players[playerId];
      broadcast();
    }
  });
});

function broadcast(){
  const payload = JSON.stringify({
    players,
    blocks: Object.values(blocks)
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}