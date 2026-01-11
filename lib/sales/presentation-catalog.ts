export interface ProgramOption {
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

export const PROGRAM_OPTIONS: ProgramOption[] = [
  {
    id: 'botox',
    name: 'Botox (Wrinkle Reduction)',
    nameKey: 'salesPresentations.programs.botox.name',
    icon: '💉',
    concerns: ['wrinkles', 'fine_lines'],
    description: 'Smooths fine lines and wrinkles',
    descriptionKey: 'salesPresentations.programs.botox.description',
    colorClass: 'bg-purple-50 border-purple-200 text-purple-900',
    defaultPrice: 12000,
  },
  {
    id: 'filler',
    name: 'Dermal Fillers',
    nameKey: 'salesPresentations.programs.filler.name',
    icon: '💧',
    concerns: ['wrinkles', 'volume_loss'],
    description: 'Restores facial volume and contours',
    descriptionKey: 'salesPresentations.programs.filler.description',
    colorClass: 'bg-blue-50 border-blue-200 text-blue-900',
    defaultPrice: 15000,
  },
  {
    id: 'laser',
    name: 'Laser Skin Resurfacing',
    nameKey: 'salesPresentations.programs.laser.name',
    icon: '✨',
    concerns: ['dark_spots', 'texture', 'pores'],
    description: 'Improves skin texture and tone',
    descriptionKey: 'salesPresentations.programs.laser.description',
    colorClass: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    defaultPrice: 8000,
  },
  {
    id: 'peel',
    name: 'Chemical Peel',
    nameKey: 'salesPresentations.programs.peel.name',
    icon: '🧪',
    concerns: ['dark_spots', 'acne', 'dullness'],
    description: 'Exfoliates and brightens skin',
    descriptionKey: 'salesPresentations.programs.peel.description',
    colorClass: 'bg-green-50 border-green-200 text-green-900',
    defaultPrice: 3500,
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    nameKey: 'salesPresentations.programs.microneedling.name',
    icon: '📍',
    concerns: ['texture', 'pores', 'scars'],
    description: 'Stimulates collagen production',
    descriptionKey: 'salesPresentations.programs.microneedling.description',
    colorClass: 'bg-pink-50 border-pink-200 text-pink-900',
    defaultPrice: 4500,
  },
  {
    id: 'hydrafacial',
    name: 'HydraFacial',
    nameKey: 'salesPresentations.programs.hydrafacial.name',
    icon: '💦',
    concerns: ['hydration', 'dullness', 'pores'],
    description: 'Deep cleansing and hydration',
    descriptionKey: 'salesPresentations.programs.hydrafacial.description',
    colorClass: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    defaultPrice: 5500,
  },
]

const programMap = new Map(PROGRAM_OPTIONS.map((program) => [program.id, program]))

export function getProgramById(id: string) {
  return programMap.get(id)
}

export function getProgramDisplayName(id: string, t?: any) {
  const program = programMap.get(id);
  if (!program) return id;
  return t ? t(program.nameKey) : program.name;
}

export function getProgramDescription(id: string, t?: any) {
  const program = programMap.get(id);
  if (!program) return '';
  return t ? t(program.descriptionKey) : program.description;
}

export function getProgramPrice(id: string) {
  return programMap.get(id)?.defaultPrice ?? 5000
}
