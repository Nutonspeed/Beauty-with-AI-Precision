/**
 * AR 3D Product Visualization System
 * 
 * Features:
 * - 360° rotation and interaction
 * - PBR (Physically Based Rendering) materials
 * - Realistic lighting and shadows
 * - Product placement in AR environment
 * - Ingredient/benefit overlays
 * - Interactive hotspots
 */

import * as THREE from 'three';

// Product 3D Model Interface
export interface Product3DModel {
  id: string;
  name: string;
  category: 'serum' | 'cream' | 'mask' | 'device' | 'injection';
  modelUrl?: string; // For custom 3D models (GLTF/GLB)
  thumbnailUrl: string;
  materials: PBRMaterial;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  ingredients: Ingredient[];
  benefits: string[];
  hotspots: Hotspot[];
}

// PBR Material Properties
export interface PBRMaterial {
  baseColor: string; // Hex color
  metallic: number; // 0-1
  roughness: number; // 0-1
  normalMapUrl?: string;
  roughnessMapUrl?: string;
  metalnessMapUrl?: string;
  aoMapUrl?: string; // Ambient Occlusion
  emissive?: string; // Emissive color for glowing effects
  emissiveIntensity?: number;
  opacity?: number; // For transparent materials
  clearcoat?: number; // For glossy finish (0-1)
  clearcoatRoughness?: number;
}

// Product Ingredient
export interface Ingredient {
  name: string;
  nameThai: string;
  concentration?: string;
  benefits: string[];
  position: THREE.Vector3; // Position for overlay
}

// Interactive Hotspot
export interface Hotspot {
  id: string;
  position: THREE.Vector3;
  label: string;
  description: string;
  type: 'ingredient' | 'benefit' | 'usage' | 'caution';
}

// AR Placement Configuration
export interface ARPlacement {
  surface: 'horizontal' | 'vertical' | 'face';
  scale: number; // Relative to real-world size
  shadowIntensity: number;
  environmentLighting: boolean;
}

/**
 * Product 3D Model Manager
 */
export class Product3DManager {
  private readonly products: Map<string, Product3DModel> = new Map();
  
  constructor() {
    this.initializeProductCatalog();
  }
  
  /**
   * Initialize product catalog with Thai beauty products
   */
  private initializeProductCatalog(): void {
    // Vitamin C Serum
    this.products.set('vitamin-c-serum', {
      id: 'vitamin-c-serum',
      name: 'Vitamin C Brightening Serum',
      category: 'serum',
      thumbnailUrl: '/products/vitamin-c-serum.jpg',
      materials: {
        baseColor: '#FFF8E7',
        metallic: 0.1,
        roughness: 0.3,
        opacity: 0.8,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        emissive: '#FFE5B4',
        emissiveIntensity: 0.1,
      },
      dimensions: {
        width: 0.03, // 3cm
        height: 0.12, // 12cm
        depth: 0.03,
      },
      ingredients: [
        {
          name: 'Vitamin C (L-Ascorbic Acid)',
          nameThai: 'วิตามินซี',
          concentration: '15%',
          benefits: ['ลดฝ้ากระ', 'เพิ่มความกระจ่างใส', 'กระตุ้นคอลลาเจน'],
          position: new THREE.Vector3(0, 0.05, 0),
        },
        {
          name: 'Hyaluronic Acid',
          nameThai: 'ไฮยาลูรอนิก',
          concentration: '2%',
          benefits: ['เติมความชุ่มชื้น', 'ลดริ้วรอย', 'เพิ่มความยืดหยุ่น'],
          position: new THREE.Vector3(0, 0.02, 0),
        },
        {
          name: 'Niacinamide',
          nameThai: 'ไนอาซินาไมด์',
          concentration: '5%',
          benefits: ['ลดรูขุมขน', 'ควบคุมความมัน', 'ลดจุดด่างดำ'],
          position: new THREE.Vector3(0, -0.02, 0),
        },
      ],
      benefits: [
        'ลดฝ้ากระ จุดด่างดำ',
        'เพิ่มความกระจ่างใส',
        'กระตุ้นการสร้างคอลลาเจน',
        'ลดริ้วรอยก่อนวัย',
      ],
      hotspots: [
        {
          id: 'hs-1',
          position: new THREE.Vector3(0, 0.06, 0),
          label: 'Vitamin C 15%',
          description: 'เข้มข้นสูงช่วยลดฝ้ากระได้อย่างมีประสิทธิภาพ',
          type: 'ingredient',
        },
        {
          id: 'hs-2',
          position: new THREE.Vector3(0, 0, 0),
          label: 'วิธีใช้',
          description: 'ใช้เช้า-เย็น หลังทำความสะอาดผิว ก่อนครีมบำรุง',
          type: 'usage',
        },
      ],
    });
    
    // Retinol Night Cream
    this.products.set('retinol-cream', {
      id: 'retinol-cream',
      name: 'Retinol Night Repair Cream',
      category: 'cream',
      thumbnailUrl: '/products/retinol-cream.jpg',
      materials: {
        baseColor: '#FFFAF0',
        metallic: 0.05,
        roughness: 0.6,
        opacity: 1,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
      },
      dimensions: {
        width: 0.05,
        height: 0.04,
        depth: 0.05,
      },
      ingredients: [
        {
          name: 'Retinol',
          nameThai: 'เรตินอล',
          concentration: '0.5%',
          benefits: ['ลดริ้วรอย', 'เร่งการฟื้นฟูผิว', 'ลดสิว'],
          position: new THREE.Vector3(0, 0.01, 0),
        },
        {
          name: 'Peptides Complex',
          nameThai: 'เพปไทด์',
          concentration: '3%',
          benefits: ['กระชับผิว', 'เพิ่มความยืดหยุ่น', 'ต่อต้านริ้วรอย'],
          position: new THREE.Vector3(0, 0, 0),
        },
      ],
      benefits: [
        'ลดริ้วรอยชัดเจน',
        'เร่งการผลัดเซลล์ผิว',
        'กระชับรูขุมขน',
        'ผิวเรียบเนียนยิ่งขึ้น',
      ],
      hotspots: [
        {
          id: 'hs-1',
          position: new THREE.Vector3(0, 0.02, 0),
          label: 'Retinol 0.5%',
          description: 'เข้มข้นที่เหมาะสมสำหรับผู้เริ่มใช้',
          type: 'ingredient',
        },
        {
          id: 'hs-2',
          position: new THREE.Vector3(0, -0.01, 0),
          label: '⚠️ ข้อควรระวัง',
          description: 'ใช้เฉพาะตอนกลางคืน หลีกเลี่ยงแสงแดด',
          type: 'caution',
        },
      ],
    });
    
    // Pico Laser Device (Simulated)
    this.products.set('pico-device', {
      id: 'pico-device',
      name: 'Pico Laser Handpiece',
      category: 'device',
      thumbnailUrl: '/products/pico-device.jpg',
      materials: {
        baseColor: '#E8E8E8',
        metallic: 0.9,
        roughness: 0.15,
        normalMapUrl: '/textures/metal-normal.jpg',
        metalnessMapUrl: '/textures/metal-metalness.jpg',
        aoMapUrl: '/textures/metal-ao.jpg',
      },
      dimensions: {
        width: 0.04,
        height: 0.15,
        depth: 0.04,
      },
      ingredients: [], // Device, not skincare
      benefits: [
        'ลดฝ้ากระ จุดด่างดำ',
        'กระตุ้นคอลลาเจน',
        'ผิวกระจ่างใส',
        'ไม่มีดาวน์ไทม์',
      ],
      hotspots: [
        {
          id: 'hs-1',
          position: new THREE.Vector3(0, 0.05, 0),
          label: 'Laser Tip',
          description: 'หัวเลเซอร์ Pico ความยาวคลื่น 755nm',
          type: 'benefit',
        },
        {
          id: 'hs-2',
          position: new THREE.Vector3(0, -0.05, 0),
          label: 'FDA Approved',
          description: 'ได้รับการรับรองจาก FDA ปลอดภัย',
          type: 'benefit',
        },
      ],
    });
    
    // Botox Syringe
    this.products.set('botox-syringe', {
      id: 'botox-syringe',
      name: 'Botulinum Toxin Type A',
      category: 'injection',
      thumbnailUrl: '/products/botox.jpg',
      materials: {
        baseColor: '#F0F0F0',
        metallic: 0.7,
        roughness: 0.2,
        opacity: 0.9,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
      },
      dimensions: {
        width: 0.01,
        height: 0.08,
        depth: 0.01,
      },
      ingredients: [
        {
          name: 'Botulinum Toxin Type A',
          nameThai: 'โบทูลินั่ม ท็อกซิน',
          concentration: '100 Units',
          benefits: ['ลดริ้วรอย', 'ยกกระชับ', 'ลดกราม'],
          position: new THREE.Vector3(0, 0.02, 0),
        },
      ],
      benefits: [
        'ลดริ้วรอยหน้าผาก',
        'ยกคิ้ว',
        'ลดริ้วรอยหางตา',
        'ผลลัพธ์เป็นธรรมชาติ',
      ],
      hotspots: [
        {
          id: 'hs-1',
          position: new THREE.Vector3(0, 0.04, 0),
          label: 'โบท็อกซ์ของแท้',
          description: 'นำเข้าจากต่างประเทศ ได้รับรองจาก FDA',
          type: 'benefit',
        },
        {
          id: 'hs-2',
          position: new THREE.Vector3(0, -0.02, 0),
          label: '⚠️ แพทย์เท่านั้น',
          description: 'ต้องฉีดโดยแพทย์ผู้เชี่ยวชาญเท่านั้น',
          type: 'caution',
        },
      ],
    });
  }
  
  /**
   * Get product by ID
   */
  getProduct(id: string): Product3DModel | undefined {
    return this.products.get(id);
  }
  
  /**
   * Get all products
   */
  getAllProducts(): Product3DModel[] {
    return Array.from(this.products.values());
  }
  
  /**
   * Get products by category
   */
  getProductsByCategory(category: Product3DModel['category']): Product3DModel[] {
    return this.getAllProducts().filter(p => p.category === category);
  }
  
  /**
   * Search products
   */
  searchProducts(query: string): Product3DModel[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllProducts().filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.ingredients.some(i => 
        i.name.toLowerCase().includes(lowerQuery) ||
        i.nameThai.includes(query)
      )
    );
  }
}

/**
 * 3D Model Generator
 * Creates procedural 3D models for products
 */
export class Product3DModelGenerator {
  /**
   * Create bottle geometry (for serums, creams)
   */
  static createBottleGeometry(dimensions: Product3DModel['dimensions']): THREE.BufferGeometry {
    const { width, height } = dimensions;
    
    // Create bottle body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(
      width / 2,  // radiusTop
      width / 2,  // radiusBottom
      height * 0.7, // height
      32 // radialSegments
    );
    
    // Create bottle cap (smaller cylinder)
    const capGeometry = new THREE.CylinderGeometry(
      width / 3,
      width / 3,
      height * 0.15,
      32
    );
    capGeometry.translate(0, height * 0.425, 0);
    
    // Merge geometries
    const mergedGeometry = new THREE.BufferGeometry();
    const bodyPositions = bodyGeometry.attributes.position;
    const capPositions = capGeometry.attributes.position;
    
    const totalVertices = bodyPositions.count + capPositions.count;
    const positions = new Float32Array(totalVertices * 3);
    
    for (let i = 0; i < bodyPositions.count; i++) {
      positions[i * 3] = bodyPositions.getX(i);
      positions[i * 3 + 1] = bodyPositions.getY(i);
      positions[i * 3 + 2] = bodyPositions.getZ(i);
    }
    
    for (let i = 0; i < capPositions.count; i++) {
      const offset = bodyPositions.count + i;
      positions[offset * 3] = capPositions.getX(i);
      positions[offset * 3 + 1] = capPositions.getY(i);
      positions[offset * 3 + 2] = capPositions.getZ(i);
    }
    
    mergedGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    mergedGeometry.computeVertexNormals();
    
    return mergedGeometry;
  }
  
  /**
   * Create jar geometry (for creams)
   */
  static createJarGeometry(dimensions: Product3DModel['dimensions']): THREE.BufferGeometry {
    const { width, height } = dimensions;
    
    // Main jar body
    const geometry = new THREE.CylinderGeometry(
      width / 2,
      width / 2,
      height,
      32
    );
    
    return geometry;
  }
  
  /**
   * Create syringe geometry
   */
  static createSyringeGeometry(dimensions: Product3DModel['dimensions']): THREE.BufferGeometry {
    const { width, height } = dimensions;
    
    // Barrel (cylinder)
    const barrel = new THREE.CylinderGeometry(
      width / 2,
      width / 2,
      height * 0.6,
      16
    );
    
    // Plunger (thin cylinder)
    const plunger = new THREE.CylinderGeometry(
      width / 4,
      width / 4,
      height * 0.3,
      16
    );
    plunger.translate(0, height * 0.45, 0);
    
    // Needle (cone)
    const needle = new THREE.ConeGeometry(
      width / 8,
      height * 0.2,
      16
    );
    needle.rotateX(Math.PI);
    needle.translate(0, -height * 0.4, 0);
    
    // Return barrel for now (could merge geometries if needed)
    return barrel;
  }
  
  /**
   * Create PBR material from product material definition
   */
  static createPBRMaterial(materialDef: PBRMaterial): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color: materialDef.baseColor,
      metalness: materialDef.metallic,
      roughness: materialDef.roughness,
      transparent: (materialDef.opacity || 1) < 1,
      opacity: materialDef.opacity || 1,
    });
    
    // Load texture maps if available
    const textureLoader = new THREE.TextureLoader();
    
    if (materialDef.normalMapUrl) {
      material.normalMap = textureLoader.load(materialDef.normalMapUrl);
    }
    
    if (materialDef.roughnessMapUrl) {
      material.roughnessMap = textureLoader.load(materialDef.roughnessMapUrl);
    }
    
    if (materialDef.metalnessMapUrl) {
      material.metalnessMap = textureLoader.load(materialDef.metalnessMapUrl);
    }
    
    if (materialDef.aoMapUrl) {
      material.aoMap = textureLoader.load(materialDef.aoMapUrl);
    }
    
    if (materialDef.emissive) {
      material.emissive = new THREE.Color(materialDef.emissive);
      material.emissiveIntensity = materialDef.emissiveIntensity || 1;
    }
    
    return material;
  }
}

/**
 * AR Environment Lighting
 */
export class AREnvironmentLighting {
  /**
   * Create realistic lighting setup for product visualization
   */
  static createLightingRig(): THREE.Group {
    const lightGroup = new THREE.Group();
    
    // Key light (main light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    lightGroup.add(keyLight);
    
    // Fill light (softer, opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-5, 3, -3);
    lightGroup.add(fillLight);
    
    // Back light (rim lighting)
    const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
    backLight.position.set(0, 5, -5);
    lightGroup.add(backLight);
    
    // Ambient light (overall illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    lightGroup.add(ambientLight);
    
    // Hemisphere light (sky + ground)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    hemiLight.position.set(0, 20, 0);
    lightGroup.add(hemiLight);
    
    return lightGroup;
  }
  
  /**
   * Create environment map for reflections
   */
  static createEnvironmentMap(): THREE.CubeTexture | null {
    // For now, return null - would load HDR environment in production
    return null;
  }
}

/**
 * Singleton instance
 */
let managerInstance: Product3DManager | null = null;

export function getProduct3DManager(): Product3DManager {
  managerInstance ??= new Product3DManager();
  return managerInstance;
}
