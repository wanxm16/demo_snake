const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverMessage = document.getElementById('gameOverMessage');
const scoreDisplay = document.getElementById('score');
const scoreElement = document.getElementById('scoreDisplay');
const highScoreElement = document.getElementById('highScoreDisplay');
const overlay = document.getElementById('overlay');

let gridSize = 20;
let canvasSize = Math.min(window.innerWidth, window.innerHeight) - 20;
canvas.width = canvasSize;
canvas.height = canvasSize;

const snake = [{ x: Math.floor(canvasSize / 2 / gridSize) * gridSize, y: Math.floor(canvasSize / 2 / gridSize) * gridSize }];
let direction = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
highScoreElement.textContent = `High Score: ${highScore}`;
let gameInterval;

function getRandomFoodPosition() {
    let position;
    const margin = 1; // Margin to avoid placing food on the edge
    do {
        position = {
            x: (Math.floor(Math.random() * ((canvasSize / gridSize) - 2 * margin)) + margin) * gridSize,
            y: (Math.floor(Math.random() * ((canvasSize / gridSize) - 2 * margin)) + margin) * gridSize
        };
    } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
    console.log('New food position:', position); // Log food position
    return position;
}

function drawRect(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridSize, gridSize);
}

function drawRoundedRect(x, y, width, height, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            drawRoundedRect(segment.x, segment.y, gridSize, gridSize, gridSize / 4, '#FFF'); // Rounded head
        } else {
            drawRect(segment.x, segment.y, '#FFF'); // White body
        }
    });
}

function drawFood() {
    drawRect(food.x, food.y, '#FFF'); // White food
}

function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    console.log('Snake head position:', head); // Log snake head position
    console.log('Food position:', food); // Log food position

    if (head.x === food.x && head.y === food.y) {
        console.log('Food eaten'); // Log when food is eaten
        score++;
        scoreElement.textContent = `Score: ${score}`;
        food = getRandomFoodPosition();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    return false;
}

function gameLoop() {
    if (checkCollision()) {
        endGame();
        return;
    }

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    drawFood();
    updateSnake();
    drawSnake();
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;
    const ESC = 27;

    const goingUp = direction.y === -gridSize;
    const goingDown = direction.y === gridSize;
    const goingRight = direction.x === gridSize;
    const goingLeft = direction.x === -gridSize;

    if (keyPressed === LEFT && !goingRight) {
        direction = { x: -gridSize, y: 0 };
    }
    if (keyPressed === UP && !goingDown) {
        direction = { x: 0, y: -gridSize };
    }
    if (keyPressed === RIGHT && !goingLeft) {
        direction = { x: gridSize, y: 0 };
    }
    if (keyPressed === DOWN && !goingUp) {
        direction = { x: 0, y: gridSize };
    }
    if (keyPressed === ESC) {
        endGame();
    }
}

function endGame() {
    clearInterval(gameInterval);
    scoreDisplay.textContent = score;
    gameOverMessage.style.display = 'block';
    canvas.addEventListener('click', restartGame);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
}

document.addEventListener('keydown', changeDirection);
food = getRandomFoodPosition();

function startGame() {
    overlay.style.display = 'none';
    startScreen.style.display = 'none'; // 隐藏开始屏幕
    gameInterval = setInterval(gameLoop, 100);
}

overlay.addEventListener('click', startGame);
canvas.addEventListener('click', startGame);

window.addEventListener('resize', () => {
    canvasSize = Math.min(window.innerWidth, window.innerHeight) - 20;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    gridSize = Math.floor(canvasSize / 30);
    food = getRandomFoodPosition();
    snake.length = 1;
    snake[0] = { x: Math.floor(canvasSize / 2 / gridSize) * gridSize, y: Math.floor(canvasSize / 2 / gridSize) * gridSize };
    direction = { x: 0, y: 0 };
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener('touchmove', (event) => {
    if (event.touches.length > 1) return; // Ignore multi-touch

    const touch = event.touches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    const goingUp = direction.y === -gridSize;
    const goingDown = direction.y === gridSize;
    const goingRight = direction.x === gridSize;
    const goingLeft = direction.x === -gridSize;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && !goingLeft) {
            direction = { x: gridSize, y: 0 };
        } else if (deltaX < 0 && !goingRight) {
            direction = { x: -gridSize, y: 0 };
        }
    } else {
        if (deltaY > 0 && !goingUp) {
            direction = { x: 0, y: gridSize };
        } else if (deltaY < 0 && !goingDown) {
            direction = { x: 0, y: -gridSize };
        }
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

function restartGame() {
    gameOverMessage.style.display = 'none';
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    direction = { x: 0, y: 0 };
    snake.length = 1;
    snake[0] = { x: Math.floor(canvasSize / 2 / gridSize) * gridSize, y: Math.floor(canvasSize / 2 / gridSize) * gridSize };
    food = getRandomFoodPosition();
    gameInterval = setInterval(gameLoop, 100);
    canvas.removeEventListener('click', restartGame);
}