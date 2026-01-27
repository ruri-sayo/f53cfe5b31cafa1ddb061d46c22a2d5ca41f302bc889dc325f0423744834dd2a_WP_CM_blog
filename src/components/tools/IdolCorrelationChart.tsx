import React, { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import idols from '../../data/idols.json';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

type Idol = typeof idols[0];

const typeColors: Record<string, string> = {
    Princess: 'rgba(234, 91, 118, 0.7)',
    Angel: 'rgba(254, 213, 82, 0.7)',
    Fairy: 'rgba(100, 149, 207, 0.7)'
};

const typeBorderColors: Record<string, string> = {
    Princess: 'rgb(234, 91, 118)',
    Angel: 'rgb(254, 213, 82)',
    Fairy: 'rgb(100, 149, 207)'
};

const IdolCorrelationChart: React.FC = () => {
    const [includeKonomi, setIncludeKonomi] = useState(true);
    const [xAxisKey, setXAxisKey] = useState<keyof Idol>('height');
    const [yAxisKey, setYAxisKey] = useState<keyof Idol>('age');

    const filteredIdols = useMemo(() => {
        return includeKonomi ? idols : idols.filter(i => i.name !== "馬場 このみ");
    }, [includeKonomi]);

    const config = useMemo(() => {
        const labels = {
            age: '年齢 (歳)',
            height: '身長 (cm)',
            weight: '体重 (kg)',
            bust: 'バスト (cm)',
            waist: 'ウエスト (cm)',
            hip: 'ヒップ (cm)'
        };

        const datasets = Object.keys(typeColors).map(type => ({
            label: type,
            data: filteredIdols
                .filter(i => i.type === type)
                .map(i => ({ x: i[xAxisKey] as number, y: i[yAxisKey] as number, name: i.name })),
            backgroundColor: typeColors[type],
            borderColor: typeBorderColors[type],
            pointRadius: 6,
            pointHoverRadius: 8,
        }));

        // Regression Line Calculation
        const allPoints = filteredIdols.map(i => ({ x: i[xAxisKey] as number, y: i[yAxisKey] as number }));
        if (allPoints.length >= 2) {
            const n = allPoints.length;
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            allPoints.forEach(p => {
                sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumX2 += p.x * p.x;
            });
            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            if (isFinite(slope)) {
                const xVals = allPoints.map(p => p.x);
                const minX = Math.min(...xVals);
                const maxX = Math.max(...xVals);
                datasets.push({
                    label: '近似曲線',
                    data: [
                        { x: minX, y: slope * minX + intercept } as any,
                        { x: maxX, y: slope * maxX + intercept } as any
                    ],
                    type: 'line' as any,
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0,
                    backgroundColor: 'transparent'
                } as any);
            }
        }

        const options: ChartOptions<'scatter'> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => {
                            const p = ctx.raw;
                            return `${p.name}: ${xAxisKey}=${p.x}, ${yAxisKey}=${p.y}`;
                        }
                    }
                },
                legend: { position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: labels[xAxisKey as keyof typeof labels] } },
                y: { title: { display: true, text: labels[yAxisKey as keyof typeof labels] } }
            }
        };

        return { datasets, options };
    }, [filteredIdols, xAxisKey, yAxisKey]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-wrap gap-6 mb-8 items-center justify-between">
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">X軸</label>
                        <select value={xAxisKey} onChange={(e) => setXAxisKey(e.target.value as any)} className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500">
                            <option value="height">身長</option>
                            <option value="weight">体重</option>
                            <option value="age">年齢</option>
                            <option value="bust">バスト</option>
                            <option value="waist">ウエスト</option>
                            <option value="hip">ヒップ</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Y軸</label>
                        <select value={yAxisKey} onChange={(e) => setYAxisKey(e.target.value as any)} className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500">
                            <option value="age">年齢</option>
                            <option value="height">身長</option>
                            <option value="weight">体重</option>
                            <option value="bust">バスト</option>
                            <option value="waist">ウエスト</option>
                            <option value="hip">ヒップ</option>
                        </select>
                    </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-pink-600 transition-colors">馬場このみさんを含める</span>
                    <div className="relative inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={includeKonomi}
                            onChange={e => setIncludeKonomi(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </div>
                </label>
            </div>

            <div className="h-[500px] w-full">
                <Scatter data={{ datasets: config.datasets as any }} options={config.options} />
            </div>
        </div>
    );
};

export default IdolCorrelationChart;
