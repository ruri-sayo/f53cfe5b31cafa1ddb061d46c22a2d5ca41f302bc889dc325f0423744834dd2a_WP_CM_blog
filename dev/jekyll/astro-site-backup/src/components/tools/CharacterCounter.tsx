import { useState } from 'react';

/**
 * 文字数カウンターコンポーネント
 * Reactアイランドとして動作
 */
export default function CharacterCounter() {
    const [text, setText] = useState('');

    // スペースを含む文字数
    const countWithSpaces = text.length;

    // スペースを含まない文字数（空白文字を除去）
    const countWithoutSpaces = text.replace(/\s/g, '').length;

    // 行数
    const lineCount = text ? text.split('\n').length : 0;

    // 単語数（日本語対応：スペース区切り + 連続した非空白文字をカウント）
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                文字数カウンター
            </h2>

            {/* テキスト入力エリア */}
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-48 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ここにテキストを入力してください..."
            />

            {/* リアルタイム結果表示 */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">スペース込み</p>
                    <p className="text-2xl font-bold text-blue-600">{countWithSpaces}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">スペース除く</p>
                    <p className="text-2xl font-bold text-green-600">{countWithoutSpaces}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">行数</p>
                    <p className="text-2xl font-bold text-purple-600">{lineCount}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">単語数</p>
                    <p className="text-2xl font-bold text-orange-600">{wordCount}</p>
                </div>
            </div>

            {/* クリアボタン */}
            <button
                onClick={() => setText('')}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md mt-4 hover:bg-gray-300 transition duration-300"
            >
                クリア
            </button>
        </div>
    );
}
