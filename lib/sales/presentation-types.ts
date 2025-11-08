import type { HybridAnalysisResult } from '@/lib/ai/hybrid-analyzer'

export interface ProposalItem {
  id: string
  name: string
  type: 'treatment' | 'product'
  quantity: number
  pricePerUnit: number
  total: number
}

export interface ProposalDetails {
  items: ProposalItem[]
  subtotal: number
  discountType: 'percent' | 'fixed'
  discountValue: number
  discountAmount: number
  total: number
  paymentTerms: string
  notes: string
}

export interface PresentationData {
  sessionId: string
  customer: {
    id: string
    name: string
    phone: string
    email?: string
  }
  scannedImages: {
    front?: string
    left?: string
    right?: string
  }
  analysisResults: HybridAnalysisResult | null
  selectedTreatments: string[]
  selectedProducts: string[]
  proposal: ProposalDetails | null
  signature: string | null
  completedAt: Date | null
  lastSavedAt: Date | null
  lastSyncedAt: Date | null
  syncStatus: 'idle' | 'saving' | 'pending' | 'synced' | 'error'
}
