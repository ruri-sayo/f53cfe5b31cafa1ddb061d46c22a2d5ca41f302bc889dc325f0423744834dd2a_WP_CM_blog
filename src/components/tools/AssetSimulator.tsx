import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface YearlyData {
    year: number;
    assetsStart: number;
    income: number;
    consumption: number;
    assetsEnd: number;
}

const AssetSimulator: React.FC = () => {
    // Inputs
    const [initialAssets, setInitialAssets] = useState(3000);
    const [annualYield, setAnnualYield] = useState(5.0);
    const [annualConsumption, setAnnualConsumption] = useState(150);
    const [inflationRate, setInflationRate] = useState(2.0);
    const [simulationYears, setSimulationYears] = useState(30);

    // Results
    const [results, setResults] = useState<YearlyData[]>([]);
    const [showGraph, setShowGraph] = useState(false);

    const formatCurrency = (value: number) => {
        return Math.round(value * 100) / 100;
    };

    const runSimulation = () => {
        let currentAssets = initialAssets;
        const newResults: YearlyData[] = [];
        const yieldDecimal = annualYield / 100;
        const inflationDecimal = inflationRate / 100;

        for (let year = 1; year <= simulationYears; year++) {
            const assetsStart = currentAssets;
            const income = assetsStart * yieldDecimal;
            const currentConsumption = annualConsumption * Math.pow(1 + inflationDecimal, year - 1);
            const assetsEnd = assetsStart + income - currentConsumption;

            newResults.push({
                year,
                assetsStart: formatCurrency(assetsStart),
                income: formatCurrency(income),
                consumption: formatCurrency(currentConsumption),
                assetsEnd: formatCurrency(assetsEnd)
            });

            currentAssets = assetsEnd;
            if (assetsEnd < -10000000) break; // Stopper
        }
        setResults(newResults);
        setShowGraph(true);
    };

    const calculateRequired = () => {
        if (annualYield <= 0) return;
        const required = annualConsumption / (annualYield / 100);
        setInitialAssets(Math.round(required * 100) / 100);
    };

    const chartData = useMemo(() => {
        return {
            labels: results.map(d => d.year),
            datasets: [
                {
                    label: '期末総資産 (万円)',
                    data: results.map(d => d.assetsEnd),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    yAxisID: 'yAssets',
                },
                {
                    label: '年間消費額 (万円)',
                    data: results.map(d => d.consumption),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'ySub',
                },
                {
                    label: '年間収入(利息) (万円)',
                    data: results.map(d => d.income),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    yAxisID: 'ySub',
                }
            ]
        };
    }, [results]);

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            yAssets: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: '総資産 (万円)' }
            },
            ySub: {
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: '消費/収入 (万円)' },
                grid: { drawOnChartArea: false }
            }
        },
        plugins: {
            legend: { position: 'top' as const },
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">初期資産 (万円)</label>
                        <input
                            type="number"
                            value={initialAssets}
                            onChange={(e) => setInitialAssets(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">年間利回り (%)</label>
                        <input
                            type="number"
                            value={annualYield}
                            step="0.1"
                            onChange={(e) => setAnnualYield(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">初年度消費額 (万円)</label>
                        <input
                            type="number"
                            value={annualConsumption}
                            onChange={(e) => setAnnualConsumption(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">インフレ率 (%)</label>
                        <input
                            type="number"
                            value={inflationRate}
                            step="0.1"
                            onChange={(e) => setInflationRate(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">期間 (年)</label>
                        <input
                            type="number"
                            value={simulationYears}
                            min="1" max="100"
                            onChange={(e) => setSimulationYears(Number(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={runSimulation}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                        シミュレーション実行
                    </button>
                    <button
                        onClick={calculateRequired}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                        必要初期資産を計算
                    </button>
                </div>
            </div>

            {results.length > 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {showGraph && (
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 h-[500px]">
                            <Line data={chartData} options={options} />
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-bold">
                                    <tr>
                                        <th className="px-6 py-4">年</th>
                                        <th className="px-6 py-4 text-right">期首資産 (万円)</th>
                                        <th className="px-6 py-4 text-right">利息収入 (万円)</th>
                                        <th className="px-6 py-4 text-right">消費額 (万円)</th>
                                        <th className="px-6 py-4 text-right">期末資産 (万円)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((row) => (
                                        <tr key={row.year} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{row.year}</td>
                                            <td className="px-6 py-4 text-right">{row.assetsStart.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-blue-600">+{row.income.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-red-500">-{row.consumption.toLocaleString()}</td>
                                            <td className={`px-6 py-4 text-right font-bold ${row.assetsEnd < 0 ? 'text-red-700' : 'text-green-700'}`}>
                                                {row.assetsEnd.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetSimulator;
