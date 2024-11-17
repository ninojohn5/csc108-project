// Backtracking function to solve Knight's Tour
export function solveKnightTour(boardSize, startX, startY) {
    const moves = [
        [2, 1], [1, 2], [-1, 2], [-2, 1],
        [-2, -1], [-1, -2], [1, -2], [2, -1],
    ];
    const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(-1));
    board[startX][startY] = 0;

    function isValidMove(x, y) {
        return x >= 0 && y >= 0 && x < boardSize && y < boardSize && board[x][y] === -1;
    }

    function backtrack(x, y, moveCount) {
        if (moveCount === boardSize * boardSize) {
            return true; // Solution found
        }

        for (const [dx, dy] of moves) {
            const nextX = x + dx;
            const nextY = y + dy;
            if (isValidMove(nextX, nextY)) {
                board[nextX][nextY] = moveCount;
                if (backtrack(nextX, nextY, moveCount + 1)) {
                    return true;
                }
                board[nextX][nextY] = -1; // Backtrack
            }
        }

        return false; // No solution for this path
    }

    if (backtrack(startX, startY, 1)) {
        return board;
    } else {
        return null; // No solution exists
    }
}
