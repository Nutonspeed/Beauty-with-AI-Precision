'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Zap,
  CheckCircle,
  Bell,
  X,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { SkinAlert, AlertSeverity } from '@/lib/skin-condition-alert-system';

interface Props {
  alerts: SkinAlert[];
  language?: 'th' | 'en';
  onMarkAsRead?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  maxVisibleAlerts?: number;
}

const translations = {
  th: {
    title: 'การแจ้งเตือนสภาพผิว',
    alerts: 'การแจ้งเตือน',
    noAlerts: 'ไม่มีการแจ้งเตือน',
    markAsRead: 'ทำเครื่องหมายว่าอ่านแล้ว',
    dismiss: 'ปิด',
    severity: 'ความรุนแรง',
    category: 'หมวดหมู่',
    degradation: 'การลดลง',
    improvement: 'การปรับปรุง',
    anomaly: 'ความผิดปกติ',
    threshold: 'เกณฑ์',
    trend: 'แนวโน้ม',
    warning: 'คำเตือน',
    achievement: 'ความสำเร็จ',
    milestone: 'เหตุการณ์สำคัญ',
    recommendedAction: 'การกระทำที่แนะนำ',
    critical: 'วิกฤต',
    high: 'สูง',
    medium: 'ปานกลาง',
    low: 'ต่ำ',
    viewMore: 'ดูเพิ่มเติม',
    allAlerts: 'การแจ้งเตือนทั้งหมด',
    change: 'การเปลี่ยนแปลง',
    previous: 'ก่อนหน้า',
    current: 'ปัจจุบัน',
  },
  en: {
    title: 'Skin Condition Alerts',
    alerts: 'Alerts',
    noAlerts: 'No alerts',
    markAsRead: 'Mark as read',
    dismiss: 'Dismiss',
    severity: 'Severity',
    category: 'Category',
    degradation: 'Degradation',
    improvement: 'Improvement',
    anomaly: 'Anomaly',
    threshold: 'Threshold',
    trend: 'Trend',
    warning: 'Warning',
    achievement: 'Achievement',
    milestone: 'Milestone',
    recommendedAction: 'Recommended Action',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    viewMore: 'View More',
    allAlerts: 'All Alerts',
    change: 'Change',
    previous: 'Previous',
    current: 'Current',
  },
};

const severityColors: Record<AlertSeverity, { bg: string; border: string; icon: string; text: string }> = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    icon: 'text-red-600',
    text: 'text-red-900',
  },
  high: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    icon: 'text-orange-600',
    text: 'text-orange-900',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    icon: 'text-yellow-600',
    text: 'text-yellow-900',
  },
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    icon: 'text-blue-600',
    text: 'text-blue-900',
  },
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  degradation: TrendingDown,
  improvement: TrendingUp,
  anomaly: AlertCircle,
  threshold: Zap,
};

export const SkinAlertComponent: React.FC<Props> = ({
  alerts,
  language = 'en',
  onMarkAsRead,
  onDismiss,
  maxVisibleAlerts = 3,
}) => {
  const t = translations[language];
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    if (filterSeverity) {
      filtered = filtered.filter((a) => a.severity === filterSeverity);
    }
    return filtered;
  }, [alerts, filterSeverity]);

  const visibleAlerts = showAll ? filteredAlerts : filteredAlerts.slice(0, maxVisibleAlerts);
  const hasMoreAlerts = filteredAlerts.length > maxVisibleAlerts && !showAll;

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.isRead).length;

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 rounded-lg border border-green-300 p-4 text-center">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-green-900 font-semibold">{t.noAlerts}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            {t.title}
          </h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread {criticalCount > 0 && `, ${criticalCount} critical`}
            </p>
          )}
        </div>

        {/* Severity Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterSeverity(null)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filterSeverity === null
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-1" />
            All
          </button>
          {(['critical', 'high', 'medium', 'low'] as AlertSeverity[]).map((severity) => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(filterSeverity === severity ? null : severity)}
              className={`px-3 py-1 rounded text-sm font-medium transition capitalize ${
                filterSeverity === severity
                  ? `${severityColors[severity].bg} ${severityColors[severity].border} border`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t[severity as keyof typeof t] || severity}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {visibleAlerts.map((alert) => {
          const colors = severityColors[alert.severity];
          const CategoryIcon = categoryIcons[alert.category] || AlertCircle;
          const isExpanded = expandedAlertId === alert.id;

          return (
            <div
              key={alert.id}
              className={`rounded-lg border-2 p-4 transition ${colors.bg} ${colors.border}`}
            >
              {/* Alert Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <CategoryIcon className={`w-6 h-6 mt-1 flex-shrink-0 ${colors.icon}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-lg ${colors.text}`}>{alert.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium capitalize ${
                          alert.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {t[alert.severity as keyof typeof t] || alert.severity}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${colors.text}`}>{alert.message}</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => onDismiss?.(alert.id)}
                  className={`flex-shrink-0 ${colors.icon} hover:opacity-70 transition ml-2`}
                  title="Dismiss alert"
                  aria-label={`Dismiss ${alert.title} alert`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics */}
              <div className="flex gap-4 mt-3 pl-9 text-sm">
                <div>
                  <p className="text-gray-600">{t.previous}</p>
                  <p className={`font-semibold ${colors.text}`}>{alert.previousValue.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-600">{t.current}</p>
                  <p className={`font-semibold ${colors.text}`}>{alert.currentValue.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-600">{t.change}</p>
                  <p className={`font-semibold ${alert.changePercentage < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {alert.changePercentage > 0 ? '+' : ''}
                    {alert.changePercentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Expandable Section */}
              <button
                onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                className="mt-3 pl-9 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                {isExpanded ? 'Hide' : 'Show'} Details
                <ChevronDown className={`w-4 h-4 transition ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="mt-3 pl-9 space-y-2 pt-3 border-t border-gray-300">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">{t.recommendedAction}</p>
                    <p className={`text-sm mt-1 ${colors.text}`}>{alert.recommendedAction}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">{t.category}</p>
                      <p className="font-semibold capitalize text-gray-900">{alert.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-semibold capitalize text-gray-900">{alert.type}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString(language === 'th' ? 'th-TH' : 'en-US')}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pl-9">
                {!alert.isRead && (
                  <button
                    onClick={() => onMarkAsRead?.(alert.id)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium transition"
                  >
                    {t.markAsRead}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {hasMoreAlerts && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition"
        >
          {t.viewMore} ({filteredAlerts.length - maxVisibleAlerts} more)
        </button>
      )}
    </div>
  );
};
