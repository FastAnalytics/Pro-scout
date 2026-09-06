import React, { useEffect, useMemo, useState } from "react";
import { api, formatNumber } from "../lib/api";
import StatsBar from "../components/StatsBar";
import FiltersPanel from "../components/FiltersPanel";
import GameGrid from "../components/GameGrid";
import ProposalDialog from "../components/ProposalDialog";
import { useToast } from "../hooks/use-toast";

const DEFAULT_FILTERS = {
  q: "",
  minCCU: 100,
  maxCCU: 0,
  minVisits: 0,
  maxVisits: 5000000,
  genre: "",
  hasDiscord: false,
  sort: "ratio",
  order: "desc",
};

export default function Dashboard() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [games, setGames] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [genres, setGenres] = useState([]);
  const [devex, setDevex] = useState({ usdPerRobux: 0.0035 });
  const [selected, setSelected] = useState(null);
  const { toast } = useToast();

  const load = async (f = filters, p = page) => {
    setLoading(true);
    try {
      const res = await api.games({ ...f, page: p, pageSize });
      setGames(res.items || []);
      setTotal(res.total || 0);
    } catch (e) {
      toast({ title: "Load error", description: String(e.message || e) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [s, g, dx] = await Promise.all([api.stats(), api.genres(), api.devex()]);
        setStats(s);
        setGenres(g.genres || []);
        setDevex(dx);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    load(filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  // refresh stats every 30s so live CCU counters feel live
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const s = await api.stats();
        setStats(s);
      } catch (e) {}
    }, 30_000);
    return () => clearInterval(t);
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="grain relative z-0">
      <main className="max-w-[1400px] mx-auto px-6 pt-8 pb-24 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Roblox <span className="text-orange-400">Opportunity</span> Scout
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            Surface under-served Roblox games with unusually high CCU-to-visits ratios. Every game shown here has under 5M lifetime visits — the sweet spot for a clone or spiritual successor.
          </p>
        </div>

        <StatsBar stats={stats} />

        <FiltersPanel
          filters={filters}
          setFilters={(f) => { setFilters(f); setPage(1); }}
          genres={genres}
          total={total}
        />

        <GameGrid
          games={games}
          loading={loading}
          devex={devex}
          onSelect={setSelected}
        />

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between text-sm text-slate-400">
            <span>Showing page {page} of {totalPages} ({formatNumber(total)} games)</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800"
              >Previous</button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-400 text-black font-medium disabled:opacity-40"
              >Next</button>
            </div>
          </div>
        )}
      </main>

      <ProposalDialog game={selected} onClose={() => setSelected(null)} devex={devex} />
    </div>
  );
}
