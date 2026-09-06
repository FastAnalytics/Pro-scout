import React from "react";

export default function CCUChart({ points, height = 260 }) {
  const pad = { l: 44, r: 20, t: 20, b: 26 };
  const width = 800; // viewBox width; scales
  if (!points || points.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
        Not enough history yet — refreshes every 20 min. Come back soon.
      </div>
    );
  }
  const xs = points.map((_, i) => i);
  const ys = points.map((p) => p.playing || 0);
  const maxY = Math.max(...ys) * 1.15 || 10;
  const minY = 0;
  const xScale = (i) => pad.l + (i / (xs.length - 1)) * (width - pad.l - pad.r);
  const yScale = (v) => pad.t + (height - pad.t - pad.b) * (1 - (v - minY) / (maxY - minY || 1));

  const path = ys.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`).join(" ");
  const area = `${path} L ${xScale(xs.length - 1).toFixed(1)} ${height - pad.b} L ${xScale(0).toFixed(1)} ${height - pad.b} Z`;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => Math.round((maxY / ticks) * i));
  const xTickCount = Math.min(6, points.length);
  const xTickIdx = Array.from({ length: xTickCount }, (_, i) => Math.floor((i / (xTickCount - 1 || 1)) * (points.length - 1)));

  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      return `${dd}/${mm}`;
    } catch { return ""; }
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ccuFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} x2={width - pad.r} y1={yScale(v)} y2={yScale(v)} stroke="#1e293b" strokeDasharray="2 4" />
          <text x={pad.l - 8} y={yScale(v) + 4} textAnchor="end" fill="#64748b" fontSize="11">{v}</text>
        </g>
      ))}
      <path d={area} fill="url(#ccuFill)" />
      <path d={path} fill="none" stroke="#f97316" strokeWidth="2.2" />
      {xTickIdx.map((i) => (
        <text key={i} x={xScale(i)} y={height - 8} textAnchor="middle" fill="#64748b" fontSize="11">{fmtDate(points[i].ts)}</text>
      ))}
    </svg>
  );
}
