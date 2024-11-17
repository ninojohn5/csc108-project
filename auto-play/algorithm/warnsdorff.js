// Define the Warnsdorff's algorithm logic here
function solveWarnsdorff(board, startX, startY) {
    const moveX = [2, 1, -1, -2, -2, -1, 1, 2];
    const moveY = [1, 2, 2, 1, -1, -2, -2, -1];
    
    const rows = board.length;
    const cols = board[0].length;
    let path = [[startX, startY]];
    
    board[startX][startY] = 1; // Start position
    let currentPos = [startX, startY];
    
    while (path.length < rows * cols) {
        const nextMove = getWarnsdorffMove(board, currentPos[0], currentPos[1], moveX, moveY);
        if (!nextMove) return null; // No valid move found
        
        currentPos = nextMove;
        board[currentPos[0]][currentPos[1]] = path.length + 1;
        path.push(currentPos);
    }
    
    return path; // Return the solved path
}

function getWarnsdorffMove(board, x, y, moveX, moveY) {
    let minDegIdx = -1;
    let minDeg = 9;
    
    for (let i = 0; i < 8; i++) {
        const nx = x + moveX[i];
        const ny = y + moveY[i];
        if (isWithinBounds(nx, ny, board) && board[nx][ny] === 0) {
            let degree = countPossibleMoves(board, nx, ny, moveX, moveY);
            if (degree < minDeg) {
                minDeg = degree;
                minDegIdx = i;
            }
        }
    }
    
    if (minDegIdx === -1) return null; // No valid move found
    
    return [x + moveX[minDegIdx], y + moveY[minDegIdx]]; // Return next move
}

function countPossibleMoves(board, x, y, moveX, moveY) {
    let count = 0;
    for (let i = 0; i < 8; i++) {
        const nx = x + moveX[i];
        const ny = y + moveY[i];
        if (isWithinBounds(nx, ny, board) && board[nx][ny] === 0) {
            count++;
        }
    }
    return count;
}
