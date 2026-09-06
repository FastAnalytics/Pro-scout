import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Sparkles, Loader2, Copy, ExternalLink, Users, Eye, TrendingUp } from "lucide-react";
import { api, formatNumber } from "../lib/api";
import { useToast } from "../hooks/use-toast";

// Basic markdown -> HTML (headings, bold, lists, paragraphs, code)
function renderMarkdown(md) {
  if (!md) return "";
  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false;
  const closeList = () => { if (inList) { html += "</ul>"; inList = false; } };
  for (let raw of lines) {
    const line = raw.trim();
    if (!line) { closeList(); continue; }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      closeList();
      const level = h[1].length + 1; // start at h2
      html += `<h${level}>${inline(h[2])}</h${level}>`;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }
    closeList();
    html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html;
}
function inline(s) {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export default function ProposalDialog({ game, onClose, devex }) {
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState("");
  const [focus, setFocus] = useState("acquisition");
  const { toast } = useToast();

  useEffect(() => {
    if (!game) { setProposal(""); return; }
    let cancelled = false;
    (async () => {
      setLoading(true); setProposal("");
      try {
        const res = await api.proposal(game.universeId, focus);
        if (!cancelled) setProposal(res.proposal || "");
      } catch (e) {
        if (!cancelled) toast({ title: "Proposal error", description: String(e.message || e) });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [game, focus]);

  const open = !!game;
  const rate = devex?.usdPerRobux || 0.0035;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(proposal);
      toast({ title: "Copied", description: "Proposal copied to clipboard" });
    } catch (e) {}
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl bg-slate-950 border-slate-800 text-slate-100 max-h-[92vh] overflow-hidden flex flex-col p-0">
        {game && (
          <>
            <DialogHeader className="p-6 pb-3 border-b border-slate-800">
              <div className="flex items-start gap-4">
                {game.icon && (
                  <img src={game.icon} alt={game.name} className="w-16 h-16 rounded-lg object-cover border border-slate-800" />
                )}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-white flex items-center gap-2">
                    <Sparkles className="text-orange-400" size={18} /> {game.name}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400 mt-1">
                    Pain Interactive outreach DM — by {game.creatorName || "Unknown"} · {game.genre || "No genre"}
                  </DialogDescription>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <MiniStat icon={Users} label="CCU" value={formatNumber(game.playing)} tone="orange" />
                    <MiniStat icon={Eye} label="Visits" value={formatNumber(game.visits)} />
                    <MiniStat icon={TrendingUp} label="Ratio" value={`${(game.ratio*100).toFixed(4)}%`} tone="emerald" />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["acquisition", "IP licensing", "revenue share", "group chat intro", "clone rights"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFocus(f)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${focus === f ? "bg-orange-500 text-black border-orange-400" : "bg-slate-900 text-slate-300 border-slate-700 hover:border-orange-500"}`}
                  >{f}</button>
                ))}
              </div>
            </DialogHeader>

            <div className="px-6 py-4 overflow-auto scroll-thin flex-1">
              {loading ? (
                <div className="flex items-center gap-3 text-slate-400 py-10 justify-center">
                  <Loader2 className="animate-spin text-orange-400" size={18} />
                  <span>Drafting outreach DM…</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-slate-200 text-[15px] leading-relaxed bg-slate-900/40 border border-slate-800 rounded-lg p-5">
                  {proposal}
                </div>
              )}

              {!loading && proposal && (
                <div className="mt-4 text-xs text-slate-500">
                  Tip: paste this straight into a Roblox DM or Discord message. Personalise the sign-off if you want.
                </div>
              )}
            </div>

            <DialogFooter className="p-4 border-t border-slate-800 gap-2 flex-row justify-between sm:justify-between">
              <div className="flex gap-2">
                {game.rootPlaceId && (
                  <a
                    href={`https://www.roblox.com/games/${game.rootPlaceId}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-700 hover:border-orange-500 text-slate-300 hover:text-orange-300 text-sm"
                  ><ExternalLink size={14} /> Open on Roblox</a>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={copy} disabled={!proposal} className="text-slate-300 hover:text-orange-400">
                  <Copy size={14} className="mr-1" /> Copy
                </Button>
                <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-400 text-black">Close</Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MiniStat({ icon: Icon, label, value, tone }) {
  const c = tone === "orange" ? "text-orange-300" : tone === "emerald" ? "text-emerald-300" : "text-slate-200";
  return (
    <div className="rounded-md bg-slate-900/70 border border-slate-800 px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase"><Icon size={10} /> {label}</div>
      <div className={`text-sm font-bold mt-0.5 ${c}`}>{value}</div>
    </div>
  );
}
