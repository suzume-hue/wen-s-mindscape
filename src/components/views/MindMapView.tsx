import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import WenCharacter from '@/components/WenCharacter';
import {
  CATEGORY_COLORS,
  formatDimName,
  ALL_DIMS_ORDER,
} from '@/lib/constants';
import { loadVizData } from '@/lib/dataLoader';
import { Category, DimScore, VizData } from '@/lib/types';

interface MindMapViewProps {
  onSelectDimension: (dim: string) => void;
}

const CATEGORY_ANGLES: Record<Category, [number, number]> = {
  capability:  [210, 290],
  behavioral:  [290, 340],
  values:      [340, 410],
  cultural:    [50, 150],
  personality: [150, 210],
};

const MindMapView: React.FC<MindMapViewProps> = ({ onSelectDimension }) => {
  const [vizData, setVizData] = useState<VizData | null>(null);
  const [hoveredDim, setHoveredDim] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadVizData().then(setVizData);
  }, []);

  const dimScores = vizData?.dim_scores ?? {};

  const stars = useMemo(() => {
    // Use ALL_DIMS_ORDER for consistent angular placement
    const byCategory: Record<Category, string[]> = {
      capability: [], behavioral: [], values: [], cultural: [], personality: [],
    };
    ALL_DIMS_ORDER.forEach(dim => {
      if (dimScores[dim]) byCategory[dimScores[dim].category].push(dim);
    });

    return ALL_DIMS_ORDER.filter(dim => dim in dimScores).map(dim => {
      const data = dimScores[dim];
      const catDims = byCategory[data.category];
      const idx = catDims.indexOf(dim);
      const [startAngle, endAngle] = CATEGORY_ANGLES[data.category];
      const angleSpan = endAngle - startAngle;
      const angle = startAngle + (angleSpan / (catDims.length + 1)) * (idx + 1);
      const radius = 80 + (1 - data.score) * 220;
      const size = 6 + data.score * 10;
      const rad = (angle * Math.PI) / 180;

      return {
        dim,
        data,
        x: Math.cos(rad) * radius,
        y: Math.sin(rad) * radius,
        size,
        angle,
        radius,
        color: CATEGORY_COLORS[data.category],
        shimmerSpeed: data.std === 0 ? 0 : 1 + (1 - data.std) * 3,
      };
    });
  }, [dimScores]);

  const hoveredStar = stars.find(s => s.dim === hoveredDim);

  return (
    <div className="min-h-screen pt-16 pb-12 flex items-center justify-center relative overflow-hidden" ref={containerRef}>
      {/* Paper texture dots */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: '#2C2C2A',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.06 + Math.random() * 0.08,
              width: Math.random() > 0.8 ? 2 : 1,
              height: Math.random() > 0.8 ? 2 : 1,
            }}
          />
        ))}
      </div>

      <div className="relative" style={{ width: 700, height: 700 }}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <WenCharacter
            size={100}
            expression={hoveredDim ? 'curious' : 'idle'}
            activeCategory={hoveredStar?.data.category || 'personality'}
          />
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ border: '1px solid rgba(80,60,40,0.06)' }} />

        {hoveredStar && (
          <svg className="absolute inset-0 pointer-events-none z-5" width="700" height="700">
            <line
              x1="350" y1="350"
              x2={350 + hoveredStar.x}
              y2={350 + hoveredStar.y}
              stroke={hoveredStar.color}
              strokeWidth="0.5"
              opacity="0.4"
              strokeDasharray="4 4"
            />
          </svg>
        )}

        {stars.map(star => {
          const isHovered = hoveredDim === star.dim;
          return (
            <motion.div
              key={star.dim}
              className="absolute cursor-pointer z-20 group"
              data-interactive
              style={{
                left: 350 + star.x - star.size / 2,
                top: 350 + star.y - star.size / 2,
                // Ensure 20×20px minimum hover target
                minWidth: 20,
                minHeight: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={() => setHoveredDim(star.dim)}
              onMouseLeave={() => setHoveredDim(null)}
              onClick={() => onSelectDimension(star.dim)}
              whileHover={{ scale: 1.4 }}
            >
              <div
                className="rounded-full"
                style={{
                  width: star.size,
                  height: star.size,
                  backgroundColor: star.color,
                  opacity: isHovered ? 1 : 0.7,
                  outline: '1px solid rgba(44,44,42,0.3)',
                  boxShadow: isHovered ? `0 2px 8px rgba(44,44,42,0.25)` : `0 0 4px ${star.color}40`,
                  animation: star.shimmerSpeed > 0
                    ? `pulse ${star.shimmerSpeed}s ease-in-out infinite`
                    : 'none',
                  transition: 'opacity 0.2s, box-shadow 0.2s',
                }}
              />
              {/* Tooltip on hover only — no static labels */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 font-mono text-[12px] whitespace-nowrap px-3 py-2 rounded z-50"
                  style={{
                    backgroundColor: '#EDE7D9',
                    color: '#2C2C2A',
                    border: '1px solid rgba(80,60,40,0.15)',
                    boxShadow: '0 2px 8px rgba(44,44,42,0.12)',
                    minWidth: 160,
                    maxWidth: 320,
                  }}
                >
                  <div className="font-semibold">{formatDimName(star.dim)}</div>
                  <div style={{ color: '#5C7A5E' }}>{star.data.score.toFixed(3)} ± {(star.data.std ?? 0).toFixed(3)}</div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="lg:hidden absolute bottom-4 left-4 right-4 text-center font-mono text-[12px]" style={{ color: '#6B6860' }}>
        <span className="font-jp text-[10px]">デスクトップで完全な星座ビューをご覧ください</span>
        <span className="block text-[10px]">View full constellation on desktop</span>
      </div>
    </div>
  );
};

export default MindMapView;
