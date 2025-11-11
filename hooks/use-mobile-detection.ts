/**
 * Mobile Detection Hook
 * Detects device type, screen size, orientation, and capabilities
 * 
 * Usage:
 * const { isMobile, isTablet, orientation, touchSupport } = useMobileDetection();
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MobileDetectionState {
  // Device type
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Screen dimensions
  screenWidth: number;
  screenHeight: number;
  
  // Orientation
  orientation: 'portrait' | 'landscape';
  
  // Capabilities
  touchSupport: boolean;
  hoverSupport: boolean;
  
  // Breakpoints
  isXs: boolean;  // < 640px
  isSm: boolean;  // >= 640px
  isMd: boolean;  // >= 768px
  isLg: boolean;  // >= 1024px
  isXl: boolean;  // >= 1280px
  is2xl: boolean; // >= 1536px
  
  // Device info
  userAgent: string;
  platform: string;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  
  // PWA
  isStandalone: boolean;
  isFullscreen: boolean;
}

export function useMobileDetection(): MobileDetectionState {
  const [state, setState] = useState<MobileDetectionState>(() => {
    // Server-side default values
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape',
        touchSupport: false,
        hoverSupport: true,
        isXs: false,
        isSm: false,
        isMd: false,
        isLg: true,
        isXl: true,
        is2xl: true,
        userAgent: '',
        platform: '',
        isIOS: false,
        isAndroid: false,
        isSafari: false,
        isChrome: false,
        isStandalone: false,
        isFullscreen: false,
      };
    }

    // Client-side detection
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    // Touch support
    const touchSupport = 
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    // Hover support (CSS media query)
    const hoverSupport = window.matchMedia('(hover: hover)').matches;

    // Device detection
    const isMobile = width < 768 && touchSupport;
    const isTablet = width >= 768 && width < 1024 && touchSupport;
    const isDesktop = width >= 1024 || !touchSupport;

    // Breakpoints
    const isXs = width < 640;
    const isSm = width >= 640;
    const isMd = width >= 768;
    const isLg = width >= 1024;
    const isXl = width >= 1280;
    const is2xl = width >= 1536;

    // Orientation
    const orientation: 'portrait' | 'landscape' = 
      width < height ? 'portrait' : 'landscape';

    // Platform detection
    const isIOS = /iPad|iPhone|iPod/.test(ua) || 
      (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isChrome = /Chrome/.test(ua);

    // PWA detection
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    const isFullscreen = 
      window.matchMedia('(display-mode: fullscreen)').matches;

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: width,
      screenHeight: height,
      orientation,
      touchSupport,
      hoverSupport,
      isXs,
      isSm,
      isMd,
      isLg,
      isXl,
      is2xl,
      userAgent: ua,
      platform,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isStandalone,
      isFullscreen,
    };
  });

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    const touchSupport = 
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    const hoverSupport = window.matchMedia('(hover: hover)').matches;

    const isMobile = width < 768 && touchSupport;
    const isTablet = width >= 768 && width < 1024 && touchSupport;
    const isDesktop = width >= 1024 || !touchSupport;

    const isXs = width < 640;
    const isSm = width >= 640;
    const isMd = width >= 768;
    const isLg = width >= 1024;
    const isXl = width >= 1280;
    const is2xl = width >= 1536;

    const orientation: 'portrait' | 'landscape' = 
      width < height ? 'portrait' : 'landscape';

    const isIOS = /iPad|iPhone|iPod/.test(ua) || 
      (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isChrome = /Chrome/.test(ua);

    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    const isFullscreen = 
      window.matchMedia('(display-mode: fullscreen)').matches;

    setState({
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: width,
      screenHeight: height,
      orientation,
      touchSupport,
      hoverSupport,
      isXs,
      isSm,
      isMd,
      isLg,
      isXl,
      is2xl,
      userAgent: ua,
      platform,
      isIOS,
      isAndroid,
      isSafari,
      isChrome,
      isStandalone,
      isFullscreen,
    });
  }, []);

  useEffect(() => {
    updateState();

    // Listen for resize
    window.addEventListener('resize', updateState);
    
    // Listen for orientation change
    window.addEventListener('orientationchange', updateState);

    return () => {
      window.removeEventListener('resize', updateState);
      window.removeEventListener('orientationchange', updateState);
    };
  }, [updateState]);

  return state;
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect network connection quality
 */
export interface NetworkInfo {
  isOnline: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink?: number;
  rtt?: number;
  saveData: boolean;
}

export function useNetworkInfo(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        isOnline: true,
        effectiveType: '4g',
        saveData: false,
      };
    }

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    return {
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData || false,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkInfo({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData || false,
      });
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateOnlineStatus);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateOnlineStatus);
      }
    };
  }, []);

  return networkInfo;
}

/**
 * Hook to detect battery status
 */
export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  supported: boolean;
}

export function useBatteryInfo(): BatteryInfo {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({
    level: 1,
    charging: false,
    chargingTime: 0,
    dischargingTime: Infinity,
    supported: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('getBattery' in navigator)) {
      return;
    }

    let battery: any;

    const updateBatteryInfo = () => {
      if (!battery) return;

      setBatteryInfo({
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        supported: true,
      });
    };

    (navigator as any).getBattery().then((b: any) => {
      battery = b;
      updateBatteryInfo();

      battery.addEventListener('levelchange', updateBatteryInfo);
      battery.addEventListener('chargingchange', updateBatteryInfo);
      battery.addEventListener('chargingtimechange', updateBatteryInfo);
      battery.addEventListener('dischargingtimechange', updateBatteryInfo);
    });

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', updateBatteryInfo);
        battery.removeEventListener('chargingchange', updateBatteryInfo);
        battery.removeEventListener('chargingtimechange', updateBatteryInfo);
        battery.removeEventListener('dischargingtimechange', updateBatteryInfo);
      }
    };
  }, []);

  return batteryInfo;
}

/**
 * Hook to get safe area insets (for devices with notch)
 */
export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function useSafeAreaInsets(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement);
      
      setInsets({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  return insets;
}
