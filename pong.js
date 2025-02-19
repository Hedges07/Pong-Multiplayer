const paddleWidth = 10, paddleHeight = 100, ballSize = 10;
const gameSpeed = 8; // Paddle speed
const ballSpeedMultiplier = 0.2;
const canvasWidth = 800, canvasHeight = 600;

let ball = { 
    x: Math.floor(canvasWidth / 2), 
    y: Math.floor(canvasHeight / 2), 
    speedX: gameSpeed * ballSpeedMultiplier, 
    speedY: gameSpeed * ballSpeedMultiplier 
};

// Move player paddle
function movePlayer(player, direction) {
    if (direction === 'up' && player.y > 0) {
        player.y -= gameSpeed;  
    } else if (direction === 'down' && player.y < canvasHeight - paddleHeight) {
        player.y += gameSpeed;  
    }
}

// Ball and collision logic
function updateGame(players) {
    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with top and bottom walls
    if (ball.y <= 0 || ball.y + ballSize >= canvasHeight) {
        ball.speedY *= -1;
    }

    // Ball collision with paddles
    Object.values(players).forEach(player => {
        //console.log(`Ball Position: x=${ball.x}, y=${ball.y}, Player Position: x=${player.x}, y=${player.y}`);

        let paddleX = (player.x < canvasWidth / 2) ? 10 : canvasWidth - paddleWidth - 10;
        let paddleY = player.y;
      
        if (
            ball.x <= paddleX + paddleWidth &&  // Ball is at the paddle's X position
            ball.x + ballSize >= paddleX &&    // Ball overlaps with paddle X
            ball.y + ballSize >= paddleY &&    // Ball bottom is within paddle
            ball.y <= paddleY + paddleHeight   // Ball top is within paddle
        ) {
            console.log("Ball hit a paddle!");
            ball.speedX *= -1; // Reverse horizontal direction
            ball.speedX += .05
            ball.speedY += (Math.random() * 2 - 1) * 2; // Add randomness
            // Ensure the ball moves away from the paddle properly
            if (ball.speedX > 0) {
                ball.speedX = Math.abs(ball.speedX);
            } else {
                ball.speedX = -Math.abs(ball.speedX);
            }
        }
    });

    // Scoring logic (ball out of bounds)
    const playerList = Object.values(players);
    if (ball.x <= 0 && playerList.length > 1) {
        playerList[1].score++; 
        resetBall();
    } else if (ball.x >= canvasWidth - ballSize && playerList.length > 0) {
        playerList[0].score++; 
        resetBall();
    }

    // Prevent ball from moving if only one player
    if (playerList.length < 2) {
        resetBall();
    }
}

// Reset the ball position after scoring
function resetBall() {
    ball.x = Math.floor(canvasWidth / 2);
    ball.y = Math.floor(canvasHeight / 2);
    ball.speedX = gameSpeed * ballSpeedMultiplier * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY = gameSpeed * ballSpeedMultiplier * (Math.random() > 0.5 ? 1 : -1);
    ball.speedY += (Math.random() * 2 - 1) * 2;
}

// Get the ball state for the server
function getBallState() {
    return {
        x: ball.x,
        y: ball.y,
        speedX: ball.speedX,
        speedY: ball.speedY
    };
}

module.exports = { movePlayer, updateGame, getBallState };