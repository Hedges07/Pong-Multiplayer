const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

// Setup Express server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Game state
let gameState = {
  ball: { x: 400, y: 300, dx: 4, dy: 4, radius: 10 },
  paddle1: { x: 50, y: 250, width: 20, height: 100, dy: 0 },
  paddle2: { x: 730, y: 250, width: 20, height: 100, dy: 0 },
  player1Score: 0,
  player2Score: 0,
};

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New player connected');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    // Control the paddles
    if (data.paddle1) {
      gameState.paddle1.dy = data.paddle1;
    }
    if (data.paddle2) {
      gameState.paddle2.dy = data.paddle2;
    }
  });

  // Periodically update the game state
  setInterval(() => {
    // Update ball position
    gameState.ball.x += gameState.ball.dx;
    gameState.ball.y += gameState.ball.dy;

    // Ball collision with top and bottom walls
    if (gameState.ball.y <= 0 || gameState.ball.y >= 600) {
      gameState.ball.dy = -gameState.ball.dy;
    }

    // Ball collision with paddles
    if (gameState.ball.x <= gameState.paddle1.x + gameState.paddle1.width && gameState.ball.y >= gameState.paddle1.y && gameState.ball.y <= gameState.paddle1.y + gameState.paddle1.height) {
      gameState.ball.dx = -gameState.ball.dx;
    }

    if (gameState.ball.x >= gameState.paddle2.x - gameState.paddle2.width && gameState.ball.y >= gameState.paddle2.y && gameState.ball.y <= gameState.paddle2.y + gameState.paddle2.height) {
      gameState.ball.dx = -gameState.ball.dx;
    }

    // Ball out of bounds
    if (gameState.ball.x <= 0) {
      gameState.player2Score += 1;
      gameState.ball = { x: 400, y: 300, dx: 4, dy: 4, radius: 10 }; // Reset ball
    } else if (gameState.ball.x >= 800) {
      gameState.player1Score += 1;
      gameState.ball = { x: 400, y: 300, dx: -4, dy: 4, radius: 10 }; // Reset ball
    }

    // Update paddles position
    gameState.paddle1.y += gameState.paddle1.dy;
    gameState.paddle2.y += gameState.paddle2.dy;

    // Ensure paddles stay in bounds
    gameState.paddle1.y = Math.max(0, Math.min(500, gameState.paddle1.y));
    gameState.paddle2.y = Math.max(0, Math.min(500, gameState.paddle2.y));

    // Send updated state to clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(gameState));
      }
    });
  }, 1000 / 60); // 60 FPS game loop
});

// Start the server
server.listen(process.env.PORT || 3000, () => {
  console.log('Server started on http://localhost:3000');
});