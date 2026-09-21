import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calculator, Coins } from "lucide-react";

const RATE = 0.0035; // USD per Robux (Roblox published rate)
const MIN_ROBUX = 30000;

export default function DevEx() {
  const [robux, setRobux] = useState(100000);
  const [usd, setUsd] = useState(100000 * RATE);

  const setR = (v) => { const n = Math.max(0, Number(v) || 0); setRobux(n); setUsd(+(n * RATE).toFixed(2)); };
  const setU = (v) => { const n = Math.max(0, Number(v) || 0); setUsd(n); setRobux(Math.round(n / RATE)); };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 text-slate-300 text-xs hover:border-orange-500 hover:text-orange-300">
          <ArrowLeft size={14} /> BACK TO SCOUT
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-lg bg-black border border-slate-800 flex items-center justify-center text-orange-400"><Calculator size={22} /></div>
        <div>
          <h1 className="text-3xl font-bold text-white leading-none">DevEx Calculator</h1>
          <p className="text-slate-400 text-sm mt-1">Convert Robux earnings to real USD at Roblox's current DevEx rate.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-black p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-500">Robux (R$)</label>
            <input type="number" min="0" step="1000" value={robux} onChange={(e) => setR(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-md px-3 py-3 text-white text-lg focus:border-orange-500 outline-none" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-slate-500">USD ($)</label>
            <input type="number" min="0" step="10" value={usd} onChange={(e) => setU(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-md px-3 py-3 text-white text-lg focus:border-orange-500 outline-none" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[100000, 500000, 1000000, 2000000].map((v) => (
            <button key={v} onClick={() => setR(v)} className="rounded-md border border-slate-800 bg-slate-950 hover:border-orange-500 py-2 text-sm text-slate-300">
              {v.toLocaleString()} R$
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-black p-5 text-sm text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-orange-400 font-semibold"><Coins size={16} /> Rate details</div>
        <div>Roblox pays <span className="text-white font-medium">$0.0035 USD per Robux</span> (i.e. 100,000 R$ = $350 USD).</div>
        <div>Minimum cashout: <span className="text-white font-medium">{MIN_ROBUX.toLocaleString()} R$</span> (~${(MIN_ROBUX * RATE).toFixed(2)} USD).</div>
        <div className="text-slate-500 text-xs pt-2">Rates set by Roblox; subject to change without notice.</div>
      </div>
    </main>
  );
}
