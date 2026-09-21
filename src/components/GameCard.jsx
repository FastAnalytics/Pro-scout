import React from "react";
import { Link } from "react-router-dom";
import { Users, Eye, ExternalLink, Sparkles, TrendingUp, Heart, ThumbsUp } from "lucide-react";
import { formatNumber } from "../lib/api";
import { Button } from "./ui/button";

export default function GameCard({ game, devex, onSelect }) {
  const ratioPct = (game.ratio * 100).toFixed(4);
  const playLink = game.rootPlaceId ? `https://www.roblox.com/games/${game.rootPlaceId}` : null;

  return (
    <div className="card-hover rounded-xl border border-slate-800 bg-black overflow-hidden flex flex-col">
      <Link to={`/games/${game.universeId}`} className="relative aspect-[16/10] bg-black block group">
        {game.icon ? (
          <img src={game.icon} alt={game.name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">no icon</div>
        )}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black to-transparent" />
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/games/${game.universeId}`} className="flex items-start justify-between gap-2 hover:text-orange-300">
          <h3 className="font-semibold text-white leading-tight line-clamp-2">{game.name}</h3>
        </Link>
        <div className="text-xs text-slate-500 mt-0.5">by {game.creatorName || "Unknown"}</div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <Metric icon={Users} label="CCU" value={formatNumber(game.playing)} accent="orange" />
          <Metric icon={Eye} label="Visits" value={formatNumber(game.visits)} />
          <Metric icon={TrendingUp} label="Ratio" value={`${ratioPct}%`} accent="emerald" />
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Heart size={12} /> {formatNumber(game.favorites)}</span>
          <span className="flex items-center gap-1"><ThumbsUp size={12} /> {formatNumber(game.likes)}</span>
          <span className="ml-auto text-slate-500">Max {game.maxPlayers || "-"}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            onClick={() => onSelect(game)}
            className="flex-1 bg-orange-500 hover:bg-orange-400 text-black font-medium gap-1"
          >
            <Sparkles size={14} /> AI Proposal
          </Button>
          {game.discord && game.discord.startsWith("http") && (
            <a
              href={game.discord}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-3 rounded-md border border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
              title="Join Discord"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.2.36-.44.85-.6 1.23a18.27 18.27 0 0 0-5.916 0c-.16-.38-.4-.87-.6-1.23A19.79 19.79 0 0 0 5.683 4.37C2.633 8.9 1.83 13.31 2.23 17.66c1.5 1.11 2.95 1.79 4.36 2.24.35-.48.66-.99.93-1.53-.5-.19-.98-.42-1.44-.7.12-.09.24-.18.36-.28 2.78 1.29 5.79 1.29 8.54 0 .12.1.24.19.36.28-.46.28-.94.51-1.44.7.27.54.58 1.05.93 1.53 1.41-.45 2.86-1.13 4.36-2.24.47-5.03-.86-9.39-3.9-13.29zM8.68 15.5c-.85 0-1.55-.79-1.55-1.75s.69-1.75 1.55-1.75c.86 0 1.56.79 1.55 1.75 0 .96-.69 1.75-1.55 1.75zm6.64 0c-.85 0-1.55-.79-1.55-1.75s.69-1.75 1.55-1.75c.86 0 1.56.79 1.55 1.75 0 .96-.69 1.75-1.55 1.75z"/></svg>
            </a>
          )}
          {playLink && (
            <a
              href={playLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-3 rounded-md border border-slate-700 hover:border-orange-500 text-slate-300 hover:text-orange-300"
              title="Open on Roblox"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent = "slate" }) {
  const cls = accent === "orange" ? "text-orange-300" : accent === "emerald" ? "text-emerald-300" : "text-slate-200";
  return (
    <div className="rounded-lg bg-slate-950/60 border border-slate-800 py-2">
      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 uppercase tracking-wide">
        <Icon size={10} /> {label}
      </div>
      <div className={`text-sm font-bold mt-0.5 ${cls}`}>{value}</div>
    </div>
  );
}
