// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pong = require('./pong'); // Import the game logic from pong.js

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the root directory
app.use(express.static('.'));

// Listen for player connection
io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Add the new player to the game
  pong.addPlayer(socket.id);

  // Send the current game state to the new player
  socket.emit('gameState', pong.getGameState());

  // Listen for player movement commands
  socket.on('move', (direction) => {
    pong.movePlayer(socket.id, direction);  // Move the player
    io.emit('gameState', pong.getGameState());  // Broadcast updated game state
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('A player disconnected:', socket.id);
    pong.removePlayer(socket.id);  // Remove the player from the game
  });
});

// Game loop to update ball position and check collisions
function gameLoop() {
  pong.updateBall();  // Update the ball's position
  io.emit('gameState', pong.getGameState());  // Broadcast updated game state
}

// Set up the game loop (50 times per second)
setInterval(gameLoop, 20);

// Start the server on the assigned port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});