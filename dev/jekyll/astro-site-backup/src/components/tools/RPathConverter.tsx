import React, { useState } from 'react';

/**
 * Rパス変換ツール
 * WindowsパスをR用フォワードスラッシュに変換
 */
export default function RPathConverter() {
    const [inputPaths, setInputPaths] = useState('');
    const [convertedPaths, setConvertedPaths] = useState<string[]>([]);
    const [copyMessage, setCopyMessage] = useState('');

    const handleConvert = () => {
        const lines = inputPaths.split('\n');
        const converted = lines
            .map(line => line.trim())
            .filter(line => line !== '')
            .map(path => path.replace(/\\/g, '/').replace(/"/g, ''));
        setConvertedPaths(converted);
    };

    const handleCopy = async (path: string) => {
        try {
            await navigator.clipboard.writeText(path);
            setCopyMessage(`「${path}」をコピーしました！`);
            setTimeout(() => setCopyMessage(''), 2500);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    const handleCopyAll = async () => {
        if (convertedPaths.length === 0) return;
        try {
            await navigator.clipboard.writeText(convertedPaths.join('\n'));
            setCopyMessage('全てのパスをコピーしました！');
            setTimeout(() => setCopyMessage(''), 2500);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Rパス変換ツール 🔄</h2>
            <p className="text-gray-600 mb-6 text-center">
                Windowsのパスを貼り付けて、Rで使える形式に一括変換します。<br />
                複数のパスは改行して入力してください。
            </p>

            {/* 入力エリア */}
            <textarea
                value={inputPaths}
                onChange={(e) => setInputPaths(e.target.value)}
                placeholder={`ここにWindowsのパスを1行に1つずつ貼り付けてください
例:
C:\\Users\\ユーザー名\\Documents\\ファイル名1.csv
C:\\Users\\ユーザー名\\Documents\\ファイル名2.xlsx`}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-y min-h-[120px]"
            />

            {/* 変換ボタン */}
            <button
                onClick={handleConvert}
                className="w-full mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md"
            >
                🔄 パスを変換
            </button>

            {/* 区切り線 */}
            <div className="border-t border-gray-200 my-8" />

            {/* 出力エリア */}
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">変換後のパス</h3>

            {convertedPaths.length > 0 ? (
                <div className="space-y-3">
                    {convertedPaths.map((path, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={path}
                                readOnly
                                className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                            />
                            <button
                                onClick={() => handleCopy(path)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 transition font-medium whitespace-nowrap"
                            >
                                📋 コピー
                            </button>
                        </div>
                    ))}

                    {/* 全コピーボタン */}
                    <button
                        onClick={handleCopyAll}
                        className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        📋 全てコピー
                    </button>
                </div>
            ) : (
                <p className="text-gray-500 text-center">変換するパスが入力されていません。</p>
            )}

            {/* コピーメッセージ */}
            {copyMessage && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center transition-opacity">
                    {copyMessage}
                </div>
            )}
        </div>
    );
}
