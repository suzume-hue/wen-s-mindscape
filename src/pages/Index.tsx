import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HudNav from '@/components/HudNav';
import CustomCursor from '@/components/CustomCursor';
import HomeView from '@/components/views/HomeView';
import ExploreView from '@/components/views/ExploreView';
import MindMapView from '@/components/views/MindMapView';
import AnalysisView from '@/components/views/AnalysisView';
import { ViewId } from '@/lib/types';

const Index = () => {
  const [activeView, setActiveView] = useState<ViewId>('home');
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  const handleNavigate = useCallback((view: ViewId) => {
    setActiveView(view);
    setSelectedDimension(null);
  }, []);

  const handleSelectDimension = useCallback((dim: string) => {
    setSelectedDimension(dim);
    setActiveView('explore');
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setSelectedDimension(null);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground cursor-none">
      <CustomCursor />
      <HudNav activeView={activeView} onNavigate={handleNavigate} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView + (selectedDimension || '')}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {activeView === 'home' && <HomeView />}
          {activeView === 'explore' && (
            <ExploreView
              onSelectDimension={handleSelectDimension}
              selectedDimension={selectedDimension}
              onBackFromDetail={handleBackFromDetail}
            />
          )}
          {activeView === 'mindmap' && <MindMapView onSelectDimension={handleSelectDimension} />}
          {activeView === 'analysis' && <AnalysisView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
