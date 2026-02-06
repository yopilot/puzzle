const container = document.getElementById('puzzle-container');
const startBtn = document.getElementById('start-btn');
const victoryOverlay = document.getElementById('victory-overlay');
const valentineReveal = document.getElementById('valentine-reveal');
const header = document.querySelector('header');

const gridSize = 3;
let tiles = []; // Holds the current state of the board. Index = position, Value = tile ID (0-8)
let emptyTileIndex = 8; // The index in the 'tiles' array where the empty tile is currently located
let isPlaying = false;

// Initialize the board in solved state
function initGame() {
    tiles = Array.from({length: gridSize * gridSize}, (_, i) => i);
    emptyTileIndex = gridSize * gridSize - 1;
    render();
}

// Convert index to row/col
function getCoords(index) {
    return {
        row: Math.floor(index / gridSize),
        col: index % gridSize
    };
}

// Check if a tile can move (is adjacent to empty slot)
function canMove(index) {
    const tilePos = getCoords(index);
    const emptyPos = getCoords(emptyTileIndex);
    
    return (Math.abs(tilePos.row - emptyPos.row) + Math.abs(tilePos.col - emptyPos.col)) === 1;
}

// Move tile
function moveTile(index) {
    if (!isPlaying) return;
    
    if (canMove(index)) {
        // Swap
        [tiles[index], tiles[emptyTileIndex]] = [tiles[emptyTileIndex], tiles[index]];
        emptyTileIndex = index;
        render(); // Re-render to update positions
        checkWin();
    }
}

// Shuffle by simulating valid moves
function shuffle() {
    let moves = 100;
    let lastMove = -1;

    // Use an interval for a visual shuffle effect or just instant?
    // Instant is better for "Start" button logic.
    
    for (let i = 0; i < moves; i++) {
        const potentialMoves = [];
        const emptyPos = getCoords(emptyTileIndex);
        
        // Check 4 directions
        const neighbors = [
            { r: emptyPos.row - 1, c: emptyPos.col }, // Up
            { r: emptyPos.row + 1, c: emptyPos.col }, // Down
            { r: emptyPos.row, c: emptyPos.col - 1 }, // Left
            { r: emptyPos.row, c: emptyPos.col + 1 }  // Right
        ];

        neighbors.forEach(n => {
            if (n.r >= 0 && n.r < gridSize && n.c >= 0 && n.c < gridSize) {
                const index = n.r * gridSize + n.c;
                if (index !== lastMove) { // Don't undo immediate last move
                    potentialMoves.push(index);
                }
            }
        });

        // Pick random move
        if (potentialMoves.length > 0) {
            const moveIndex = potentialMoves[Math.floor(Math.random() * potentialMoves.length)];
            
            // Swap in state
            [tiles[moveIndex], tiles[emptyTileIndex]] = [tiles[emptyTileIndex], tiles[moveIndex]];
            
            // Update tracking
            lastMove = emptyTileIndex; // The tile that just moved into the empty spot is now at emptyTileIndex (before swap) -> wait.
             // The empty spot MOVED to moveIndex. The TILE moved to old empty spot.
             // We want to avoid moving the SAME tile back.
             // If we swap tiles[A] (empty) and tiles[B] (tile), empty becomes B.
             // Next turn, if we pick A, we swap back.
             
            emptyTileIndex = moveIndex;
        }
    }
    render();
    isPlaying = true;
    startBtn.textContent = 'Shuffle Again';
}

function render() {
    container.innerHTML = '';
    
    tiles.forEach((tileId, positionIndex) => {
        // Calculate where this tile should be visually on the board
        const { row, col } = getCoords(positionIndex);
        
        // Create element
        const tile = document.createElement('div');
        tile.className = `tile ${tileId === 8 ? 'empty' : ''}`;
        
        // Position on board (percentage for responsiveness)
        tile.style.top = `${row * (100/gridSize)}%`;
        tile.style.left = `${col * (100/gridSize)}%`;
        
        // Size of tile
        tile.style.width = `${100/gridSize}%`;
        tile.style.height = `${100/gridSize}%`;
        
        if (tileId !== 8) {
            // Background position based on the TILE ID (original image position)
            const correctCoords = getCoords(tileId);
            
            // We need to shift the background to show the correct part
            // For 3x3: 0%, 50%, 100%
            // Formula: coord * 100 / (gridSize - 1)
            const bgX = correctCoords.col * 100 / (gridSize - 1);
            const bgY = correctCoords.row * 100 / (gridSize - 1);
            
            tile.style.backgroundPosition = `${bgX}% ${bgY}%`;
            
            // Add number
            const number = document.createElement('span');
            number.className = 'tile-number';
            number.textContent = tileId + 1;
            tile.appendChild(number);

            // Click event
            tile.addEventListener('click', () => moveTile(positionIndex));
        }
        
        container.appendChild(tile);
    });
}

function checkWin() {
    const isSolved = tiles.every((val, index) => val === index);
    
    if (isSolved && isPlaying) {
        isPlaying = false;
        onWin();
    }
}

function onWin() {
    // 1. Show the seamless full photo (victory overlay)
    setTimeout(() => {
        victoryOverlay.classList.add('visible');
        header.querySelector('h1').textContent = "Beautiful...";
        
        // 2. Wait 5 seconds then show reveal
        setTimeout(() => {
            triggerValentineReveal();
        }, 5000);
        
    }, 500); // Small delay after last move
}

function triggerValentineReveal() {
    valentineReveal.classList.add('visible');
    header.style.opacity = '0'; // Clean look
    document.querySelector('.controls').style.opacity = '0';
}

startBtn.addEventListener('click', shuffle);

// Initial Render
initGame();
