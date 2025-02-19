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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';

    // Draw paddles
    Object.values(players).forEach(player => {
        ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);
    });

    // Draw ball
    ctx.fillRect(ball.x, ball.y, ballSize, ballSize);

    // Draw scores
    const playerKeys = Object.keys(players);
    ctx.font = '20px Arial';
    if (playerKeys.length > 0) {
        ctx.fillText(`Player 1: ${players[playerKeys[0]] ? players[playerKeys[0]].score : 0}`, 50, 50);
    }
    if (playerKeys.length > 1) {
        ctx.fillText(`Player 2: ${players[playerKeys[1]] ? players[playerKeys[1]].score : 0}`, canvas.width - 150, 50);
    }
}