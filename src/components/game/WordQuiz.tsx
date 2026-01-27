import React, { useState, useEffect } from 'react';
import { QUIZ_LANGS, type LangConfig } from './QuizConfig';

// 共通のクイズアイテム型
interface QuizItem {
    term: string;
    def: string;
    extra?: string;
}

// データソースごとの生の形式
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

const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '') || '';

// データ正規化ロジック
const normalizeData = (langId: string, item: any): QuizItem => {
    switch (langId) {
        case 'swedish':
            const s = item as RawSwedishItem;
            return {
                term: s["単語"],
                def: s["意味"],
                extra: s["属性"] || s["品詞"]
            };
        case 'ainu':
            const a = item as RawAinuItem;
            return {
                term: `${a.word}\n(${a.reading})`,
                def: a.meaning,
                extra: a.pos
            };
        default:
            return { term: item.term || '', def: item.def || '' };
    }
};

export const WordQuiz: React.FC = () => {
    const [gameState, setGameState] = useState<'home' | 'quiz'>('home');
    const [currentLang, setCurrentLang] = useState<LangConfig | null>(null);
    const [score, setScore] = useState(0);
    const [highScores, setHighScores] = useState<Record<string, number>>({});
    const [quizData, setQuizData] = useState<QuizItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [currentQuestion, setCurrentQuestion] = useState<{
        target: QuizItem;
        options: QuizItem[];
        isForward: boolean;
    } | null>(null);

    const [feedback, setFeedback] = useState<{
        isCorrect: boolean;
        selectedOption: QuizItem;
    } | null>(null);

    // ハイスコアの読み込み
    useEffect(() => {
        const scores: Record<string, number> = {};
        QUIZ_LANGS.forEach(lang => {
            scores[lang.id] = parseInt(localStorage.getItem(lang.storageKey) || '0');
        });
        setHighScores(scores);
    }, []);

    const startQuiz = async (lang: LangConfig) => {
        setLoading(true);
        setCurrentLang(lang);
        setScore(0);
        setFeedback(null);

        try {
            const fullPath = lang.path.startsWith('http') ? lang.path : `${baseUrl}${lang.path}`;
            const response = await fetch(fullPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const rawData = await response.json();

            const normalizedData = rawData.map((item: any) => normalizeData(lang.id, item));

            if (normalizedData.length < 4) {
                alert("データが少なすぎます（最低4語必要です）");
                setLoading(false);
                return;
            }

            setQuizData(normalizedData);
            setGameState('quiz');
            generateQuestion(normalizedData);
        } catch (err) {
            console.error("Failed to load quiz data:", err);
            alert(`データの読み込みに失敗しました: ${lang.name}`);
            setCurrentLang(null);
        } finally {
            setLoading(false);
        }
    };

    const generateQuestion = (data: QuizItem[] = quizData) => {
        setFeedback(null);
        if (data.length < 4) return;

        const correctIndex = Math.floor(Math.random() * data.length);
        const target = data[correctIndex];

        const distractors: QuizItem[] = [];
        const usedIndices = new Set([correctIndex]);

        while (distractors.length < 3) {
            const idx = Math.floor(Math.random() * data.length);
            if (!usedIndices.has(idx)) {
                usedIndices.add(idx);
                distractors.push(data[idx]);
            }
        }

        const options = [...distractors, target].sort(() => Math.random() - 0.5);
        const isForward = Math.random() < 0.5;

        setCurrentQuestion({ target, options, isForward });
    };

    const handleAnswer = (selected: QuizItem) => {
        if (feedback || !currentQuestion || !currentLang) return;

        const isCorrect = selected === currentQuestion.target;
        const newScore = isCorrect ? score + 10 : Math.max(0, score - 5);
        setScore(newScore);
        setFeedback({ isCorrect, selectedOption: selected });

        if (newScore > (highScores[currentLang.id] || 0)) {
            localStorage.setItem(currentLang.storageKey, newScore.toString());
            setHighScores(prev => ({ ...prev, [currentLang.id]: newScore }));
        }
    };

    const goHome = () => {
        setGameState('home');
        setCurrentLang(null);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#7278a8] to-[#8a91c7] text-white p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">WORD QUIZ</h1>
                        <p className="text-xs opacity-80 font-medium">Language Learning Game</p>
                    </div>
                    {gameState === 'quiz' && (
                        <div className="text-2xl font-mono bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner">
                            <span className="text-sm opacity-70 mr-2">SCORE</span>
                            {score}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
                {gameState === 'home' ? (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-800">言語を選択</h2>
                            <p className="text-gray-500">学習したい言語を選んでクイズを始めましょう</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {QUIZ_LANGS.map(lang => (
                                <button
                                    key={lang.id}
                                    onClick={() => startQuiz(lang)}
                                    disabled={loading}
                                    className="group relative p-6 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-[#7278a8] hover:bg-white hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{lang.flag}</span>
                                        <div>
                                            <div className="text-xl font-bold text-gray-800">{lang.name}</div>
                                            <div className="text-sm text-gray-500">{lang.subName}</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">High Score</span>
                                        <span className="text-lg font-mono font-bold text-[#7278a8]">{highScores[lang.id] || 0}</span>
                                    </div>
                                    {loading && currentLang?.id === lang.id && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                            <div className="w-6 h-6 border-4 border-[#7278a8] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    currentQuestion && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={goHome}
                                className="inline-flex items-center gap-2 text-gray-400 hover:text-[#7278a8] font-bold text-sm transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                BACK TO HOME
                            </button>

                            <div className="text-center space-y-4 py-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <span className="px-4 py-1 bg-white text-[#7278a8] text-xs font-black rounded-full shadow-sm border border-gray-100 uppercase tracking-widest">Question</span>
                                <h3 className="text-4xl font-black text-gray-800 leading-tight whitespace-pre-line">
                                    {currentQuestion.isForward
                                        ? currentQuestion.target.term
                                        : currentQuestion.target.def}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {currentQuestion.options.map((opt, idx) => {
                                    let btnClass = "p-6 rounded-2xl border-2 text-left transition-all duration-300 relative group ";

                                    if (feedback) {
                                        if (opt === currentQuestion.target) {
                                            btnClass += "bg-green-50 border-green-500 text-green-700 shadow-[0_0_20px_rgba(34,197,94,0.2)] scale-[1.02] z-10 ";
                                        } else if (opt === feedback.selectedOption && !feedback.isCorrect) {
                                            btnClass += "bg-red-50 border-red-500 text-red-700 opacity-90 ";
                                        } else {
                                            btnClass += "bg-gray-50 border-gray-100 text-gray-400 opacity-40 grayscale ";
                                        }
                                    } else {
                                        btnClass += "bg-white border-gray-100 hover:border-[#7278a8] hover:shadow-lg text-gray-700 hover:-translate-y-1 ";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(opt)}
                                            disabled={!!feedback}
                                            className={btnClass}
                                        >
                                            <span className="text-lg font-bold">
                                                {currentQuestion.isForward ? opt.def : opt.term}
                                            </span>
                                            {!feedback && (
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-2 h-2 rounded-full bg-[#7278a8]"></div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {feedback && (
                                <div className="mt-10 bg-gray-900 text-white rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${feedback.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {feedback.isCorrect ? '✓' : '✗'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">Result</div>
                                            <div className="text-2xl font-black">{feedback.isCorrect ? '正解です！' : '残念、不正解...'}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 mb-8">
                                        <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                                            <div className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Answer Details</div>
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-xl font-bold">{currentQuestion.target.term}</span>
                                                <span className="text-white/40 text-sm">=</span>
                                                <span className="text-xl font-bold text-[#8a91c7]">{currentQuestion.target.def}</span>
                                            </div>
                                            {currentQuestion.target.extra && (
                                                <div className="mt-2 text-xs font-medium text-white/50 bg-white/5 px-2 py-1 rounded inline-block">
                                                    {currentQuestion.target.extra}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => generateQuestion()}
                                        className="w-full py-5 bg-white text-gray-900 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        NEXT QUESTION
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
