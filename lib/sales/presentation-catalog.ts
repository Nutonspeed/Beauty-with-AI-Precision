export interface TreatmentOption {
  id: string
  name: string
  nameKey: string
  icon: string
  concerns: string[]
  description: string
  descriptionKey: string
  colorClass: string
  defaultPrice: number
}

export const TREATMENT_OPTIONS: TreatmentOption[] = [
  {
    id: 'botox',
    name: 'Botox (Wrinkle Reduction)',
    nameKey: 'salesPresentations.treatments.botox.name',
    icon: '💉',
    concerns: ['wrinkles', 'fine_lines'],
    description: 'Smooths fine lines and wrinkles',
    descriptionKey: 'salesPresentations.treatments.botox.description',
    colorClass: 'bg-purple-50 border-purple-200 text-purple-900',
    defaultPrice: 12000,
  },
  {
    id: 'filler',
    name: 'Dermal Fillers',
    nameKey: 'salesPresentations.treatments.filler.name',
    icon: '💧',
    concerns: ['wrinkles', 'volume_loss'],
    description: 'Restores facial volume and contours',
    descriptionKey: 'salesPresentations.treatments.filler.description',
    colorClass: 'bg-blue-50 border-blue-200 text-blue-900',
    defaultPrice: 15000,
  },
  {
    id: 'laser',
    name: 'Laser Skin Resurfacing',
    nameKey: 'salesPresentations.treatments.laser.name',
    icon: '✨',
    concerns: ['dark_spots', 'texture', 'pores'],
    description: 'Improves skin texture and tone',
    descriptionKey: 'salesPresentations.treatments.laser.description',
    colorClass: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    defaultPrice: 8000,
  },
  {
    id: 'peel',
    name: 'Chemical Peel',
    nameKey: 'salesPresentations.treatments.peel.name',
    icon: '🧪',
    concerns: ['dark_spots', 'acne', 'dullness'],
    description: 'Exfoliates and brightens skin',
    descriptionKey: 'salesPresentations.treatments.peel.description',
    colorClass: 'bg-green-50 border-green-200 text-green-900',
    defaultPrice: 3500,
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    nameKey: 'salesPresentations.treatments.microneedling.name',
    icon: '📍',
    concerns: ['texture', 'pores', 'scars'],
    description: 'Stimulates collagen production',
    descriptionKey: 'salesPresentations.treatments.microneedling.description',
    colorClass: 'bg-pink-50 border-pink-200 text-pink-900',
    defaultPrice: 4500,
  },
  {
    id: 'hydrafacial',
    name: 'HydraFacial',
    nameKey: 'salesPresentations.treatments.hydrafacial.name',
    icon: '💦',
    concerns: ['hydration', 'dullness', 'pores'],
    description: 'Deep cleansing and hydration',
    descriptionKey: 'salesPresentations.treatments.hydrafacial.description',
    colorClass: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    defaultPrice: 5500,
  },
]

const treatmentMap = new Map(TREATMENT_OPTIONS.map((treatment) => [treatment.id, treatment]))

export function getTreatmentById(id: string) {
  return treatmentMap.get(id)
}

export function getTreatmentDisplayName(id: string, t?: any) {
  const treatment = treatmentMap.get(id);
  if (!treatment) return id;
  return t ? t(treatment.nameKey) : treatment.name;
}

export function getTreatmentDescription(id: string, t?: any) {
  const treatment = treatmentMap.get(id);
  if (!treatment) return '';
  return t ? t(treatment.descriptionKey) : treatment.description;
}

export function getTreatmentPrice(id: string) {
  return treatmentMap.get(id)?.defaultPrice ?? 5000
}
