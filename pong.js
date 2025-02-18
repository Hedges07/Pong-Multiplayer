// pong.js

// Ball and game state
let ball = { x: 400, y: 300, dx: 2, dy: 2, size: 10 };
let players = {};

// Move the ball and check collisions
function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with top and bottom
  if (ball.y <= 0 || ball.y >= 590) {
    ball.dy = -ball.dy;
  }

  // Ball collision with paddles
  Object.values(players).forEach(player => {
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
}

// Update player paddle position based on direction
function movePlayer(socketId, direction) {
  const player = players[socketId];
  if (!player) return;

  if (direction === 'up' && player.y > 0) {
    player.y -= 10;
  } else if (direction === 'down' && player.y < 500) {
    player.y += 10;
  }
}

// Return the current game state
function getGameState() {
  return { players, ball };
}

// Add new player to the game
function addPlayer(socketId) {
  players[socketId] = { x: 50, y: 250, width: 10, height: 100, score: 0 };
}

// Remove player from the game
function removePlayer(socketId) {
  delete players[socketId];
}

module.exports = { updateBall, movePlayer, getGameState, addPlayer, removePlayer };