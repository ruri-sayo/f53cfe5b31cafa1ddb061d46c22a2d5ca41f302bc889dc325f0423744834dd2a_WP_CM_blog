export class InputHandler {
    constructor() {
        this.state = {
            forward: false,
            backward: false,
            turnLeft: false,
            turnRight: false
        };

        this.initKeyboard();
        this.initTouch();
    }

    initKeyboard() {
        window.addEventListener('keydown', (e) => this.handleKey(e, true));
        window.addEventListener('keyup', (e) => this.handleKey(e, false));
    }

    handleKey(e, isDown) {
        switch(e.key) {
            case 'w': case 'ArrowUp':    this.state.forward = isDown; break;
            case 's': case 'ArrowDown':  this.state.backward = isDown; break;
            case 'a': case 'ArrowLeft':  this.state.turnLeft = isDown; break;
            case 'd': case 'ArrowRight': this.state.turnRight = isDown; break;
        }
    }

    initTouch() {
        const bindBtn = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            // マウス・タッチ両対応
            const start = (e) => { e.preventDefault(); this.state[key] = true; };
            const end = (e) => { e.preventDefault(); this.state[key] = false; };

            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('touchstart', start, {passive: false});
            btn.addEventListener('touchend', end, {passive: false});
        };

        bindBtn('btn-left', 'turnLeft');
        bindBtn('btn-right', 'turnRight');
        bindBtn('btn-forward', 'forward');
    }
}