// Analysis Components Export

// Core Components
export * from './ai-scanning-effect'
export * from './quality-indicator'
export { AnalysisCard, AnalysisCardsGrid } from './analysis-card'
export { AnalysisTimeline } from './analysis-timeline'
export { AnalysisWithConcerns } from './analysis-with-concerns'
export { default as AnalysisDetailClient } from './AnalysisDetailClient'
export { AnalysisProgressIndicator, CompactProgressIndicator, FullScreenProgressOverlay, MinimalProgressSpinner } from './AnalysisProgressIndicator'

// Educational & Interactive
export { ConcernDetailModal } from './concern-detail-modal'
export { InteractivePhotoMarkers } from './interactive-markers'
export { Shared3DCanvas } from './shared-3d-canvas'
export { AgingSimulator } from './aging-simulator'
export { ClinicalGenomeVisualization } from './clinical-genome-visualization'

// Comparison & Progress
export { default as AnalysisComparison } from './analysis-comparison'
export { ComparisonView } from './comparison-view'
export { ProgressDashboard } from './progress-dashboard'
export { SkinComparisonTimeline } from './skin-comparison-timeline'

// Forms & Questionnaires
export { LifestyleQuestionnaire } from './lifestyle-questionnaire'

// Recommendations & Scheduling
export { default as ProgramRecommendations } from './program-recommendations'
export { ProgramSchedulingComponent } from './program-scheduling'
export { ProductRecommendationComponent } from './product-recommendation'
export { VisionToOrderPanel } from './vision-to-order-panel'
export { MedicalDecisionSupport } from './medical-decision-support'

// Reports & Gallery
export { VISIAReport } from './visia-report'
export { EnhancedVISIAReport } from './enhanced-visia-report'
export { AnalysisHistoryGallery } from './history-gallery'
export { ShareDialog } from './share-dialog'
export { CustomerInfoCard } from './customer-info-card'
export { default as PriorityRankingCard } from './priority-ranking-card'
export { default as SkinAnalyzerComponent } from './skin-analyzer'

// Future Prediction
export { SkinFuturePrediction } from './skin-future-prediction'

// Types
export type { SkinAgePrediction, YearlyPrediction, AgingFactor, LifestyleFactors } from '@/lib/ai/skin-age-predictor'
export type { AnalysisCardProps, AnalysisCardsGridProps } from './analysis-card'
export type { AnalysisTimelineProps, TimelineEntry } from './analysis-timeline'
export type { VISIAReportProps } from './visia-report'
export type { EnhancedVISIAReportProps } from './enhanced-visia-report'
