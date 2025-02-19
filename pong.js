const paddleWidth = 10, paddleHeight = 100, ballSize = 10;
const gameSpeed = 2; // Lower speed for better collision detection
const ballSpeedMultiplier = 0.5; // Slightly faster ball
const canvasWidth = 800, canvasHeight = 600;

let ball = { 
    x: Math.floor(canvasWidth / 2), 
    y: Math.floor(canvasHeight / 2), 
    speedX: gameSpeed * ballSpeedMultiplier, 
    speedY: gameSpeed * ballSpeedMultiplier 
};

// Move player paddle (now takes player object instead of socket ID)
function movePlayer(player, direction) {
    if (direction === 'up' && player.y > 0) {
        player.y -= gameSpeed;  // Faster paddle movement
    } else if (direction === 'down' && player.y < canvasHeight - paddleHeight) {
        player.y += gameSpeed;  // Faster paddle movement
    }
}

// Ball and collision logic
function updateGame(players) {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Debugging: Log Ball Position
    console.log(`Ball Position: x=${ball.x}, y=${ball.y}, speedX=${ball.speedX}, speedY=${ball.speedY}`);

    // Ball collision with top and bottom walls
    if (ball.y <= 0 || ball.y >= canvasHeight - ballSize) {
        ball.speedY *= -1; // Reverse vertical direction
    }

    // Ball collision with paddles (check wider range)
    Object.values(players).forEach(player => {
        // Player 1 (left) paddle collision (check wider range for overlap)
        if (player.x === 0 && 
            ball.x <= player.x + paddleWidth + ballSize &&  // Ball is within X range (buffer added)
            ball.x + ballSize >= player.x &&                 // Ball is within X range
            ball.y + ballSize >= player.y &&                 // Ball's bottom is within paddle's vertical range
            ball.y <= player.y + paddleHeight) {             // Ball's top is within paddle's vertical range
            
            console.log("Ball hit Player 1's paddle!");

            // Reverse the horizontal direction of the ball (bounce)
            if (ball.speedX < 0) {
                ball.speedX *= -1; // Reverse horizontal direction
                // Add randomness to the bounce angle
                ball.speedY += (Math.random() * 2 - 1) * 2;
            }
        }

        // Player 2 (right) paddle collision (check wider range for overlap)
        if (player.x === canvasWidth - paddleWidth &&
            ball.x + ballSize >= player.x - ballSize &&     // Ball is within X range (buffer added)
            ball.x <= player.x + paddleWidth &&              // Ball is within X range
            ball.y + ballSize >= player.y &&                 // Ball's bottom is within paddle's vertical range
            ball.y <= player.y + paddleHeight) {             // Ball's top is within paddle's vertical range

            console.log("Ball hit Player 2's paddle!");

            // Reverse the horizontal direction of the ball (bounce)
            if (ball.speedX > 0) {
                ball.speedX *= -1; // Reverse horizontal direction
                // Add randomness to the bounce angle
                ball.speedY += (Math.random() * 2 - 1) * 2;
            }
        }
    });

    // Scoring logic (ball out of bounds)
    const playerList = Object.values(players);
    if (ball.x <= 0 && playerList.length > 1) {
        playerList[1].score++; // Player 2 scores
        resetBall(); // Reset the ball position after scoring
    } else if (ball.x >= canvasWidth - ballSize && playerList.length > 0) {
        playerList[0].score++; // Player 1 scores
        resetBall(); // Reset the ball position after scoring
    }

    // Prevent ball from moving if only one player
    if (playerList.length < 2) {
        resetBall(); // Reset ball when there’s only one player
    }
}

// Reset the ball position after scoring
function resetBall() {
    ball.x = Math.floor(canvasWidth / 2);
    ball.y = Math.floor(canvasHeight / 2);
    // Randomize horizontal direction (left or right)
    ball.speedX = gameSpeed * ballSpeedMultiplier * (Math.random() > 0.5 ? 1 : -1);
    // Randomize vertical direction (up or down)
    ball.speedY = gameSpeed * ballSpeedMultiplier * (Math.random() > 0.5 ? 1 : -1);
    // Optional: Add slight randomness to the vertical speed to avoid straight line shots
    ball.speedY += (Math.random() * 2 - 1) * 2;
}

// Get the ball state for the server (so we can send it to the client)
function getBallState() {
    return {
        x: ball.x,
        y: ball.y,
        speedX: ball.speedX,
        speedY: ball.speedY
    };
}

module.exports = { movePlayer, updateGame, getBallState };
