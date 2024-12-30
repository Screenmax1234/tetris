const canvas = document.getElementById('tetrisCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');

    const gridWidth = 10;
    const gridHeight = 20;
    const blockSize = 30;

    let grid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(0));

    const pieces = [
      [[1, 1, 1, 1]],
      [[1, 1, 1], [0, 1, 0]],
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1, 1], [1, 1, 0]],
      [[1, 1], [1, 1]],
      [[1, 0, 0], [1, 1, 1]],
      [[0, 0, 1], [1, 1, 1]],
    ];

    const colors = [
      'cyan', 'purple', 'orange', 'blue', 'yellow', 'red', 'green'
    ];

    let currentPiece;
    let currentPieceX;
    let currentPieceY;
    let currentPieceRotation;
    let score = 0;
    let gameRunning = true;
    let dropCounter = 0;
    let dropInterval = 1000;

    function getRandomPiece() {
      const index = Math.floor(Math.random() * pieces.length);
      return {
        shape: pieces[index],
        color: colors[index],
      };
    }

    function createPiece() {
      const piece = getRandomPiece();
      currentPiece = piece.shape;
      currentPieceColor = piece.color;
      currentPieceX = Math.floor(gridWidth / 2) - Math.floor(currentPiece[0].length / 2);
      currentPieceY = 0;
      currentPieceRotation = 0;

      if (!isValidMove(currentPiece, currentPieceX, currentPieceY)) {
        gameRunning = false;
        alert('Game Over!');
      }
    }

    function rotatePiece(piece) {
      const rows = piece.length;
      const cols = piece[0].length;
      const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          rotated[j][rows - 1 - i] = piece[i][j];
        }
      }
      return rotated;
    }

    function drawBlock(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      ctx.strokeStyle = 'black';
      ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }

    function drawGrid() {
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          if (grid[y][x]) {
            drawBlock(x, y, grid[y][x]);
          }
        }
      }
    }

    function drawPiece() {
      for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
          if (currentPiece[y][x]) {
            drawBlock(currentPieceX + x, currentPieceY + y, currentPieceColor);
          }
        }
      }
    }

    function isValidMove(piece, x, y) {
      for (let row = 0; row < piece.length; row++) {
        for (let col = 0; col < piece[row].length; col++) {
          if (piece[row][col]) {
            const gridX = x + col;
            const gridY = y + row;

            if (gridX < 0 || gridX >= gridWidth || gridY >= gridHeight || (gridY >= 0 && grid[gridY][gridX])) {
              return false;
            }
          }
        }
      }
      return true;
    }

    function movePiece(dx, dy) {
      const newX = currentPieceX + dx;
      const newY = currentPieceY + dy;

      if (isValidMove(currentPiece, newX, newY)) {
        currentPieceX = newX;
        currentPieceY = newY;
      } else if (dy === 1) {
        freezePiece();
      }
    }

    function freezePiece() {
      for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
          if (currentPiece[y][x]) {
            grid[currentPieceY + y][currentPieceX + x] = currentPieceColor;
          }
        }
      }
      clearLines();
      createPiece();
    }

    function clearLines() {
      for (let y = gridHeight - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell)) {
          grid.splice(y, 1);
          grid.unshift(Array(gridWidth).fill(0));
          score += 100;
          scoreDisplay.textContent = score;
          y++;
        }
      }
    }

    function gameLoop() {
      if (!gameRunning) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      drawPiece();

      dropCounter += 16;
      if (dropCounter > dropInterval) {
        movePiece(0, 1);
        dropCounter = 0;
      }

      requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (e) => {
      if (!gameRunning) return;
      if (e.code === 'ArrowLeft') {
        movePiece(-1, 0);
      } else if (e.code === 'ArrowRight') {
        movePiece(1, 0);
      } else if (e.code === 'ArrowDown') {
        movePiece(0, 1);
      } else if (e.code === 'ArrowUp') {
        const rotated = rotatePiece(currentPiece);
        if (isValidMove(rotated, currentPieceX, currentPieceY)) {
          currentPiece = rotated;
        }
      }
    });

    createPiece();
    gameLoop();
