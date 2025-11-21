/**
 * Concern Detail Modal
 * Displays comprehensive educational content for a skin concern
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Info, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  Calendar,
  CheckCircle2,
  XCircle,
  Printer
} from 'lucide-react';
import type { InteractiveConcern, ConcernLocation } from '@/lib/concerns/concern-education';
import { formatConcernType, getSeverityColor } from '@/lib/concerns/concern-education';

interface ConcernDetailModalProps {
  concern: InteractiveConcern | null;
  location?: ConcernLocation;
  language?: 'en' | 'th';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConcernDetailModal({
  concern,
  location,
  language = 'en',
  open,
  onOpenChange,
}: ConcernDetailModalProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'th'>(language);

  if (!concern?.education) return null;

  const { education } = concern;
  const severity = location?.severity || concern.averageSeverity > 7 ? 'high' : concern.averageSeverity > 4 ? 'medium' : 'low';
  
  // Get treatment based on severity
  const getTreatmentOptions = () => {
    if (!education.treatment) return [];
    
    // Handle different treatment structures
    if ('mild' in education.treatment) {
      return education.treatment[severity as 'mild' | 'moderate' | 'severe']?.options || [];
    }
    if ('fine_lines' in education.treatment) {
      // Wrinkles special case
      const level = concern.averageSeverity < 4 ? 'fine_lines' : concern.averageSeverity < 7 ? 'moderate' : 'severe';
      return (education.treatment as any)[level]?.options || [];
    }
    return [];
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{education.icon}</span>
              <div>
                <DialogTitle className="text-2xl">
                  {formatConcernType(concern.type)}
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  {education.definition[currentLanguage]}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLanguage(currentLanguage === 'en' ? 'th' : 'en')}
              >
                {currentLanguage === 'en' ? 'ไทย' : 'EN'}
              </Button>
              {/* Print button */}
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Severity badge */}
          <div className="flex items-center gap-2 mt-3">
            <Badge
              variant="secondary"
              className="px-3 py-1"
              style={{ backgroundColor: getSeverityColor(severity) }}
            >
              {severity.toUpperCase()} - Score: {concern.averageSeverity.toFixed(1)}/10
            </Badge>
            {concern.locations.length > 0 && (
              <Badge variant="outline">
                {concern.locations.length} location{concern.locations.length > 1 ? 's' : ''}
              </Badge>
            )}
            {location && (
              <Badge variant="outline">
                Confidence: {Math.round(location.confidence * 100)}%
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <Info className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="causes">
              <AlertCircle className="h-4 w-4 mr-1" />
              Causes
            </TabsTrigger>
            <TabsTrigger value="prevention">
              <ShieldCheck className="h-4 w-4 mr-1" />
              Prevention
            </TabsTrigger>
            <TabsTrigger value="treatment">
              <Sparkles className="h-4 w-4 mr-1" />
              Treatment
            </TabsTrigger>
            <TabsTrigger value="routine">
              <Calendar className="h-4 w-4 mr-1" />
              Routine
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] mt-4 pr-4">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Statistics */}
              {education.statistics && (
                <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Key Statistics
                  </h3>
                  <ul className="space-y-2">
                    {Object.entries(education.statistics).map(([key, value]) => (
                      <li key={key} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Myths & Facts */}
              {education.myths && education.myths.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Common Myths
                  </h3>
                  <div className="space-y-4">
                    {education.myths.map((myth, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge variant="destructive" className="mt-1">MYTH</Badge>
                          <p className="font-medium text-red-700 dark:text-red-400">
                            {myth.myth}
                          </p>
                        </div>
                        <div className="flex items-start gap-2 ml-2 pl-4 border-l-2 border-green-600">
                          <Badge variant="secondary" className="mt-1 bg-green-600">FACT</Badge>
                          <p className="text-green-700 dark:text-green-400">
                            {myth.fact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Concerns */}
              {education.relatedConcerns && education.relatedConcerns.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Related Concerns</h3>
                  <div className="flex flex-wrap gap-2">
                    {education.relatedConcerns.map((relatedType) => (
                      <Badge key={relatedType} variant="outline">
                        {formatConcernType(relatedType as any)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Causes Tab */}
            <TabsContent value="causes" className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold text-lg mb-3">What Causes {formatConcernType(concern.type)}?</h3>
                <ul className="space-y-2">
                  {education.causes[currentLanguage].map((cause, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-red-600 font-bold mt-1">{index + 1}.</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* Prevention Tab */}
            <TabsContent value="prevention" className="space-y-4">
              <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  How to Prevent {formatConcernType(concern.type)}
                </h3>
                <ul className="space-y-2">
                  {education.prevention[currentLanguage].map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            {/* Treatment Tab */}
            <TabsContent value="treatment" className="space-y-6">
              {/* Current severity treatment */}
              <div className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-950">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Recommended Treatment for Your {severity.toUpperCase()} Level
                </h3>
                <ul className="space-y-2">
                  {getTreatmentOptions().map((option: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-purple-600 font-bold mt-1">•</span>
                      <span>{option}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* When to see dermatologist */}
              {education.whenToSeeDermatologist && (
                <div className="rounded-lg border p-4 bg-orange-50 dark:bg-orange-950">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    When to See a Dermatologist
                  </h3>
                  <ul className="space-y-2">
                    {education.whenToSeeDermatologist[currentLanguage].map((scenario, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>{scenario}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ingredients */}
              {(education as any).ingredients && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Effective Ingredients</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {(education as any).ingredients.proven && (
                      <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-2">Proven Ingredients</h4>
                        <ul className="space-y-1 text-sm">
                          {(education as any).ingredients.proven.map((ingredient: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(education as any).ingredients.effective && (
                      <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-2">Effective Ingredients</h4>
                        <ul className="space-y-1 text-sm">
                          {(education as any).ingredients.effective.map((ingredient: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Routine Tab */}
            <TabsContent value="routine" className="space-y-6">
              {education.dailyRoutine && (
                <>
                  {/* Morning routine */}
                  {education.dailyRoutine.morning && (
                    <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-950">
                      <h3 className="font-semibold text-lg mb-3">☀️ Morning Routine</h3>
                      <ol className="space-y-2">
                        {education.dailyRoutine.morning.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="font-bold text-yellow-600">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Evening routine */}
                  {education.dailyRoutine.evening && (
                    <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950">
                      <h3 className="font-semibold text-lg mb-3">🌙 Evening Routine</h3>
                      <ol className="space-y-2">
                        {education.dailyRoutine.evening.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="font-bold text-blue-600">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Weekly routine */}
                  {education.dailyRoutine.weekly && education.dailyRoutine.weekly.length > 0 && (
                    <div className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-950">
                      <h3 className="font-semibold text-lg mb-3">📅 Weekly Treatments</h3>
                      <ul className="space-y-2">
                        {education.dailyRoutine.weekly.map((treatment, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>{treatment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-500">
            💡 Tip: Consistency is key for best results. Track your progress over time.
          </p>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
