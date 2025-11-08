'use client';

import { useEffect, useState } from 'react';
import { getPWAManager } from '@/lib/pwa/pwa-manager';
import type { InstallPromptState } from '@/lib/pwa/pwa-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface PWAInstallPromptProps {
  autoShow?: boolean;
  onInstalled?: () => void;
  onDismissed?: () => void;
}

export function PWAInstallPrompt({
  autoShow = true,
  onInstalled,
  onDismissed,
}: PWAInstallPromptProps) {
  const [installState, setInstallState] = useState<InstallPromptState>({
    canInstall: false,
    isInstalled: false,
    platform: null,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const pwaManager = getPWAManager();

    // Check install state
    const checkInstallState = () => {
      const state = pwaManager.getInstallPromptState();
      setInstallState(state);

      // Auto-show prompt if enabled and can install
      if (autoShow && state.canInstall && !state.isInstalled) {
        // Show after a short delay
        setTimeout(() => {
          setIsVisible(true);
        }, 3000);
      }
    };

    checkInstallState();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = () => {
      checkInstallState();
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsVisible(false);
      setInstallState((prev) => ({ ...prev, isInstalled: true, canInstall: false }));
      if (onInstalled) {
        onInstalled();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow, onInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);

    const pwaManager = getPWAManager();
    const success = await pwaManager.showInstallPrompt();

    setIsInstalling(false);

    if (success) {
      setIsVisible(false);
      if (onInstalled) {
        onInstalled();
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismissed) {
      onDismissed();
    }
  };

  // Don't show if already installed or can't install
  if (!isVisible || installState.isInstalled || !installState.canInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96">
      <Card className="shadow-lg border-2 border-purple-200 dark:border-purple-800">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            {installState.platform === 'Android' || installState.platform === 'mobile' ? (
              <Smartphone className="h-8 w-8 text-purple-600" />
            ) : (
              <Monitor className="h-8 w-8 text-purple-600" />
            )}
            <div>
              <CardTitle className="text-lg">Install AI Clinic App</CardTitle>
              <CardDescription>Get quick access and offline features</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
              <span>Work offline with cached data</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
              <span>Receive push notifications</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
              <span>Quick access from home screen</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
              <span>Faster load times</span>
            </li>
          </ul>

          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Download className="mr-2 h-4 w-4" />
              {isInstalling ? 'Installing...' : 'Install App'}
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
