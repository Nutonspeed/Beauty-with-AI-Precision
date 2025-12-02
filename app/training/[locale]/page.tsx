import { Metadata } from 'next'
import TrainingDashboard from '@/components/training/training-dashboard'

export const metadata: Metadata = {
  title: 'Training Center - Beauty with AI Precision',
  description: 'Comprehensive training resources for Beauty with AI Precision platform',
}

export default function TrainingPage() {
  return <TrainingDashboard />
}
