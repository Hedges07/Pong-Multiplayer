// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Game state
let players = {};
let ball = { x: 400, y: 300, dx: 2, dy: 2, size: 10 };

// Serve the index.html file
app.use(express.static('public')); // If you have any public folder assets (like images)

// Listen for player movement
io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Add new player to the game
  players[socket.id] = { x: 50, y: 250, width: 10, height: 100, score: 0 };

  // Send current game state to the new player
  socket.emit('gameState', { players, ball });

  // Handle player movement
  socket.on('move', (direction) => {
    if (direction === 'up' && players[socket.id].y > 0) {
      players[socket.id].y -= 10;
    } else if (direction === 'down' && players[socket.id].y < 500) {
      players[socket.id].y += 10;
    }

    // Broadcast updated player state
    io.emit('gameState', { players, ball });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A player disconnected:', socket.id);
    delete players[socket.id];
  });
});

// Update game state (move ball and check for collisions)
function updateGame() {
  // Move the ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with top and bottom
  if (ball.y <= 0 || ball.y >= 590) {
    ball.dy = -ball.dy;
  }

  // Ball collision with paddles
  Object.values(players).forEach((player) => {
    if (ball.x <= player.x + player.width && ball.x >= player.x &&
        ball.y >= player.y && ball.y <= player.y + player.height) {
      ball.dx = -ball.dx;
      player.score += 1; // Player scores when they hit the ball
    }
  });

  // Ball reset if it goes out of bounds
  if (ball.x <= 0 || ball.x >= 800) {
    ball.x = 400;
    ball.y = 300;
  }

  // Broadcast updated game state to all clients
  io.emit('gameState', { players, ball });
}

// Set up the game loop (50 times per second)
setInterval(updateGame, 20);

// Start the server on a specific port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});