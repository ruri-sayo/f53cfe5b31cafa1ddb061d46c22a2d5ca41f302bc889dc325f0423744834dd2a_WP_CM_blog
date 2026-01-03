/**
 * Flow Logic - Puzzle Game (Ver. 1.1)
 * Update: Added Pipe/Direction Nodes & Vector-based Simulation
 */

const GRID_COLS = 6;
const GRID_ROWS = 8;

// ■ ノード定義：ロジックと「飛び先ベクトル」を定義
// dx: -1(左), 0(直下), 1(右) / dy: 1(一段下)
const NODE_TYPES = {
    // --- 配管系 (Routing) ---
    PIPE_DOWN: { 
        id: 'pipe_down', label: '↓', 
        calc: (v) => [{ dx: 0, dy: 1, v: v }] 
    },
    PIPE_LEFT: { 
        id: 'pipe_left', label: '↙', 
        calc: (v) => [{ dx: -1, dy: 1, v: v }] 
    },
    PIPE_RIGHT: { 
        id: 'pipe_right', label: '↘', 
        calc: (v) => [{ dx: 1, dy: 1, v: v }] 
    },
    
    // --- ロジック系 (Logic) ---
    SPLIT2: { 
        id: 'split2', label: '÷2', 
        calc: (v) => [
            { dx: -1, dy: 1, v: Math.floor(v / 2) }, // 左下
            { dx: 1, dy: 1, v: Math.ceil(v / 2) }    // 右下
        ]
    },
    SPLIT3: { 
        id: 'split3', label: '÷3', 
        calc: (v) => {
            const d = Math.floor(v / 3);
            return [
                { dx: -1, dy: 1, v: d },             // 左下
                { dx: 0, dy: 1, v: d },              // 真下
                { dx: 1, dy: 1, v: v - (d * 2) }     // 右下
            ];
        }
    },
    MERGE: { 
        id: 'merge', label: '+', 
        calc: (v) => [{ dx: 0, dy: 1, v: v }] // 単に集めて下に流す
    },
    TRASH: { 
        id: 'trash', label: '🗑️', 
        calc: (v) => [] // 何も出力しない
    }
};

// 難易度設定：配管ノードは最初から使えるように変更
const DIFFICULTY_CONFIG = {
    1: { sources: [12, 16, 24], nodes: ['pipe_down', 'pipe_left', 'pipe_right', 'split2'], complex: 3 },
    2: { sources: [36, 48, 60], nodes: ['pipe_down', 'pipe_left', 'pipe_right', 'split2', 'split3', 'merge'], complex: 5 },
    3: { sources: [120, 180, 240], nodes: ['pipe_down', 'pipe_left', 'pipe_right', 'split2', 'split3', 'merge', 'trash'], complex: 8 },
    4: { sources: [2520, 5040], nodes: ['pipe_down', 'pipe_left', 'pipe_right', 'split2', 'split3', 'merge', 'trash'], complex: 12 }
};

let state = {
    level: 1,
    sourceVal: 0,
    grid: [],
    goals: []
};

// --- Initialization (変更なし) ---
window.onload = () => {
    loadProgress();
    initGrid();
    startLevel();
    
    document.getElementById('run-btn').addEventListener('click', runSimulation);
    document.getElementById('reset-btn').addEventListener('click', resetBoard);
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);
};

function loadProgress() {
    const saved = localStorage.getItem('flow_puzzle_level');
    if (saved) state.level = parseInt(saved, 10);
}

function saveProgress() {
    localStorage.setItem('flow_puzzle_level', state.level);
}

// --- Grid System (変更なし) ---
function initGrid() {
    const board = document.getElementById('grid-board');
    board.innerHTML = '';
    state.grid = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));

    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell droppable';
            cell.dataset.x = x;
            cell.dataset.y = y;
            const flowTag = document.createElement('span');
            flowTag.className = 'flow-value';
            cell.appendChild(flowTag);
            cell.addEventListener('dragover', e => e.preventDefault());
            cell.addEventListener('drop', handleDrop);
            cell.addEventListener('contextmenu', handleRightClick);
            board.appendChild(cell);
        }
    }
}

// --- Level Generator (微調整) ---
function startLevel() {
    const diffRank = Math.min(4, Math.ceil(state.level / 2));
    const config = DIFFICULTY_CONFIG[diffRank];
    
    state.sourceVal = config.sources[Math.floor(Math.random() * config.sources.length)];
    updateToolbox(config.nodes);

    state.grid.forEach(row => row.fill(null));
    state.goals = [];
    document.querySelectorAll('.placed-node').forEach(n => n.remove());
    document.querySelectorAll('.flow-value').forEach(f => { f.innerText = ''; f.parentElement.classList.remove('has-flow', 'error'); });

    document.getElementById('level-display').innerText = state.level;
    document.getElementById('source-val').innerText = state.sourceVal;
    document.getElementById('modal').classList.add('hidden');

    generatePuzzle(config, diffRank);
}

function updateToolbox(allowedNodes) {
    const box = document.getElementById('toolbox-items');
    box.innerHTML = '';
    allowedNodes.forEach(typeKey => {
        const type = NODE_TYPES[typeKey.toUpperCase()];
        if(!type) return;
        const div = document.createElement('div');
        div.className = 'node-item';
        div.draggable = true;
        div.innerText = type.label;
        div.dataset.type = typeKey;
        div.addEventListener('dragstart', (e) => e.dataTransfer.setData('type', typeKey));
        box.appendChild(div);
    });
}

function generatePuzzle(config, difficulty) {
    const startX = Math.floor(Math.random() * GRID_COLS);
    placeNodeVisual(startX, 0, 'SOURCE', state.sourceVal);
    state.grid[0][startX] = { type: 'source', val: state.sourceVal };

    // 簡易ゴール生成ロジック
    // ※本格的なパス探索は省略し、解ける可能性が高い数値を設定
    let target1 = Math.floor(state.sourceVal / 2); // 基本は半分
    if (difficulty >= 2) {
        // Lv2以降は割り切れる数でランダム分割
        const div = [2, 3, 4, 5, 6].find(d => state.sourceVal % d === 0) || 2;
        target1 = state.sourceVal / div;
    }

    const goalX1 = Math.floor(Math.random() * GRID_COLS);
    placeNodeVisual(goalX1, GRID_ROWS - 1, 'GOAL', target1);
    state.grid[GRID_ROWS - 1][goalX1] = { type: 'goal', req: target1 };
    state.goals.push({ x: goalX1, y: GRID_ROWS - 1, req: target1, satisfied: false });

    // 2つ目のゴール（確率）
    if (difficulty > 1 && Math.random() > 0.3) {
        let goalX2 = Math.floor(Math.random() * GRID_COLS);
        while(goalX1 === goalX2) goalX2 = Math.floor(Math.random() * GRID_COLS);
        
        let target2 = state.sourceVal - target1; // 残りをターゲットに
        // 残りが多すぎる場合はさらに分割した値を
        if(target2 > target1) target2 = target1;

        placeNodeVisual(goalX2, GRID_ROWS - 1, 'GOAL', target2);
        state.grid[GRID_ROWS - 1][goalX2] = { type: 'goal', req: target2 };
        state.goals.push({ x: goalX2, y: GRID_ROWS - 1, req: target2, satisfied: false });
    }
}

// --- Interaction (変更なし) ---
function handleDrop(e) {
    e.preventDefault();
    const typeKey = e.dataTransfer.getData('type');
    if (!typeKey) return;
    const x = parseInt(e.target.closest('.cell').dataset.x);
    const y = parseInt(e.target.closest('.cell').dataset.y);
    if (state.grid[y][x] || y === 0 || y === GRID_ROWS - 1) return;
    
    const typeDef = NODE_TYPES[typeKey.toUpperCase()];
    state.grid[y][x] = { type: typeKey };
    placeNodeVisual(x, y, typeKey, typeDef.label);
}

function handleRightClick(e) {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    if (y === 0 || y === GRID_ROWS - 1 || !state.grid[y][x]) return;
    
    state.grid[y][x] = null;
    const node = cell.querySelector('.placed-node');
    if (node) node.remove();
    resetFlowDisplay();
}

function placeNodeVisual(x, y, type, label) {
    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    const div = document.createElement('div');
    // クラス名生成の安全策
    const safeType = type.toLowerCase().replace('_', '-');
    div.className = `placed-node type-${safeType}`;
    
    if (type === 'GOAL') div.innerHTML = `GOAL<br>=${label}`;
    else if (type === 'SOURCE') div.innerHTML = `${label}`;
    else div.innerText = label;
    
    cell.appendChild(div);
}

// --- Simulation Logic (大幅リファクタリング) ---

function resetFlowDisplay() {
    document.querySelectorAll('.flow-value').forEach(el => {
        el.innerText = '';
        el.parentElement.classList.remove('has-flow', 'error');
    });
    state.goals.forEach(g => g.satisfied = false);
}

function resetBoard() {
    for(let y=1; y<GRID_ROWS-1; y++) {
        for(let x=0; x<GRID_COLS; x++) {
            if(state.grid[y][x]) {
                state.grid[y][x] = null;
                const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
                const n = cell.querySelector('.placed-node');
                if(n) n.remove();
            }
        }
    }
    resetFlowDisplay();
}

function runSimulation() {
    resetFlowDisplay();

    // 流量マップ
    let flowMap = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(0));
    
    // Source注入
    state.grid[0].forEach((node, x) => {
        if (node && node.type === 'source') {
            flowMap[0][x] = node.val;
            showFlow(x, 0, node.val);
        }
    });

    // 行ごとにシミュレーション
    for (let y = 0; y < GRID_ROWS - 1; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            const val = flowMap[y][x];
            if (val <= 0) continue;

            const node = state.grid[y][x];

            // 1. ノードがない場合（自由落下）
            if (!node) {
                addToFlow(x, y + 1, val, flowMap);
                continue;
            }

            // 2. 特殊ノード（Source/Goal）
            if (node.type === 'source') {
                addToFlow(x, y + 1, val, flowMap);
                continue;
            }
            if (node.type === 'goal') continue;

            // 3. 一般ノード（定義されたベクトルに従って分配）
            const typeDef = NODE_TYPES[node.type.toUpperCase()];
            if (typeDef) {
                const outputs = typeDef.calc(val);
                outputs.forEach(out => {
                    const targetX = x + out.dx;
                    const targetY = y + out.dy;
                    // グリッド範囲内なら流す
                    if (targetX >= 0 && targetX < GRID_COLS && targetY < GRID_ROWS) {
                        addToFlow(targetX, targetY, out.v, flowMap);
                    }
                });
            }
        }
    }

    checkWinCondition(flowMap);
}

function addToFlow(x, y, val, map) {
    if (y >= GRID_ROWS) return;
    if (val === 0) return;
    map[y][x] += val;
    showFlow(x, y, map[y][x]);
}

function showFlow(x, y, val) {
    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    const tag = cell.querySelector('.flow-value');
    tag.innerText = val;
    cell.classList.add('has-flow');
}

function checkWinCondition(flowMap) {
    let allCleared = true;
    state.goals.forEach(g => {
        const actual = flowMap[g.y][g.x];
        const cell = document.querySelector(`.cell[data-x="${g.x}"][data-y="${g.y}"]`);
        if (actual === g.req) {
            g.satisfied = true;
            cell.classList.remove('error');
        } else {
            allCleared = false;
            cell.classList.add('error');
        }
    });

    if (allCleared) {
        setTimeout(() => {
            document.getElementById('modal').classList.remove('hidden');
        }, 500);
    }
}

function nextLevel() {
    state.level++;
    saveProgress();
    startLevel();
}