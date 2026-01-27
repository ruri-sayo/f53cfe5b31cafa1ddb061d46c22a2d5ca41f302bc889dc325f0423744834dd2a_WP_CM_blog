import React, { useState, useEffect, useRef, useCallback } from 'react';

interface MazeGameProps {
    difficulty: 'easy' | 'hard';
}

interface Point {
    x: number;
    y: number;
}

const MazeGame: React.FC<MazeGameProps> = ({ difficulty }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stage, setStage] = useState(1);
    const [message, setMessage] = useState('');
    const [gameState, setGameState] = useState<'playing' | 'cleared'>('playing');
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const mazeRef = useRef<number[][]>([]);
    const playerRef = useRef<Point>({ x: 1, y: 1 });
    const goalRef = useRef<Point>({ x: 1, y: 1 });
    const visibilityRef = useRef<boolean[][]>([]);
    const mazeDimRef = useRef({ width: 0, height: 0 });

    const cellSize = 24;
    const revealRadius = 2;

    const wallColor = '#1e293b';
    const pathColor = '#f8fafc';
    const playerColor = '#3b82f6';
    const goalColor = '#ef4444';
    const fogColor = '#94a3b8';

    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const generateMaze = (width: number, height: number) => {
        const maze = Array.from({ length: height }, () => Array(width).fill(1));
        const stack: Point[] = [];
        const startX = 1;
        const startY = 1;

        maze[startY][startX] = 0;
        stack.push({ x: startX, y: startY });

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors: { nx: number; ny: number; wx: number; wy: number }[] = [];
            const directions = [
                { dx: 0, dy: -2, wx: 0, wy: -1 },
                { dx: 2, dy: 0, wx: 1, wy: 0 },
                { dx: 0, dy: 2, wx: 0, wy: 1 },
                { dx: -2, dy: 0, wx: -1, wy: 0 }
            ];

            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
                    neighbors.push({ nx, ny, wx: current.x + dir.wx, wy: current.y + dir.wy });
                }
            }

            if (neighbors.length > 0) {
                const move = neighbors[Math.floor(Math.random() * neighbors.length)];
                maze[move.wy][move.wx] = 0;
                maze[move.ny][move.nx] = 0;
                stack.push({ x: move.nx, y: move.ny });
            } else {
                stack.pop();
            }
        }
        return maze;
    };

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = mazeDimRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const isVisible = difficulty === 'easy' || visibilityRef.current[y][x];
                ctx.fillStyle = isVisible ? (mazeRef.current[y][x] === 1 ? wallColor : pathColor) : fogColor;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }

        if (difficulty === 'easy' || visibilityRef.current[goalRef.current.y][goalRef.current.x]) {
            ctx.fillStyle = goalColor;
            ctx.beginPath();
            ctx.arc(goalRef.current.x * cellSize + cellSize / 2, goalRef.current.y * cellSize + cellSize / 2, cellSize / 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '14px Arial';
            ctx.fillText('★', goalRef.current.x * cellSize + cellSize / 2, goalRef.current.y * cellSize + cellSize / 2 + 1);
        }

        ctx.fillStyle = playerColor;
        ctx.beginPath();
        ctx.arc(playerRef.current.x * cellSize + cellSize / 2, playerRef.current.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }, [difficulty]);

    const updateVisibility = (px: number, py: number) => {
        if (difficulty === 'easy') return;
        const { width, height } = mazeDimRef.current;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.abs(x - px) + Math.abs(y - py) <= revealRadius) {
                    visibilityRef.current[y][x] = true;
                }
            }
        }
    };

    const movePlayer = useCallback((dx: number, dy: number) => {
        if (gameState !== 'playing') return;
        const nx = playerRef.current.x + dx;
        const ny = playerRef.current.y + dy;

        if (nx >= 0 && nx < mazeDimRef.current.width && ny >= 0 && ny < mazeDimRef.current.height && mazeRef.current[ny][nx] === 0) {
            playerRef.current = { x: nx, y: ny };
            updateVisibility(nx, ny);
            draw();

            if (nx === goalRef.current.x && ny === goalRef.current.y) {
                setGameState('cleared');
                setMessage(`Stage ${stage} クリア!`);
                setTimeout(() => setStage(prev => prev + 1), 1500);
            }
        }
    }, [gameState, stage, draw]);

    const initStage = (s: number) => {
        const w = Math.min(11 + (s - 1) * 2, 35);
        const h = Math.min(9 + (s - 1) * 2, 25);
        mazeDimRef.current = { width: w, height: h };

        const maze = generateMaze(w, h);
        mazeRef.current = maze;
        playerRef.current = { x: 1, y: 1 };

        if (difficulty === 'easy') {
            goalRef.current = { x: w - 2, y: h - 2 };
        } else {
            const paths: Point[] = [];
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    if (maze[y][x] === 0 && (x !== 1 || y !== 1)) paths.push({ x, y });
                }
            }
            goalRef.current = paths[Math.floor(Math.random() * paths.length)];
        }
        mazeRef.current[goalRef.current.y][goalRef.current.x] = 0;

        visibilityRef.current = Array.from({ length: h }, () => Array(w).fill(false));
        updateVisibility(1, 1);

        setGameState('playing');
        setMessage('');

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = w * cellSize;
            canvas.height = h * cellSize;
            draw();
        }
    };

    useEffect(() => {
        initStage(stage);
    }, [stage]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key.toLowerCase()) {
                case 'w': case 'arrowup': movePlayer(0, -1); break;
                case 's': case 'arrowdown': movePlayer(0, 1); break;
                case 'a': case 'arrowleft': movePlayer(-1, 0); break;
                case 'd': case 'arrowright': movePlayer(1, 0); break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer]);

    const DPadButton = ({ direction, icon, dx, dy }: { direction: string; icon: string; dx: number; dy: number }) => (
        <button
            onTouchStart={(e) => { e.preventDefault(); movePlayer(dx, dy); }}
            onMouseDown={() => movePlayer(dx, dy)}
            className={`w-14 h-14 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 rounded-xl text-white text-2xl font-bold flex items-center justify-center shadow-lg transition-colors select-none ${direction}`}
        >
            {icon}
        </button>
    );

    return (
        <div className="flex flex-col items-center">
            <div className="mb-6 flex gap-4 items-center bg-white px-6 py-3 rounded-2xl shadow-md border border-gray-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Stage</span>
                <span className="text-3xl font-black text-blue-600">{stage}</span>
                <div className="w-px h-8 bg-gray-100 mx-2"></div>
                <div className="text-sm font-medium text-gray-600">
                    {difficulty === 'easy' ? 'Standard Mode' : 'Hard Mode (Fog)'}
                </div>
            </div>

            <div className="relative group">
                <canvas
                    ref={canvasRef}
                    className="rounded-xl shadow-2xl border-4 border-slate-800 bg-slate-900 transition-transform duration-300"
                />
                {message && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                        <div className="text-2xl font-bold text-blue-600 flex flex-col items-center">
                            <span className="text-4xl mb-2">🎉</span>
                            {message}
                        </div>
                    </div>
                )}
            </div>

            {isTouchDevice && (
                <div className="mt-8 grid grid-cols-3 gap-2 w-48">
                    <div></div>
                    <DPadButton direction="up" icon="▲" dx={0} dy={-1} />
                    <div></div>
                    <DPadButton direction="left" icon="◀" dx={-1} dy={0} />
                    <div className="w-14 h-14 bg-slate-800 rounded-xl"></div>
                    <DPadButton direction="right" icon="▶" dx={1} dy={0} />
                    <div></div>
                    <DPadButton direction="down" icon="▼" dx={0} dy={1} />
                    <div></div>
                </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-8 text-xs text-gray-400 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Player {isTouchDevice ? '(D-Pad)' : '(WASD / Arrows)'}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Goal (★)
                </div>
            </div>
        </div>
    );
};

export default MazeGame;
