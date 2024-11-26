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
const warnsdorffBtn = document.getElementById('warnsdorffBtn');

let isPaused = false; // Flag to track if the game is paused
let moveCount = 0; // To track the number of moves during auto-play


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
    } else if (isNaN(inputRows) || isNaN(inputCols) || inputRows > 20 || inputCols > 20) {
        displayError("Please enter valid positive numbers for rows and columns (max: 20).");
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

    // Only display the "Game over!" message if auto-play is NOT active
    if (possibleMoves.length === 0 && path.length !== rows * cols && !isAutoPlaying) {
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
                displayCelebration();  // Trigger the celebration animation
                displayError(`Congratulations! You've completed the Knight's Tour!\n\n Do you want to play again? Please press "Reset Game" to play again or press "Main Menu" to exit. `);
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

//To display prompt messages
function displayError(message) {
    errorMessageElement.innerText = message;
    errorMessageElement.style.display = 'block';
    setTimeout(() => {
        errorMessageElement.style.opacity = 1;
    }, 10);
    errorMessageElement.style.pointerEvents = 'auto';

    // Set the color based on the message
    if (message.includes("Congratulations!")) {
        errorMessageElement.style.backgroundColor = 'green'; 
    } else if (message.includes("Game over!") || message.includes("No solution exists")) {
        errorMessageElement.style.backgroundColor = 'red'; 
    } else if (message.includes("Please make one initial move")) {
        errorMessageElement.style.backgroundColor = 'red';
        errorMessageElement.style.color = 'white';
        FadeOutErrorMessage(); 
    } else if (message.includes("No moves to undo!")){
        errorMessageElement.style.backgroundColor = 'red';
        FadeOutErrorMessage();
    } else if (message.includes("Auto-Play paused.")){
        errorMessageElement.style.backgroundColor = 'red';
    } else if (message.includes("Auto-Play resumed.")){
        errorMessageElement.style.backgroundColor = 'green';
        FadeOutErrorMessage();
    } else if (message.includes("Click 'Auto-Play' first.")){
        errorMessageElement.style.backgroundColor = 'red';
        FadeOutErrorMessage();
    } else if (message.includes("Please enter valid positive numbers")){
        errorMessageElement.style.backgroundColor = 'red';
        FadeOutErrorMessage();
    }
}
//To avoid error kay usahay dili mudisplay ang game over
function FadeOutErrorMessage(){
    setTimeout(() => {
        let fadeEffect = setInterval(() => {
            if (errorMessageElement.style.opacity > 0) {
                errorMessageElement.style.opacity -= 0.1; // Reduce opacity gradually
            } else {
                clearInterval(fadeEffect); // Stop fading when opacity reaches 0
                errorMessageElement.style.display = 'none'; // Hide the element
            }
        }, 100); // Adjust the fade speed here (100ms interval)
    }, 2000);
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
    if (startX === -1 || startY === -1) {
        displayError("Please make one initial move by clicking on the board.");
        return;
    }
    // Call the solveWarnsdorffAuto function here
    solveWarnsdorffAuto(startX, startY);
});

// Flag for active auto-play
let isAutoPlaying = false;

// Auto-Play Button Logic
startAutoPlayBtn.addEventListener('click', () => {
    if (startX === -1 || startY === -1) {
        displayError("Please make one initial move by clicking on the board.");
        return;
    }
    // Call the solveWarnsdorffAuto function here
    solveWarnsdorffAuto(startX, startY);
});


// Flag for active auto-play
let autoPlayTimer; // Variable to store the timer ID

function displayCelebration() {
    // Create the congratulatory message element
    const congratsMessage = document.createElement("div");
    congratsMessage.style.position = "fixed";
    congratsMessage.style.top = "50%";
    congratsMessage.style.left = "50%";
    congratsMessage.style.transform = "translate(-50%, -50%)";
    congratsMessage.style.fontSize = "24px";
    congratsMessage.style.fontWeight = "bold";
    congratsMessage.style.color = "#4CAF50";
    congratsMessage.style.textAlign = "center";
    congratsMessage.style.opacity = 0;
    congratsMessage.style.transition = "opacity 2s ease-out, transform 1s ease-out";
    document.body.appendChild(congratsMessage);

    // Smooth fade-in and slightly scale up the message
    setTimeout(() => {
        congratsMessage.style.opacity = 1;
        congratsMessage.style.transform = "translate(-50%, -50%) scale(1.1)";
    }, 100);

    // Add more confetti pieces for a fuller effect (200 pieces)
    for (let i = 0; i < 200; i++) { // Increase number of confetti pieces
        const confetti = document.createElement("div");
        confetti.style.position = "absolute";
        confetti.style.width = "10px";
        confetti.style.height = "10px";
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
        confetti.style.borderRadius = "50%";
        
        // Set a random animation duration and delay for each piece
        const duration = Math.random() * 2 + 2; // Duration between 2s and 4s
        const delay = Math.random() * 1; // Random delay between 0s and 1s
        
        confetti.style.animation = `confetti ${duration}s ease-in-out ${delay}s forwards`;
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = `-10%`;  // Start the confetti off-screen at the top
        document.body.appendChild(confetti);
        
        // Remove confetti after animation ends
        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }

    // Add CSS keyframes for the confetti animation dynamically
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes confetti {
            0% {
                transform: translateY(0) rotate(0);
                opacity: 1; /* Fully visible at the start */
            }
            80% {
                opacity: 1; /* Confetti stays visible until near the end */
            }
            100% {
                transform: translateY(120vh) rotate(${Math.random() * 360}deg); /* Fall beyond 100vh (off-screen) */
                opacity: 0; /* Fade out before reaching the bottom */
            }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Auto-Play Pause/Resume Button
const pauseResumeBtn = document.getElementById('pauseResumeBtn');

// Pause Auto-Play
function pauseAutoPlay() {
    if (isAutoPlaying && !isPaused) {
        clearTimeout(autoPlayTimer); // Stop the scheduled auto-play move
        isPaused = true;
        pauseResumeBtn.textContent = "Resume"; // Update button text
        displayError("Auto-Play paused. Click 'Resume' to continue.");
    } else if (!isAutoPlaying) {
        isPaused = false;
        pauseResumeBtn.textContent = "Pause Auto-Play"; // Update button text
        displayError("Click 'Auto-Play' first.");
    } else if (isAutoPlaying && isPaused) {
        isPaused = false;
        pauseResumeBtn.textContent = "Pause Auto-Play"; // Update button text
        displayError("Auto-Play resumed.");
        // Resume from the current position
        continueAutoPlay(); // NEW: Continue from current position
    }
}

// Warnsdorff's Algorithm Auto-Play Logic
function solveWarnsdorffAuto(x, y) {
    if (isAutoPlaying) {
        return; // Avoid overlapping execution
    }
    isAutoPlaying = true;

    // Check if the board is already solved
    if (path.length === rows * cols) {
        displayCelebration();  // Trigger the celebration animation
        displayError(`Congratulations! The Knight's Tour is already completed. \n\n Do you want to play again? Please press "Reset Game" to play again or press "Main Menu" to exit. `);
        isAutoPlaying = false;
        return;
    }

    // Start auto-play
    continueAutoPlay(); // NEW: Start or resume auto-play
}

function continueAutoPlay() {
    // Start from the current position in the path
    const currentMoveCount = path.length;

    function nextMove(moveCount, x, y) {
        if (moveCount > rows * cols) {
            displayCelebration(); // Trigger the celebration animation
            displayError(`Congratulations! The Knight's Tour is completed using Warnsdorff's mixed with backtrack Algorithm! \n\n Do you want to play again? Please press "Reset Game" to play again or press "Main Menu" to exit. `);
            isAutoPlaying = false;
            return;
        }

        if (isPaused) {
            return; // Stop progressing if paused
        }

        // Find the best possible next move based on Warnsdorff's heuristic
        const next = findBestMove(x, y);
        if (!next) {
            displayError(`No solution exists using Warnsdorff's mixed with backtrack Algorithm from this starting point. You visited ${moveCount - 1} squares out of ${rows * cols} possible on a ${rows}x${cols} board.`);
            isAutoPlaying = false;
            return false;
        }

        const [nextX, nextY] = next;
        path.push([nextX, nextY]);
        board[nextX][nextY] = moveCount;
        calculatePossibleMoves(nextX, nextY); // Highlight possible moves
        drawBoard();

        // Schedule the next move, store the timer ID
        autoPlayTimer = setTimeout(() => {
            if (!nextMove(moveCount + 1, nextX, nextY)) {
                // If next move didn't work, backtrack by removing the last move
                path.pop();
                board[nextX][nextY] = -1;
            }
        }, 500); // Adjust speed of auto-play

        return true;
    }

    // Get the current position
    const [currentX, currentY] = path[path.length - 1];
    nextMove(currentMoveCount + 1, currentX, currentY);
}

pauseResumeBtn.addEventListener('click', pauseAutoPlay);



// Updated Button Event Handlers
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

const MainMenuBtn = document.getElementById('MainMenuBtn');
const startGameBtn = document.getElementById('startGameBtn');
const introScreen = document.getElementById('intro');
const gameContainer = document.getElementById('game-container');

// Start Game button event listener
startGameBtn.addEventListener('click', function () {
    introScreen.classList.add('hidden');
    gameContainer.classList.add('visible');
});


// Main Menu button functionality
MainMenuBtn.addEventListener('click', function () {
    // Make intro screen visible and hide the game container
    introScreen.classList.add('visible');  // Show the intro screen
    introScreen.classList.remove('hidden'); // Remove the hidden class (if present)
    
    gameContainer.classList.add('hidden'); // Hide the game container
    gameContainer.classList.remove('visible'); // Remove the visible class (if present)

    // Trigger the click event programmatically
    resetBtn.click();

    isPaused = false;
    pauseResumeBtn.textContent = "Pause Auto-Play"; // Update button text

});

resetBtn.addEventListener('click', () => {
    // Stop auto-play if it's active
    isAutoPlaying = false; 

    isPaused = false;
    pauseResumeBtn.textContent = "Pause Auto-Play"; // Update button text

    // Clear the auto-play timer
    clearTimeout(autoPlayTimer); 
    initBoard(); 
});


// Initialize the board
initBoard();

