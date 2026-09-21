import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, formatNumber } from "../lib/api";
import CCUChart from "../components/CCUChart";
import ProposalDialog from "../components/ProposalDialog";
import { Button } from "../components/ui/button";
import { ArrowLeft, Flag, Users, ExternalLink, ShieldCheck, Bookmark, Sparkles, Clock, Info } from "lucide-react";

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [range, setRange] = useState("7d");
  const [points, setPoints] = useState([]);
  const [devex, setDevex] = useState({ usdPerRobux: 0.0035 });
  const [showProposal, setShowProposal] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [g, dx] = await Promise.all([api.game(id), api.devex()]);
        setGame(g); setDevex(dx);
      } catch (e) { setErr(String(e.message || e)); }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const d = await api.history(id, range);
        setPoints(d.points || []);
      } catch {}
    })();
  }, [id, range]);

  if (err) return <div className="p-8 text-slate-300">{err} — <Link to="/" className="text-orange-400">back</Link></div>;
  if (!game) return <div className="p-8 text-slate-400">Loading…</div>;

  const playLink = game.rootPlaceId ? `https://www.roblox.com/games/${game.rootPlaceId}` : null;

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300 text-xs hover:border-orange-500 hover:text-orange-300">
          <ArrowLeft size={14} /> ALL GAMES
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start gap-4">
            {game.icon && <img src={game.icon} alt={game.name} className="w-16 h-16 rounded-xl border border-slate-800 object-cover" />}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{game.name}</h1>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300"><Clock size={11} /> updated recently</div>
            </div>
            <button className="px-3 py-1.5 rounded-md border border-slate-700 text-slate-400 hover:text-orange-400 text-xs inline-flex items-center gap-1"><Flag size={12} /> Report</button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" /> {formatNumber(game.playing)} playing</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">{game.genre || "Uncategorized"}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs"><Users size={11} /> {game.maxPlayers} per server</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">Visits {formatNumber(game.visits)}</span>
          </div>

          <section>
            <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">About this experience</div>
            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Info size={11} /> Description from Roblox, not written by the seller.</div>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{game.description || "No description provided."}</p>
            {playLink && (
              <a href={playLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-sm border border-slate-700">
                <ExternalLink size={14} /> View on Roblox
              </a>
            )}
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-slate-500">Concurrent Players</div>
                <div className="text-3xl font-bold text-white mt-1">{formatNumber(game.playing)} <span className="text-sm text-slate-500 font-normal ml-1">CCU</span></div>
              </div>
              <div className="flex gap-1 bg-slate-950/60 border border-slate-800 rounded-md p-1 text-xs">
                {["24h","7d","30d"].map(r => (
                  <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 rounded ${range === r ? "bg-orange-500 text-black font-medium" : "text-slate-400 hover:text-white"}`}>{r}</button>
                ))}
              </div>
            </div>
            <CCUChart points={points} />
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-widest text-slate-500">Offer activity</div>
              <div className="text-xs text-slate-400">0 offers</div>
            </div>
            <div className="text-slate-500 text-sm mt-2">No offers yet. This game is not currently listed for sale.</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-white leading-none">NaN</div>
                <div className="text-xs text-slate-500 mt-1">Not currently for sale</div>
              </div>
              <button className="text-slate-500 hover:text-orange-400" title="Save"><Bookmark size={16} /></button>
            </div>
            <div className="mt-4 rounded-md bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-400 leading-relaxed">
              <span className="text-slate-200 font-medium">Listed elsewhere?</span> If a seller has this game on another marketplace, the asking price appears here automatically.
            </div>
            <Button onClick={() => setShowProposal(true)} className="w-full mt-3 bg-orange-500 hover:bg-orange-400 text-black font-medium"><Sparkles size={14} className="mr-1" /> Generate AI Proposal</Button>
            <button className="w-full mt-2 px-3 py-2 rounded-md border border-slate-700 hover:border-orange-500 text-slate-300 text-sm">Contact Creator</button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3 text-sm">
            <div className="flex items-start gap-2 text-slate-300"><ShieldCheck size={16} className="text-emerald-400 mt-0.5" /><div><div className="font-medium text-white">Data verified</div><div className="text-xs text-slate-500">CCU and visits pulled live from Roblox public API.</div></div></div>
            <div className="flex items-start gap-2 text-slate-300"><ShieldCheck size={16} className="text-emerald-400 mt-0.5" /><div><div className="font-medium text-white">Under 5M visits</div><div className="text-xs text-slate-500">Sweet spot for a clone or spiritual successor.</div></div></div>
            <div className="flex items-start gap-2 text-slate-300"><ShieldCheck size={16} className="text-emerald-400 mt-0.5" /><div><div className="font-medium text-white">Refreshed every 20 min</div><div className="text-xs text-slate-500">Graph builds up as new snapshots come in.</div></div></div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between"><div className="text-[11px] uppercase tracking-widest text-slate-500">Listed by</div>{game.discord && game.discord.startsWith("http") && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/40 text-indigo-300">Discord linked</span>}</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-black font-bold">{(game.creatorName || "?")[0]}</div>
              <div><div className="text-white font-medium">@{game.creatorName || "Unknown"}</div><div className="text-xs text-slate-500">{game.creatorType || "User"}</div></div>
            </div>
          </div>
        </aside>
      </div>

      <ProposalDialog game={showProposal ? game : null} devex={devex} onClose={() => setShowProposal(false)} />
    </main>
  );
}
