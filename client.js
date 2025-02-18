// client.js

const socket = io(); // Connect to the server

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = {};
let ball = {};

let moveDirection = null; // 'up' or 'down'
let controls = {}; // Track player's key bindings

// Listen for the game state from the server
socket.on('gameState', (gameState) => {
  players = gameState.players;
  ball = gameState.ball;

  // Assign player controls only once
  if (!controls[socket.id]) {
    const playerKeys = Object.keys(players);
    if (playerKeys[0] === socket.id) {
      controls[socket.id] = { up: 'w', down: 's' };
    } else if (playerKeys[1] === socket.id) {
      controls[socket.id] = { up: 'ArrowUp', down: 'ArrowDown' };
    }
  }

  drawGame();
});

// Handle keydown events for paddle movement
document.addEventListener('keydown', (e) => {
  if (controls[socket.id]) {
    if (e.key === controls[socket.id].up) {
      moveDirection = 'up';
    } else if (e.key === controls[socket.id].down) {
      moveDirection = 'down';
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (controls[socket.id] && (e.key === controls[socket.id].up || e.key === controls[socket.id].down)) {
    moveDirection = null; // Stop moving when key is released
  }
});

// Send player movement to the server
function sendPlayerMovement() {
  if (moveDirection) {
    socket.emit('move', moveDirection);
  }
}

// Draw the game state on the canvas
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the paddles
  Object.values(players).forEach(player => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  });

  // Draw the ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.closePath();

  // Draw the score
  ctx.font = '30px Arial';
  ctx.fillText(`Player 1: ${players[Object.keys(players)[0]] ? players[Object.keys(players)[0]].score : 0}`, 50, 50);
  ctx.fillText(`Player 2: ${players[Object.keys(players)[1]] ? players[Object.keys(players)[1]].score : 0}`, canvas.width - 200, 50);
}