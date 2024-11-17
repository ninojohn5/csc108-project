// Define the backtracking algorithm logic here
function solveBacktracking(board, startX, startY) {
    const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
    const moveY = [1, 2, 2, 1, -1, -2, -2, -1];
    
    const rows = board.length;
    const cols = board[0].length;
    let path = [[startX, startY]];

    board[startX][startY] = 1; // Start position
    if (backtrack(board, startX, startY, 2, path, moveX, moveY)) {
        return path; // Return the solved path
    } else {
        return null; // No solution found
    }
}

function backtrack(board, x, y, moveCount, path, moveX, moveY) {
    if (moveCount === board.length * board[0].length) {
        return true; // All squares visited
    }

    for (let i = 0; i < 8; i++) {
        const nx = x + moveX[i];
        const ny = y + moveY[i];
        if (isWithinBounds(nx, ny, board) && board[nx][ny] === 0) {
            board[nx][ny] = moveCount;
            path.push([nx, ny]);

            if (backtrack(board, nx, ny, moveCount + 1, path, moveX, moveY)) {
                return true; // Found the solution
            }

            // Undo the move if it doesn't work out
            board[nx][ny] = 0;
            path.pop();
        }
    }

    return false; // No solution found
}

function isWithinBounds(x, y, board) {
    return x >= 0 && x < board.length && y >= 0 && y < board[0].length;
}
