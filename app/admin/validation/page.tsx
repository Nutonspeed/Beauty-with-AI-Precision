/**
 * Admin Validation Dashboard
 * 
 * Compares AI predictions with expert-annotated ground truth
 * Displays accuracy metrics, confusion matrix, and recommendations
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import type { ValidationReport, SeverityLevel } from '@/types/calibration';
import type { ModelType } from '@/lib/validation/calibration-validator';

type ReportStatus = {
  level: 'excellent' | 'good' | 'fair' | 'poor';
  color: 'green' | 'yellow' | 'orange' | 'red';
  message: string;
};

export default function ValidationDashboardPage() {
  const [model, setModel] = useState<ModelType>('ensemble');
  const [severity, setSeverity] = useState<SeverityLevel | 'all'>('all');
  const [threshold, setThreshold] = useState<number>(0.65);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [status, setStatus] = useState<ReportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runValidation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/validation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          severity: severity === 'all' ? undefined : severity,
          threshold,
          saveReport: true,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Validation failed');
      }

      setReport(data.report);
      setStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Validation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (level: string) => {
    switch (level) {
      case 'excellent':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'good':
        return <CheckCircle className="h-6 w-6 text-yellow-500" />;
      case 'fair':
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case 'poor':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Validation Dashboard</h1>
        <p className="text-gray-600">
          Compare AI predictions with expert-annotated ground truth
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Validation Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">AI Model</label>
              <Select value={model} onValueChange={(v) => setModel(v as ModelType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mediapipe">MediaPipe</SelectItem>
                  <SelectItem value="tensorflow">TensorFlow</SelectItem>
                  <SelectItem value="huggingface">HuggingFace</SelectItem>
                  <SelectItem value="ensemble">Ensemble (Best)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Severity Level</label>
              <Select
                value={severity}
                onValueChange={(v) => setSeverity(v as SeverityLevel | 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Threshold */}
            <div>
              <label htmlFor="threshold-slider" className="block text-sm font-medium mb-2">
                Confidence Threshold: {(threshold * 100).toFixed(0)}%
              </label>
              <input
                id="threshold-slider"
                type="range"
                min="50"
                max="95"
                step="5"
                value={threshold * 100}
                onChange={(e) => setThreshold(parseInt(e.target.value) / 100)}
                className="w-full"
                aria-label="Confidence threshold slider"
              />
            </div>

            {/* Run Button */}
            <div className="flex items-end">
              <Button
                onClick={runValidation}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  'Run Validation'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {report && status && (
        <>
          {/* Status Banner */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {getStatusIcon(status.level)}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold capitalize">{status.level} Performance</h3>
                  <p className="text-gray-600">{status.message}</p>
                </div>
                <Badge
                  variant={status.level === 'excellent' || status.level === 'good' ? 'default' : 'destructive'}
                  className="text-lg px-4 py-2"
                >
                  {(report.overallMetrics.accuracy * 100).toFixed(1)}% Accuracy
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Overall Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getMetricColor(report.overallMetrics.accuracy, { good: 0.85, warning: 0.75 })}`}>
                  {(report.overallMetrics.accuracy * 100).toFixed(1)}%
                </div>
                <Progress
                  value={report.overallMetrics.accuracy * 100}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Target: ≥85%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Precision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getMetricColor(report.overallMetrics.avgPrecision, { good: 0.80, warning: 0.70 })}`}>
                  {(report.overallMetrics.avgPrecision * 100).toFixed(1)}%
                </div>
                <Progress
                  value={report.overallMetrics.avgPrecision * 100}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Target: ≥80%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Recall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getMetricColor(report.overallMetrics.avgRecall, { good: 0.80, warning: 0.70 })}`}>
                  {(report.overallMetrics.avgRecall * 100).toFixed(1)}%
                </div>
                <Progress
                  value={report.overallMetrics.avgRecall * 100}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Target: ≥80%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  F1 Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getMetricColor(report.overallMetrics.avgF1Score, { good: 0.80, warning: 0.70 })}`}>
                  {(report.overallMetrics.avgF1Score * 100).toFixed(1)}%
                </div>
                <Progress
                  value={report.overallMetrics.avgF1Score * 100}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Target: ≥80%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Severity Breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Performance by Severity Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Severity</th>
                      <th className="text-right py-2 px-4">Samples</th>
                      <th className="text-right py-2 px-4">Accuracy</th>
                      <th className="text-right py-2 px-4">Precision</th>
                      <th className="text-right py-2 px-4">Recall</th>
                      <th className="text-right py-2 px-4">F1 Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['clear', 'mild', 'moderate', 'severe'] as SeverityLevel[]).map((sev) => {
                      const metrics = report.severityBreakdown[sev];
                      if (metrics.sampleCount === 0) return null;

                      return (
                        <tr key={sev} className="border-b">
                          <td className="py-2 px-4">
                            <Badge variant="outline" className="capitalize">
                              {sev}
                            </Badge>
                          </td>
                          <td className="text-right py-2 px-4">{metrics.sampleCount}</td>
                          <td className={`text-right py-2 px-4 font-semibold ${getMetricColor(metrics.accuracy, { good: 0.85, warning: 0.75 })}`}>
                            {(metrics.accuracy * 100).toFixed(1)}%
                          </td>
                          <td className={`text-right py-2 px-4 ${getMetricColor(metrics.precision, { good: 0.80, warning: 0.70 })}`}>
                            {(metrics.precision * 100).toFixed(1)}%
                          </td>
                          <td className={`text-right py-2 px-4 ${getMetricColor(metrics.recall, { good: 0.80, warning: 0.70 })}`}>
                            {(metrics.recall * 100).toFixed(1)}%
                          </td>
                          <td className={`text-right py-2 px-4 ${getMetricColor(metrics.f1Score, { good: 0.80, warning: 0.70 })}`}>
                            {(metrics.f1Score * 100).toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Confusion Matrix */}
          {report.confusionMatrix.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Confusion Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {/* Header */}
                  <div></div>
                  {(['clear', 'mild', 'moderate', 'severe'] as SeverityLevel[]).map((sev) => (
                    <div key={sev} className="text-center text-sm font-medium capitalize">
                      {sev}
                    </div>
                  ))}

                  {/* Matrix */}
                  {(['clear', 'mild', 'moderate', 'severe'] as SeverityLevel[]).map((actual) => (
                    <>
                      <div key={`${actual}-label`} className="text-sm font-medium capitalize flex items-center">
                        {actual}
                      </div>
                      {(['clear', 'mild', 'moderate', 'severe'] as SeverityLevel[]).map((predicted) => {
                        const entry = report.confusionMatrix.find(
                          (e) => e.actual === actual && e.predicted === predicted
                        );
                        const count = entry?.count || 0;
                        const isCorrect = actual === predicted;

                        return (
                          <div
                            key={`${actual}-${predicted}`}
                            className={`text-center p-4 rounded ${
                              isCorrect
                                ? 'bg-green-100 border-2 border-green-500'
                                : count > 0
                                ? 'bg-red-100 border border-red-300'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="text-2xl font-bold">{count}</div>
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Rows: Actual severity | Columns: Predicted severity | Diagonal (green): Correct predictions
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-600 font-semibold">{i + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Threshold Suggestions */}
          {report.thresholdSuggestions && (
            <Card>
              <CardHeader>
                <CardTitle>Threshold Tuning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Threshold:</span>
                    <Badge>{(report.thresholdSuggestions.currentThreshold * 100).toFixed(0)}%</Badge>
                  </div>
                  {report.thresholdSuggestions.suggestedThreshold !== report.thresholdSuggestions.currentThreshold && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Suggested Threshold:</span>
                        <Badge variant="outline">
                          {(report.thresholdSuggestions.suggestedThreshold * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <Button
                        onClick={() => setThreshold(report.thresholdSuggestions!.suggestedThreshold)}
                        variant="outline"
                        className="w-full"
                      >
                        Apply Suggested Threshold
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!report && !loading && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="text-gray-400 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Validation Results Yet</h3>
            <p className="text-gray-600 mb-4">
              Select a model and click "Run Validation" to start
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
