"use client";

import { useEffect, useState } from "react";
import { X, Bell, AlertCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LeadNotification } from "@/lib/websocket-client";

interface LeadNotificationToastProps {
  notification: LeadNotification;
  onClose: () => void;
  autoCloseDelay?: number; // milliseconds
}

export default function LeadNotificationToast({
  notification,
  onClose,
  autoCloseDelay = 8000
}: LeadNotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close timer
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [autoCloseDelay]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getPriorityBadgeClass = () => {
    switch (notification.priority) {
      case 'critical':
        return 'bg-red-600 hover:bg-red-700';
      case 'high':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'medium':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'low':
        return 'bg-gray-600 hover:bg-gray-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'new_lead':
        return <TrendingUp className="h-5 w-5" />;
      case 'high_priority':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-[400px] w-[calc(100vw-2rem)] transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <Card className="bg-white dark:bg-gray-800 shadow-2xl border-l-4 overflow-hidden">
        {/* Priority indicator bar */}
        <div className={`h-1 ${getPriorityColor()}`} />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${getPriorityColor()} text-white`}>
                {getIcon()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">
                  New Lead Alert
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(notification.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {notification.message}
            </p>

            {notification.leadData && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={getPriorityBadgeClass()}>
                  Score: {notification.priorityScore}
                </Badge>
                
                {notification.leadData.isOnline && (
                  <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
                    🟢 Online
                  </Badge>
                )}

                <Badge variant="outline" className="border-purple-500 text-purple-700 dark:text-purple-400">
                  AI: {notification.leadData.score}
                </Badge>

                <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">
                  ฿{(notification.leadData.estimatedValue / 1000).toFixed(0)}K
                </Badge>
              </div>
            )}

            {/* CTA */}
            <div className="pt-2 mt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                View Lead Details →
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
