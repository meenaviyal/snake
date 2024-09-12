const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const messageElement = document.getElementById('message');
const fireworksElement = document.getElementById('fireworks');
const mobileControls = document.getElementById('mobileControls');
const gameContainer = document.getElementById('gameContainer');
const gameWrapper = document.getElementById('gameWrapper');

let snake, food, dx, dy, score, highScore, gameLoop, isMobile, GRID_SIZE;

// Changed orange color to green
const SNAKE_COLOR = '#4ade80';
const SNAKE_BORDER_COLOR = '#e53170';
const FOOD_COLOR = '#e53170';
const BACKGROUND_COLOR = '#0f0e17';

function init() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const scoreboardHeight = document.getElementById('scoreBoard').offsetHeight;
    const headerHeight = document.querySelector('header').offsetHeight;
    const footerHeight = document.querySelector('footer').offsetHeight;

    if (isMobile) {
        const mobileControlsHeight = document.getElementById('mobileControls').offsetHeight;
        canvas.width = window.innerWidth - 4; // Subtracting 4 to account for the border
        canvas.height = window.innerHeight - scoreboardHeight - headerHeight - footerHeight - mobileControlsHeight - 4; // Subtracting 4 to account for the border
        mobileControls.style.display = 'flex';
    } else {
        canvas.width = window.innerWidth - 4; // Subtracting 4 to account for the border
        canvas.height = window.innerHeight - scoreboardHeight - headerHeight - footerHeight - 4; // Subtracting 4 to account for the border
        mobileControls.style.display = 'none';
    }

    gameContainer.style.width = `${canvas.width}px`;
    gameContainer.style.height = `${canvas.height}px`;

    GRID_SIZE = Math.floor(Math.min(canvas.width, canvas.height) / 20);

    snake = [{ x: Math.floor(canvas.width / GRID_SIZE / 2), y: Math.floor(canvas.height / GRID_SIZE / 2) }];
    placeFood();
    dx = 0;
    dy = 0;
    score = 0;
    highScore = localStorage.getItem('snakeHighScore') || 0;
    updateScoreBoard();

    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    showMessage(isMobile ? 'Tap arrows to start' : 'Press Space to start');
    draw();
}

function startGame() {
    if (gameLoop) return;

    if (dx === 0 && dy === 0) {
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        dx = randomDirection.dx;
        dy = randomDirection.dy;
    }
    hideMessage();
    gameLoop = setInterval(update, 100);
}

function update() {
    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score++;
        updateScoreBoard();
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            updateScoreBoard();
            celebrateHighScore();
        }
        placeFood();
    } else {
        snake.pop();
    }
    draw();
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= Math.floor(canvas.width / GRID_SIZE) || 
        head.y < 0 || head.y >= Math.floor(canvas.height / GRID_SIZE)) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * Math.floor(canvas.width / GRID_SIZE)),
        y: Math.floor(Math.random() * Math.floor(canvas.height / GRID_SIZE))
    };
}

function draw() {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        ctx.fillStyle = SNAKE_COLOR;
        ctx.beginPath();
        ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = SNAKE_BORDER_COLOR;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (index === 0) {
            ctx.fillStyle = '#0f0e17';
            ctx.beginPath();
            ctx.arc(x + GRID_SIZE * 0.3, y + GRID_SIZE * 0.3, GRID_SIZE * 0.1, 0, 2 * Math.PI);
            ctx.arc(x + GRID_SIZE * 0.7, y + GRID_SIZE * 0.3, GRID_SIZE * 0.1, 0, 2 * Math.PI);
            ctx.fill();
        }
    });

    ctx.fillStyle = FOOD_COLOR;
    ctx.beginPath();
    ctx.arc(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = '#a7a9be';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE);
    ctx.lineTo(food.x * GRID_SIZE + GRID_SIZE / 2 + 3, food.y * GRID_SIZE - 5);
    ctx.stroke();
}

function updateScoreBoard() {
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
}

function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;
    showMessage(isMobile ? 'Game Over! Tap arrows to restart' : 'Game Over! Press Space to restart');
}

function showMessage(text) {
    messageElement.textContent = text;
    messageElement.style.display = 'block';
}

function hideMessage() {
    messageElement.style.display = 'none';
}

function celebrateHighScore() {
    showMessage('New High Score!');
    createFireworks();
    setTimeout(() => {
        hideMessage();
        clearFireworks();
    }, 3000);
}

function createFireworks() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            firework.style.transform = `scale(${Math.random() * 0.5 + 0.5})`;
            firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            firework.style.width = '5px';
            firework.style.height = '5px';
            firework.style.borderRadius = '50%';
            firework.style.position = 'absolute';
            firework.style.setProperty('--tx', `${Math.random() * 200 - 100}px`);
            firework.style.setProperty('--ty', `${-(Math.random() * 50 + 50)}px`);
            firework.style.animation = 'firework 1s ease-out forwards';
            fireworksElement.appendChild(firework);
        }, i * 40);
    }
}

function clearFireworks() {
    fireworksElement.innerHTML = '';
}

function handleDirectionChange(newDx, newDy) {
    if ((newDx === 1 && dx !== -1) || (newDx === -1 && dx !== 1) ||
        (newDy === 1 && dy !== -1) || (newDy === -1 && dy !== 1)) {
        dx = newDx;
        dy = newDy;
        if (!gameLoop) {
            init();
            startGame();
        }
    }
}

window.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault(); // Prevent default scrolling behavior
    }
    
    if (e.code === 'Space') {
        if (!gameLoop) {
            init();
            startGame();
        }
    } else if (e.code === 'ArrowUp') {
        handleDirectionChange(0, -1);
    } else if (e.code === 'ArrowDown') {
        handleDirectionChange(0, 1);
    } else if (e.code === 'ArrowLeft') {
        handleDirectionChange(-1, 0);
    } else if (e.code === 'ArrowRight') {
        handleDirectionChange(1, 0);
    }
});

function addMobileControls() {
    const controls = ['upBtn', 'downBtn', 'leftBtn', 'rightBtn'];
    controls.forEach(id => {
        document.getElementById(id).addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            switch(id) {
                case 'upBtn': handleDirectionChange(0, -1); break;
                case 'downBtn': handleDirectionChange(0, 1); break;
                case 'leftBtn': handleDirectionChange(-1, 0); break;
                case 'rightBtn': handleDirectionChange(1, 0); break;
            }
        });
    });
}

window.addEventListener('resize', init);
init();
addMobileControls();
