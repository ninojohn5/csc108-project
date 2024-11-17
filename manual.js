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

window.onload = function() {
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
    console.log(possibleMoves);  // Debug log to check possible moves

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

    // Only allow clicks inside the board area (within bounds of rows and columns)
    if (x >= 0 && x < rows && y >= 0 && y < cols) {
        if (startX === -1 && startY === -1) {
            // Set the initial knight position
            startX = x;
            startY = y;
            board[x][y] = path.length + 1;
            path.push([x, y]);
            calculatePossibleMoves(x, y);  // Check for possible moves after setting the initial position
            clearError();
            drawBoard();
        } else if (possibleMoves.some(([nx, ny]) => nx === x && ny === y)) {
            // Move the knight
            startX = x;
            startY = y;
            board[x][y] = path.length + 1;
            path.push([x, y]);
            calculatePossibleMoves(x, y);  // Check for possible moves after each move
            clearError();
            drawBoard();

            // Check if the tour is complete (all squares visited)
            if (path.length === rows * cols) {
                displayError("Congratulations! You've completed the Knight's Tour!");
            }
        }
    }
});



// Undo the last move
function undoMove() {
    if (path.length > 1) {
        // If there are moves to undo, remove the last move
        const [prevX, prevY] = path.pop();
        board[prevX][prevY] = 0;
        const [lastX, lastY] = path[path.length - 1];
        startX = lastX;
        startY = lastY;
        calculatePossibleMoves(startX, startY);
        drawBoard();
        clearError();
    } else if (path.length === 1) {
        // If there's only the starting position left, remove it
        const [initialX, initialY] = path.pop();
        board[initialX][initialY] = 0;
        startX = startY = -1;
        possibleMoves = []; // Clear possible moves
        drawBoard();
        clearError();
    } else {
        // No moves left to undo, clear the board completely and display error message
        displayError("No moves to undo! The board has been cleared.");
        board = Array.from({ length: rows }, () => Array(cols).fill(0)); // Reset the board
        path = [];
        startX = startY = -1;
        possibleMoves = []; // Clear possible moves
        drawBoard(); // Redraw the cleared board
    }
}

function displayError(message) {
    console.log("Error displayed:", message); // Debug log
    errorMessageElement.innerText = message; // Set the error message text
    errorMessageElement.style.display = 'block'; // Ensure the element is visible
    setTimeout(() => {
        errorMessageElement.style.opacity = 1; // Fade in
    }, 10); // Small timeout for the transition effect
    errorMessageElement.style.pointerEvents = 'auto'; // Allow interactions
}

// Only hide the error when explicitly clicked
errorMessageElement.addEventListener('click', function () {
    clearError(); // Attach clear logic to user click
});

function clearError() {
    errorMessageElement.style.opacity = 0; // Fade out
    setTimeout(() => {
        errorMessageElement.style.display = 'none'; // Hide after transition
    }, 10000000); 
    errorMessageElement.style.pointerEvents = 'none'; // Disable interactions
}

// Event listeners
resetBtn.addEventListener('click', initBoard);
undoBtn.addEventListener('click', undoMove);
rowsInput.addEventListener('change', initBoard);
colsInput.addEventListener('change', initBoard);

// Get the start game button and intro screen
const startGameBtn = document.getElementById('startGameBtn');
const introScreen = document.getElementById('intro');
const gameContainer = document.getElementById('game-container');

// Start Game button event listener
startGameBtn.addEventListener('click', function() {
    // Hide the intro screen with a fade-out effect
    introScreen.classList.add('hidden');

    // Show the game container with a fade-in effect
    gameContainer.classList.add('visible');
});

// Handle button clicks to switch between algorithms
const solveBacktrackingBtn = document.getElementById('solveBacktrackingBtn');
const solveWarnsdorffBtn = document.getElementById('solveWarnsdorffBtn');

solveBacktrackingBtn.addEventListener('click', function() {
    const path = solveBacktracking(board, startX, startY);
    if (path) {
        path.forEach(([x, y], index) => {
            board[x][y] = index + 1; // Mark the path on the board
        });
        drawBoard(); // Draw the updated board
    } else {
        displayError("No solution found using backtracking.");
    }
});

solveWarnsdorffBtn.addEventListener('click', function() {
    const path = solveWarnsdorff(board, startX, startY);
    if (path) {
        path.forEach(([x, y], index) => {
            board[x][y] = index + 1; // Mark the path on the board
        });
        drawBoard(); // Draw the updated board
    } else {
        displayError("No solution found using Warnsdorff's algorithm.");
    }
});



// Initialize the board
initBoard();
