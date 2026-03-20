import React from 'react';
import { ViewId } from '@/lib/types';
import { Home, Grid3X3, Microscope, Orbit, BarChart3 } from 'lucide-react';

interface HudNavProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

const NAV_ITEMS: { id: ViewId; icon: React.ElementType; label: string }[] = [
  { id: 'home', icon: Home, label: 'HOME' },
  { id: 'explore', icon: Grid3X3, label: 'EXPLORE' },
  { id: 'testroom', icon: Microscope, label: 'TEST ROOM' },
  { id: 'mindmap', icon: Orbit, label: 'MIND MAP' },
  { id: 'analysis', icon: BarChart3, label: 'ANALYSIS' },
];

const HudNav: React.FC<HudNavProps> = ({ activeView, onNavigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-12 border-b border-wen-neon/[0.15] bg-background/80 backdrop-blur-sm">
      {/* Left: brand */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 group cursor-pointer"
        data-interactive
      >
        <span className="font-mono text-wen-neon text-xs tracking-wider font-bold">
          ◈ WEN
        </span>
        <span className="font-mono text-muted-foreground text-[10px] tracking-widest">
          // 0.5B
        </span>
      </button>

      {/* Center: dotted line decoration */}
      <div className="flex-1 mx-8 border-b border-dotted border-muted-foreground/20 hidden md:block" />

      {/* Right: nav icons */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            data-interactive
            className={`relative p-2 rounded transition-colors duration-200 group cursor-pointer ${
              activeView === id
                ? 'text-wen-neon'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={label}
          >
            <Icon size={16} strokeWidth={activeView === id ? 2 : 1.5} />
            {activeView === id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-wen-neon" />
            )}
            {/* Tooltip */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-wen-surface rounded text-[9px] font-mono text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default HudNav;
