import { InputHandler } from './input.js';
import { Renderer } from './renderer.js';
import { Game } from './game.js';

window.onload = () => {
    const canvas = document.getElementById('game');
    
    const input = new InputHandler();
    const renderer = new Renderer(canvas);
    const game = new Game(renderer, input);

    // リスタートボタン（次のレベルへ）のイベント
    document.getElementById('btn-restart').addEventListener('click', () => {
        game.nextLevel();
    });

    let lastTime = 0;

    // ゲームループ
    const loop = (timestamp) => {
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        // dtが大きすぎる場合（タブ切り替え復帰時など）は補正
        if (dt < 0.1) {
            game.update(dt);
        }
        
        game.render();
        
        requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
};