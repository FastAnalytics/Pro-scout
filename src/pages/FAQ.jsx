import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Heart } from "lucide-react";

const QA = [
  { q: "What is Pain Scout?", a: "Pain Scout is the internal opportunity tool for Pain Interactive — a Roblox studio that buys, revives and expands promising games. Scouts use this tool to surface titles with unusually high current CCU relative to their total lifetime visits, so we can move fast on acquisitions." },
  { q: "How often does the data update?", a: "Live CCU and visit counts refresh every 20 minutes across every tracked game. Fresh discovery sweeps run in the background to keep the pipeline full. Historical CCU snapshots power the graphs on the game detail pages." },
  { q: "Why is the price always NaN?", a: "Pain Scout is a discovery tool, not a marketplace. If a seller has already listed a game on another platform, the asking price appears here automatically. Otherwise the panel shows NaN so scouts know to reach out fresh." },
  { q: "How is the CCU-to-visits ratio calculated?", a: "Simply current CCU divided by total lifetime visits. Higher ratios mean players stick around and come back — a strong signal that the core loop is working, even if the game hasn’t exploded yet. That’s our sweet spot." },
  { q: "What does the AI Proposal do?", a: "It drafts an outreach message to the game’s creator on your behalf, introducing yourself as a scout from Pain Interactive, asking for stats, and inviting them to a group chat. One click, ready to copy." },
  { q: "Where do the Discord links come from?", a: "Discord invites are parsed from public game descriptions on Roblox. Not every game advertises its Discord in its description — many use Roblox’s social panel instead. Toggle 'Discord only' in filters to see just the ones we can confirm." },
  { q: "Does Pain Scout scrape Roblox?", a: "No. All data comes from Roblox’s public Games API via a lightweight proxy for rate-limit fairness. We never scrape HTML pages or bypass authentication." },
  { q: "Who built this?", a: "Built by DGRW2812 for the Pain Interactive scout team. Massive thanks to Teddy and Hud for the constant feedback, testing, and late-night bug reports. Thanks for working at Pain Interactive." },
];

export default function FAQ() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 text-slate-300 text-xs hover:border-orange-500 hover:text-orange-300">
          <ArrowLeft size={14} /> BACK TO SCOUT
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-lg bg-black border border-slate-800 flex items-center justify-center text-orange-400"><HelpCircle size={22} /></div>
        <div>
          <h1 className="text-3xl font-bold text-white leading-none">Frequently Asked Questions</h1>
          <p className="text-slate-400 text-sm mt-1">Everything you probably wanted to know about Pain Scout.</p>
        </div>
      </div>

      <div className="space-y-4">
        {QA.map((item, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-black p-5">
            <div className="text-white font-semibold text-base">{item.q}</div>
            <div className="text-slate-300 mt-2 leading-relaxed text-sm whitespace-pre-line">{item.a}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-slate-800 bg-black p-6 text-center">
        <Heart size={20} className="mx-auto text-orange-400 mb-2" />
        <div className="text-white font-semibold">Thanks for working at Pain Interactive</div>
        <div className="text-slate-400 text-sm mt-1">Built by <span className="text-orange-300">DGRW2812</span>. Huge thanks to <span className="text-orange-300">Teddy</span> and <span className="text-orange-300">Hud</span> for the support, feedback, and testing.</div>
        <div className="text-slate-500 text-xs mt-3">Good hunting. — Pain Interactive Scout Team</div>
      </div>
    </main>
  );
}
