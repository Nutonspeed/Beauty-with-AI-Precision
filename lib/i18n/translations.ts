// Translations for the application
export type Language = 'en' | 'th'

export const translations = {
  en: {
    // Header
    brand: 'AI Beauty Platform',
    // Navigation
    nav: {
      analysis: 'Skin Analysis',
      arSimulator: 'AR Simulator',
      booking: 'Book Appointment',
      dashboard: 'Dashboard',
      customers: 'Customers',
      analytics: 'Analytics',
      leads: 'Leads',
      proposals: 'Proposals',
      tenants: 'Clinic Management',
      users: 'User Management',
      settings: 'Settings',
      admin: 'Admin Panel',
      demo: 'Demo',
      salesNarrative: 'Sales Narrative',
    },
    // Common
    common: {
      login: 'Sign In',
      logout: 'Sign Out',
      getStarted: 'Get Started',
      profile: 'Profile',
      language: 'Language',
      notifications: 'Notifications',
      switchClinic: 'Switch Clinic',
      startAnalysis: 'Start Analysis',
      viewFullSystem: 'View Full Clinic System',
      status: {
        initializing: 'INITIALIZING',
        scanningBaseline: 'SCANNING FACIAL BASELINE',
      },
      messages: {
        webglFallback: 'WebGL not available – showing optimized static preview.',
      },
    },
    // Home Page
    home: {
      heroTitle: 'AI for Clinics that Actually Converts',
      heroSubtitle: 'From analysis to recommendations to revenue',
      heroDescription: 'Evidence‑based AI skin analysis connected to your sales workflow — improve conversion and customer trust with medical‑grade insights and AR visualization.',
      startFreeAnalysis: 'Start Free Analysis',
      watchDemo: 'See Interactive Demo',
      noCreditCard: 'No credit card required',
      freeTierAvailable: 'Free tier available',
      whyChooseTitle: 'Why Choose Our Platform',
      whyChooseSubtitle: 'Professional-grade tools designed specifically for beauty clinics and dermatologists',
      features: {
        aiPowered: {
          title: 'AI-Powered Analysis',
          description: '8-point comprehensive skin analysis with 95-99% medical-grade accuracy',
        },
        arVisualization: {
          title: 'AR Visualization',
          description: 'Real-time AR preview of treatment results before actual procedures',
        },
        pdpaCompliant: {
          title: 'PDPA Compliant',
          description: 'Secure, encrypted data management following Thai personal data protection laws',
        },
        visiaStyle: {
          title: 'VISIA-Style Dashboard',
          description: 'Professional reporting comparable to million-dollar VISIA equipment',
        },
        fastAccurate: {
          title: 'Fast & Accurate',
          description: 'Complete analysis in 3-5 seconds with personalized recommendations',
        },
        multiClinic: {
          title: 'Multi-Clinic Support',
          description: 'Multi-branch support with integrated CRM and appointment system',
        },
      },
      howItWorks: {
        title: 'How It Works',
        subtitle: 'Simple 3-step process to get professional skin analysis',
        step1: {
          title: 'Upload Photo',
          description: 'Capture or upload facial photo\nSupports all devices',
        },
        step2: {
          title: 'AI Analysis',
          description: '8-point AI skin analysis\nCompletes in 3-5 seconds',
        },
        step3: {
          title: 'Get Results',
          description: 'Receive detailed report and recommendations\nwith AR Visualization',
        },
      },
      cta: {
        title: 'Ready to Transform Your Clinic?',
        description: 'Start today with no credit card required',
        startFreeAnalysis: 'Start Free Analysis',
        contactSales: 'Contact Sales',
      },
      pricing: {
        title: 'Simple Pricing',
        subtitle: 'Choose the plan that fits your clinic needs',
        freeTier: {
          badge: 'Free Tier',
          title: 'Free Analysis',
          description: 'Try for free, no registration required',
          price: '฿0',
          period: 'per analysis',
          features: [
            '85-90% accuracy',
            'Basic 8-point analysis',
            'Top 3 concerns only',
            'Generic recommendations',
          ],
          cta: 'Try Free',
        },
        premium: {
          badge: 'Premium Tier',
          title: 'Medical-Grade',
          description: 'For clinics and hospitals',
          price: '฿30,000',
          period: 'per month',
          features: [
            '95-99% medical-grade accuracy',
            'Complete comprehensive analysis',
            'HITL validation by experts',
            'Personalized treatment plans',
            'AR visualization',
            'CRM & booking system',
          ],
          cta: 'Contact Sales',
        },
      },
    },
    badges: {
      iso: { label: 'ISO 13485', tooltip: 'Medical device quality management' },
      ethics: { label: 'AI Ethics', tooltip: 'Meets AI ethics criteria' },
      secure: { label: 'Secure Data', tooltip: 'Encrypted and segmented data' },
    },
    trust: {
      metrics: {
        clarity: 'Clarity',
        hydration: 'Hydration',
        risk: 'Risk',
      },
      microLines: [
        'We analyze only transformed embeddings, never store raw facial images.',
        'Realtime integrity self-test passes every 5 minutes.',
        'Your personalization settings stay local to this session.',
      ],
    },
    timeline: {
      capture: 'CAPTURE',
      gallery: 'GALLERY',
      title: 'SESSION SNAPSHOTS',
      close: 'CLOSE',
      empty: 'No snapshots yet.',
      persona: 'Persona',
      adaptiveReduced: 'Reduced Effects',
      adaptiveFull: 'Full Fidelity',
      lowPerfTooltip: 'Low perf adaptive',
      stagePrefix: '',
      atTime: 'captured at',
    },
    outcome: {
      toggleShow: 'OUTCOME',
      toggleHide: 'HIDE',
      captureBaseline: 'CAPTURE BASELINE',
      baselineReady: 'BASELINE READY',
      modes: {
        clarity: 'CLARITY',
        firming: 'FIRMING',
        hydration: 'HYDRATION',
      },
      intensity: 'INTENSITY',
      before: 'BEFORE',
      afterProjected: 'AFTER (PROJECTED)',
      footer: 'SIMULATION ONLY • DOES NOT STORE RAW IMAGE',
      needBaseline: 'Capture a baseline to generate a projected improvement preview.',
    },
    clinic: {
      steps: [
        {
          eyebrow: 'STEP 01',
          title: 'Precision AI Halo',
          body:
            'HALO renders real-time skin analysis with a volumetric scan beam to reveal subtle patterns without visual clutter.',
        },
        {
          eyebrow: 'STEP 02',
          title: 'Volumetric Scan',
          body:
            'A paced vertical scan communicates genuine data capture, enhancing perceived credibility for premium clinical experiences.',
        },
        {
          eyebrow: 'STEP 03',
          title: 'Adaptive Protocol',
          body:
            'AI-driven treatment protocol adapts live; user sliders for sensitivity/intensity instantly reflect via HALO feedback.',
        },
        {
          eyebrow: 'STEP 04',
          title: 'Outcome Forecast',
          body:
            'Forecast 30 / 60 / 90 day outcomes with confidence levels and percentile vs reference cohorts.',
        },
      ],
    },
    perf: {
      fps: 'FPS',
      frame: 'FRAME',
      mem: 'MEM',
      statusAdaptive: 'ADAPTIVE QUALITY',
      statusStable: 'STABLE',
    },
    persona: {
      title: 'PERSONALIZE',
      tone: 'Skin Tone',
      sensitivity: 'Sensitivity',
      goal: 'Goal',
      options: {
        tone: { cool: 'Cool', neutral: 'Neutral', warm: 'Warm' },
        sensitivity: { low: 'Low', medium: 'Medium', high: 'High' },
        goal: { rejuvenate: 'Rejuvenate', firming: 'Firming', clarity: 'Clarity' },
      },
    },
    consent: {
      title: 'ANALYTICS CONSENT',
      description: 'We collect aggregate interaction metrics only (no photos / PII). Allow logging?',
      allow: 'ALLOW',
      decline: 'DECLINE',
    },
    // Footer
    footer: {
      description: 'Medical-grade AI skin analysis for professional beauty clinics',
      product: 'Product',
      features: 'Features',
      pricing: 'Pricing',
      faq: 'FAQ',
      tryDemo: 'Try Demo',
      company: 'Company',
      caseStudies: 'Case Studies',
      about: 'About',
      contact: 'Contact',
      careers: 'Careers',
      legal: 'Legal',
      privacy: 'Privacy',
      terms: 'Terms',
      compliance: 'Compliance',
      pdpa: 'PDPA',
      copyright: '© 2025 AI Beauty Platform. All rights reserved.',
    },
    // Roles
    roles: {
      customer: 'Customer',
      clinic_owner: 'Clinic Owner',
      sales_staff: 'Sales Staff',
      super_admin: 'Super Admin',
    },
  },
  th: {
    // Header
    brand: 'AI Beauty Platform',
    // Navigation
    nav: {
      analysis: 'วิเคราะห์ผิวหน้า',
      arSimulator: 'AR Simulator',
      booking: 'จองนัดหมาย',
      dashboard: 'แดชบอร์ด',
      customers: 'ลูกค้า',
      analytics: 'การวิเคราะห์',
      leads: 'ลูกค้าเป้าหมาย',
      proposals: 'ข้อเสนอ',
      tenants: 'จัดการคลินิก',
      users: 'จัดการผู้ใช้',
      settings: 'ตั้งค่า',
      admin: 'ผู้ดูแลระบบ',
      demo: 'เดโม',
      salesNarrative: 'สรุปคุณค่าทางธุรกิจ',
    },
    // Common
    common: {
      login: 'เข้าสู่ระบบ',
      logout: 'ออกจากระบบ',
      getStarted: 'เริ่มต้น',
      profile: 'โปรไฟล์',
      language: 'ภาษา',
      notifications: 'การแจ้งเตือน',
      switchClinic: 'เปลี่ยนคลินิก',
      startAnalysis: 'เริ่มวิเคราะห์',
      viewFullSystem: 'ดูระบบคลินิกเต็ม',
      status: {
        initializing: 'กำลังเริ่มระบบ',
        scanningBaseline: 'กำลังสแกนค่าพื้นฐานผิว',
      },
      messages: {
        webglFallback: 'อุปกรณ์นี้ไม่รองรับ WebGL – แสดงภาพตัวอย่างแบบปรับแต่งแทน',
      },
    },
    // Home Page
    home: {
      heroTitle: 'AI เพื่อคลินิก ที่ “ปิดการขาย” ได้จริง',
      heroSubtitle: 'จากการวิเคราะห์ → แนะนำ → สู่รายได้ ในที่เดียว',
      heroDescription: 'วิเคราะห์ผิวที่พิสูจน์ได้ เชื่อมต่อเวิร์กโฟลว์การขาย เพื่อเพิ่ม Conversion และความเชื่อมั่น ด้วยข้อมูลระดับการแพทย์และ AR Visualization',
      startFreeAnalysis: 'เริ่มวิเคราะห์ฟรี',
      watchDemo: 'ดูเดโมแบบโต้ตอบ',
      noCreditCard: 'ไม่ต้องใช้บัตรเครดิต',
      freeTierAvailable: 'มีแพ็กเกจฟรี',
      whyChooseTitle: 'ทำไมต้องเลือกเรา',
      whyChooseSubtitle: 'เครื่องมือระดับมืออาชีพที่ออกแบบมาเฉพาะสำหรับคลินิกความงามและแพทย์ผิวหนัง',
      features: {
        aiPowered: {
          title: 'AI-Powered Analysis',
          description: 'วิเคราะห์ผิวหน้า 8 จุดด้วย AI ความแม่นยำ 95-99% รองรับผิวคนไทย',
        },
        arVisualization: {
          title: 'AR Visualization',
          description: 'แสดงผลการรักษาแบบ Real-time AR ให้ลูกค้าเห็นภาพก่อนทำจริง',
        },
        pdpaCompliant: {
          title: 'PDPA Compliant',
          description: 'ปลอดภัย เข้ารหัสข้อมูล ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล',
        },
        visiaStyle: {
          title: 'VISIA-Style Dashboard',
          description: 'รายงานผลแบบมืออาชีพ เหมือนเครื่อง VISIA ราคาหลักล้าน',
        },
        fastAccurate: {
          title: 'Fast & Accurate',
          description: 'วิเคราะห์เสร็จภายใน 3-5 วินาที พร้อมคำแนะนำเฉพาะบุคคล',
        },
        multiClinic: {
          title: 'Multi-Clinic Support',
          description: 'รองรับหลายสาขา จัดการลูกค้า CRM และระบบนัดหมาย',
        },
      },
      howItWorks: {
        title: 'วิธีการใช้งาน',
        subtitle: 'ขั้นตอนง่าย ๆ 3 ขั้นตอน เพื่อรับการวิเคราะห์ผิวหน้าแบบมืออาชีพ',
        step1: {
          title: 'อัปโหลดภาพ',
          description: 'ถ่ายหรืออัปโหลดภาพใบหน้า\nระบบรองรับทุกอุปกรณ์',
        },
        step2: {
          title: 'AI Analysis',
          description: 'AI วิเคราะห์ผิวหน้า 8 จุด\nภายใน 3-5 วินาที',
        },
        step3: {
          title: 'รับผลลัพธ์',
          description: 'รับรายงานผลและคำแนะนำ\nพร้อม AR Visualization',
        },
      },
      cta: {
        title: 'พร้อมยกระดับคลินิกของคุณแล้วหรือยัง',
        description: 'เริ่มต้นฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต',
        startFreeAnalysis: 'เริ่มวิเคราะห์ฟรี',
        contactSales: 'ติดต่อฝ่ายขาย',
      },
      pricing: {
        title: 'ราคาที่เหมาะสม',
        subtitle: 'เลือกแพ็กเกจที่เหมาะกับคลินิกของคุณ',
        freeTier: {
          badge: 'Free Tier',
          title: 'Free Analysis',
          description: 'ทดลองใช้ฟรี ไม่ต้องสมัครสมาชิก',
          price: '฿0',
          period: 'ต่อการวิเคราะห์',
          features: [
            'ความแม่นยำ 85-90%',
            'วิเคราะห์ 8 จุดพื้นฐาน',
            'แสดง 3 ปัญหาหลัก',
            'คำแนะนำทั่วไป',
          ],
          cta: 'ทดลองฟรี',
        },
        premium: {
          badge: 'Premium Tier',
          title: 'Medical-Grade',
          description: 'สำหรับคลินิกและโรงพยาบาล',
          price: '฿30,000',
          period: 'ต่อเดือน',
          features: [
            'ความแม่นยำระดับการแพทย์ 95-99%',
            'วิเคราะห์ครบทุกมิติ',
            'ตรวจสอบโดยผู้เชี่ยวชาญ',
            'แผนการรักษาเฉพาะบุคคล',
            'แสดงผล AR',
            'ระบบ CRM และนัดหมาย',
          ],
          cta: 'ติดต่อฝ่ายขาย',
        },
      },
    },
    badges: {
      iso: { label: 'ISO 13485', tooltip: 'มาตรฐานระบบเครื่องมือแพทย์' },
      ethics: { label: 'AI Ethics', tooltip: 'ผ่านเกณฑ์จริยธรรม AI' },
      secure: { label: 'Secure Data', tooltip: 'ข้อมูลถูกเข้ารหัสและแยกส่วน' },
    },
    trust: {
      metrics: {
        clarity: 'ความใส',
        hydration: 'ความชุ่มชื้น',
        risk: 'ความเสี่ยง',
      },
      microLines: [
        'ระบบวิเคราะห์เฉพาะข้อมูลที่แปลงแล้ว ไม่บันทึกภาพใบหน้าดิบ',
        'ตรวจสอบความสมบูรณ์ของระบบอัตโนมัติทุก 5 นาที',
        'การปรับแต่งส่วนบุคคลถูกเก็บเฉพาะในเซสชันนี้',
      ],
    },
    timeline: {
      capture: 'บันทึก',
      gallery: 'แกลเลอรี',
      title: 'ภาพบันทึกในเซสชัน',
      close: 'ปิด',
      empty: 'ยังไม่มีภาพบันทึก',
      persona: 'บุคลิกภาพ',
      adaptiveReduced: 'ลดเอฟเฟกต์',
      adaptiveFull: 'รายละเอียดเต็ม',
      lowPerfTooltip: 'โหมดปรับตามประสิทธิภาพ',
      stagePrefix: '',
      atTime: 'เวลา',
    },
    outcome: {
      toggleShow: 'คาดการณ์ผลลัพธ์',
      toggleHide: 'ซ่อน',
      captureBaseline: 'บันทึกค่าพื้นฐาน',
      baselineReady: 'มีค่าพื้นฐานแล้ว',
      modes: {
        clarity: 'ความใส',
        firming: 'ความกระชับ',
        hydration: 'ความชุ่มชื้น',
      },
      intensity: 'ความเข้ม',
      before: 'ก่อน',
      afterProjected: 'หลัง (คาดการณ์)',
      footer: 'เพื่อการจำลองเท่านั้น • ไม่เก็บภาพจริง',
      needBaseline: 'บันทึกค่าพื้นฐานเพื่อสร้างภาพคาดการณ์การปรับปรุง',
    },
    clinic: {
      steps: [
        {
          eyebrow: 'STEP 01',
          title: 'Precision AI Halo',
          body:
            'ระบบ HALO แสดงการวิเคราะห์ผิวแบบเรียลไทม์ พร้อม volumetric beam สแกนสภาพชั้นผิวเพื่อให้แพทย์เห็น pattern ความผิดปกติอย่างนุ่มนวล ไม่รกตา',
        },
        {
          eyebrow: 'STEP 02',
          title: 'Volumetric Scan',
          body:
            'แสงสแกนแนวตั้งเลื่อนเป็นจังหวะ ทำให้ผู้ใช้เข้าใจว่ามีการจับข้อมูลจริง ไม่ใช่อนิเมชันลอยๆ เพิ่มความน่าเชื่อถือระดับคลินิกพรีเมียม',
        },
        {
          eyebrow: 'STEP 03',
          title: 'Adaptive Protocol',
          body:
            'โปรโตคอลการรักษาที่ปรับอัตโนมัติด้วยโมเดล AI ให้ลูกค้าปรับสไลเดอร์ ความไว/ความเข้มข้น แล้ว HALO เปลี่ยนสีตอบสนองทันที',
        },
        {
          eyebrow: 'STEP 04',
          title: 'Outcome Forecast',
          body:
            'คาดการณ์ผลลัพธ์หลังการรักษา 30 / 60 / 90 วัน พร้อมระดับความเชื่อมั่น และ percentile เทียบกลุ่มอ้างอิง',
        },
      ],
    },
    perf: {
      fps: 'FPS',
      frame: 'เวลาเฟรม',
      mem: 'หน่วยความจำ',
      statusAdaptive: 'ปรับคุณภาพอัตโนมัติ',
      statusStable: 'เสถียร',
    },
    persona: {
      title: 'ปรับให้เหมาะกับคุณ',
      tone: 'โทนผิว',
      sensitivity: 'ความไวผิว',
      goal: 'เป้าหมาย',
      options: {
        tone: { cool: 'โทนเย็น', neutral: 'กลาง', warm: 'โทนร้อน' },
        sensitivity: { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง' },
        goal: { rejuvenate: 'ฟื้นฟู', firming: 'ยกกระชับ', clarity: 'ความใส' },
      },
    },
    consent: {
      title: 'การยินยอมการวิเคราะห์',
      description: 'เราบันทึกเฉพาะสถิติการใช้งานรวม (ไม่มีรูป/ข้อมูลส่วนบุคคล) อนุญาตหรือไม่?',
      allow: 'อนุญาต',
      decline: 'ปฏิเสธ',
    },
    // Footer
    footer: {
      description: 'ระบบวิเคราะห์ผิวหน้าด้วย AI ระดับการแพทย์สำหรับคลินิกความงามมืออาชีพ',
      product: 'ผลิตภัณฑ์',
      features: 'คุณสมบัติ',
      pricing: 'ราคา',
      faq: 'คำถามที่พบบ่อย',
      tryDemo: 'ทดลองใช้',
      company: 'บริษัท',
      caseStudies: 'กรณีศึกษา',
      about: 'เกี่ยวกับ',
      contact: 'ติดต่อ',
      careers: 'ร่วมงาน',
      legal: 'กฎหมาย',
      privacy: 'ความเป็นส่วนตัว',
      terms: 'ข้อกำหนด',
      compliance: 'การปฏิบัติตามข้อกำหนด',
      pdpa: 'พ.ร.บ.คุ้มครองข้อมูล',
      copyright: '© 2025 AI Beauty Platform สงวนลิขสิทธิ์',
    },
    // Roles
    roles: {
      customer: 'ลูกค้า',
      clinic_owner: 'เจ้าของคลินิก',
      sales_staff: 'พนักงานขาย',
      super_admin: 'ผู้ดูแลระบบสูงสุด',
    },
  },
} as const

export type TranslationKey = keyof typeof translations.en
