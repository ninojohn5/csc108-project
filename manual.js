let rows = 8; // Default rows
let cols = 8; // Default columns
const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
const moveY = [1, 2, 2, 1, -1, -2, -2, -1];
let board, path, startX, startY, possibleMoves;

const canvas = document.getElementById('boardCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

let squareSize;
const rowsInput = document.getElementById('rowsInput');
const colsInput = document.getElementById('colsInput');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const errorMessageElement = document.getElementById('errorMessage');

// Auto-Play Button and Dialog
const autoPlayDialog = document.getElementById('autoPlayDialog');
const startAutoPlayBtn = document.getElementById('startAutoPlayBtn');
const backtrackingBtn = document.getElementById('backtrackingBtn');
const warnsdorffBtn = document.getElementById('warnsdorffBtn');

window.onload = function () {
    // Simulating the game initialization completion
    setTimeout(() => {
        // Hide the loading screen after everything is loaded
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
    }, 3000); // Adjust the timeout for the loading duration
};

// Initialize the game board
function initBoard() {
    const inputRows = parseInt(rowsInput.value, 10);
    const inputCols = parseInt(colsInput.value, 10);

    if (isNaN(inputRows) || isNaN(inputCols) || inputRows < 3 || inputCols < 3) {
        displayError("Please enter valid positive numbers for rows and columns (min: 3).");
        rowsInput.value = colsInput.value = 8; // Reset to default
        rows = cols = 8;
    } else {
        rows = inputRows;
        cols = inputCols;
        clearError();
    }

    squareSize = Math.min(canvas.width / cols, canvas.height / rows);
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    path = [];
    possibleMoves = [];
    startX = startY = -1; // No starting position selected
    drawBoard();
}

// Draw the chessboard and moves
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            ctx.fillStyle = (i + j) % 2 === 0 ? '#f0d9b5' : '#b58863';
            ctx.fillRect(j * squareSize, i * squareSize, squareSize, squareSize);

            if (board[i][j] > 0) {
                ctx.fillStyle = 'black';
                ctx.font = `${squareSize / 2}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    board[i][j],
                    j * squareSize + squareSize / 2,
                    i * squareSize + squareSize / 2
                );
            }

            // Highlight possible moves
            if (possibleMoves.some(([x, y]) => x === i && y === j)) {
                ctx.beginPath();
                ctx.arc(
                    j * squareSize + squareSize / 2,
                    i * squareSize + squareSize / 2,
                    squareSize / 4,
                    0,
                    2 * Math.PI
                );
                ctx.fillStyle = 'green';
                ctx.fill();
                ctx.stroke();
            }
        }
    }
}

function calculatePossibleMoves(x, y) {
    possibleMoves = [];
    for (let i = 0; i < 8; i++) {
        const nx = x + moveX[i];
        const ny = y + moveY[i];
        if (isWithinBounds(nx, ny) && !board[nx][ny]) {
            possibleMoves.push([nx, ny]);
        }
    }

    // Game over condition: No possible moves left, and not all squares visited
    if (possibleMoves.length === 0 && path.length !== rows * cols) {
        displayError(
            `Game over! You visited ${path.length} squares out of ${rows * cols} possible on a ${rows}x${cols} board.\n\nPress "Reset Game" or "Undo your last move" to continue.`
        );
    }
}

// Check if a position is within bounds
function isWithinBounds(x, y) {
    return x >= 0 && x < rows && y >= 0 && y < cols;
}

canvas.addEventListener('click', function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientY - rect.top) / squareSize);
    const y = Math.floor((event.clientX - rect.left) / squareSize);

    if (x >= 0 && x < rows && y >= 0 && y < cols) {
        if (startX === -1 && startY === -1) {
            startX = x;
            startY = y;
            board[x][y] = path.length + 1;
            path.push([x, y]);
            calculatePossibleMoves(x, y);
            clearError();
            drawBoard();
        } else if (possibleMoves.some(([nx, ny]) => nx === x && ny === y)) {
            startX = x;
            startY = y;
            board[x][y] = path.length + 1;
            path.push([x, y]);
            calculatePossibleMoves(x, y);
            clearError();
            drawBoard();

            if (path.length === rows * cols) {
                displayError("Congratulations! You've completed the Knight's Tour!");
            }
        }
    }
});

// Undo the last move
function undoMove() {
    if (path.length > 1) {
        const [prevX, prevY] = path.pop();
        board[prevX][prevY] = 0;
        const [lastX, lastY] = path[path.length - 1];
        startX = lastX;
        startY = lastY;
        calculatePossibleMoves(startX, startY);
        drawBoard();
        clearError();
    } else if (path.length === 1) {
        const [initialX, initialY] = path.pop();
        board[initialX][initialY] = 0;
        startX = startY = -1;
        possibleMoves = [];
        drawBoard();
        clearError();
    } else {
        displayError("No moves to undo! The board has been cleared.");
        board = Array.from({ length: rows }, () => Array(cols).fill(0));
        path = [];
        startX = startY = -1;
        possibleMoves = [];
        drawBoard();
    }
}

function displayError(message) {
    errorMessageElement.innerText = message;
    errorMessageElement.style.display = 'block';
    setTimeout(() => {
        errorMessageElement.style.opacity = 1;
    }, 10);
    errorMessageElement.style.pointerEvents = 'auto';
}

errorMessageElement.addEventListener('click', function () {
    clearError();
});

function clearError() {
    errorMessageElement.style.opacity = 0;
    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 10000000);
    errorMessageElement.style.pointerEvents = 'none';
}

// Auto-Play Button Logic
startAutoPlayBtn.addEventListener('click', () => {
    autoPlayDialog.classList.remove('hidden');
});

backtrackingBtn.addEventListener('click', () => {
    autoPlayDialog.classList.add('hidden');
    console.log("Backtracking Algorithm Selected");
    if (startX === -1 || startY === -1) {
        displayError("Please select a starting position before running the algorithm.");
        return;
    }
    solveBacktracking(startX, startY);
});

warnsdorffBtn.addEventListener('click', () => {
    autoPlayDialog.classList.add('hidden');
    console.log("Warnsdorff's Algorithm Selected");
    if (startX === -1 || startY === -1) {
        displayError("Please select a starting position before running the algorithm.");
        return;
    }
    solveWarnsdorff(startX, startY);
});

// Flag for active auto-play
let isAutoPlaying = false;

// Backtracking Algorithm with highlighted possible moves
function solveBacktrackingAuto(x, y, moveCount = 1) {
    if (isAutoPlaying) {
        return; // Avoid overlapping execution
    }
    isAutoPlaying = true;

    function nextMove() {
        if (moveCount > rows * cols) {
            displayError("Congratulations! The Knight's Tour is completed using Backtracking!");
            isAutoPlaying = false;
            return;
        }

        board[x][y] = moveCount;
        path.push([x, y]);
        calculatePossibleMoves(x, y); // Highlight possible moves
        drawBoard();

        if (moveCount === rows * cols) {
            displayError("Congratulations! The Knight's Tour is completed using Backtracking!");
            isAutoPlaying = false;
            return;
        }

        for (let i = 0; i < 8; i++) {
            const nextX = x + moveX[i];
            const nextY = y + moveY[i];

            if (isWithinBounds(nextX, nextY) && board[nextX][nextY] === 0) {
                setTimeout(() => {
                    moveCount++;
                    x = nextX;
                    y = nextY;
                    nextMove();
                }, 500); // Auto-move every 500ms
                return;
            }
        }

        // Backtrack if no moves are available
        board[x][y] = 0;
        path.pop();
        moveCount--;
        const [prevX, prevY] = path[path.length - 1];
        x = prevX;
        y = prevY;

        setTimeout(nextMove, 500); // Continue backtracking automatically
    }

    nextMove();
}

// Warnsdorff's Algorithm with highlighted possible moves
function solveWarnsdorffAuto(x, y) {
    if (isAutoPlaying) {
        return; // Avoid overlapping execution
    }
    isAutoPlaying = true;

    board[x][y] = 1;
    path.push([x, y]);
    calculatePossibleMoves(x, y); // Highlight possible moves
    drawBoard();

    function nextMove(moveCount) {
        if (moveCount > rows * cols) {
            displayError("Congratulations! The Knight's Tour is completed using Warnsdorff's Algorithm!");
            isAutoPlaying = false;
            return;
        }

        const next = findBestMove(x, y);
        if (!next) {
            displayError("No solution exists using Warnsdorff's Algorithm from this starting point.");
            isAutoPlaying = false;
            return;
        }

        [x, y] = next;
        board[x][y] = moveCount;
        path.push([x, y]);
        calculatePossibleMoves(x, y); // Highlight possible moves
        drawBoard();

        setTimeout(() => nextMove(moveCount + 1), 500); // Auto-move every 500ms
    }

    nextMove(2);
}

// Updated Button Event Handlers
backtrackingBtn.addEventListener('click', () => {
    if (startX === -1 || startY === -1) {
        displayError("Please make one initial move by clicking on the board.");
        return;
    }
    solveBacktrackingAuto(startX, startY, 1);
});

warnsdorffBtn.addEventListener('click', () => {
    if (startX === -1 || startY === -1) {
        displayError("Please make one initial move by clicking on the board.");
        return;
    }
    solveWarnsdorffAuto(startX, startY);
});

// Helper Functions (Warnsdorff)
function findBestMove(x, y) {
    let minDegree = Infinity;
    let bestMove = null;

    for (let i = 0; i < 8; i++) {
        const nx = x + moveX[i];
        const ny = y + moveY[i];

        if (isWithinBounds(nx, ny) && board[nx][ny] === 0) {
            const degree = countMoves(nx, ny);
            if (degree < minDegree) {
                minDegree = degree;
                bestMove = [nx, ny];
            }
        }
    }

    return bestMove;
}

function countMoves(x, y) {
    let count = 0;
    for (let i = 0; i < 8; i++) {
        const nx = x + moveX[i];
        const ny = y + moveY[i];
        if (isWithinBounds(nx, ny) && board[nx][ny] === 0) {
            count++;
        }
    }
    return count;
}



// Event listeners
resetBtn.addEventListener('click', initBoard);
undoBtn.addEventListener('click', undoMove);
rowsInput.addEventListener('change', initBoard);
colsInput.addEventListener('change', initBoard);

const startGameBtn = document.getElementById('startGameBtn');
const introScreen = document.getElementById('intro');
const gameContainer = document.getElementById('game-container');

// Start Game button event listener
startGameBtn.addEventListener('click', function () {
    introScreen.classList.add('hidden');
    gameContainer.classList.add('visible');
});

// Initialize the board
initBoard();
