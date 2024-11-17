// /algorithms/backtracking/backtracking.js
const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
const moveY = [1, 2, 2, 1, -1, -2, -2, -1];

function solveBacktrackingAuto(x, y, moveCount = 1, board, path, rows, cols, drawBoard, calculatePossibleMoves, displayError) {
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

            if (isWithinBounds(nextX, nextY, rows, cols) && board[nextX][nextY] === 0) {
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
