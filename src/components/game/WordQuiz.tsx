import React, { useState, useEffect } from 'react';

// 型定義
interface QuizItem {
    term: string;
    def: string;
    extra?: string;
}

interface RawSwedishItem {
    "単語": string;
    "意味": string;
    "属性"?: string;
    "品詞"?: string;
}

interface RawAinuItem {
    word: string;
    reading: string;
    meaning: string;
    pos: string;
}

type Lang = 'swedish' | 'ainu';

const QUIZ_CONFIG = {
    swedish: {
        path: '/game/word_quiz/data/swedish.json',
        storageKey: 'quiz_highscore_swedish',
        normalize: (item: RawSwedishItem): QuizItem => ({
            term: item["単語"],
            def: item["意味"],
            extra: item["属性"] || item["品詞"]
        })
    },
    ainu: {
        path: '/game/word_quiz/data/ainu.json',
        storageKey: 'quiz_highscore_ainu',
        normalize: (item: RawAinuItem): QuizItem => ({
            term: `${item.word}\n(${item.reading})`,
            def: item.meaning,
            extra: item.pos
        })
    }
};

export const WordQuiz: React.FC = () => {
    // State
    const [gameState, setGameState] = useState<'home' | 'quiz'>('home');
    const [lang, setLang] = useState<Lang | null>(null);
    const [score, setScore] = useState(0);
    const [highScores, setHighScores] = useState({ swedish: 0, ainu: 0 });
    const [quizData, setQuizData] = useState<QuizItem[]>([]);

    // Quiz State
    const [currentQuestion, setCurrentQuestion] = useState<{
        target: QuizItem;
        options: QuizItem[];
        isForward: boolean; // true: term -> def, false: def -> term
    } | null>(null);

    const [feedback, setFeedback] = useState<{
        isCorrect: boolean;
        selectedOption: QuizItem;
    } | null>(null);

    // Initial Load
    useEffect(() => {
        updateHighScores();
    }, []);

    const updateHighScores = () => {
        setHighScores({
            swedish: parseInt(localStorage.getItem(QUIZ_CONFIG.swedish.storageKey) || '0'),
            ainu: parseInt(localStorage.getItem(QUIZ_CONFIG.ainu.storageKey) || '0')
        });
    };

    const resetHighScores = () => {
        if (confirm("ハイスコアをリセットしますか？\nこの操作は取り消せません。")) {
            localStorage.removeItem(QUIZ_CONFIG.swedish.storageKey);
            localStorage.removeItem(QUIZ_CONFIG.ainu.storageKey);
            updateHighScores();
        }
    };

    const startQuiz = async (selectedLang: Lang) => {
        setLang(selectedLang);
        setScore(0);
        setFeedback(null);

        try {
            const config = QUIZ_CONFIG[selectedLang];
            const response = await fetch(config.path);
            if (!response.ok) throw new Error("File not found");
            const rawData = await response.json();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const normalizedData = rawData.map((item: any) => config.normalize(item));

            if (normalizedData.length < 4) {
                alert("データが少なすぎます（最低4語必要です）");
                return;
            }

            setQuizData(normalizedData);
            setGameState('quiz');
            generateQuestion(normalizedData);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(err);
            alert(`データ読み込みエラー: ${errorMessage}`);
        }
    };

    const generateQuestion = (data: QuizItem[] = quizData) => {
        setFeedback(null);

        // Pick Correct Answer
        const correctIndex = Math.floor(Math.random() * data.length);
        const target = data[correctIndex];

        // Pick Distractors
        const distractors: QuizItem[] = [];
        const usedIndices = new Set([correctIndex]);

        while (distractors.length < 3) {
            const idx = Math.floor(Math.random() * data.length);
            if (!usedIndices.has(idx)) {
                usedIndices.add(idx);
                distractors.push(data[idx]);
            }
        }

        // Shuffle Options
        const options = [...distractors, target];
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        // Direction
        const isForward = Math.random() < 0.5;

        setCurrentQuestion({ target, options, isForward });
    };

    const handleAnswer = (selected: QuizItem) => {
        if (feedback || !currentQuestion || !lang) return;

        const isCorrect = selected === currentQuestion.target;
        const newScore = isCorrect ? score + 5 : score - 2;
        setScore(newScore);

        setFeedback({ isCorrect, selectedOption: selected });

        // Update High Score
        const config = QUIZ_CONFIG[lang];
        if (newScore > (highScores[lang] || 0)) {
            localStorage.setItem(config.storageKey, newScore.toString());
            updateHighScores();
        }
    };

    const goHome = () => {
        setGameState('home');
        setLang(null);
        updateHighScores();
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-[#7278a8] text-white p-4">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-xl font-bold">Word Quiz</h1>
                    {gameState === 'quiz' && (
                        <div className="text-xl font-mono bg-white/20 px-3 py-1 rounded">
                            Score: {score}
                        </div>
                    )}
                </div>

                {gameState === 'home' && (
                    <div className="flex flex-col sm:flex-row gap-4 text-sm bg-white/10 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span>🇸🇪 Swedish Best:</span>
                            <span className="font-bold text-yellow-300">{highScores.swedish}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>🐻 Ainu Best:</span>
                            <span className="font-bold text-yellow-300">{highScores.ainu}</span>
                        </div>
                        <button
                            onClick={resetHighScores}
                            className="text-xs text-white/70 hover:text-white underline ml-auto"
                        >
                            スコアリセット
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {gameState === 'home' ? (
                    <div className="text-center py-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8">言語を選択してください</h2>
                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            <button
                                onClick={() => startQuiz('swedish')}
                                className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold border border-blue-200 transition-colors flex items-center justify-center gap-3"
                            >
                                <span className="text-2xl">🇸🇪</span>
                                <div>
                                    <div className="text-lg">Svenska</div>
                                    <div className="text-xs opacity-75">スウェーデン語</div>
                                </div>
                            </button>
                            <button
                                onClick={() => startQuiz('ainu')}
                                className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-semibold border border-green-200 transition-colors flex items-center justify-center gap-3"
                            >
                                <span className="text-2xl">🐻</span>
                                <div>
                                    <div className="text-lg">Aynu itak</div>
                                    <div className="text-xs opacity-75">アイヌ語</div>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    currentQuestion && (
                        <div className="space-y-6">
                            {/* Toolbar */}
                            <button
                                onClick={goHome}
                                className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium"
                            >
                                ← Home
                            </button>

                            {/* Question */}
                            <div className="text-center space-y-2 py-4">
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">問題</div>
                                <h3 className="text-3xl font-bold text-gray-800 whitespace-pre-line">
                                    {currentQuestion.isForward
                                        ? currentQuestion.target.term
                                        : currentQuestion.target.def}
                                </h3>
                            </div>

                            {/* Choices */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {currentQuestion.options.map((opt, idx) => {
                                    let btnClass = "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ";

                                    if (feedback) {
                                        // Result Phase
                                        if (opt === currentQuestion.target) {
                                            btnClass += "bg-green-50 border-green-500 text-green-700 font-bold ";
                                        } else if (opt === feedback.selectedOption && !feedback.isCorrect) {
                                            btnClass += "bg-red-50 border-red-500 text-red-700 ";
                                        } else {
                                            btnClass += "bg-gray-50 border-gray-100 text-gray-400 opacity-50 ";
                                        }
                                    } else {
                                        // Answering Phase
                                        btnClass += "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:shadow-md ";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(opt)}
                                            disabled={!!feedback}
                                            className={btnClass}
                                        >
                                            <span className="text-lg">
                                                {currentQuestion.isForward ? opt.def : opt.term}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback Area */}
                            {feedback && (
                                <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100 animate-fade-in">
                                    <div className="text-center mb-6">
                                        <div className={`text-2xl font-bold mb-2 ${feedback.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                                            {feedback.isCorrect ? '🙆 正解！' : '🙅 残念...'}
                                        </div>
                                        <div className="text-gray-600">
                                            正解は: <span className="font-bold text-gray-800 mx-2">{currentQuestion.target.term}</span> = <span className="font-bold text-gray-800 mx-2">{currentQuestion.target.def}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-bold text-gray-500 text-sm uppercase">選択肢の解説</h4>
                                        <ul className="space-y-2 bg-white rounded-lg p-4 border border-gray-100">
                                            {currentQuestion.options.map((opt, i) => (
                                                <li key={i} className={`flex items-start gap-2 p-2 rounded ${opt === currentQuestion.target ? 'bg-green-50 text-green-800 font-bold' : 'text-gray-600'}`}>
                                                    <span className="min-w-[40%] border-r pr-2 text-right">{opt.term}</span>
                                                    <span>{opt.def} <span className="text-xs text-gray-400 ml-1">({opt.extra || '-'})</span></span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={() => generateQuestion()}
                                            className="px-8 py-3 bg-[#7278a8] text-white rounded-full font-bold shadow-lg hover:bg-[#5a6090] hover:shadow-xl transition-all transform hover:-translate-y-1"
                                        >
                                            次の問題へ →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
