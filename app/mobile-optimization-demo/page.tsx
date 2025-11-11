/**
 * Mobile Optimization Demo Page
 * Test all mobile features and optimizations
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  WifiOff,
  Battery,
  Zap,
  Image as ImageIcon,
  Navigation,
  Gauge,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { 
  useMobileDetection, 
  useNetworkInfo, 
  useBatteryInfo,
  useReducedMotion,
  useSafeAreaInsets,
} from '@/hooks/use-mobile-detection';
import { OptimizedImage, MobileGallery } from '@/components/mobile/optimized-image';
import { 
  MobileNavigation, 
  MobileHeader, 
  MobileNavigationSpacer,
  MobileHeaderSpacer,
} from '@/components/mobile/mobile-navigation';
import { cn } from '@/lib/utils';
import { 
  PerformanceTracker, 
  MemoryMonitor,
  AdaptiveLoadingManager,
} from '@/lib/mobile/performance-utils';

export default function MobileOptimizationDemo() {
  const [showGallery, setShowGallery] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const [performanceData, setPerformanceData] = useState<any>(null);

  // Hooks
  const device = useMobileDetection();
  const network = useNetworkInfo();
  const battery = useBatteryInfo();
  const prefersReducedMotion = useReducedMotion();
  const safeArea = useSafeAreaInsets();

  // Performance monitoring
  const tracker = new PerformanceTracker();
  const memory = new MemoryMonitor();
  const adaptive = new AdaptiveLoadingManager();

  const runPerformanceTest = async () => {
    tracker.mark('test-start');
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 500));
    
    tracker.mark('test-end');
    const duration = tracker.measure('test-duration', 'test-start', 'test-end');
    
    const vitals = await tracker.getCoreWebVitals();
    const memoryUsage = memory.getMemoryUsage();

    setPerformanceData({
      duration,
      vitals,
      memory: memoryUsage,
      adaptive: {
        shouldLoadHighQuality: adaptive.shouldLoadHighQuality(),
        recommendedQuality: adaptive.getRecommendedQuality(),
        shouldPrefetch: adaptive.shouldPrefetch(),
        shouldLazyLoad: adaptive.shouldLazyLoad(),
      },
    });
  };

  // Mock images for gallery
  const galleryImages = [
    {
      src: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800',
      alt: 'Skin analysis before',
      caption: 'Before treatment',
    },
    {
      src: 'https://images.unsplash.com/photo-1614179689702-355944cd0918?w=800',
      alt: 'Skin analysis after',
      caption: 'After 30 days',
    },
    {
      src: 'https://images.unsplash.com/photo-1612818488842-528eda87e7a3?w=800',
      alt: 'Skin analysis progress',
      caption: 'Progress chart',
    },
  ];

  return (
    <div className="min-h-mobile-screen bg-gray-50 dark:bg-gray-900 pb-safe">
      {/* Mobile Header (only on mobile) */}
      {device.isMobile && (
        <>
          <MobileHeader
            title="Mobile Optimization Demo"
            backButton={false}
          />
          <MobileHeaderSpacer />
        </>
      )}

      <div className="container max-w-6xl py-8 px-4">
        {/* Page Title (desktop) */}
        {device.isDesktop && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Mobile Optimization Demo</h1>
            <p className="text-muted-foreground">
              Test all mobile features and optimizations
            </p>
          </div>
        )}

        <Tabs defaultValue="device" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="device" className="text-xs sm:text-sm">
              <Smartphone className="h-4 w-4 mr-1" />
              Device
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs sm:text-sm">
              <Wifi className="h-4 w-4 mr-1" />
              Network
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs sm:text-sm">
              <ImageIcon className="h-4 w-4 mr-1" />
              Images
            </TabsTrigger>
            <TabsTrigger value="navigation" className="text-xs sm:text-sm">
              <Navigation className="h-4 w-4 mr-1" />
              Nav
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">
              <Gauge className="h-4 w-4 mr-1" />
              Perf
            </TabsTrigger>
          </TabsList>

          {/* Device Info Tab */}
          <TabsContent value="device">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {device.isMobile && <Smartphone className="h-5 w-5" />}
                    {device.isTablet && <Tablet className="h-5 w-5" />}
                    {device.isDesktop && <Monitor className="h-5 w-5" />}
                    Device Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Mobile:</span>
                    {device.isMobile ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tablet:</span>
                    {device.isTablet ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Desktop:</span>
                    {device.isDesktop ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Screen Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Width:</span>
                    <Badge variant="secondary">{device.screenWidth}px</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Height:</span>
                    <Badge variant="secondary">{device.screenHeight}px</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Orientation:</span>
                    <Badge>{device.orientation}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Touch:</span>
                    {device.touchSupport ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Hover:</span>
                    {device.hoverSupport ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reduced Motion:</span>
                    {prefersReducedMotion ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>iOS:</span>
                    {device.isIOS ? (
                      <Badge className="bg-black">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Android:</span>
                    {device.isAndroid ? (
                      <Badge className="bg-green-600">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>PWA:</span>
                    {device.isStandalone ? (
                      <Badge className="bg-blue-600">Installed</Badge>
                    ) : (
                      <Badge variant="outline">Browser</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Safe Area Insets</CardTitle>
                  <CardDescription>Respect device notches and home indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="text-2xl font-bold">{safeArea.top}px</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Top</div>
                    </div>
                    <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="text-2xl font-bold">{safeArea.bottom}px</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Bottom</div>
                    </div>
                    <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="text-2xl font-bold">{safeArea.left}px</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Left</div>
                    </div>
                    <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded">
                      <div className="text-2xl font-bold">{safeArea.right}px</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Right</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {network.isOnline ? (
                      <Wifi className="h-5 w-5 text-green-600" />
                    ) : (
                      <WifiOff className="h-5 w-5 text-red-600" />
                    )}
                    Connection Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>Online:</span>
                    <Badge className={network.isOnline ? 'bg-green-600' : 'bg-red-600'}>
                      {network.isOnline ? 'Connected' : 'Offline'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Effective Type:</span>
                    <Badge 
                      className={cn(
                        network.effectiveType === '4g' && 'bg-green-600',
                        network.effectiveType === '3g' && 'bg-yellow-600',
                        network.effectiveType === '2g' && 'bg-orange-600'
                      )}
                    >
                      {network.effectiveType.toUpperCase()}
                    </Badge>
                  </div>
                  {network.downlink && (
                    <div className="flex justify-between text-sm">
                      <span>Downlink:</span>
                      <Badge variant="secondary">{network.downlink} Mbps</Badge>
                    </div>
                  )}
                  {network.rtt && (
                    <div className="flex justify-between text-sm">
                      <span>RTT:</span>
                      <Badge variant="secondary">{network.rtt}ms</Badge>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Data Saver:</span>
                    {network.saveData ? (
                      <Badge className="bg-orange-600">Enabled</Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {battery.supported && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Battery className="h-5 w-5" />
                      Battery Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Level:</span>
                      <Badge 
                        className={cn(
                          battery.level > 0.5 && 'bg-green-600',
                          battery.level > 0.2 && battery.level <= 0.5 && 'bg-yellow-600',
                          battery.level <= 0.2 && 'bg-red-600'
                        )}
                      >
                        {Math.round(battery.level * 100)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Charging:</span>
                      {battery.charging ? (
                        <Zap className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Optimized Images</CardTitle>
                  <CardDescription>
                    Lazy loading, blur placeholder, adaptive quality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((image, index) => (
                      <OptimizedImage
                        key={index}
                        src={image.src}
                        alt={image.alt}
                        aspectRatio="portrait"
                        lazy={true}
                        blur={true}
                        adaptiveQuality={true}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setShowGallery(true)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Image Gallery</CardTitle>
                  <CardDescription>
                    Swipeable full-screen gallery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowGallery(true)} className="w-full">
                    Open Gallery
                  </Button>
                </CardContent>
              </Card>

              {showGallery && (
                <MobileGallery
                  images={galleryImages}
                  initialIndex={0}
                  onClose={() => setShowGallery(false)}
                />
              )}
            </div>
          </TabsContent>

          {/* Navigation Tab */}
          <TabsContent value="navigation">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mobile Navigation</CardTitle>
                  <CardDescription>
                    Bottom navigation bar with haptic feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Mobile Nav:</span>
                    <Button
                      variant={showMobileNav ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShowMobileNav(!showMobileNav)}
                    >
                      {showMobileNav ? 'Hide' : 'Show'}
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Info className="h-4 w-4 inline mr-2" />
                    <span className="text-sm">
                      Mobile navigation appears at the bottom on mobile/tablet devices.
                      Scroll to see it in action.
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Touch Targets</CardTitle>
                  <CardDescription>
                    All buttons meet 44px minimum size (Apple HIG)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="touch-target">Touch Me</Button>
                    <Button className="touch-target-lg" variant="secondary">
                      Large Target
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Test</CardTitle>
                  <CardDescription>
                    Run performance and memory tests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={runPerformanceTest} className="w-full">
                    Run Test
                  </Button>

                  {performanceData && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="text-2xl font-bold text-blue-600">
                            {performanceData.duration.toFixed(0)}ms
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Test Duration
                          </div>
                        </div>

                        {performanceData.memory.usedPercent && (
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="text-2xl font-bold text-green-600">
                              {performanceData.memory.usedPercent}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Memory Used
                            </div>
                          </div>
                        )}

                        {performanceData.vitals.FCP && (
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
                            <div className="text-2xl font-bold text-purple-600">
                              {performanceData.vitals.FCP.toFixed(0)}ms
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              First Contentful Paint
                            </div>
                          </div>
                        )}

                        {performanceData.vitals.TTFB && (
                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded">
                            <div className="text-2xl font-bold text-orange-600">
                              {performanceData.vitals.TTFB.toFixed(0)}ms
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Time to First Byte
                            </div>
                          </div>
                        )}
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Adaptive Loading</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>High Quality:</span>
                            {performanceData.adaptive.shouldLoadHighQuality ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Recommended Quality:</span>
                            <Badge>{performanceData.adaptive.recommendedQuality}%</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Should Prefetch:</span>
                            {performanceData.adaptive.shouldPrefetch ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Should Lazy Load:</span>
                            {performanceData.adaptive.shouldLazyLoad ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Navigation (bottom) */}
      {showMobileNav && <MobileNavigation />}
      {showMobileNav && <MobileNavigationSpacer />}
    </div>
  );
}
