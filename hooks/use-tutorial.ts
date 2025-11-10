'use client';

import { useState, useEffect } from 'react';
import { TutorialType } from '@/lib/tutorials/tutorial-steps';

const STORAGE_KEY_PREFIX = 'tutorial_completed_';

export function useTutorial(tutorialType: TutorialType) {
  const [isActive, setIsActive] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Check if tutorial has been completed before
    const completed = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tutorialType}`) === 'true';
    console.log('[useTutorial] Checking completion:', { tutorialType, completed, key: `${STORAGE_KEY_PREFIX}${tutorialType}` });
    setHasCompleted(completed);
  }, [tutorialType]);

  const startTutorial = () => {
    console.log('[useTutorial] Starting tutorial:', tutorialType);
    setIsActive(true);
  };

  const completeTutorial = () => {
    console.log('[useTutorial] Completing tutorial:', tutorialType);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${tutorialType}`, 'true');
    setHasCompleted(true);
    setIsActive(false);
  };

  const skipTutorial = () => {
    console.log('[useTutorial] Skipping tutorial:', tutorialType);
    // Mark as completed when skipped to prevent auto-restart
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${tutorialType}`, 'true');
    setHasCompleted(true);
    setIsActive(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${tutorialType}`);
    setHasCompleted(false);
  };

  return {
    isActive,
    hasCompleted,
    startTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
}
