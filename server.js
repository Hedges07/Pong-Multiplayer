const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pong = require('./pong');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('.'));

const players = {}; // Store connected players
const playerSlots = { left: null, right: null }; // Track which slot is taken

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Assign the player to an available slot
    if (!playerSlots.left) {
        players[socket.id] = { x: 10, y: 250, score: 0 }; // Left paddle
        playerSlots.left = socket.id;
    } else if (!playerSlots.right) {
        players[socket.id] = { x: 780, y: 250, score: 0 }; // Right paddle
        playerSlots.right = socket.id;
    } else {
        console.log(`Server full. Kicking ${socket.id}`);
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

        if (playerSlots.left === socket.id) {
            playerSlots.left = null; // Free the left slot
        } else if (playerSlots.right === socket.id) {
            playerSlots.right = null; // Free the right slot
        }

        delete players[socket.id];
    });
});

// Game loop - update game state & send to clients
setInterval(() => {
    pong.updateGame(players);
    io.emit('gameState', { players, ball: pong.getBallState() });
}, 20);

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL"); // Allows embedding
    next();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
