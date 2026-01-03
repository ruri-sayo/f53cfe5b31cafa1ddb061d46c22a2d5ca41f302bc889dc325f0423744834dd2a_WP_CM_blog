import React, { useState } from 'react';

/**
 * スピーチ所要時間計算ツール
 */
export default function SpeechTimer() {
    const [text, setText] = useState('');
    const [speed, setSpeed] = useState(300);

    // 空白を除いた文字数
    const charCount = text.replace(/\s/g, '').length;

    // 所要時間（秒）
    const totalSeconds = charCount > 0 ? (charCount / speed) * 60 : 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);

    return (
        <div className="bg-white w-full max-w-2xl mx-auto rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    ⏱️ スピーチ所要時間計算機
                </h2>
                <p className="text-blue-100 text-sm mt-1">文字数から最適なスピーチ時間を算出します</p>
            </div>

            <div className="p-6 space-y-6">
                {/* 速度設定 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            読む速度 (文字/分)
                        </label>
                        <input
                            type="number"
                            value={speed}
                            onChange={(e) => setSpeed(parseInt(e.target.value) || 300)}
                            min={1}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-mono"
                        />
                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                            <button onClick={() => setSpeed(250)} className="hover:text-blue-600 underline">ゆっくり (250)</button>
                            <button onClick={() => setSpeed(300)} className="hover:text-blue-600 underline font-bold text-blue-600">標準 (300)</button>
                            <button onClick={() => setSpeed(350)} className="hover:text-blue-600 underline">早口 (350)</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            文字数
                        </label>
                        <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg font-mono bg-gray-50">
                            {charCount} <span className="text-gray-400 text-sm">chars</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">※下のエリアに入力すると自動計算</p>
                    </div>
                </div>

                {/* 結果表示 */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">想定所要時間</h3>
                    <div className="text-5xl md:text-6xl font-bold text-gray-800 font-mono tracking-tight my-2">
                        {minutes}<span className="text-2xl text-gray-400 mx-1">分</span>
                        {String(seconds).padStart(2, '0')}<span className="text-2xl text-gray-400 mx-1">秒</span>
                    </div>
                    <div className="text-gray-400 font-mono text-sm">
                        Total: {totalSeconds.toFixed(1)} seconds
                    </div>
                </div>

                {/* テキスト入力 */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-bold text-gray-700">原稿テキスト (任意)</label>
                        <button
                            onClick={() => setText('')}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            🗑️ クリア
                        </button>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={6}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none text-gray-700"
                        placeholder="ここに原稿を貼り付けると、自動的に文字数をカウントして時間を計算します。"
                    />
                </div>
            </div>
        </div>
    );
}
