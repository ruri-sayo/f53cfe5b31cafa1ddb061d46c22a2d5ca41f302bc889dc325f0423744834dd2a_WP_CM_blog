import { MazeGenerator } from './maze.js';

export class Game {
    constructor(renderer, input) {
        this.renderer = renderer;
        this.input = input;
        
        this.mazeData = null;
        this.player = { x: 0, y: 0, angle: 0 };
        this.isClear = false;
        
        // レベル管理用
        this.level = 1;
        
        // パラメータ
        this.MOVE_SPEED = 3.0;
        this.ROTATE_SPEED = 2.5;
        this.GOAL_DIST = 0.5;

        // ゲーム開始
        this.startLevel();
    }

    // 次のレベルへ進む処理
    nextLevel() {
        this.level++;
        this.startLevel();
    }

    startLevel() {
        // サイズ計算ロジック
        // Level 1 = 15x15
        // Level 2 = 19x19
        // ... (+4ずつ拡大)
        const baseSize = 15;
        const growth = 4;
        const size = baseSize + (this.level - 1) * growth;

        // 迷路生成
        const mazeGen = new MazeGenerator(size, size);
        this.mazeData = mazeGen.generate();

        // プレイヤー配置
        this.player.x = this.mazeData.start.x;
        this.player.y = this.mazeData.start.y;
        this.player.angle = 0; // 北向きでも東向きでも任意
        this.isClear = false;

        // UI更新
        document.getElementById('overlay').classList.add('hidden');
        document.getElementById('status-level').innerText = `Level: ${this.level}`;
        document.getElementById('status-size').innerText = `Size: ${size}x${size}`;
    }

    update(dt) {
        if (this.isClear) return;

        const inputState = this.input.state;

        // 回転
        if (inputState.turnLeft) this.player.angle -= this.ROTATE_SPEED * dt;
        if (inputState.turnRight) this.player.angle += this.ROTATE_SPEED * dt;

        // 移動量
        let moveStep = 0;
        if (inputState.forward) moveStep += this.MOVE_SPEED * dt;
        if (inputState.backward) moveStep -= this.MOVE_SPEED * dt;

        if (moveStep !== 0) {
            const newX = this.player.x + Math.cos(this.player.angle) * moveStep;
            const newY = this.player.y + Math.sin(this.player.angle) * moveStep;

            // 簡易当たり判定
            if (this.mazeData.grid[Math.floor(newY)][Math.floor(newX)] === 0) {
                this.player.x = newX;
                this.player.y = newY;
            }
        }

        // ゴール判定
        this.checkGoal();
    }

    checkGoal() {
        const dx = this.player.x - this.mazeData.goal.x;
        const dy = this.player.y - this.mazeData.goal.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < this.GOAL_DIST) {
            this.isClear = true;
            document.getElementById('overlay').classList.remove('hidden');
        }
    }

    render() {
        this.renderer.render(this.player, this.mazeData);
    }
}