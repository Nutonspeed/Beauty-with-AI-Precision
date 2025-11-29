/**
 * AR/AI Simulators for Sales Dashboard
 * เครื่องมือจำลองผลลัพธ์สำหรับคลินิกเสริมความงามทุกสาขา
 */

// Skin & Face
export { default as FillerLipSimulator } from '../filler-lip-simulator';
export { default as EyeEnhancementSimulator } from '../eye-enhancement-simulator';
export { default as ARTreatmentPreview } from '../ar-treatment-preview';

// Body
export { default as BodyContouringSimulator } from '../body-contouring-simulator';

// Hair
export { default as HairRestorationSimulator } from '../hair-restoration-simulator';

// Existing tools
export { default as SkinHeatmap } from '../skin-heatmap';

/**
 * Simulator Registry - ใช้สำหรับ dynamic loading
 */
export const SIMULATOR_REGISTRY = {
  // Face & Skin
  skin_analysis: {
    id: 'skin_analysis',
    name: 'AI Skin Analysis',
    nameTh: 'วิเคราะห์ผิวด้วย AI',
    category: 'face',
    component: 'SkinHeatmap',
    clinicTypes: ['dermatology', 'aesthetic', 'spa'],
    features: ['8-mode detection', '468-point mapping', 'Treatment recommendations']
  },
  filler_lip: {
    id: 'filler_lip',
    name: 'Filler & Lip Simulator',
    nameTh: 'จำลองฟิลเลอร์และปาก',
    category: 'face',
    component: 'FillerLipSimulator',
    clinicTypes: ['aesthetic', 'plastic_surgery'],
    features: ['Lip augmentation', 'Cheek filler', 'Chin projection', 'Nose filler']
  },
  eye_enhancement: {
    id: 'eye_enhancement',
    name: 'Eye Enhancement Simulator',
    nameTh: 'จำลองการทำตา',
    category: 'face',
    component: 'EyeEnhancementSimulator',
    clinicTypes: ['aesthetic', 'plastic_surgery'],
    features: ['Double eyelid', 'Eye bag removal', 'Brow lift', 'Dark circles']
  },
  treatment_preview: {
    id: 'treatment_preview',
    name: 'AR Treatment Preview',
    nameTh: 'ดูผลลัพธ์ล่วงหน้า',
    category: 'face',
    component: 'ARTreatmentPreview',
    clinicTypes: ['dermatology', 'aesthetic', 'spa'],
    features: ['Before/After', 'Multiple treatments', 'Real-time preview']
  },
  
  // Body
  body_contouring: {
    id: 'body_contouring',
    name: 'Body Contouring Simulator',
    nameTh: 'จำลองการกระชับสัดส่วน',
    category: 'body',
    component: 'BodyContouringSimulator',
    clinicTypes: ['slimming', 'aesthetic', 'spa'],
    features: ['Fat reduction', 'Skin tightening', 'Muscle toning', 'Cellulite']
  },
  
  // Hair
  hair_restoration: {
    id: 'hair_restoration',
    name: 'Hair Restoration Simulator',
    nameTh: 'จำลองการปลูกผม',
    category: 'hair',
    component: 'HairRestorationSimulator',
    clinicTypes: ['hair_clinic', 'aesthetic'],
    features: ['FUE/DHI preview', 'Density simulation', 'Hairline design']
  },
};

/**
 * Get simulators by clinic type
 */
export function getSimulatorsByClinicType(clinicType: string) {
  return Object.values(SIMULATOR_REGISTRY).filter(
    sim => sim.clinicTypes.includes(clinicType)
  );
}

/**
 * Get simulators by category
 */
export function getSimulatorsByCategory(category: 'face' | 'body' | 'hair') {
  return Object.values(SIMULATOR_REGISTRY).filter(
    sim => sim.category === category
  );
}

/**
 * Get all available simulators
 */
export function getAllSimulators() {
  return Object.values(SIMULATOR_REGISTRY);
}
