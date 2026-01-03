// 設定: JSONファイルのパスと、各データのキーマッピング
const QUIZ_CONFIG = {
    swedish: {
        path: 'data/swedish.json',
        storageKey: 'quiz_highscore_swedish',
        // データを共通フォーマット { term, def, extra } に変換する関数
        normalize: (item) => ({
            term: item["単語"],
            def: item["意味"],
            extra: item["属性"] || item["品詞"]
        })
    },
    ainu: {
        path: 'data/ainu.json',
        storageKey: 'quiz_highscore_ainu',
        normalize: (item) => ({
            term: `${item.word}\n(${item.reading})`, // 単語と読みを結合
            def: item.meaning,
            extra: item.pos
        })
    }
};

// 状態管理
let currentLang = null;
let quizData = [];
let currentScore = 0;
let isAnswering = false; // 連打防止用

// DOM要素
const els = {
    homeScreen: document.getElementById('home-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    scoreSwedish: document.getElementById('score-swedish'),
    scoreAinu: document.getElementById('score-ainu'),
    resetBtn: document.getElementById('reset-score-btn'),
    currentScore: document.getElementById('current-score-display'),
    questionText: document.getElementById('question-text'),
    choicesContainer: document.getElementById('choices-container'),
    feedbackArea: document.getElementById('feedback-area'),
    feedbackTitle: document.getElementById('feedback-title'),
    correctInfo: document.getElementById('correct-answer-info'),
    expList: document.getElementById('explanations-list'),
    nextBtn: document.getElementById('next-btn'),
    backBtn: document.getElementById('back-home-btn')
};

// --- 初期化 & イベントリスナー ---

window.addEventListener('DOMContentLoaded', () => {
    updateHighScoresDisplay();
});

// 言語選択ボタン
document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => startQuiz(e.target.dataset.lang));
});

// ホームに戻る
els.backBtn.addEventListener('click', () => {
    switchScreen('home');
    updateHighScoresDisplay(); // 戻った時にスコア更新を確認
});

// スコアリセット
els.resetBtn.addEventListener('click', () => {
    if (confirm("ハイスコアをリセットしますか？\nこの操作は取り消せません。")) {
        localStorage.removeItem(QUIZ_CONFIG.swedish.storageKey);
        localStorage.removeItem(QUIZ_CONFIG.ainu.storageKey);
        updateHighScoresDisplay();
    }
});

// 次の問題へ
els.nextBtn.addEventListener('click', generateQuestion);


// --- コア機能 ---

function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    if (screenName === 'home') els.homeScreen.classList.add('active');
    if (screenName === 'quiz') els.quizScreen.classList.add('active');
}

function updateHighScoresDisplay() {
    els.scoreSwedish.textContent = localStorage.getItem(QUIZ_CONFIG.swedish.storageKey) || 0;
    els.scoreAinu.textContent = localStorage.getItem(QUIZ_CONFIG.ainu.storageKey) || 0;
}

// クイズ開始処理
async function startQuiz(lang) {
    currentLang = lang;
    currentScore = 0;
    els.currentScore.textContent = currentScore;
    
    // JSON読み込み
    try {
        const config = QUIZ_CONFIG[lang];
        const response = await fetch(config.path);
        if (!response.ok) throw new Error("File not found");
        const rawData = await response.json();
        
        // データを共通形式に変換
        quizData = rawData.map(config.normalize);
        
        if (quizData.length < 4) {
            alert("データが少なすぎます（最低4語必要です）");
            return;
        }

        switchScreen('quiz');
        generateQuestion();

    } catch (err) {
        console.error(err);
        alert(`データ読み込みエラー: ${err.message}`);
    }
}

// 問題生成
function generateQuestion() {
    isAnswering = true;
    els.feedbackArea.classList.add('hidden');
    els.choicesContainer.innerHTML = '';

    // 正解をランダムに選ぶ
    const correctIndex = Math.floor(Math.random() * quizData.length);
    const correctItem = quizData[correctIndex];

    // 間違い選択肢を3つ選ぶ（重複なし）
    const distractors = [];
    while (distractors.length < 3) {
        const idx = Math.floor(Math.random() * quizData.length);
        if (idx !== correctIndex && !distractors.includes(quizData[idx])) {
            distractors.push(quizData[idx]);
        }
    }

    // 選択肢をマージしてシャッフル
    const options = [correctItem, ...distractors];
    shuffleArray(options);

    // 出題方向を決定 (true: Term -> Def, false: Def -> Term)
    const isForward = Math.random() < 0.5;

    // 画面表示
    els.questionText.textContent = isForward ? correctItem.term : correctItem.def;
    
    // 選択肢ボタン生成
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        // 答えとして表示するテキスト
        btn.textContent = isForward ? opt.def : opt.term;
        
        btn.addEventListener('click', () => handleAnswer(opt, correctItem, options, btn));
        els.choicesContainer.appendChild(btn);
    });
}

// 回答処理
function handleAnswer(selected, correct, allOptions, clickedBtn) {
    if (!isAnswering) return;
    isAnswering = false; // 二重回答防止

    const isCorrect = selected === correct;
    
    // スコア計算
    if (isCorrect) {
        currentScore += 5;
        els.feedbackTitle.textContent = "🙆 正解！";
        els.feedbackTitle.style.color = "var(--success)";
        clickedBtn.classList.add('correct');
    } else {
        currentScore -= 2;
        els.feedbackTitle.textContent = "🙅 残念...";
        els.feedbackTitle.style.color = "var(--accent)";
        clickedBtn.classList.add('wrong-selected');
    }
    els.currentScore.textContent = currentScore;

    // ハイスコア更新チェック
    const config = QUIZ_CONFIG[currentLang];
    const currentHigh = parseInt(localStorage.getItem(config.storageKey) || 0);
    if (currentScore > currentHigh) {
        localStorage.setItem(config.storageKey, currentScore);
    }

    // 正解・解説の表示
    els.feedbackArea.classList.remove('hidden');
    
    // 正解情報を表示
    els.correctInfo.textContent = `正解は: ${correct.term} = ${correct.def}`;

    // 選択肢すべての解説リスト生成
    els.expList.innerHTML = '';
    allOptions.forEach(opt => {
        const li = document.createElement('li');
        // 解説表示
        li.textContent = `${opt.term} : ${opt.def} （${opt.extra || '-'}）`;
        
        // 正解の行を強調
        if (opt === correct) {
            li.style.fontWeight = "bold";
            li.style.color = "var(--success)";
        }
        els.expList.appendChild(li);

        // ボタンの色分け（正解ボタンを緑にする処理）
        // どのボタンがこの選択肢かを探す
        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach(b => {
            // テキストで判定（簡易的ですが、重複がなければ動きます）
            // より厳密にするならdata属性でID管理などが良いです
            const btnText = b.textContent;
            if (btnText === opt.def || btnText === opt.term) {
                if (opt === correct) b.classList.add('correct');
                else if (opt !== selected) b.classList.add('wrong');
            }
            b.disabled = true; // ボタン無効化
        });
    });
}

// 配列シャッフル用ユーティリティ
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}