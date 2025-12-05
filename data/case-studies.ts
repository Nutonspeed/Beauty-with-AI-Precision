export type Locale = 'th' | 'en' | 'zh';

export interface CaseStudyMetric {
  label: Record<Locale, string>;
  value: string;
}

export interface CaseStudyContent {
  heading: Record<Locale, string>;
  body: Record<Locale, string>;
}

export interface CaseStudy {
  slug: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  metrics: CaseStudyMetric[];
  content: CaseStudyContent[];
  disclaimer?: Record<Locale, string>;
}

export interface LocalizedCaseStudy {
  slug: string;
  title: string;
  summary: string;
  metrics: { label: string; value: string }[];
}

const caseStudies: CaseStudy[] = [
  {
    slug: 'ai-skin-insights',
    title: {
      th: 'AI วิเคราะห์ผิวลึก',
      en: 'AI-powered Skin Insights',
      zh: 'AI 皮肤洞察'
    },
    summary: {
      th: 'วิเคราะห์ผิวหน้าจากรูปถ่ายพร้อมรายงานแนะนำการรักษาเฉพาะบุคคล',
      en: 'Analyzing selfies to generate personalized treatment recommendations.',
      zh: '分析自拍照，生成个性化的治疗建议。'
    },
    metrics: [
      { label: { th: 'เวลา', en: 'Time', zh: '时间' }, value: '2 mins' },
      { label: { th: 'แม่นยำ', en: 'Accuracy', zh: '准确度' }, value: '98%' },
      { label: { th: 'ลูกค้า', en: 'Leads', zh: '潜在客户' }, value: '1,250' }
    ],
    content: [
      {
        heading: {
          th: 'การเก็บข้อมูล',
          en: 'Data Capture',
          zh: '数据采集'
        },
        body: {
          th: 'ฟีเจอร์ AR ถ่ายภาพผิวพร้อมตรวจสอบแสงและมุมการถ่ายที่เหมาะสม',
          en: 'AR capture guides users to ideal lighting and angles for reliable scans.',
          zh: 'AR 捕捉指南，引导用户获得理想光线和角度，确保扫描可靠。'
        }
      },
      {
        heading: {
          th: 'การวิเคราะห์ AI',
          en: 'AI Analysis',
          zh: 'AI 分析'
        },
        body: {
          th: 'โมเดล TensorFlow ประเมินริ้วรอย ฝ้า และรูขุมขน พร้อมคะแนนคุณภาพแสง',
          en: 'TensorFlow models score wrinkles, pigmentation, and pores with lighting checks.',
          zh: 'TensorFlow 模型对皱纹、色素和毛孔打分，并检测光线质量。'
        }
      },
      {
        heading: {
          th: 'การแนะนำการรักษา',
          en: 'Treatment Guidance',
          zh: '治疗建议'
        },
        body: {
          th: 'CRM จับคู่บริการที่เหมาะกับผิวลูกค้าแต่ละคนพร้อมแผน Follow-up',
          en: 'CRM recommends treatments and follow-up reminders for each profile.',
          zh: 'CRM 为每个轮廓推荐治疗方案并设置后续提醒。'
        }
      }
    ],
    disclaimer: {
      th: 'ข้อมูลจำลองเพื่อสาธิตฟีเจอร์ ไม่ใช่คำแนะนำทางการแพทย์',
      en: 'Simulated data for demonstration only, not medical advice.',
      zh: '仅为演示用模拟数据，不构成医疗建议。'
    }
  },
  {
    slug: 'omnichannel-scheduling',
    title: {
      th: 'ตารางนัดแบบ Omnichannel',
      en: 'Omnichannel Scheduling',
      zh: '全渠道排期'
    },
    summary: {
      th: 'ระบบตรงกับลูกค้าผ่านแชท วิดีโอ และเว็บ เพื่อรีบตีตั๋วการรักษา',
      en: 'Unified scheduling triggered by chat, video consults, and web analytics.',
      zh: '通过聊天、视频咨询和网页数据触发统一预约。'
    },
    metrics: [
      { label: { th: 'อัตราการเข้ารับบริการ', en: 'Conversion', zh: '转化率' }, value: '28%' },
      { label: { th: 'เวลาจอง', en: 'Booking Time', zh: '预约时间' }, value: '45s' },
      { label: { th: 'CSAT', en: 'CSAT', zh: '满意度' }, value: '4.9/5' }
    ],
    content: [
      {
        heading: {
          th: 'พูดคุยกับลูกค้า',
          en: 'Customer Conversations',
          zh: '客户对话'
        },
        body: {
          th: 'Chatbot ไล่ถาม Concerns ก่อนเปิด Live Chat ให้พนักงาน',
          en: 'Chatbot collects concerns ahead of agent-led live chat sessions.',
          zh: '聊天机器人在人工会话前收集问题痛点。'
        }
      },
      {
        heading: {
          th: 'การจองต่อเนื่อง',
          en: 'Continuous Booking',
          zh: '连续预约'
        },
        body: {
          th: 'แจ้งเตือนผ่าน Push วิดีโอคอล และ SMS เมื่อเวลาว่างมีการเปลี่ยน',
          en: 'Push, video call, and SMS alerts update leads when slots open.',
          zh: '当空档出现时，通过推送、视频通话和短信通知潜在客户。'
        }
      }
    ]
  }
];

export function getCaseStudies(locale: Locale): LocalizedCaseStudy[] {
  return caseStudies.map(({ slug, title, summary, metrics }) => ({
    slug,
    title: title[locale],
    summary: summary[locale],
    metrics: metrics.map((metric) => ({
      label: metric.label[locale],
      value: metric.value
    }))
  }));
}

export function getCaseStudyBySlug(slug?: string | null): CaseStudy | undefined {
  if (!slug) return undefined;
  return caseStudies.find((study) => study.slug === slug);
}
