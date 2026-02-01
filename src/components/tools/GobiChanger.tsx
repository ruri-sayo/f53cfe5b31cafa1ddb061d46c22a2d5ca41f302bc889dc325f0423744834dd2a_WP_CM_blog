import React, { useState, useEffect } from 'react';

// 型定義
interface Patterns {
    agreement: string;
    question: string;
    normal: string;
}

interface Character {
    id: string;
    name: string;
    suffixes: {
        agreement: string;
        question: string;
        normal: string;
    };
}

interface AppConfig {
    patterns: Patterns;
    characters: Character[];
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsyaml: any;
    }
}

export const GobiChanger: React.FC = () => {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [selectedCharId, setSelectedCharId] = useState('');
    const [customSuffix, setCustomSuffix] = useState('');
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        // Load config.yaml using global jsyaml (loaded via script tag in Astro)
        const loadConfig = async () => {
            if (typeof window === 'undefined' || !window.jsyaml) {
                // Wait for script to load if this runs too early? 
                // Usually Astro script tags in head run before hydration if not deferred?
                // But React client:only might run fast.
                // We can retry or just wait.
            }

            try {
                const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
                const response = await fetch(`${baseUrl}/data/tools/config.yaml`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const text = await response.text();

                // Retry checking jsyaml a few times if needed
                if (window.jsyaml) {
                    const data = window.jsyaml.load(text) as AppConfig;
                    setConfig(data);
                    if (data.characters.length > 0) {
                        setSelectedCharId(data.characters[0].id);
                    }
                } else {
                    setError('YAMLパーサー(js-yaml)が読み込まれていません。');
                }
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                setError(`設定ファイルの読み込みに失敗しました: ${errorMessage}`);
            }
        };

        // Give a slight delay to ensure library load or retry logic could be added
        // Simple approach: try immediately, if fail? 
        // Better: check for window.jsyaml.
        const interval = setInterval(() => {
            if (window.jsyaml) {
                clearInterval(interval);
                loadConfig();
            }
        }, 100);

        // Timeout
        setTimeout(() => clearInterval(interval), 3000);

        return () => clearInterval(interval);
    }, []);

    const convertText = () => {
        if (!config || !selectedCharId) return;

        const lines = inputText.split('\n');
        // Pre-compile regex
        const patterns = {
            agreement: new RegExp(config.patterns.agreement),
            question: new RegExp(config.patterns.question),
            normal: new RegExp(config.patterns.normal)
        };

        const charDef = config.characters.find(c => c.id === selectedCharId);
        const isCustom = selectedCharId === 'custom';

        const converted = lines.map(line => {
            if (!line.trim()) return line;

            let type: 'agreement' | 'question' | 'normal' = 'normal';
            let stem = line;

            if (patterns.agreement.test(line)) {
                type = 'agreement';
                stem = line.replace(patterns.agreement, '');
            } else if (patterns.question.test(line)) {
                type = 'question';
                stem = line.replace(patterns.question, '');
            } else {
                if (patterns.normal.test(line)) {
                    stem = line.replace(patterns.normal, '');
                }
            }

            let suffix = '';
            if (isCustom) {
                if (type === 'agreement') suffix = `${customSuffix}ね`;
                else if (type === 'question') suffix = `${customSuffix}？`;
                else suffix = customSuffix;
            } else if (charDef) {
                suffix = charDef.suffixes[type];
            }

            return stem + suffix;
        });

        setOutputText(converted.join('\n'));
    };

    const copyToClipboard = () => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="mb-6">
                <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 mb-2">変換したい文章</label>
                <textarea
                    id="input-text"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                    placeholder="例：今日はとてもいい天気ですね。明日は暇ですか？"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="char-select" className="block text-sm font-medium text-gray-700 mb-1">キャラクター（語尾）選択</label>
                        <select
                            id="char-select"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={selectedCharId}
                            onChange={(e) => setSelectedCharId(e.target.value)}
                            disabled={!config}
                        >
                            {!config && <option>読み込み中...</option>}
                            {config?.characters.map(char => (
                                <option key={char.id} value={char.id}>{char.name}</option>
                            ))}
                            {config && <option value="custom">カスタム（自由入力）</option>}
                        </select>
                    </div>

                    {selectedCharId === 'custom' && (
                        <div className="animate-fade-in">
                            <label htmlFor="custom-suffix" className="block text-sm font-medium text-gray-700 mb-1">カスタム語尾（指定）</label>
                            <input
                                type="text"
                                id="custom-suffix"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="例：ワン"
                                value={customSuffix}
                                onChange={(e) => setCustomSuffix(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">※文脈に応じて「ね」「？」を自動補完します</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-6 text-center">
                <button
                    onClick={convertText}
                    className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow transition duration-200 flex items-center justify-center mx-auto"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    変換する
                </button>
            </div>

            <div className="mb-2">
                <label htmlFor="output-text" className="block text-sm font-medium text-gray-700 mb-2">変換結果</label>
                <textarea
                    id="output-text"
                    rows={4}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none text-gray-800"
                    value={outputText}
                />
            </div>

            <div className="text-right flex justify-end items-center gap-2">
                {copySuccess && <span className="text-xs text-green-600 font-bold transition-opacity duration-500">コピーしました！</span>}
                <button
                    onClick={copyToClipboard}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    クリップボードにコピー
                </button>
            </div>
        </div>
    );
};
