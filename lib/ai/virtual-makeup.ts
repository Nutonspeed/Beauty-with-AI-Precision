// Virtual Makeup Try-On System
// Allows users to virtually try different makeup products

export interface MakeupProduct {
  id: string;
  name: string;
  category: MakeupCategory;
  brand: string;
  shade: string;
  hex: string;
  finish: 'matte' | 'satin' | 'glossy' | 'shimmer' | 'metallic';
  coverage: 'sheer' | 'medium' | 'full';
  image: string;
  price: number;
}

export type MakeupCategory =
  | 'foundation'
  | 'lipstick'
  | 'eyeshadow'
  | 'blush'
  | 'highlighter'
  | 'eyeliner'
  | 'mascara'
  | 'eyebrow';

export interface FaceLandmarks {
  leftEye: Point[];
  rightEye: Point[];
  nose: Point[];
  mouth: Point[];
  jawline: Point[];
  leftEyebrow: Point[];
  rightEyebrow: Point[];
  leftCheek: Point;
  rightCheek: Point;
}

export interface Point {
  x: number;
  y: number;
}

export interface TryOnResult {
  originalImage: string;
  modifiedImage: string;
  appliedProducts: MakeupProduct[];
  landmarks: FaceLandmarks;
  timestamp: number;
}

export interface MakeupLook {
  id: string;
  name: string;
  description: string;
  products: MakeupProduct[];
  thumbnail: string;
  tags: string[];
}

export class VirtualMakeupTryOn {
  private products: Map<string, MakeupProduct>;
  private looks: Map<string, MakeupLook>;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.products = this.initializeProducts();
    this.looks = this.initializeLooks();
  }

  /**
   * Initialize canvas for makeup application
   */
  initializeCanvas(width: number, height: number): HTMLCanvasElement {
    if (typeof window === 'undefined') {
      throw new Error('Canvas can only be initialized in browser environment');
    }

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    return this.canvas;
  }

  /**
   * Apply makeup to image
   */
  async applyMakeup(
    imageData: string | File,
    products: MakeupProduct[]
  ): Promise<TryOnResult> {
    // Detect face landmarks
    const landmarks = await this.detectFaceLandmarks(imageData);

    if (!landmarks) {
      throw new Error('No face detected in image. Please provide a clear frontal face photo.');
    }

    // Load image
    const image = await this.loadImage(imageData);

    // Initialize canvas if not already done
    if (!this.canvas || !this.ctx) {
      this.initializeCanvas(image.width, image.height);
    }

    // Draw original image
    this.ctx!.drawImage(image, 0, 0);

    // Apply each product
    for (const product of products) {
      await this.applyProduct(product, landmarks);
    }

    // Get modified image
    const modifiedImage = this.canvas!.toDataURL('image/png');

    return {
      originalImage: typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData),
      modifiedImage,
      appliedProducts: products,
      landmarks,
      timestamp: Date.now(),
    };
  }

  /**
   * Apply single makeup product
   */
  private async applyProduct(product: MakeupProduct, landmarks: FaceLandmarks): Promise<void> {
    if (!this.ctx) return;

    switch (product.category) {
      case 'foundation':
        this.applyFoundation(product, landmarks);
        break;
      case 'lipstick':
        this.applyLipstick(product, landmarks);
        break;
      case 'eyeshadow':
        this.applyEyeshadow(product, landmarks);
        break;
      case 'blush':
        this.applyBlush(product, landmarks);
        break;
      case 'highlighter':
        this.applyHighlighter(product, landmarks);
        break;
      case 'eyeliner':
        this.applyEyeliner(product, landmarks);
        break;
      case 'eyebrow':
        this.applyEyebrow(product, landmarks);
        break;
    }
  }

  /**
   * Apply foundation
   */
  private applyFoundation(product: MakeupProduct, landmarks: FaceLandmarks): void {
    if (!this.ctx) return;

    const alpha = product.coverage === 'full' ? 0.6 : product.coverage === 'medium' ? 0.4 : 0.2;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = product.hex;

    // Create face shape path
    this.ctx.beginPath();
    for (const point of landmarks.jawline) {
      this.ctx.lineTo(point.x, point.y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Apply lipstick
   */
  private applyLipstick(product: MakeupProduct, landmarks: FaceLandmarks): void {
    if (!this.ctx) return;

    const alpha = product.finish === 'matte' ? 0.8 : product.finish === 'glossy' ? 0.6 : 0.7;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = product.hex;

    // Draw lips
    this.ctx.beginPath();
    for (const point of landmarks.mouth) {
      this.ctx.lineTo(point.x, point.y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Apply eyeshadow
   */
  private applyEyeshadow(product: MakeupProduct, landmarks: FaceLandmarks): void {
    if (!this.ctx) return;

    const alpha = 0.5;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = product.hex;

    // Apply to left eye
    this.applyEyeshadowToEye(landmarks.leftEye, landmarks.leftEyebrow);

    // Apply to right eye
    this.applyEyeshadowToEye(landmarks.rightEye, landmarks.rightEyebrow);

    this.ctx.restore();
  }

  /**
   * Apply eyeshadow to single eye
   */
  private applyEyeshadowToEye(eye: Point[], eyebrow: Point[]): void {
    if (!this.ctx) return;

    const gradient = this.ctx.createLinearGradient(
      eye[0].x,
      eye[0].y,
      eyebrow[0].x,
      eyebrow[0].y
    );
    
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, this.ctx.fillStyle as string);

    this.ctx.fillStyle = gradient;

    this.ctx.beginPath();
    for (const point of eye) {
      this.ctx.lineTo(point.x, point.y);
    }
    for (let i = eyebrow.length - 1; i >= 0; i--) {
      this.ctx.lineTo(eyebrow[i].x, eyebrow[i].y);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Apply blush
   */
  private applyBlush(product: MakeupProduct, landmarks: FaceLandmarks): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = product.hex;

    // Apply to left cheek
    this.applyBlushToCheck(landmarks.leftCheek);

    // Apply to right cheek
    this.applyBlushToCheck(landmarks.rightCheek);

    this.ctx.restore();
  }

  /**
   * Apply blush to single cheek
   */
  private applyBlushToCheck(cheek: Point): void {
    if (!this.ctx) return;

    const gradient = this.ctx.createRadialGradient(
      cheek.x,
      cheek.y,
      0,
      cheek.x,
      cheek.y,
      40
    );

    gradient.addColorStop(0, this.ctx.fillStyle as string);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(cheek.x - 40, cheek.y - 40, 80, 80);
  }

  /**
   * Apply highlighter
   */
  private applyHighlighter(product: MakeupProduct, landmarks: FaceLandmarks): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.globalAlpha = 0.4;
    this.ctx.fillStyle = product.hex;

    // Highlight cheekbones
    this.applyHighlightToArea(landmarks.leftCheek, 30);
    this.applyHighlightToArea(landmarks.rightCheek, 30);

    // Highlight nose bridge
    if (landmarks.nose.length > 0) {
      const noseBridge = landmarks.nose[Math.floor(landmarks.nose.length / 2)];
      this.applyHighlightToArea(noseBridge, 20);
    }

    this.ctx.restore();
  }

  /**
   * Apply highlight to area
   */
  private applyHighlightToArea(point: Point, radius: number): void {
    if (!this.ctx) return;

    const gradient = this.ctx.createRadialGradient(
      point.x,
      point.y,
      0,
      point.x,
      point.y,
      radius
    );

    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, this.ctx.fillStyle as string);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
  }

  /**
   * Apply eyeliner
   */
  private applyEyeliner(product: MakeupProduct, landmarks: FaceLandmarks): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.strokeStyle = product.hex;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';

    // Apply to left eye
    this.drawEyeliner(landmarks.leftEye);

    // Apply to right eye
    this.drawEyeliner(landmarks.rightEye);

    this.ctx.restore();
  }

  /**
   * Draw eyeliner on single eye
   */
  private drawEyeliner(eye: Point[]): void {
    if (!this.ctx || eye.length === 0) return;

    this.ctx.beginPath();
    this.ctx.moveTo(eye[0].x, eye[0].y);

    for (let i = 1; i < eye.length / 2; i++) {
      this.ctx.lineTo(eye[i].x, eye[i].y);
    }

    this.ctx.stroke();
  }

  /**
   * Apply eyebrow product
   */
  private applyEyebrow(product: MakeupProduct, landmarks: FaceLandmarks): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.strokeStyle = product.hex;
    this.ctx.lineWidth = 1.5;
    this.ctx.lineCap = 'round';

    // Apply to left eyebrow
    this.drawEyebrow(landmarks.leftEyebrow);

    // Apply to right eyebrow
    this.drawEyebrow(landmarks.rightEyebrow);

    this.ctx.restore();
  }

  /**
   * Draw eyebrow
   */
  private drawEyebrow(eyebrow: Point[]): void {
    if (!this.ctx || eyebrow.length === 0) return;

    this.ctx.beginPath();
    this.ctx.moveTo(eyebrow[0].x, eyebrow[0].y);

    for (let i = 1; i < eyebrow.length; i++) {
      this.ctx.lineTo(eyebrow[i].x, eyebrow[i].y);
    }

    this.ctx.stroke();
  }

  /**
   * Detect face landmarks (simulated - in production use TensorFlow.js or backend ML)
   */
  private async detectFaceLandmarks(_imageData: string | File): Promise<FaceLandmarks | null> {
    // Simulate landmark detection
    const width = 640;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;

    // Generate realistic face landmarks
    return {
      leftEye: this.generateEyePoints(centerX - 60, centerY - 40),
      rightEye: this.generateEyePoints(centerX + 60, centerY - 40),
      nose: this.generateNosePoints(centerX, centerY),
      mouth: this.generateMouthPoints(centerX, centerY + 60),
      jawline: this.generateJawlinePoints(centerX, centerY),
      leftEyebrow: this.generateEyebrowPoints(centerX - 60, centerY - 60),
      rightEyebrow: this.generateEyebrowPoints(centerX + 60, centerY - 60),
      leftCheek: { x: centerX - 80, y: centerY + 20 },
      rightCheek: { x: centerX + 80, y: centerY + 20 },
    };
  }

  /**
   * Generate eye landmark points
   */
  private generateEyePoints(centerX: number, centerY: number): Point[] {
    const points: Point[] = [];
    const radiusX = 20;
    const radiusY = 10;

    for (let i = 0; i <= 10; i++) {
      const angle = (Math.PI * i) / 10;
      points.push({
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle),
      });
    }

    return points;
  }

  /**
   * Generate nose landmark points
   */
  private generateNosePoints(centerX: number, centerY: number): Point[] {
    return [
      { x: centerX, y: centerY - 30 },
      { x: centerX, y: centerY },
      { x: centerX - 15, y: centerY + 10 },
      { x: centerX + 15, y: centerY + 10 },
    ];
  }

  /**
   * Generate mouth landmark points
   */
  private generateMouthPoints(centerX: number, centerY: number): Point[] {
    const points: Point[] = [];
    const radiusX = 30;
    const radiusY = 12;

    for (let i = 0; i <= 20; i++) {
      const angle = (Math.PI * i) / 10 - Math.PI / 2;
      points.push({
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle),
      });
    }

    return points;
  }

  /**
   * Generate jawline landmark points
   */
  private generateJawlinePoints(centerX: number, centerY: number): Point[] {
    const points: Point[] = [];
    const radiusX = 100;
    const radiusY = 140;

    for (let i = 0; i <= 20; i++) {
      const angle = (Math.PI * i) / 20 + Math.PI / 4;
      points.push({
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle),
      });
    }

    return points;
  }

  /**
   * Generate eyebrow landmark points
   */
  private generateEyebrowPoints(centerX: number, centerY: number): Point[] {
    return [
      { x: centerX - 30, y: centerY },
      { x: centerX - 15, y: centerY - 5 },
      { x: centerX, y: centerY - 6 },
      { x: centerX + 15, y: centerY - 5 },
      { x: centerX + 30, y: centerY },
    ];
  }

  /**
   * Load image from string or File
   */
  private loadImage(imageData: string | File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = reject;

      if (typeof imageData === 'string') {
        img.src = imageData;
      } else {
        img.src = URL.createObjectURL(imageData);
      }
    });
  }

  /**
   * Get product by ID
   */
  getProduct(productId: string): MakeupProduct | null {
    return this.products.get(productId) || null;
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: MakeupCategory): MakeupProduct[] {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  /**
   * Get all products
   */
  getAllProducts(): MakeupProduct[] {
    return Array.from(this.products.values());
  }

  /**
   * Get makeup look by ID
   */
  getLook(lookId: string): MakeupLook | null {
    return this.looks.get(lookId) || null;
  }

  /**
   * Get all makeup looks
   */
  getAllLooks(): MakeupLook[] {
    return Array.from(this.looks.values());
  }

  /**
   * Initialize makeup products
   */
  private initializeProducts(): Map<string, MakeupProduct> {
    const products = new Map();

    // Foundations
    products.set('found-001', {
      id: 'found-001',
      name: 'Natural Glow Foundation',
      category: 'foundation',
      brand: 'BeautyPro',
      shade: 'Fair',
      hex: '#f5d5c6',
      finish: 'satin',
      coverage: 'medium',
      image: '/images/makeup/foundation-fair.jpg',
      price: 42,
    });

    products.set('found-002', {
      id: 'found-002',
      name: 'Natural Glow Foundation',
      category: 'foundation',
      brand: 'BeautyPro',
      shade: 'Medium',
      hex: '#d4a574',
      finish: 'satin',
      coverage: 'medium',
      image: '/images/makeup/foundation-medium.jpg',
      price: 42,
    });

    // Lipsticks
    products.set('lip-001', {
      id: 'lip-001',
      name: 'Velvet Matte Lipstick',
      category: 'lipstick',
      brand: 'ColorLux',
      shade: 'Rose Pink',
      hex: '#d16a89',
      finish: 'matte',
      coverage: 'full',
      image: '/images/makeup/lipstick-rose.jpg',
      price: 24,
    });

    products.set('lip-002', {
      id: 'lip-002',
      name: 'Glossy Finish Lipstick',
      category: 'lipstick',
      brand: 'ColorLux',
      shade: 'Ruby Red',
      hex: '#b91c1c',
      finish: 'glossy',
      coverage: 'full',
      image: '/images/makeup/lipstick-red.jpg',
      price: 24,
    });

    products.set('lip-003', {
      id: 'lip-003',
      name: 'Nude Collection Lipstick',
      category: 'lipstick',
      brand: 'ColorLux',
      shade: 'Peachy Nude',
      hex: '#e8b4a0',
      finish: 'satin',
      coverage: 'medium',
      image: '/images/makeup/lipstick-nude.jpg',
      price: 24,
    });

    // Eyeshadows
    products.set('eye-001', {
      id: 'eye-001',
      name: 'Shimmer Eyeshadow',
      category: 'eyeshadow',
      brand: 'GlamEyes',
      shade: 'Golden Bronze',
      hex: '#cd7f32',
      finish: 'shimmer',
      coverage: 'medium',
      image: '/images/makeup/eyeshadow-bronze.jpg',
      price: 18,
    });

    products.set('eye-002', {
      id: 'eye-002',
      name: 'Matte Eyeshadow',
      category: 'eyeshadow',
      brand: 'GlamEyes',
      shade: 'Soft Brown',
      hex: '#8b7355',
      finish: 'matte',
      coverage: 'medium',
      image: '/images/makeup/eyeshadow-brown.jpg',
      price: 18,
    });

    // Blushes
    products.set('blush-001', {
      id: 'blush-001',
      name: 'Powder Blush',
      category: 'blush',
      brand: 'RosyGlow',
      shade: 'Peachy Pink',
      hex: '#ffa07a',
      finish: 'satin',
      coverage: 'sheer',
      image: '/images/makeup/blush-peach.jpg',
      price: 26,
    });

    products.set('blush-002', {
      id: 'blush-002',
      name: 'Cream Blush',
      category: 'blush',
      brand: 'RosyGlow',
      shade: 'Coral',
      hex: '#ff7f50',
      finish: 'satin',
      coverage: 'medium',
      image: '/images/makeup/blush-coral.jpg',
      price: 28,
    });

    return products;
  }

  /**
   * Initialize makeup looks
   */
  private initializeLooks(): Map<string, MakeupLook> {
    const looks = new Map();

    looks.set('natural', {
      id: 'natural',
      name: 'Natural Everyday',
      description: 'Fresh, natural look perfect for daily wear',
      products: [
        this.products.get('found-001')!,
        this.products.get('lip-003')!,
        this.products.get('blush-001')!,
      ],
      thumbnail: '/images/looks/natural.jpg',
      tags: ['natural', 'everyday', 'minimal'],
    });

    looks.set('glam', {
      id: 'glam',
      name: 'Evening Glam',
      description: 'Bold, glamorous look for special occasions',
      products: [
        this.products.get('found-002')!,
        this.products.get('lip-002')!,
        this.products.get('eye-001')!,
        this.products.get('blush-002')!,
      ],
      thumbnail: '/images/looks/glam.jpg',
      tags: ['glam', 'evening', 'bold'],
    });

    return looks;
  }
}
