let N = 8; // Default board size
const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
const moveY = [1, 2, 2, 1, -1, -2, -2, -1];
let board, path, moveCount, startX, startY, timerInterval, startTime, possibleMoves;

const canvas = document.getElementById('boardCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

let squareSize = canvas.width / N;
const moveCountElement = document.getElementById('moveCount');
const timerDisplay = document.getElementById('timerDisplay');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const boardSizeInput = document.getElementById('boardSizeInput');

// Initialize the game board and variables
function initBoard() {
    N = parseInt(boardSizeInput.value); // Set board size based on input
    if (N < 3 || N > 15) {
        alert("Please enter a board size between 3 and 15.");
        boardSizeInput.value = 8; // Reset to default
        N = 8;
    }

    // Adjust canvas square size based on new board size
    squareSize = canvas.width / N;
    board = Array.from({ length: N }, () => Array(N).fill(0));
    path = []; // Track the path to support backtracking
    possibleMoves = [];
    moveCount = 0;
    startX = startY = -1; // No starting position selected
    drawBoard();
    resetTimer();
    moveCountElement.innerText = moveCount;
}

// Draw the chessboard on the canvas
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? '#f0d9b5' : '#b58863'; // Chessboard color
            ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);

            // Highlight possible "L" pattern moves
            if (possibleMoves.some(pos => pos[0] === i && pos[1] === j)) {
                ctx.fillStyle = 'Green'; // Highlight for possible moves
                ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
            }

            // Draw knight's position
            if (board[i][j] === 1) {
                ctx.fillStyle = 'Black';
                ctx.beginPath();
                ctx.arc(i * squareSize + squareSize / 2, j * squareSize + squareSize / 2, squareSize / 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Calculate possible moves for the knight
function calculatePossibleMoves(x, y) {
    possibleMoves = [];
    for (let i = 0; i < 8; i++) {
        const nx = x + moveX[i];
        const ny = y + moveY[i];
        if (isWithinBounds(nx, ny) && !board[nx][ny]) {
            possibleMoves.push([nx, ny]);
        }
    }

    // Check if no possible moves and path length is not complete
    if (possibleMoves.length === 0 && path.length !== N * N) {
        stopTimer();
        setTimeout(() => alert("Game Over! No more possible moves."), 10);
    }
}

// Check if the knight's move is within bounds
function isWithinBounds(x, y) {
    return x >= 0 && x < N && y >= 0 && y < N;
}

// Handle clicks on the canvas to set starting position or move the knight
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / squareSize);
    const y = Math.floor((event.clientY - rect.top) / squareSize);

    if (startX === -1 && startY === -1) {
        // Set initial position
        startX = x;
        startY = y;
        board[x][y] = 1;
        path.push([x, y]);
        moveCount = 1;
        moveCountElement.innerText = moveCount;
        startTimer();
        calculatePossibleMoves(startX, startY);
        drawBoard();
    } else {
        // Attempt to move the knight
        if (isValidKnightMove(startX, startY, x, y)) {
            moveKnight(x, y);
        } else {
            alert("Invalid move. Knights move in an 'L' shape.");
        }
    }
});

// Check if the move is a valid knight "L" move
function isValidKnightMove(x1, y1, x2, y2) {
    return possibleMoves.some(([nx, ny]) => nx === x2 && ny === y2);
}

// Move the knight to the new position and allow backtracking
function moveKnight(x, y) {
    startX = x;
    startY = y;
    board[x][y] = 1;
    path.push([x, y]);
    moveCount++;
    moveCountElement.innerText = moveCount;
    calculatePossibleMoves(x, y);
    drawBoard();

    // If path covers all squares, end the game with success message
    if (path.length === N * N) {
        stopTimer();
        alert("Congratulations! You've completed the Knight's Tour.");
    }
}

// Undo the last move
function undoMove() {
    if (path.length > 1) {
        const [prevX, prevY] = path.pop();
        board[prevX][prevY] = 0;
        const [lastX, lastY] = path[path.length - 1];
        startX = lastX;
        startY = lastY;
        moveCount--;
        moveCountElement.innerText = moveCount;
        calculatePossibleMoves(lastX, lastY);
        drawBoard();
    } else {
        alert("No moves to undo!");
    }
}

// Reset the game
function resetGame() {
    initBoard();
    stopTimer();
    moveCountElement.innerText = 0;
}

// Timer functions
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    timerDisplay.innerText = '00:00';
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
    const seconds = String(elapsedTime % 60).padStart(2, '0');
    timerDisplay.innerText = `${minutes}:${seconds}`;
}

// Event listeners
resetBtn.addEventListener('click', resetGame);
undoBtn.addEventListener('click', undoMove);
boardSizeInput.addEventListener('change', initBoard); // Re-initialize board on size change

// Initialize on page load
initBoard();
