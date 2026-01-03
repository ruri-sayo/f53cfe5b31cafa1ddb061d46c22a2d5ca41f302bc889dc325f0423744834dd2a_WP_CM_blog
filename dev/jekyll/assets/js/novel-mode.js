/**
 * Novelモード - 表示設定カスタマイズ機能
 * 設定はlocalStorageに保存され、次回アクセス時も適用される
 */

const NovelMode = {
    // デフォルト設定
    defaults: {
        theme: 'light',      // light, dark, sepia
        fontSize: 'medium'   // small, medium, large
    },

    // 現在の設定
    settings: null,

    /**
     * 初期化
     */
    init() {
        this.settings = this.load() || { ...this.defaults };
        this.apply();
        this.setupUI();
        console.log('[NovelMode] 初期化完了:', this.settings);
    },

    /**
     * 設定をlocalStorageに保存
     */
    save() {
        try {
            localStorage.setItem('novelSettings', JSON.stringify(this.settings));
            console.log('[NovelMode] 設定保存:', this.settings);
        } catch (e) {
            console.warn('[NovelMode] 保存エラー:', e);
        }
    },

    /**
     * localStorageから設定を読み込み
     */
    load() {
        try {
            const data = localStorage.getItem('novelSettings');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('[NovelMode] 読み込みエラー:', e);
            return null;
        }
    },

    /**
     * 現在の設定を適用
     */
    apply() {
        const body = document.body;

        // テーマクラスを削除
        body.classList.remove('novel-light', 'novel-dark', 'novel-sepia');
        // フォントサイズクラスを削除
        body.classList.remove('font-small', 'font-medium', 'font-large');

        // 新しいクラスを適用
        body.classList.add(`novel-${this.settings.theme}`);
        body.classList.add(`font-${this.settings.fontSize}`);

        // カスタムカラーの適用（将来の拡張用）
        if (this.settings.customBg) {
            body.style.setProperty('--novel-bg', this.settings.customBg);
        }
        if (this.settings.customFg) {
            body.style.setProperty('--novel-fg', this.settings.customFg);
        }

        // UI選択状態を更新
        this.updateUIState();
    },

    /**
     * UIの選択状態を更新
     */
    updateUIState() {
        const themeSelect = document.getElementById('novel-theme-select');
        const sizeSelect = document.getElementById('novel-size-select');

        if (themeSelect) {
            themeSelect.value = this.settings.theme;
        }
        if (sizeSelect) {
            sizeSelect.value = this.settings.fontSize;
        }
    },

    /**
     * 設定UIをセットアップ
     */
    setupUI() {
        const toggleBtn = document.getElementById('novel-settings-toggle');
        const panel = document.getElementById('novel-settings-panel');
        const closeBtn = document.getElementById('novel-settings-close');
        const themeSelect = document.getElementById('novel-theme-select');
        const sizeSelect = document.getElementById('novel-size-select');
        const resetBtn = document.getElementById('novel-reset-btn');

        if (!toggleBtn || !panel) {
            console.warn('[NovelMode] 設定UIが見つかりません');
            return;
        }

        // トグルボタン
        toggleBtn.addEventListener('click', () => {
            panel.classList.toggle('show');
        });

        // 閉じるボタン
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.classList.remove('show');
            });
        }

        // パネル外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
                panel.classList.remove('show');
            }
        });

        // テーマ変更
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }

        // フォントサイズ変更
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => {
                this.setFontSize(e.target.value);
            });
        }

        // リセットボタン
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.reset();
            });
        }

        // 初期状態を設定
        this.updateUIState();
    },

    /**
     * テーマを設定
     * @param {string} theme - 'light', 'dark', 'sepia'
     */
    setTheme(theme) {
        if (['light', 'dark', 'sepia'].includes(theme)) {
            this.settings.theme = theme;
            this.apply();
            this.save();
        }
    },

    /**
     * フォントサイズを設定
     * @param {string} size - 'small', 'medium', 'large'
     */
    setFontSize(size) {
        if (['small', 'medium', 'large'].includes(size)) {
            this.settings.fontSize = size;
            this.apply();
            this.save();
        }
    },

    /**
     * カスタムカラーを設定（将来の拡張用）
     * @param {string} bg - 背景色
     * @param {string} fg - 文字色
     */
    setCustomColors(bg, fg) {
        this.settings.customBg = bg;
        this.settings.customFg = fg;
        this.apply();
        this.save();
    },

    /**
     * 設定をデフォルトにリセット
     */
    reset() {
        this.settings = { ...this.defaults };
        this.apply();
        this.save();
        console.log('[NovelMode] 設定をリセット');
    }
};

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    NovelMode.init();
});

// グローバルに公開（デバッグ用）
window.NovelMode = NovelMode;
