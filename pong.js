const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');

// Set initial game variables
let paddleWidth = 20, paddleHeight = 100, ballRadius = 10;
let paddle1Y = canvas.height / 2 - paddleHeight / 2, paddle2Y = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2, ballY = canvas.height / 2, ballDX = 4, ballDY = 4;
let paddle1DY = 0, paddle2DY = 0;

// Set up WebSocket connection
const socket = new WebSocket('ws://your-app-name.onrender.com'); // Replace with your deployed backend URL

socket.onmessage = function (event) {
  const gameState = JSON.parse(event.data);
  ballX = gameState.ball.x;
  ballY = gameState.ball.y;
  paddle1Y = gameState.paddle1.y;
  paddle2Y = gameState.paddle2.y;
  paddle1Score = gameState.player1Score;
  paddle2Score = gameState.player2Score;
  render();
};

// Listen for paddle control messages
document.addEventListener('keydown', function (event) {
  if (event.key === 'w') paddle1DY = -5;
  if (event.key === 's') paddle1DY = 5;
  if (event.key === 'ArrowUp') paddle2DY = -5;
  if (event.key === 'ArrowDown') paddle2DY = 5;
});
document.addEventListener('keyup', function (event) {
  if (event.key === 'w' || event.key === 's') paddle1DY = 0;
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') paddle2DY = 0;
});

// Update WebSocket with paddle positions
function sendPaddlePositions() {
  socket.send(JSON.stringify({ paddle1: paddle1DY, paddle2: paddle2DY }));
}

// Draw the game
function render() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'white';
  context.fillRect(50, paddle1Y, paddleWidth, paddleHeight); // Player 1 paddle
  context.fillRect(730, paddle2Y, paddleWidth, paddleHeight); // Player 2 paddle
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  context.fill();
  context.fillText(paddle1Score, 100, 50);
  context.fillText(paddle2Score, canvas.width - 100, 50);
}

// Game loop
function gameLoop() {
  ballX += ballDX;
  ballY += ballDY;

  if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
    ballDY = -ballDY;
  }

  if (ballX - ballRadius < 70 && ballY > paddle1Y && ballY < paddle1Y + paddleHeight || ballX + ballRadius > canvas.width - 70 && ballY > paddle2Y && ballY < paddle2Y + paddleHeight) {
    ballDX = -ballDX;
  }

  if (ballX < 0 || ballX > canvas.width) {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballDX = -ballDX;
  }

  paddle1Y += paddle1DY;
  paddle2Y += paddle2DY;

  // Ensure paddles stay within canvas
  paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));
  paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));

  sendPaddlePositions();
  requestAnimationFrame(gameLoop);
}

gameLoop();