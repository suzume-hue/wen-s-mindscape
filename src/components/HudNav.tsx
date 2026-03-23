import React from 'react';
import { ViewId } from '@/lib/types';
import { Home, Grid3X3, Orbit, BarChart3 } from 'lucide-react';
import { SECTION_HEADERS } from '@/lib/constants';

interface HudNavProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

const NAV_ITEMS: { id: ViewId; icon: React.ElementType; label: string; jp: string }[] = [
  { id: 'home', icon: Home, label: SECTION_HEADERS.home.en, jp: SECTION_HEADERS.home.jp },
  { id: 'explore', icon: Grid3X3, label: SECTION_HEADERS.explore.en, jp: SECTION_HEADERS.explore.jp },
  { id: 'mindmap', icon: Orbit, label: SECTION_HEADERS.mindmap.en, jp: SECTION_HEADERS.mindmap.jp },
  { id: 'analysis', icon: BarChart3, label: SECTION_HEADERS.analysis.en, jp: SECTION_HEADERS.analysis.jp },
];

const HudNav: React.FC<HudNavProps> = ({ activeView, onNavigate }) => {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-12"
      style={{
        backgroundColor: '#EDE7D9',
        borderBottom: '1px solid rgba(80,60,40,0.15)',
      }}
    >
      {/* Left: brand */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 group cursor-pointer"
        data-interactive
      >
        <span className="font-mono text-[13px] tracking-wider font-bold" style={{ color: '#2C2C2A' }}>
          ◈ WEN
        </span>
        <span className="font-jp text-[11px]" style={{ color: '#B8710A' }}>
          紙神
        </span>
        <span className="font-mono text-[10px] tracking-widest block" style={{ color: '#6B6860' }}>
          // 0.5B
        </span>
      </button>

      {/* Center: brush stroke decoration */}
      <div className="flex-1 mx-8 hidden md:block" style={{ borderBottom: '1px dashed rgba(80,60,40,0.10)' }} />

      {/* Right: nav icons */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(({ id, icon: Icon, label, jp }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            data-interactive
            className="relative p-2 rounded transition-colors duration-200 group cursor-pointer"
            style={{
              color: activeView === id ? '#7A9E3F' : '#6B6860',
            }}
            title={label}
          >
            <Icon size={16} strokeWidth={activeView === id ? 2 : 1.5} />
            {activeView === id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ backgroundColor: '#7A9E3F' }} />
            )}
            {/* Tooltip — bilingual */}
            <span
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 flex flex-col items-center"
              style={{
                backgroundColor: '#EDE7D9',
                border: '1px solid rgba(80,60,40,0.15)',
                boxShadow: '0 2px 8px rgba(44,44,42,0.12)',
              }}
            >
              <span className="font-jp text-[10px]" style={{ color: '#6B6860' }}>{jp}</span>
              <span className="font-mono text-[12px]" style={{ color: '#2C2C2A' }}>{label}</span>
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default HudNav;
