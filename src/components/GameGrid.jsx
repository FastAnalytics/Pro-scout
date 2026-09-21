import React from "react";
import GameCard from "./GameCard";
import { Skeleton } from "./ui/skeleton";

export default function GameGrid({ games, loading, devex, onSelect }) {
  if (loading) {
    return (
      <div id="games" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <Skeleton className="h-32 w-full bg-slate-800" />
            <Skeleton className="h-4 w-2/3 bg-slate-800" />
            <Skeleton className="h-3 w-1/2 bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }
  if (!games?.length) {
    return (
      <div className="text-center py-16 text-slate-400 border border-dashed border-slate-800 rounded-xl">
        <div className="text-lg text-slate-200 font-medium mb-1">No games match these filters</div>
        <div className="text-sm">Try widening the CCU or visits range, clearing the search, or resetting the filters.</div>
      </div>
    );
  }
  return (
    <div id="games" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {games.map((g) => (
        <GameCard key={g.universeId} game={g} devex={devex} onSelect={onSelect} />
      ))}
    </div>
  );
}
