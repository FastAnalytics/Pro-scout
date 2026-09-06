import React from "react";
import { Database, Flame, Gem, LineChart } from "lucide-react";
import { formatNumber } from "../lib/api";

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-black p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-400">
        <Icon size={20} />
      </div>
      <div>
        <div className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold text-white leading-none mt-1">{value}</div>
      </div>
    </div>
  );
}

export default function StatsBar({ stats }) {
  const s = stats || {};
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Stat icon={Database} label="Games Tracked" value={formatNumber(s.totalGames)} />
      <Stat icon={Flame} label="High-CCU Games" value={formatNumber(s.highCCU)} />
      <Stat icon={Gem} label="Hidden Gems" value={formatNumber(s.hiddenGems)} />
      <Stat icon={LineChart} label="Avg CCU" value={formatNumber(s.avgCCU)} />
    </div>
  );
}
