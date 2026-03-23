import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import WenCharacter from '@/components/WenCharacter';
import TestRoomView from '@/components/views/TestRoomView';
import {
  CATEGORY_ORDER,
  CATEGORY_CSS_CLASSES,
  CATEGORY_BG_CLASSES,
  CATEGORY_COLORS,
  formatDimName,
  getScoreColor,
  SORT_LABELS,
  ALL_DIMS_ORDER,
} from '@/lib/constants';
import { loadVizData } from '@/lib/dataLoader';
import { Category, DimScore, VizData } from '@/lib/types';

type SortMode = 'category' | 'score_asc' | 'score_desc' | 'volatility';

interface ExploreViewProps {
  onSelectDimension: (dim: string) => void;
  selectedDimension?: string | null;
  onBackFromDetail?: () => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({ onSelectDimension, selectedDimension, onBackFromDetail }) => {
  const [sort, setSort] = useState<SortMode>('category');
  const [vizData, setVizData] = useState<VizData | null>(null);

  useEffect(() => {
    loadVizData().then(setVizData);
  }, []);

  // If a dimension is selected, show the TestRoomView inline
  if (selectedDimension) {
    return (
      <TestRoomView
        dimension={selectedDimension}
        onBack={() => onBackFromDetail?.()}
      />
    );
  }

  const dimScores = vizData?.dim_scores ?? {};

  // Use ALL_DIMS_ORDER for category sorting to maintain correct sequence
  const sortedDims = useMemo(() => {
    const entries = Object.entries(dimScores);
    switch (sort) {
      case 'score_asc':
        return [...entries].sort((a, b) => a[1].score - b[1].score);
      case 'score_desc':
        return [...entries].sort((a, b) => b[1].score - a[1].score);
      case 'volatility':
        return [...entries].sort((a, b) => b[1].std - a[1].std);
      case 'category':
      default: {
        // Use ALL_DIMS_ORDER for canonical ordering
        const orderMap = Object.fromEntries(ALL_DIMS_ORDER.map((d, i) => [d, i]));
        return [...entries].sort((a, b) => (orderMap[a[0]] ?? 99) - (orderMap[b[0]] ?? 99));
      }
    }
  }, [dimScores, sort]);

  const grouped = useMemo(() => {
    if (sort !== 'category') return null;
    const groups: { cat: Category; dims: [string, DimScore][] }[] = [];
    let currentCat: Category | null = null;
    for (const entry of sortedDims as [string, DimScore][]) {
      if (entry[1].category !== currentCat) {
        currentCat = entry[1].category;
        groups.push({ cat: currentCat, dims: [] });
      }
      groups[groups.length - 1].dims.push(entry);
    }
    return groups;
  }, [sort, sortedDims]);

  const SORTS: { mode: SortMode; jp: string; en: string }[] = [
    { mode: 'category', ...SORT_LABELS.category },
    { mode: 'score_desc', ...SORT_LABELS.score_desc },
    { mode: 'score_asc', ...SORT_LABELS.score_asc },
    { mode: 'volatility', ...SORT_LABELS.volatility },
  ];

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="font-mono text-[12px] tracking-widest" style={{ color: '#6B6860' }}>
          <span className="font-jp text-[11px]" style={{ color: '#6B6860' }}>探索</span>
          <span className="ml-2" style={{ color: '#2C2C2A' }}>EXPLORE</span>
          <span className="ml-2">// {sortedDims.length || 32} DIMENSIONS</span>
        </div>
        <div className="hidden lg:block">
          <WenCharacter size={60} expression="curious" activeCategory="personality" />
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {SORTS.map(s => (
          <button
            key={s.mode}
            data-interactive
            onClick={() => setSort(s.mode)}
            className="font-mono text-[11px] px-3 py-1.5 rounded cursor-pointer transition-all"
            style={{
              border: sort === s.mode ? '1px solid rgba(122,158,63,0.4)' : '1px solid rgba(80,60,40,0.10)',
              backgroundColor: sort === s.mode ? 'rgba(122,158,63,0.1)' : 'transparent',
              color: sort === s.mode ? '#7A9E3F' : '#6B6860',
            }}
          >
            <span className="font-jp text-[9px] mr-1">{s.jp}</span> / {s.en}
          </button>
        ))}
      </div>

      <LayoutGroup>
        {sort === 'category' && grouped ? (
          grouped.map(group => (
            <div key={group.cat} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[group.cat] }} />
                <span className={`font-mono text-[11px] tracking-[0.2em] ${CATEGORY_CSS_CLASSES[group.cat]}`}>
                  ◆ {group.cat.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.dims.map(([dim, data]) => (
                  <DimCard key={dim} dim={dim} data={data} onClick={() => onSelectDimension(dim)} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedDims.map(([dim, data]) => (
              <DimCard key={dim} dim={dim} data={data} onClick={() => onSelectDimension(dim)} />
            ))}
          </div>
        )}
      </LayoutGroup>
    </div>
  );
};

const DimCard: React.FC<{
  dim: string;
  data: DimScore;
  onClick: () => void;
}> = ({ dim, data, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const maxStd = 0.4;
  const fuzzyWidth = Math.max(4, (data.std / maxStd) * 16);
  const scoreColor = getScoreColor(data.score);

  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      data-interactive
      className="paper-card rounded p-4 cursor-pointer transition-all duration-200 hover:-translate-y-[3px] group relative overflow-hidden"
      style={{
        borderColor: hovered ? `rgba(80,60,40,0.22)` : undefined,
        boxShadow: hovered ? '0 4px 12px rgba(44,44,42,0.12)' : undefined,
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${CATEGORY_BG_CLASSES[data.category]}`} />
          <span className="font-display text-[14px] font-semibold leading-tight" style={{ color: '#2C2C2A' }}>
            {formatDimName(dim)}
          </span>
        </div>

        {/* Score chip */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-mono text-[11px] px-2 py-0.5 rounded tabular-nums font-semibold"
            style={{ backgroundColor: scoreColor, color: '#2C2C2A' }}
          >
            {data.score.toFixed(3)}
          </span>
        </div>

        <div className="h-1.5 rounded-full overflow-hidden mb-2 relative" style={{ backgroundColor: 'rgba(80,60,40,0.06)' }}>
          <div
            className="h-full rounded-full relative"
            style={{ width: `${data.score * 100}%`, backgroundColor: scoreColor }}
          >
            <div
              className="absolute right-0 top-0 bottom-0"
              style={{ width: `${fuzzyWidth}px`, background: `linear-gradient(to right, ${scoreColor}, transparent)` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tabular-nums" style={{ color: '#6B6860' }}>
            ±{data.std.toFixed(3)}
          </span>
          <span className="font-mono text-[10px]" style={{ color: '#6B6860' }}>
            25 tests · 3 runs
          </span>
        </div>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] z-10"
            style={{ color: '#7A9E3F' }}
          >
            <span className="font-jp text-[9px]">入室</span> →
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExploreView;
