import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { Home, LayoutGrid, Tag, Receipt, HelpCircle, MessageCircle, Activity } from "lucide-react";

const NavSection = ({ title, children }) => (
  <div className="px-4 mt-6 first:mt-2">
    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">{title}</div>
    <div className="space-y-0.5">{children}</div>
  </div>
);

const NavItem = ({ to, icon: Icon, children, external }) => {
  const cls = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
      isActive ? "text-orange-400" : "text-slate-300 hover:text-orange-300"
    }`;
  if (external) {
    return (
      <a href={external} target="_blank" rel="noreferrer" className={cls({ isActive: false })}>
        <Icon size={16} /> {children}
      </a>
    );
  }
  return <NavLink to={to} end className={cls}><Icon size={16} /> {children}</NavLink>;
};

const LOGO_URL = "/logo.png";

export default function SidebarLayout() {
  return (
    <div className="flex min-h-screen bg-black">
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-900 bg-black shrink-0">
        <div className="h-16 px-4 flex items-center gap-2 border-b border-slate-900">
          <img src={LOGO_URL} alt="Pain Interactive" className="w-9 h-9 rounded-md object-cover" />
          <div className="leading-tight"><div className="text-white text-sm font-semibold">Pain Interactive</div><div className="text-[10px] text-slate-500">v2.5 · Scout</div></div>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto scroll-thin">
          <NavSection title="Scout">
            <NavItem to="/" icon={Home}>Home</NavItem>
            <NavItem to="/" icon={LayoutGrid}>Browse Games</NavItem>
          </NavSection>
          <NavSection title="Insights">
            <NavItem to="/" icon={Tag}>Hidden Gems</NavItem>
            <NavItem to="/" icon={Activity}>Rising Stars</NavItem>
          </NavSection>
          <NavSection title="Resources">
            <NavItem to="/faq" icon={HelpCircle}>FAQ</NavItem>
            <NavItem to="/devex" icon={Receipt}>DevEx Info</NavItem>
          </NavSection>
          <NavSection title="Community">
            <NavItem external="https://discord.gg/37YZSUf489" icon={MessageCircle}>Discord</NavItem>
          </NavSection>
        </nav>
        <div className="p-4 border-t border-slate-900 text-[11px] text-slate-500 space-y-1">
          <div>Data via Roblox public API</div>
          <div className="text-slate-600">© pain interactive 2026</div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-slate-900 bg-black/90 backdrop-blur">
          <div className="h-full px-6 flex items-center justify-between">
            <Link to="/" className="md:hidden flex items-center gap-2">
              <img src={LOGO_URL} alt="Pain Interactive" className="w-7 h-7 rounded-md" />
              <span className="text-white font-semibold">Pain Interactive</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm text-slate-400">
              <Link to="/faq" className="px-3 py-2 hover:text-orange-400">FAQ</Link>
              <Link to="/devex" className="px-3 py-2 hover:text-orange-400">DevEx</Link>
            </nav>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs"><span className="text-slate-400">USD</span><span className="text-white">$0.0035/R$</span></div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" /> live</div>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
