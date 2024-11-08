window.onload = function() {
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');

    const ROWS = 20;
    const COLS = 10;
    const BLOCK_SIZE = 20;

    context.scale(BLOCK_SIZE, BLOCK_SIZE);

    let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    let score = 0;

    const pieces = 'IJLOSTZ';
    const colors = [
        null,
        '#FF5733', // I
        '#C70039', // J
        '#900C3F', // L
        '#581845', // O
        '#FFC300', // S
        '#DAF7A6', // T
        '#FF33A6'  // Z
    ];

    let piece = {
        pos: { x: 0, y: 0 },
        matrix: null,
    };

    let dropCounter = 0;
    let dropInterval = 1000;  // 기본 낙하 속도
    let lastTime = 0;

    // 시작 게임 함수
    function startGame() {
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        score = 0;
        updateScore();
        spawnPiece();
        lastTime = 0;
        dropCounter = 0;
        update();
    }

    // 점수 업데이트
    function updateScore() {
        document.getElementById('score').innerText = `Score: ${score}`;
    }

    // 블록 생성
    function spawnPiece() {
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        piece.matrix = createPiece(type);
        piece.pos = { x: Math.floor(COLS / 2) - 1, y: 0 };
        if (collide(board, piece)) {
            board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
            score = 0;
            updateScore();
        }
    }

    // 블록 생성 로직
    function createPiece(type) {
        switch (type) {
            case 'T': return [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ];
            case 'O': return [
                [1, 1],
                [1, 1]
            ];
            case 'L': return [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ];
            case 'J': return [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ];
            case 'I': return [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            case 'S': return [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ];
            case 'Z': return [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ];
        }
    }

    // 블록 회전
    function rotate(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
    }

    function rotatePiece() {
        const oldMatrix = piece.matrix;
        piece.matrix = rotate(piece.matrix);

        if (collide(board, piece)) {
            piece.matrix = oldMatrix; // 충돌 시 회전 취소
        }
    }

    // 그리기 함수
    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = colors[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, COLS, ROWS);

        drawMatrix(board, { x: 0, y: 0 });
        drawMatrix(piece.matrix, piece.pos);
    }

    // 충돌 감지 함수
    function collide(board, piece) {
        const [m, o] = [piece.matrix, piece.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    // 블록 보드에 고정
    function merge(board, piece) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + piece.pos.y][x + piece.pos.x] = value;
                }
            });
        });
        clearLines();  // 줄 삭제
    }

    // 줄 삭제 함수
    function clearLines() {
        outer: for (let y = board.length - 1; y >= 0; --y) {
            for (let x = 0; x < board[y].length; ++x) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            const row = board.splice(y, 1)[0].fill(0); // 줄 삭제
            board.unshift(row); // 맨 위에 빈 줄 추가
            score += 50; // 점수 추가
            updateScore();
            ++y;
        }
    }

    // 업데이트 함수
    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            piece.pos.y++;
            if (collide(board, piece)) {
                piece.pos.y--;
                merge(board, piece);
                spawnPiece();
            }
            dropCounter = 0;
        }

        draw();
        requestAnimationFrame(update);
    }

    // 키보드 이벤트 처리
    function movePiece(offset) {
        piece.pos.x += offset;
        if (collide(board, piece)) {
            piece.pos.x -= offset;
        }
    }

    function dropPiece() {
        piece.pos.y++;
        if (collide(board, piece)) {
            piece.pos.y--;
            merge(board, piece);
            spawnPiece();
            score += 10;
            updateScore();
        }
        dropCounter = 0;
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            movePiece(-1); // 왼쪽 이동
        } else if (event.key === 'ArrowRight') {
            movePiece(1);  // 오른쪽 이동
        } else if (event.key === 'ArrowDown') {
            dropPiece();   // 빠르게 아래로 이동
        } else if (event.key === 'r' || event.key === 'R') {
            rotatePiece(); // 블록 회전
        }
    });

    window.startGame = startGame;
};
