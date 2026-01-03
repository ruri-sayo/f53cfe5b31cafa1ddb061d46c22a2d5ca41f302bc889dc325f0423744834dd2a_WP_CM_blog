export class MazeGenerator {
    constructor(width, height) {
        // 奇数サイズを強制
        this.width = width % 2 === 0 ? width + 1 : width;
        this.height = height % 2 === 0 ? height + 1 : height;
        this.grid = [];
    }

    generate() {
        // 1. 全て壁(1)で初期化
        this.grid = Array.from({ length: this.height }, () => 
            new Array(this.width).fill(1)
        );

        // 2. (1,1)から掘る
        this.carve(1, 1);

        return {
            grid: this.grid,
            width: this.width,
            height: this.height,
            start: { x: 1.5, y: 1.5 }, // スタート地点の中心
            // ゴールは右下の道を探す
            goal: this.findGoal()
        };
    }

    carve(x, y) {
        this.grid[y][x] = 0; // 道にする

        // 方向をシャッフル (上, 下, 左, 右)
        const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
        ].sort(() => Math.random() - 0.5);

        for (const dir of directions) {
            const nx = x + dir.dx * 2;
            const ny = y + dir.dy * 2;

            // 範囲内かつ壁なら掘り進める
            if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1) {
                if (this.grid[ny][nx] === 1) {
                    this.grid[y + dir.dy][x + dir.dx] = 0; // 間の壁を道に
                    this.carve(nx, ny); // 再帰
                }
            }
        }
    }

    findGoal() {
        // 右下から探索して最初の道を見つける
        for (let y = this.height - 2; y > 0; y--) {
            for (let x = this.width - 2; x > 0; x--) {
                if (this.grid[y][x] === 0) {
                    return { x: x + 0.5, y: y + 0.5 };
                }
            }
        }
        return { x: 1.5, y: 1.5 }; // フォールバック
    }
}