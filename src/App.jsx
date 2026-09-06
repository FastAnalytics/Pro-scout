import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import GameDetail from "./pages/GameDetail";
import FAQ from "./pages/FAQ";
import DevEx from "./pages/DevEx";
import SidebarLayout from "./components/SidebarLayout";
import { Toaster } from "./components/ui/toaster";

function App() {
  useEffect(() => { document.title = "Pain Scout Pro — Roblox Opportunity Finder"; }, []);
  return (
    <div className="App min-h-screen bg-black text-slate-100">
      <BrowserRouter>
        <Routes>
          <Route element={<SidebarLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/devex" element={<DevEx />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}
export default App;
