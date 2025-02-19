const socket = io(); // Connect to the server

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas size
const canvasWidth = 800;
const canvasHeight = 600;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const paddleWidth = 10, paddleHeight = 100, ballSize = 10;
let players = {};
let ball = {};

// Listen for game state updates from the server
socket.on('gameState', (gameState) => {
    players = gameState.players;
    ball = gameState.ball;
    drawGame();
});

// Handle player movement (send to server)
document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'ArrowUp') {
        socket.emit('move', 'up');
    } else if (e.key === 's' || e.key === 'ArrowDown') {
        socket.emit('move', 'down');
    }
});

// Draw the game state on the canvas
function drawGame() {
  // Clear the canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Black background

  ctx.fillStyle = 'white';

  // Draw middle dashed line
  ctx.setLineDash([10, 10]); // Dashed effect
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // Draw paddles
  Object.values(players).forEach(player => {
      ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);
  });

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x + ballSize / 2, ball.y + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw scores
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';

  const playerKeys = Object.keys(players);
  if (playerKeys.length > 0) {
      ctx.fillText(`${players[playerKeys[0]] ? players[playerKeys[0]].score : 0}`, canvas.width / 4, 50);
  }
  if (playerKeys.length > 1) {
      ctx.fillText(`${players[playerKeys[1]] ? players[playerKeys[1]].score : 0}`, (canvas.width / 4) * 3, 50);
  }
}
