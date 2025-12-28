/**
 * Beauty AI Loading Hooks
 * Hooks สำหรับจัดการ loading states แบบ Beauty AI
 */

import { useState, useEffect } from 'react';

// Hook สำหรับ Staggered Loading
export function useStaggeredLoading(items: string[], interval = 2000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!isLoading) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= items.length - 1) {
          setIsLoading(false);
          return prev;
        }
        return prev + 1;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [items.length, interval, isLoading]);
  
  return {
    currentItem: items[currentIndex],
    currentIndex,
    isLoading,
    progress: ((currentIndex + 1) / items.length) * 100,
    complete: !isLoading
  };
}

// Hook สำหรับ Progress Loading
export function useProgressLoading(duration = 3000) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!isLoading) return;
    
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        setIsLoading(false);
        clearInterval(timer);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, [duration, isLoading]);
  
  return {
    progress,
    isLoading,
    complete: !isLoading
  };
}

// Hook สำหรับ Beauty Loading States
export function useBeautyLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [message, setMessage] = useState('กำลังโหลด...');
  
  const startLoading = (newMessage = 'กำลังโหลด...') => {
    setMessage(newMessage);
    setIsLoading(true);
  };
  
  const stopLoading = () => {
    setIsLoading(false);
  };
  
  return {
    isLoading,
    message,
    startLoading,
    stopLoading,
    setLoading: setIsLoading
  };
}

// Hook สำหรับ Async Loading with Beauty Components
export function useAsyncBeautyLoading<T>(
  asyncFn: () => Promise<T>,
  loadingMessage = 'กำลังดำเนินการ...'
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const execute = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    data,
    error,
    isLoading,
    execute,
    reset: () => {
      setData(null);
      setError(null);
      setIsLoading(false);
    }
  };
}
