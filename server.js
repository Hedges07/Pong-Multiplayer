const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pong = require('./pong');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('.'));

const players = {};
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    const playerCount = Object.keys(players).length;
    if (playerCount === 0) {
        players[socket.id] = { x: 10, y: 250, score: 0 }; // Left paddle
    } else if (playerCount === 1) {
        players[socket.id] = { x: 780, y: 250, score: 0 }; // Right paddle
    } else {
        socket.disconnect();
        return;
    }

    socket.emit('gameState', { players, ball: pong.getBallState() });

    socket.on('move', (direction) => {
        if (players[socket.id]) {
            pong.movePlayer(players[socket.id], direction);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
    });
});

setInterval(() => {
    pong.updateGame(players);
    io.emit('gameState', { players, ball: pong.getBallState() });
}, 20);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
