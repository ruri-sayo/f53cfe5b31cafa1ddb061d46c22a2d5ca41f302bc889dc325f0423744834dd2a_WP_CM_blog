import React, { useState, useRef, useEffect } from 'react';

/**
 * テキスト差分比較ツール
 * Reactアイランドとして動作
 */
export default function DiffCompare() {
    const [textA, setTextA] = useState('');
    const [textB, setTextB] = useState('');
    const [showResult, setShowResult] = useState(false);

    const outputARef = useRef<HTMLDivElement>(null);
    const outputBRef = useRef<HTMLDivElement>(null);

    // スクロール同期
    useEffect(() => {
        const outputA = outputARef.current;
        const outputB = outputBRef.current;
        if (!outputA || !outputB) return;

        let isSyncing = false;

        const handleScrollA = () => {
            if (!isSyncing) {
                isSyncing = true;
                outputB.scrollTop = outputA.scrollTop;
                isSyncing = false;
            }
        };

        const handleScrollB = () => {
            if (!isSyncing) {
                isSyncing = true;
                outputA.scrollTop = outputB.scrollTop;
                isSyncing = false;
            }
        };

        outputA.addEventListener('scroll', handleScrollA);
        outputB.addEventListener('scroll', handleScrollB);

        return () => {
            outputA.removeEventListener('scroll', handleScrollA);
            outputB.removeEventListener('scroll', handleScrollB);
        };
    }, [showResult]);

    // HTMLエスケープ
    const escapeHtml = (text: string | undefined) => {
        if (text === null || text === undefined) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\t/g, '    ')
            .replace(/ /g, '&nbsp;');
    };

    // 比較ロジック
    const compareTexts = () => {
        const linesA = textA.split('\n');
        const linesB = textB.split('\n');
        const maxLines = Math.max(linesA.length, linesB.length);

        const resultA: React.ReactNode[] = [];
        const resultB: React.ReactNode[] = [];

        for (let i = 0; i < maxLines; i++) {
            const lineA = linesA[i];
            const lineB = linesB[i];
            const lineNum = i + 1;

            const prefix = (
                <span className="text-gray-400 select-none w-10 inline-block text-right pr-2">
                    {lineNum}
                </span>
            );
            const emptyPrefix = (
                <span className="text-gray-400 select-none w-10 inline-block text-right pr-2">
                    {' '}
                </span>
            );

            if (lineA === undefined) {
                resultA.push(<div key={i} className="h-[21px]">{emptyPrefix}</div>);
                resultB.push(
                    <div key={i}>
                        {prefix}
                        <span
                            className="bg-gradient-to-b from-transparent via-transparent to-green-300"
                            style={{ backgroundPosition: '0 60%' }}
                            dangerouslySetInnerHTML={{ __html: escapeHtml(lineB) }}
                        />
                    </div>
                );
            } else if (lineB === undefined) {
                resultA.push(
                    <div key={i}>
                        {prefix}
                        <span
                            className="bg-gradient-to-b from-transparent via-transparent to-green-300"
                            dangerouslySetInnerHTML={{ __html: escapeHtml(lineA) }}
                        />
                    </div>
                );
                resultB.push(<div key={i} className="h-[21px]">{emptyPrefix}</div>);
            } else if (lineA === lineB) {
                resultA.push(
                    <div key={i}>
                        {prefix}
                        <span dangerouslySetInnerHTML={{ __html: escapeHtml(lineA) }} />
                    </div>
                );
                resultB.push(
                    <div key={i}>
                        {prefix}
                        <span dangerouslySetInnerHTML={{ __html: escapeHtml(lineB) }} />
                    </div>
                );
            } else {
                resultA.push(
                    <div key={i}>
                        {prefix}
                        <span
                            className="bg-gradient-to-b from-transparent via-transparent to-red-300"
                            dangerouslySetInnerHTML={{ __html: escapeHtml(lineA) }}
                        />
                    </div>
                );
                resultB.push(
                    <div key={i}>
                        {prefix}
                        <span
                            className="bg-gradient-to-b from-transparent via-transparent to-red-300"
                            dangerouslySetInnerHTML={{ __html: escapeHtml(lineB) }}
                        />
                    </div>
                );
            }
        }

        return { resultA, resultB };
    };

    const handleCompare = () => {
        setShowResult(true);
    };

    const { resultA, resultB } = showResult ? compareTexts() : { resultA: [], resultB: [] };

    return (
        <div className="w-full">
            {/* 入力エリア */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="block text-lg font-medium mb-2">入力 A</label>
                    <textarea
                        value={textA}
                        onChange={(e) => setTextA(e.target.value)}
                        className="w-full h-64 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                        placeholder="比較したいテキストを入力してください..."
                    />
                </div>
                <div>
                    <label className="block text-lg font-medium mb-2">入力 B</label>
                    <textarea
                        value={textB}
                        onChange={(e) => setTextB(e.target.value)}
                        className="w-full h-64 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        placeholder="比較対象のテキストを入力してください..."
                    />
                </div>
            </div>

            {/* 比較ボタン */}
            <div className="mt-6 text-center">
                <button
                    onClick={handleCompare}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg"
                >
                    比較を実行
                </button>
            </div>

            {/* 結果表示エリア */}
            {showResult && (
                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-center mb-6">比較結果</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 bg-white p-4 rounded-lg shadow-md border">
                        <div>
                            <h3 className="text-xl font-semibold mb-2 border-b pb-2">Aの結果</h3>
                            <div
                                ref={outputARef}
                                className="w-full h-96 p-3 bg-gray-50 rounded-md whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-auto"
                            >
                                {resultA}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2 border-b pb-2">Bの結果</h3>
                            <div
                                ref={outputBRef}
                                className="w-full h-96 p-3 bg-gray-50 rounded-md whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-auto"
                            >
                                {resultB}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
