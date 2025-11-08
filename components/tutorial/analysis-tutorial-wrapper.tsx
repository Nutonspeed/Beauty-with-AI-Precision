'use client';

import { useEffect } from 'react';
import { TutorialOverlay } from '@/components/tutorial/tutorial-overlay';
import { TutorialButton } from '@/components/tutorial/tutorial-button';
import { getTutorialSteps } from '@/lib/tutorials/tutorial-steps';
import { useTutorial } from '@/hooks/use-tutorial';

export function AnalysisTutorialWrapper() {
  const { isActive, hasCompleted, startTutorial, completeTutorial, skipTutorial } =
    useTutorial('analysis');

  console.log('[AnalysisTutorialWrapper] State:', { isActive, hasCompleted });

  // Auto-start tutorial on first visit
  useEffect(() => {
    console.log('[AnalysisTutorialWrapper] useEffect triggered, hasCompleted:', hasCompleted);
    
    if (!hasCompleted) {
      // Start tutorial after 1 second delay
      const timer = setTimeout(() => {
        console.log('[AnalysisTutorialWrapper] Starting tutorial...');
        startTutorial();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasCompleted, startTutorial]);

  return (
    <>
      {/* Tutorial Button - always show in top right */}
      <div className="fixed top-20 right-4 z-50">
        <TutorialButton onClick={startTutorial} />
      </div>

      {/* Tutorial Overlay */}
      {isActive && (
        <TutorialOverlay
          steps={getTutorialSteps('analysis')}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}
    </>
  );
}
