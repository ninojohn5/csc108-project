// /algorithms/warnsdorff/warnsdorff.js
const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
const moveY = [1, 2, 2, 1, -1, -2, -2, -1];

function solveWarnsdorffAuto(x, y, rows, cols, board, path, calculatePossibleMoves, drawBoard, displayError) {
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

        const next = findBestMove(x, y, board, rows, cols);
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

function findBestMove(x, y, board, rows, cols) {
    let minDegree = Infinity;
    let bestMove = null;

    for (let i = 0; i < 8; i++) {
        const nx = x + moveX[i];
        const ny = y + moveY[i];

        if (isWithinBounds(nx, ny, rows, cols) && board[nx][ny] === 0) {
            const degree = countMoves(nx, ny, board, rows, cols);
            if (degree < minDegree) {
                minDegree = degree;
                bestMove = [nx, ny];
            }
        }
    }

    return bestMove;
}

function countMoves(x, y, board, rows, cols) {
    let count = 0;
    for (let i = 0; i < 8; i++) {
        const nx = x + moveX[i];
        const ny = y + moveY[i];
        if (isWithinBounds(nx, ny, rows, cols) && board[nx][ny] === 0) {
            count++;
        }
    }
    return count;
}
