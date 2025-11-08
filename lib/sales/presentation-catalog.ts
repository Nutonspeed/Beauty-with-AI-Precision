export interface TreatmentOption {
  id: string
  name: string
  icon: string
  concerns: string[]
  description: string
  colorClass: string
  defaultPrice: number
}

export const TREATMENT_OPTIONS: TreatmentOption[] = [
  {
    id: 'botox',
    name: 'Botox (Wrinkle Reduction)',
    icon: '💉',
    concerns: ['wrinkles', 'fine_lines'],
    description: 'Smooths fine lines and wrinkles',
    colorClass: 'bg-purple-50 border-purple-200 text-purple-900',
    defaultPrice: 12000,
  },
  {
    id: 'filler',
    name: 'Dermal Fillers',
    icon: '💧',
    concerns: ['wrinkles', 'volume_loss'],
    description: 'Restores facial volume and contours',
    colorClass: 'bg-blue-50 border-blue-200 text-blue-900',
    defaultPrice: 15000,
  },
  {
    id: 'laser',
    name: 'Laser Skin Resurfacing',
    icon: '✨',
    concerns: ['dark_spots', 'texture', 'pores'],
    description: 'Improves skin texture and tone',
    colorClass: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    defaultPrice: 8000,
  },
  {
    id: 'peel',
    name: 'Chemical Peel',
    icon: '🧪',
    concerns: ['dark_spots', 'acne', 'dullness'],
    description: 'Exfoliates and brightens skin',
    colorClass: 'bg-green-50 border-green-200 text-green-900',
    defaultPrice: 3500,
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    icon: '📍',
    concerns: ['texture', 'pores', 'scars'],
    description: 'Stimulates collagen production',
    colorClass: 'bg-pink-50 border-pink-200 text-pink-900',
    defaultPrice: 4500,
  },
  {
    id: 'hydrafacial',
    name: 'HydraFacial',
    icon: '💦',
    concerns: ['hydration', 'dullness', 'pores'],
    description: 'Deep cleansing and hydration',
    colorClass: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    defaultPrice: 5500,
  },
]

const treatmentMap = new Map(TREATMENT_OPTIONS.map((treatment) => [treatment.id, treatment]))

export function getTreatmentById(id: string) {
  return treatmentMap.get(id)
}

export function getTreatmentDisplayName(id: string) {
  return treatmentMap.get(id)?.name ?? id
}

export function getTreatmentPrice(id: string) {
  return treatmentMap.get(id)?.defaultPrice ?? 5000
}
