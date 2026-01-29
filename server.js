const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

let players = {};
let blocks = [];

function broadcast(data){
  const str = JSON.stringify(data);
  wss.clients.forEach(c=>{
    if(c.readyState===WebSocket.OPEN) c.send(str);
  });
}

wss.on('connection', ws => {
  ws.on('message', msg => {
    const data = JSON.parse(msg);

    // Update player
    if(data.type==='playerUpdate') players[data.id] = data.player;

    // Update blocks
    if(data.type==='blockUpdate') blocks = data.blocks;

    // Send updated state to all clients
    broadcast({type:'players', players, blocks});
  });

  // Send initial state to new client
  ws.send(JSON.stringify({type:'init', players, blocks}));
});