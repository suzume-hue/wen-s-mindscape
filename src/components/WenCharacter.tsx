import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Category, WenExpression } from '@/lib/types';
import { CATEGORY_COLORS } from '@/lib/constants';

interface WenCharacterProps {
  expression?: WenExpression;
  activeCategory?: Category;
  size?: number;
  className?: string;
}

const EXPRESSION_CONFIG: Record<WenExpression, {
  eyeRx: number; eyeRy: number; pupilR: number; pupilOffY: number;
  pupilRightDiff: number; mouthD: string; blushOpacity: number;
  browD?: string; showSweat?: boolean; showGlitch?: boolean;
  eyesClosed?: boolean; mouthAnim?: boolean;
}> = {
  idle: {
    eyeRx: 7.5, eyeRy: 8, pupilR: 4.5, pupilOffY: 1, pupilRightDiff: 0,
    mouthD: "M63 92 Q70 90 77 92", blushOpacity: 0.4,
  },
  curious: {
    eyeRx: 8.5, eyeRy: 9, pupilR: 5, pupilOffY: 0, pupilRightDiff: 0,
    mouthD: "M65 91 Q70 89 75 91", blushOpacity: 0.3,
  },
  speaking: {
    eyeRx: 6.5, eyeRy: 7, pupilR: 4, pupilOffY: 1, pupilRightDiff: 0,
    mouthD: "M63 91 Q70 96 77 91", blushOpacity: 0.3, mouthAnim: true,
  },
  confused: {
    eyeRx: 6, eyeRy: 6.5, pupilR: 3.5, pupilOffY: 0, pupilRightDiff: 0,
    mouthD: "M61 93 Q65 91 70 93 Q75 95 79 93", blushOpacity: 0.2,
    browD: "M49 66 Q57 63 65 67", showSweat: true,
  },
  glitching: {
    eyeRx: 7.5, eyeRy: 8, pupilR: 4.5, pupilOffY: 1, pupilRightDiff: 2,
    mouthD: "M61 93 Q65 91 70 93 Q75 95 79 93", blushOpacity: 0.1,
    showGlitch: true,
  },
  bright: {
    eyeRx: 9, eyeRy: 10, pupilR: 5.5, pupilOffY: 0, pupilRightDiff: 0,
    mouthD: "M60 91 Q70 98 80 91", blushOpacity: 0.6,
  },
  shy: {
    eyeRx: 6, eyeRy: 7, pupilR: 4, pupilOffY: 2, pupilRightDiff: 0,
    mouthD: "M64 92 Q70 90 76 92", blushOpacity: 0.5,
  },
};

const WenCharacter: React.FC<WenCharacterProps> = ({
  expression = 'idle',
  activeCategory = 'personality',
  size = 180,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [glitchFrame, setGlitchFrame] = useState(false);

  // Mouse tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / window.innerWidth * 12;
      const dy = (e.clientY - cy) / window.innerHeight * 12;
      const clampedX = Math.max(-6, Math.min(6, dx));
      const clampedY = Math.max(-4, Math.min(4, dy));
      setMouseOffset({ x: clampedX, y: clampedY });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Glitch flicker
  useEffect(() => {
    if (expression !== 'glitching') return;
    const interval = setInterval(() => {
      setGlitchFrame(prev => !prev);
    }, 150);
    return () => clearInterval(interval);
  }, [expression]);

  const config = EXPRESSION_CONFIG[expression];
  const catColor = CATEGORY_COLORS[activeCategory];
  const scale = size / 180;

  const orbColors = useMemo(() => {
    const cats: Category[] = ['personality', 'values', 'cultural', 'behavioral', 'capability'];
    return cats.map(c => CATEGORY_COLORS[c]);
  }, []);

  const eyeOffX = mouseOffset.x;
  const eyeOffY = mouseOffset.y;

  return (
    <div className={`relative animate-float ${className}`} style={{ width: size, height: size }}>
      {/* Orbiting data orbs */}
      {orbColors.map((color, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: 8 * scale,
            height: 8 * scale,
            backgroundColor: color,
            opacity: 0.7,
            animation: `orbit ${8 + i * 2.5}s linear infinite`,
            '--orbit-radius': `${(50 + i * 10) * scale}px`,
            animationDelay: `${i * -1.5}s`,
            marginLeft: -4 * scale,
            marginTop: -4 * scale,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 ${6 * scale}px ${color}`,
          } as React.CSSProperties}
        />
      ))}

      <svg
        ref={svgRef}
        viewBox="0 0 140 180"
        width={size}
        height={size}
        className="relative z-10"
      >
        {/* Aura glow */}
        <ellipse
          cx="70" cy="155" rx="44" ry="12"
          fill={catColor}
          opacity={0.4}
          className="animate-breathe"
          style={{ transformOrigin: '70px 155px' }}
        />

        {/* Body */}
        <rect x="38" y="108" width="64" height="58" rx="20" fill="#D8CCF0" />
        <ellipse cx="70" cy="112" rx="14" ry="7" fill="#EEEAF8" />
        <rect x="55" y="118" width="30" height="40" rx="8" fill="#C8BCE8" opacity="0.6" />
        <rect x="84" y="115" width="12" height="8" rx="2" fill="hsl(79 100% 64%)" opacity="0.8" />

        {/* Hair back */}
        <ellipse cx="70" cy="60" rx="36" ry="30" fill="#DDDAF0" />
        <ellipse cx="36" cy="72" rx="10" ry="22" fill="#DDDAF0" transform="rotate(-12 36 72)" />
        <ellipse cx="104" cy="72" rx="10" ry="22" fill="#DDDAF0" transform="rotate(12 104 72)" />
        <ellipse cx="32" cy="88" rx="7" ry="9" fill="#F0C878" transform="rotate(-15 32 88)" />
        <ellipse cx="108" cy="88" rx="7" ry="9" fill="#F0C878" transform="rotate(15 108 88)" />
        <ellipse cx="70" cy="36" rx="5" ry="10" fill="#DDDAF0" transform="rotate(-8 70 36)" />

        {/* Face */}
        <ellipse cx="70" cy="72" rx="34" ry="36" fill="#F2EBF8" />

        {/* Blush */}
        <ellipse cx="50" cy="84" rx="10" ry="5" fill="#FFB8D0" opacity={config.blushOpacity} />
        <ellipse cx="90" cy="84" rx="10" ry="5" fill="#FFB8D0" opacity={config.blushOpacity} />

        {/* Nose */}
        <ellipse cx="70" cy="86" rx="2" ry="1.5" fill="#D4A0B0" opacity="0.6" />

        {/* Eyebrows (if confused) */}
        {config.browD && (
          <>
            <path d={config.browD} stroke="#3A1A00" strokeWidth="1.5" fill="none" />
            <path d={config.browD.replace(/49|57|65/g, m => ({ '49': '75', '57': '83', '65': '91' }[m] || m))} stroke="#3A1A00" strokeWidth="1.5" fill="none" />
          </>
        )}

        {/* Left eye */}
        <g transform={`translate(${eyeOffX} ${eyeOffY})`} style={{ transition: 'transform 0.15s ease-out' }}>
          <ellipse cx="57" cy="74" rx="10" ry="11" fill="white" />
          <ellipse cx="57" cy="75" rx={config.eyeRx} ry={config.eyeRy} fill="#E8A030" />
          <ellipse cx="57" cy="76" rx={config.pupilR} ry={config.pupilR + 0.5} fill="#3A1A00" />
          <circle cx="59.5" cy="72" r="2.5" fill="white" opacity="0.95" />
          <circle cx="54" cy="78" r="1" fill="white" opacity="0.5" />
          <path d="M48 68 Q57 64 66 68" stroke="#3A1A00" strokeWidth="1.2" fill="none" />
        </g>

        {/* Right eye */}
        <g transform={`translate(${eyeOffX} ${eyeOffY})`} style={{ transition: 'transform 0.15s ease-out' }}>
          <ellipse cx="83" cy="74" rx="10" ry="11" fill="white" />
          <ellipse cx="83" cy="75" rx={config.eyeRx} ry={config.eyeRy} fill="#E8A030" />
          <ellipse cx="83" cy="76" rx={config.pupilR + config.pupilRightDiff} ry={config.pupilR + 0.5 + config.pupilRightDiff} fill="#3A1A00" />
          <circle cx="85.5" cy="72" r="2.5" fill="white" opacity="0.95" />
          <circle cx="80" cy="78" r="1" fill="white" opacity="0.5" />
          <path d="M74 68 Q83 64 92 68" stroke="#3A1A00" strokeWidth="1.2" fill="none" />
        </g>

        {/* Sweat drop (confused) */}
        {config.showSweat && (
          <ellipse cx="100" cy="64" rx="3" ry="5" fill="#A0D4FF" opacity="0.6" />
        )}

        {/* Mouth */}
        <path
          d={config.mouthD}
          stroke="#3A1A00"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          style={{ transition: 'd 0.3s ease-in-out' }}
        />

        {/* Glitch scan lines */}
        {config.showGlitch && glitchFrame && (
          <>
            <rect x="36" y="68" width="68" height="2" fill="hsl(79 100% 64%)" opacity="0.3" />
            <rect x="36" y="80" width="68" height="1.5" fill="hsl(var(--wen-danger))" opacity="0.25" />
            <rect x="36" y="90" width="68" height="2" fill="hsl(79 100% 64%)" opacity="0.2" />
          </>
        )}
      </svg>

      {/* Periodic scan line */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none z-20"
        style={{ opacity: 0.15 }}
      >
        <div
          className="absolute left-0 right-0 h-[2px] bg-wen-neon"
          style={{
            animation: 'scanline 12s linear infinite',
            animationDelay: '5s',
          }}
        />
      </div>
    </div>
  );
};

export default WenCharacter;
