import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import jsYaml from 'js-yaml';

interface SkiResort {
    name: string;
    pref: string;
    region: string;
    high: number;
    low: number;
    courses: number | null;
}

const prefToRegion: Record<string, string> = {
    "北海道": "北海道",
    "青森": "東北", "岩手": "東北", "宮城": "東北", "秋田": "東北", "山形": "東北", "福島": "東北",
    "茨城": "北関東・甲信", "栃木": "北関東・甲信", "群馬": "北関東・甲信", "山梨": "北関東・甲信", "長野": "北関東・甲信",
    "新潟": "北陸", "富山": "北陸", "石川": "北陸", "福井": "北陸",
    "岐阜": "中部", "静岡": "中部", "愛知": "中部", "三重": "中部",
    "滋賀": "近畿", "京都": "近畿", "大阪": "近畿", "兵庫": "近畿", "奈良": "近畿", "和歌山": "近畿",
    "鳥取": "中国", "島根": "中国", "岡山": "中国", "広島": "中国", "山口": "中国",
    "徳島": "四国", "香川": "四国", "愛媛": "四国", "高知": "四国",
    "福岡": "九州", "佐賀": "九州", "長崎": "九州", "熊本": "九州", "大分": "九州", "宮崎": "九州", "鹿児島": "九州",
    "沖縄": "沖縄"
};

const regionColors: Record<string, string> = {
    "北海道": "#0ea5e9",
    "東北": "#22c55e",
    "北関東・甲信": "#6366f1",
    "北陸": "#ca8a04",
    "中部": "#f97316",
    "近畿": "#ef4444",
    "中国": "#14b8a6",
    "四国": "#8b5cf6",
    "九州": "#e11d48",
    "沖縄": "#06b6d4",
    "その他": "#6b7280"
};

const regionOrder = ["北海道", "東北", "北関東・甲信", "北陸", "中部", "近畿", "中国", "四国", "九州", "沖縄", "その他"];

const SkiAltitudeChart: React.FC<{ dataUrl: string }> = ({ dataUrl }) => {
    const [data, setData] = useState<SkiResort[]>([]);
    const [sortKey, setSortKey] = useState<string>('region');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(true);
    const chartRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(dataUrl);
                const text = await response.text();
                const raw = jsYaml.load(text) as any[];

                const parsedData = raw
                    .filter(d => d.alt_top != null && d.alt_bottom != null)
                    .map(d => ({
                        name: d.name || "名称不明",
                        pref: d.pref || "",
                        region: d.region || prefToRegion[d.pref] || "その他",
                        high: Number(d.alt_top),
                        low: Number(d.alt_bottom),
                        courses: d.corse != null && d.corse !== "" ? Number(d.corse) : null
                    }))
                    .filter(d => !isNaN(d.high) && !isNaN(d.low));

                setData(parsedData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching ski data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [dataUrl]);

    useEffect(() => {
        if (data.length === 0 || !chartRef.current) return;

        const sortedData = [...data].sort((a, b) => {
            let comp = 0;
            if (sortKey === "region") {
                const idxA = regionOrder.indexOf(a.region);
                const idxB = regionOrder.indexOf(b.region);
                comp = (idxA === -1 ? regionOrder.length : idxA) - (idxB === -1 ? regionOrder.length : idxB);
                if (comp === 0) comp = a.high - b.high;
            } else if (sortKey === "pref") {
                comp = a.pref.localeCompare(b.pref, "ja");
                if (comp === 0) comp = a.high - b.high;
            } else if (sortKey === "elevation") {
                comp = a.high - b.high;
            }
            return sortOrder === "desc" ? -comp : comp;
        });

        // D3 rendering logic - 固定幅でスクロール対応
        const barWidth = 20;
        const barPadding = 10;
        const margin = { top: 20, right: 30, bottom: 220, left: 70 };
        const height = 600;
        const innerHeight = height - margin.top - margin.bottom;
        const width = sortedData.length * (barWidth + barPadding) + margin.left + margin.right;
        const innerWidth = width - margin.left - margin.right;

        d3.select(chartRef.current).select("svg").remove();

        const svg = d3.select(chartRef.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .domain(sortedData.map(d => d.name))
            .range([0, innerWidth])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(sortedData, d => d.high)! * 1.05])
            .range([innerHeight, 0]);

        const xAxis = svg.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(x));

        xAxis.selectAll("text")
            .attr("transform", "translate(-10,5)rotate(-65)")
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .attr("fill", "#4b5563")
            .attr("font-weight", "500");

        xAxis.selectAll(".domain, .tick line").remove();

        svg.append("g")
            .call(
                d3.axisLeft(y)
                    .tickFormat(d => `${d}m`)
                    .tickSize(-innerWidth)
                    .tickPadding(10)
            )
            .call(g => g.select(".domain").remove())
            .selectAll("text")
            .style("font-size", "10px")
            .attr("fill", "#6b7280");

        svg.selectAll(".tick line")
            .attr("stroke", "#f3f4f6")
            .attr("stroke-dasharray", "2,2");

        svg.append("g")
            .selectAll("rect")
            .data(sortedData, d => (d as SkiResort).name)
            .enter()
            .append("rect")
            .attr("x", d => x(d.name)!)
            .attr("y", d => y(d.high))
            .attr("width", x.bandwidth())
            .attr("height", d => Math.max(0, y(d.low) - y(d.high)))
            .style("fill", d => regionColors[d.region] || "#888888")
            .attr("opacity", 0.85)
            .attr("rx", 3)
            .attr("ry", 3)
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget).style("opacity", 1.0).attr("stroke", "#374151").attr("stroke-width", 1);
                if (tooltipRef.current) {
                    const tooltip = d3.select(tooltipRef.current);
                    tooltip.style("opacity", 0.9);
                    tooltip.html(`
            <div class="font-bold text-sm mb-1">${d.name}</div>
            <div class="text-xs space-y-0.5">
              <div>地域: ${d.region}</div>
              <div>都道府県: ${d.pref}</div>
              <div>標高: ${d.low.toLocaleString()}m - ${d.high.toLocaleString()}m</div>
              <div>コース数: ${d.courses != null ? d.courses + '本' : '調査中'}</div>
            </div>
          `)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            })
            .on("mousemove", (event) => {
                if (tooltipRef.current) {
                    d3.select(tooltipRef.current)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 28) + "px");
                }
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget).style("opacity", 0.85).attr("stroke", "none");
                if (tooltipRef.current) {
                    d3.select(tooltipRef.current).style("opacity", 0);
                }
            });

    }, [data, sortKey, sortOrder]);

    if (loading) {
        return <div className="text-center py-20 text-gray-500 animate-pulse">データを読み込み中...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-gray-700">並び替え:</label>
                        <select
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 hover:bg-white transition-colors"
                        >
                            <option value="region">地域</option>
                            <option value="pref">都道府県</option>
                            <option value="elevation">標高 (最高)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-gray-700">順序:</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 hover:bg-white transition-colors"
                        >
                            <option value="desc">降順 (高い順)</option>
                            <option value="asc">昇順 (低い順)</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {Object.keys(regionColors).map(region => (
                        <div key={region} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: regionColors[region] }}></span>
                            {region}
                        </div>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-xl bg-gray-50/30">
                <div ref={chartRef} className="min-w-full"></div>
            </div>

            <div
                ref={tooltipRef}
                className="fixed pointer-events-none opacity-0 bg-gray-900 text-white p-3 rounded-xl shadow-2xl text-xs z-50 transition-opacity duration-200 border border-white/10 backdrop-blur-sm"
            ></div>
        </div>
    );
};

export default SkiAltitudeChart;
