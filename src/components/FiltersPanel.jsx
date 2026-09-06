import React from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "./ui/select";
import { Button } from "./ui/button";
import { formatNumber } from "../lib/api";

export default function FiltersPanel({ filters, setFilters, genres, total }) {
  const update = (patch) => setFilters({ ...filters, ...patch });

  return (
    <section id="filters" className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={16} className="text-orange-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Filters</h2>
        <span className="ml-auto text-xs text-slate-400">{formatNumber(total)} matches</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search game name..."
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            className="pl-9 bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        {/* Sort */}
        <div className="md:col-span-3">
          <Select value={filters.sort} onValueChange={(v) => update({ sort: v })}>
            <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
              <ArrowUpDown size={14} className="text-orange-400 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
              <SelectItem value="ratio">CCU / Visits ratio</SelectItem>
              <SelectItem value="playing">Current CCU</SelectItem>
              <SelectItem value="visits">Total Visits</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Genre */}
        <div className="md:col-span-3">
          <Select value={filters.genre || "__all"} onValueChange={(v) => update({ genre: v === "__all" ? "" : v })}>
            <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100 max-h-64">
              <SelectItem value="__all">All genres</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Order */}
        <div className="md:col-span-2">
          <Select value={filters.order} onValueChange={(v) => update({ order: v })}>
            <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min CCU */}
        <div className="md:col-span-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Minimum CCU</span>
            <span className="text-slate-200 font-medium">{filters.minCCU}+</span>
          </div>
          <Slider
            value={[filters.minCCU]}
            min={100}
            max={2000}
            step={10}
            onValueChange={([v]) => update({ minCCU: v })}
          />
        </div>

        {/* Max Visits */}
        <div className="md:col-span-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Max Visits (hard cap: 5M)</span>
            <span className="text-slate-200 font-medium">{formatNumber(filters.maxVisits)}</span>
          </div>
          <Slider
            value={[filters.maxVisits]}
            min={1000}
            max={5000000}
            step={1000}
            onValueChange={([v]) => update({ maxVisits: v })}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <Preset label="Hidden Gems" onClick={() => setFilters({ ...filters, minCCU: 100, maxVisits: 500000, sort: "ratio", order: "desc" })} />
        <Preset label="Rising Stars" onClick={() => setFilters({ ...filters, minCCU: 100, maxVisits: 2000000, sort: "playing", order: "desc" })} />
        <Preset label="High Ratio" onClick={() => setFilters({ ...filters, minCCU: 100, maxVisits: 5000000, sort: "ratio", order: "desc" })} />
        <Preset label="Newest" onClick={() => setFilters({ ...filters, minCCU: 100, maxVisits: 5000000, sort: "newest", order: "desc" })} />
        <label className="ml-auto inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!filters.hasDiscord}
            onChange={(e) => update({ hasDiscord: e.target.checked })}
            className="accent-orange-500"
          />
          <span>Discord only</span>
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilters({ q: "", minCCU: 100, maxCCU: 0, minVisits: 0, maxVisits: 5000000, genre: "", hasDiscord: false, sort: "ratio", order: "desc" })}
          className="text-slate-400 hover:text-orange-400"
        >Reset</Button>
      </div>
    </section>
  );
}

function Preset({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs border border-slate-700 bg-slate-900 hover:border-orange-500 hover:text-orange-300 text-slate-300 transition-colors"
    >{label}</button>
  );
}
