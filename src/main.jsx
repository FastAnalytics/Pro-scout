import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_BASE44_APP_BASE_URL;

export default function App() {
  const [games, setGames] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API}/api/catalog`);
      const data = await res.json();

      setGames(data.games);
      setMeta(data.meta);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div>Loading catalog…</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Game Catalog</h1>

      <p>Total games: {meta.total}</p>

      <div style={{ marginTop: "20px" }}>
        {games.map((game) => (
          <div key={game.id} style={{ marginBottom: "10px" }}>
            <strong>{game.name}</strong>
            <div>CCU: {game.playing}</div>
            <div>Visits: {game.visits}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
