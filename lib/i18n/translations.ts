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
    },
    // Home Page
    home: {
      heroTitle: 'Medical-Grade AI Skin Analysis',
      heroSubtitle: 'for Professional Beauty Clinics',
      heroDescription: '95-99% accuracy AI-powered skin analysis with personalized treatment recommendations and AR visualization',
      startFreeAnalysis: 'Start Free Analysis',
      watchDemo: 'Watch Demo',
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
    // Footer
    footer: {
      description: 'Medical-grade AI skin analysis for professional beauty clinics',
      product: 'Product',
      features: 'Features',
      pricing: 'Pricing',
      tryDemo: 'Try Demo',
      company: 'Company',
      about: 'About',
      contact: 'Contact',
      careers: 'Careers',
      legal: 'Legal',
      privacy: 'Privacy',
      terms: 'Terms',
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
    },
    // Home Page
    home: {
      heroTitle: 'ระบบวิเคราะห์ผิวหน้าด้วย AI ระดับการแพทย์',
      heroSubtitle: 'สำหรับคลินิกความงามมืออาชีพ',
      heroDescription: 'ระบบวิเคราะห์ผิวหน้าด้วย AI ความแม่นยำ 95-99% พร้อมคำแนะนำการรักษาเฉพาะบุคคลและ AR Visualization',
      startFreeAnalysis: 'เริ่มวิเคราะห์ฟรี',
      watchDemo: 'ดูตัวอย่าง',
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
    // Footer
    footer: {
      description: 'ระบบวิเคราะห์ผิวหน้าด้วย AI ระดับการแพทย์สำหรับคลินิกความงามมืออาชีพ',
      product: 'ผลิตภัณฑ์',
      features: 'คุณสมบัติ',
      pricing: 'ราคา',
      tryDemo: 'ทดลองใช้',
      company: 'บริษัท',
      about: 'เกี่ยวกับ',
      contact: 'ติดต่อ',
      careers: 'ร่วมงาน',
      legal: 'กฎหมาย',
      privacy: 'ความเป็นส่วนตัว',
      terms: 'ข้อกำหนด',
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
