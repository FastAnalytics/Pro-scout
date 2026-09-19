import React from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Button } from "./ui/button";
import { formatNumber, parseBound } from "../lib/api";

export default function FiltersPanel({ filters, setFilters, genres, total }) {
  const update = (patch) => setFilters({ ...filters, ...patch });
  const bound = (key) => (e) => update({ [key]: parseBound(e.target.value) || "" });
  return <section id="filters" className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
    <div className="flex items-center gap-2 mb-4"><SlidersHorizontal size={16} className="text-orange-400" /><h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Game filters</h2><span className="ml-auto text-xs text-slate-400">{formatNumber(total)} matches</span></div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-4 relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><Input aria-label="Search games and descriptions" placeholder="Search keywords: obby, sim, tower..." value={filters.q} onChange={(e) => update({ q: e.target.value })} className="pl-9 bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500" /></div>
      <div className="md:col-span-3"><Select value={filters.sort} onValueChange={(v) => update({ sort: v })}><SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100"><ArrowUpDown size={14} className="text-orange-400 mr-2" /><SelectValue /></SelectTrigger><SelectContent className="bg-slate-900 border-slate-700 text-slate-100"><SelectItem value="ratio">CCU / Visits ratio</SelectItem><SelectItem value="playing">Current CCU</SelectItem><SelectItem value="visits">Total Visits</SelectItem><SelectItem value="favorites">Favorites</SelectItem><SelectItem value="newest">Newest</SelectItem></SelectContent></Select></div>
      <div className="md:col-span-3"><Select value={filters.genre || "__all"} onValueChange={(v) => update({ genre: v === "__all" ? "" : v })}><SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100"><SelectValue placeholder="All genres" /></SelectTrigger><SelectContent className="bg-slate-900 border-slate-700 text-slate-100 max-h-64"><SelectItem value="__all">All genres</SelectItem>{genres.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
      <div className="md:col-span-2"><Select value={filters.order} onValueChange={(v) => update({ order: v })}><SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-900 border-slate-700 text-slate-100"><SelectItem value="desc">Descending</SelectItem><SelectItem value="asc">Ascending</SelectItem></SelectContent></Select></div>
      {[["minCCU","Min CCU","100"],["maxCCU","Max CCU","No limit"],["minVisits","Min visits","0"],["maxVisits","Max visits","No limit"]].map(([key,label,placeholder]) => <label key={key} className="md:col-span-3 text-xs text-slate-400">{label}<Input type="number" min="0" placeholder={placeholder} value={filters[key]} onChange={bound(key)} className="mt-2 bg-slate-950 border-slate-700 text-slate-100" /></label>)}
    </div>
    <div className="mt-4 flex flex-wrap gap-2 items-center"><Preset label="5M+ visits" onClick={() => setFilters({ ...filters, minVisits: 5000000, maxVisits: "", sort: "visits", order: "desc" })} /><Preset label="100+ CCU" onClick={() => setFilters({ ...filters, minCCU: 100, sort: "playing", order: "desc" })} /><Preset label="Under 5M visits" onClick={() => setFilters({ ...filters, minCCU: 100, minVisits: 0, maxVisits: 5000000, sort: "ratio", order: "desc" })} /><Button variant="ghost" size="sm" onClick={() => setFilters({ q: "", minCCU: 100, maxCCU: "", minVisits: 0, maxVisits: "", genre: "", hasDiscord: false, sort: "ratio", order: "desc" })} className="text-slate-400 hover:text-orange-400">Reset</Button></div>
  </section>;
}
function Preset({ label, onClick }) { return <button onClick={onClick} className="px-3 py-1.5 rounded-full text-xs border border-slate-700 bg-slate-900 hover:border-orange-500 hover:text-orange-300 text-slate-300 transition-colors">{label}</button>; }
