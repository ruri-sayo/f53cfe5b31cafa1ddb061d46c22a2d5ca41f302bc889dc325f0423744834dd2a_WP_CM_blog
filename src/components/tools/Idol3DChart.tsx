import React from 'react';
import Plot from 'react-plotly.js';
import idols from '../../data/idols.json';

const Idol3DChart: React.FC = () => {
    const trace = {
        x: idols.map(i => i.height),
        y: idols.map(i => i.age),
        z: idols.map(i => i.weight),
        mode: 'markers' as const,
        type: 'scatter3d' as const,
        text: idols.map(i => `${i.name}<br>身長: ${i.height}cm<br>年齢: ${i.age}歳<br>体重: ${i.weight}kg`),
        hoverinfo: 'text' as const,
        marker: {
            size: 6,
            color: idols.map(i => i.age),
            colorscale: 'Viridis' as const,
            opacity: 0.8,
            line: {
                color: 'rgba(50, 50, 50, 0.5)',
                width: 0.5
            }
        }
    };

    const layout = {
        title: {
            text: 'アイドルの身長・年齢・体重の3D分布',
            font: { size: 18, color: '#333' },
        },
        autosize: true,
        scene: {
            xaxis: { title: '身長 (cm)' },
            yaxis: { title: '年齢 (歳)' },
            zaxis: { title: '体重 (kg)' },
            camera: {
                eye: { x: 1.8, y: 1.8, z: 0.8 },
                up: { x: 0, y: 0, z: 1 }
            },
            aspectmode: 'cube' as const
        },
        margin: { l: 0, r: 0, b: 0, t: 50 },
        paper_bgcolor: 'rgba(249, 250, 251, 1)',
        plot_bgcolor: 'rgba(249, 250, 251, 1)'
    };

    return (
        <div className="w-full h-[700px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <Plot
                data={[trace]}
                layout={layout as any}
                useResizeHandler={true}
                className="w-full h-full"
                config={{
                    responsive: true,
                    displaylogo: false,
                }}
            />
        </div>
    );
};

export default Idol3DChart;
