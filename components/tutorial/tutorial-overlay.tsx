'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TutorialStep } from '@/lib/tutorials/tutorial-steps';

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({ steps, onComplete, onSkip }: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    // Update highlight position when step changes
    if (currentStep.element === 'body') {
      setHighlightRect(null);
      return;
    }

    // Add delay to ensure element is rendered
    const updateHighlight = () => {
      const element = document.querySelector(currentStep.element);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        console.log('[Tutorial] Highlighting element:', currentStep.element, rect);
        setHighlightRect(rect);

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Silently skip if element not found (it might not be rendered yet)
        setHighlightRect(null);
      }
    };

    // Retry with increasing delays to handle slow rendering
    const timers: NodeJS.Timeout[] = [];
    [100, 300, 500, 1000].forEach(delay => {
      timers.push(setTimeout(updateHighlight, delay));
    });
    
    // Also update on window resize
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    return () => {
      timers.forEach(t => clearTimeout(t));
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const getTooltipPosition = () => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth < 768;

    // Mobile: Always use bottom fixed position for better UX
    if (isMobile || !highlightRect) {
      return {
        position: 'fixed' as const,
        bottom: '0',
        left: '0',
        right: '0',
        transform: 'none',
        maxWidth: '100%',
      };
    }

    // Desktop: Smart positioning
    const tooltipOffset = 20;
    let position = currentStep.position;
    
    // Check if tooltip would go off-screen
    if (position === 'bottom' && highlightRect.bottom + 300 > viewportHeight) {
      position = 'top';
    }
    if (position === 'top' && highlightRect.top - 300 < 0) {
      position = 'bottom';
    }
    if (position === 'right' && highlightRect.right + 400 > viewportWidth) {
      position = 'left';
    }
    if (position === 'left' && highlightRect.left - 400 < 0) {
      position = 'right';
    }

    switch (position) {
      case 'top':
        return {
          position: 'absolute' as const,
          top: `${Math.max(20, highlightRect.top - tooltipOffset)}px`,
          left: `${highlightRect.left + highlightRect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
          maxWidth: '400px',
        };
      case 'right':
        return {
          position: 'absolute' as const,
          top: `${highlightRect.top + highlightRect.height / 2}px`,
          left: `${highlightRect.right + tooltipOffset}px`,
          transform: 'translateY(-50%)',
          maxWidth: '400px',
        };
      case 'bottom':
        return {
          position: 'absolute' as const,
          top: `${Math.min(viewportHeight - 20, highlightRect.bottom + tooltipOffset)}px`,
          left: `${highlightRect.left + highlightRect.width / 2}px`,
          transform: 'translateX(-50%)',
          maxWidth: '400px',
        };
      case 'left':
        return {
          position: 'absolute' as const,
          top: `${highlightRect.top + highlightRect.height / 2}px`,
          left: `${highlightRect.left - tooltipOffset}px`,
          transform: 'translate(-100%, -50%)',
          maxWidth: '400px',
        };
      default:
        return {
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '400px',
        };
    }
  };

  // Calculate spotlight position and size
  const getSpotlightStyle = () => {
    if (!highlightRect) {
      return { background: 'rgba(0, 0, 0, 0.75)' };
    }

    const centerX = highlightRect.left + highlightRect.width / 2;
    const centerY = highlightRect.top + highlightRect.height / 2;
    const padding = currentStep.highlightPadding || 8;
    
    // Use ellipse to better fit rectangular elements
    const radiusX = highlightRect.width / 2 + padding;
    const radiusY = highlightRect.height / 2 + padding;

    console.log('[Tutorial] Spotlight:', { centerX, centerY, radiusX, radiusY, rect: highlightRect });

    return {
      background: `radial-gradient(ellipse ${radiusX + 100}px ${radiusY + 100}px at ${centerX}px ${centerY}px, 
        transparent 0%, 
        transparent ${Math.min(radiusX, radiusY)}px, 
        rgba(0, 0, 0, 0.75) ${Math.max(radiusX, radiusY) + 150}px)`
    };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Dark overlay with spotlight effect - Click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-auto cursor-pointer"
          style={getSpotlightStyle()}
          onClick={onSkip}
          aria-label="คลิกเพื่อปิดคำแนะนำ"
        />

        {/* Highlight border with pulse animation */}
        {highlightRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: [
                '0 0 0 4px rgba(59, 130, 246, 0.5)',
                '0 0 0 8px rgba(59, 130, 246, 0.3)',
                '0 0 0 4px rgba(59, 130, 246, 0.5)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            className="absolute border-2 border-primary/80 rounded-lg pointer-events-none shadow-lg"
            style={{
              top: `${highlightRect.top - (currentStep.highlightPadding || 8)}px`,
              left: `${highlightRect.left - (currentStep.highlightPadding || 8)}px`,
              width: `${highlightRect.width + (currentStep.highlightPadding || 8) * 2}px`,
              height: `${highlightRect.height + (currentStep.highlightPadding || 8) * 2}px`,
              zIndex: 10000,
            }}
          />
        )}

        {/* Tooltip - Responsive */}
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="pointer-events-auto md:max-w-md w-full max-h-[90vh] md:max-h-[600px] overflow-y-auto"
          style={{
            ...getTooltipPosition(),
            zIndex: 10001,
          }}
        >
          <div className="bg-white dark:bg-slate-800 md:rounded-lg rounded-t-2xl shadow-2xl border-t-4 md:border-2 border-blue-500 dark:border-blue-400 p-3 md:p-5 backdrop-blur-sm min-h-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white bg-blue-600 dark:bg-blue-500 px-2 py-0.5 rounded shadow-md">
                    {currentStepIndex + 1}/{steps.length}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1 drop-shadow-sm line-clamp-2">
                  {currentStep.title}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSkip}
                className="h-9 w-9 -mt-1 -mr-1 shrink-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 touch-manipulation"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-800 dark:text-gray-100 mb-3 md:mb-4 leading-snug md:leading-relaxed font-medium line-clamp-4 md:line-clamp-none">
              {currentStep.description}
            </p>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-1.5 md:h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-blue-600 dark:bg-blue-400 shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Actions - Mobile optimized */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center gap-1 border-gray-400 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium disabled:opacity-50 touch-manipulation h-10 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">ก่อนหน้า</span>
              </Button>

              <Button 
                onClick={onSkip} 
                variant="ghost" 
                size="sm"
                className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium touch-manipulation h-10 px-2 text-xs"
              >
                ข้าม
              </Button>

              <Button
                onClick={handleNext}
                size="sm"
                className="flex items-center gap-1 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium shadow-md touch-manipulation h-10 px-4"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    เสร็จ
                  </>
                ) : (
                  <>
                    ถัดไป
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
