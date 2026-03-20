import React, { useEffect, useState } from 'react';

interface CustomCursorProps {}

const CustomCursor: React.FC<CustomCursorProps> = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [role="button"], .cursor-pointer, [data-interactive]')) {
        setHovering(true);
      }
    };
    const out = () => setHovering(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mouseout', out);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mouseout', out);
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        {/* Crosshair lines */}
        <line x1="10" y1="2" x2="10" y2="7" stroke="hsl(79 100% 64%)" strokeWidth="1" />
        <line x1="10" y1="13" x2="10" y2="18" stroke="hsl(79 100% 64%)" strokeWidth="1" />
        <line x1="2" y1="10" x2="7" y2="10" stroke="hsl(79 100% 64%)" strokeWidth="1" />
        <line x1="13" y1="10" x2="18" y2="10" stroke="hsl(79 100% 64%)" strokeWidth="1" />
        {/* Center dot */}
        <circle cx="10" cy="10" r="1.5" fill="hsl(79 100% 64%)" />
        {/* Pulse ring on hover */}
        {hovering && (
          <circle
            cx="10" cy="10" r="8"
            stroke="hsl(79 100% 64%)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.5"
            className="animate-ping"
          />
        )}
      </svg>
    </div>
  );
};

export default CustomCursor;
