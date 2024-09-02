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

const snake = [{ x: canvasSize / 2, y: canvasSize / 2 }];
let direction = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
highScoreElement.textContent = `High Score: ${highScore}`;
let gameInterval;

function getRandomFoodPosition() {
    return {
        x: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize
    };
}

function drawRect(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridSize, gridSize);
}

function drawSnake() {
    snake.forEach(segment => drawRect(segment.x, segment.y, '#FFF')); // White snake
}

function drawFood() {
    drawRect(food.x, food.y, '#FFF'); // White food
}

function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
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
        clearInterval(gameInterval);
        scoreDisplay.textContent = score;
        gameOverMessage.style.display = 'block';
        canvas.addEventListener('click', restartGame);
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElement.textContent = `High Score: ${highScore}`;
        }
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

// ... existing code ...

canvas.addEventListener('click', startGame);

window.addEventListener('resize', () => {
    canvasSize = Math.min(window.innerWidth, window.innerHeight) - 20;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    gridSize = Math.floor(canvasSize / 30);
    food = getRandomFoodPosition();
    snake.length = 1;
    snake[0] = { x: canvasSize / 2, y: canvasSize / 2 };
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
    snake[0] = { x: canvasSize / 2, y: canvasSize / 2 };
    food = getRandomFoodPosition();
    gameInterval = setInterval(gameLoop, 100);
    canvas.removeEventListener('click', restartGame);
}