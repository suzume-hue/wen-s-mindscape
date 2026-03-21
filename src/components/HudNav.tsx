import React from 'react';
import { ViewId } from '@/lib/types';
import { Home, Grid3X3, Microscope, Orbit, BarChart3 } from 'lucide-react';

interface HudNavProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

const NAV_ITEMS: { id: ViewId; icon: React.ElementType; label: string; jp: string }[] = [
  { id: 'home', icon: Home, label: 'HOME', jp: '家' },
  { id: 'explore', icon: Grid3X3, label: 'EXPLORE', jp: '探索' },
  { id: 'testroom', icon: Microscope, label: 'TEST ROOM', jp: '試験室' },
  { id: 'mindmap', icon: Orbit, label: 'MIND MAP', jp: '星図' },
  { id: 'analysis', icon: BarChart3, label: 'ANALYSIS', jp: '分析' },
];

const HudNav: React.FC<HudNavProps> = ({ activeView, onNavigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-12 border-b border-foreground/10 bg-background/90 backdrop-blur-sm">
      {/* Left: brand */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 group cursor-pointer"
        data-interactive
      >
        <span className="font-mono text-primary text-xs tracking-wider font-bold">
          ◈ WEN
        </span>
        <span className="font-jp text-muted-foreground text-[10px]">
          紙神
        </span>
        <span className="font-mono text-muted-foreground text-[10px] tracking-widest">
          // 0.5B
        </span>
      </button>

      {/* Center: brush stroke decoration */}
      <div className="flex-1 mx-8 border-b border-dashed border-foreground/10 hidden md:block" />

      {/* Right: nav icons */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label, jp }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            data-interactive
            className={`relative p-2 rounded transition-colors duration-200 group cursor-pointer ${
              activeView === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={label}
          >
            <Icon size={16} strokeWidth={activeView === id ? 2 : 1.5} />
            {activeView === id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
            )}
            {/* Tooltip */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-card rounded text-[9px] font-mono text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-foreground/10">
              <span className="font-jp text-[8px] mr-1">{jp}</span>{label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default HudNav;
