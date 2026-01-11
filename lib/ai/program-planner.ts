/**
 * Treatment Planner
 * Phase 2 Week 6-7 Task 6.2
 * 
 * AI-powered treatment plan generation based on skin analysis
 */

import { createServerClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { getOpenAIApiKey } from '@/lib/config/ai';

// =============================================
// Types
// =============================================

export interface TreatmentPreferences {
  budget?: 'low' | 'medium' | 'high';
  timeCommitment?: 'minimal' | 'moderate' | 'intensive';
  productPreference?: 'natural' | 'clinical' | 'any';
  sensitivity?: 'sensitive' | 'normal' | 'resistant';
}

export interface TreatmentStep {
  order: number;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  frequency: string;
  frequencyTh: string;
  products?: string[];
  productsUrlReference?: string;
}

export interface TreatmentPlan {
  id?: string;
  analysisId: string;
  customerId: string;
  
  // Plan overview
  title: string;
  titleTh: string;
  summary: string;
  summaryTh: string;
  
  // Timeline
  duration: string; // e.g., "8-12 weeks"
  durationTh: string;
  reviewMilestones: string[]; // e.g., ["2 weeks", "4 weeks", "8 weeks"]
  
  // Steps
  morningRoutine: TreatmentStep[];
  eveningRoutine: TreatmentStep[];
  weeklyTreatments: TreatmentStep[];
  
  // Expectations
  expectedResults: string[];
  expectedResultsTh: string[];
  warnings: string[];
  warningsTh: string[];
  
  // Costs
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Metadata
  generatedAt: string;
  generatedBy: 'ai' | 'staff' | 'doctor';
}

export interface AnalysisData {
  id: string;
  overallScore: number;
  concerns: {
    acne?: number;
    wrinkles?: number;
    texture?: number;
    pores?: number;
    hydration?: number;
  };
  skinType?: string;
  age?: number;
}

// =============================================
// OpenAI Client
// =============================================

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (openai) return openai;
  openai = new OpenAI({ apiKey: getOpenAIApiKey() });
  return openai;
}

// =============================================
// Treatment Plan Generator
// =============================================

export class TreatmentPlanner {
  /**
   * Generate treatment plan using AI
   */
  async generatePlan(
    analysisData: AnalysisData,
    preferences?: TreatmentPreferences
  ): Promise<TreatmentPlan> {
    // Build prompt
    const prompt = this.buildPrompt(analysisData, preferences);

    try {
      // Call OpenAI
      const completion = await getOpenAIClient().chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert dermatologist and skincare specialist. Generate detailed, personalized treatment plans based on skin analysis results. Plans should be medically sound, practical, and tailored to the customer's needs and preferences. Always provide both English and Thai translations.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('Empty response from AI');
      }

      const aiPlan = JSON.parse(responseText);

      // Transform AI response to TreatmentPlan structure
      const treatmentPlan: TreatmentPlan = {
        analysisId: analysisData.id,
        customerId: '', // Will be set by caller
        title: aiPlan.title || 'Personalized Treatment Plan',
        titleTh: aiPlan.titleTh || 'แผนการรักษาเฉพาะบุคคล',
        summary: aiPlan.summary || '',
        summaryTh: aiPlan.summaryTh || '',
        duration: aiPlan.duration || '8-12 weeks',
        durationTh: aiPlan.durationTh || '8-12 สัปดาห์',
        reviewMilestones: aiPlan.reviewMilestones || ['2 weeks', '4 weeks', '8 weeks'],
        morningRoutine: aiPlan.morningRoutine || [],
        eveningRoutine: aiPlan.eveningRoutine || [],
        weeklyTreatments: aiPlan.weeklyTreatments || [],
        expectedResults: aiPlan.expectedResults || [],
        expectedResultsTh: aiPlan.expectedResultsTh || [],
        warnings: aiPlan.warnings || [],
        warningsTh: aiPlan.warningsTh || [],
        estimatedCost: aiPlan.estimatedCost || {
          min: 2000,
          max: 5000,
          currency: 'THB',
        },
        generatedAt: new Date().toISOString(),
        generatedBy: 'ai',
      };

      return treatmentPlan;
    } catch (error) {
      console.error('Failed to generate treatment plan with AI:', error);
      
      // Fallback to template-based plan
      return this.generateTemplatePlan(analysisData, preferences);
    }
  }

  /**
   * Build prompt for AI
   */
  private buildPrompt(
    analysisData: AnalysisData,
    preferences?: TreatmentPreferences
  ): string {
    const concerns: string[] = [];
    
    if (analysisData.concerns.acne && analysisData.concerns.acne < 70) {
      concerns.push(`Acne (severity: ${100 - analysisData.concerns.acne}%)`);
    }
    if (analysisData.concerns.wrinkles && analysisData.concerns.wrinkles < 70) {
      concerns.push(`Wrinkles (severity: ${100 - analysisData.concerns.wrinkles}%)`);
    }
    if (analysisData.concerns.texture && analysisData.concerns.texture < 70) {
      concerns.push(`Texture issues (severity: ${100 - analysisData.concerns.texture}%)`);
    }
    if (analysisData.concerns.pores && analysisData.concerns.pores < 70) {
      concerns.push(`Enlarged pores (severity: ${100 - analysisData.concerns.pores}%)`);
    }
    if (analysisData.concerns.hydration && analysisData.concerns.hydration < 70) {
      concerns.push(`Dehydration (severity: ${100 - analysisData.concerns.hydration}%)`);
    }

    return `
Generate a personalized skincare treatment plan based on the following analysis:

**Skin Analysis:**
- Overall Score: ${analysisData.overallScore}/100
- Primary Concerns: ${concerns.join(', ') || 'None'}
- Skin Type: ${analysisData.skinType || 'Unknown'}
- Age: ${analysisData.age || 'Unknown'}

**Customer Preferences:**
- Budget: ${preferences?.budget || 'medium'}
- Time Commitment: ${preferences?.timeCommitment || 'moderate'}
- Product Preference: ${preferences?.productPreference || 'any'}
- Skin Sensitivity: ${preferences?.sensitivity || 'normal'}

Please provide a comprehensive treatment plan in JSON format with the following structure:
{
  "title": "Brief plan title in English",
  "titleTh": "Brief plan title in Thai",
  "summary": "2-3 sentence summary in English",
  "summaryTh": "2-3 sentence summary in Thai",
  "duration": "Expected timeline (e.g., '8-12 weeks')",
  "durationTh": "Expected timeline in Thai",
  "reviewMilestones": ["Array of milestone dates"],
  "morningRoutine": [
    {
      "order": 1,
      "name": "Step name in English",
      "nameTh": "Step name in Thai",
      "description": "Detailed description in English",
      "descriptionTh": "Detailed description in Thai",
      "frequency": "Daily",
      "frequencyTh": "ทุกวัน",
      "products": ["Product recommendations"]
    }
  ],
  "eveningRoutine": [/* Similar structure */],
  "weeklyTreatments": [/* Similar structure */],
  "expectedResults": ["Array of expected outcomes in English"],
  "expectedResultsTh": ["Array of expected outcomes in Thai"],
  "warnings": ["Array of warnings/precautions in English"],
  "warningsTh": ["Array of warnings/precautions in Thai"],
  "estimatedCost": {
    "min": 2000,
    "max": 5000,
    "currency": "THB"
  }
}

Focus on:
1. Addressing the primary concerns first
2. Gradual introduction of active ingredients
3. Realistic timeline and expectations
4. Budget-appropriate product recommendations
5. Safety warnings for sensitive skin
`;
  }

  /**
   * Get minimum budget
   */
  private getBudgetMin(budget: string): number {
    if (budget === 'low') return 1000;
    if (budget === 'medium') return 2000;
    return 3000;
  }

  /**
   * Get maximum budget
   */
  private getBudgetMax(budget: string): number {
    if (budget === 'low') return 2000;
    if (budget === 'medium') return 5000;
    return 10000;
  }

  /**
   * Generate template-based plan (fallback)
   */
  private generateTemplatePlan(
    analysisData: AnalysisData,
    preferences?: TreatmentPreferences
  ): TreatmentPlan {
    const budget = preferences?.budget || 'medium';
    
    return {
      analysisId: analysisData.id,
      customerId: '',
      title: 'Basic Skincare Routine',
      titleTh: 'กิจวัตรดูแลผิวพื้นฐาน',
      summary: 'A gentle, effective skincare routine to address your concerns.',
      summaryTh: 'กิจวัตรดูแลผิวที่อ่อนโยนและมีประสิทธิภาพ เพื่อแก้ไขปัญหาผิวของคุณ',
      duration: '8-12 weeks',
      durationTh: '8-12 สัปดาห์',
      reviewMilestones: ['2 weeks', '4 weeks', '8 weeks'],
      morningRoutine: [
        {
          order: 1,
          name: 'Gentle Cleanser',
          nameTh: 'คลีนเซอร์อ่อนโยน',
          description: 'Cleanse face with lukewarm water and gentle cleanser',
          descriptionTh: 'ล้างหน้าด้วยน้ำอุ่นและคลีนเซอร์อ่อนโยน',
          frequency: 'Daily',
          frequencyTh: 'ทุกวัน',
          products: ['CeraVe Hydrating Cleanser', 'Cetaphil Gentle Cleanser'],
        },
        {
          order: 2,
          name: 'Vitamin C Serum',
          nameTh: 'เซรั่มวิตามินซี',
          description: 'Apply vitamin C serum for brightening',
          descriptionTh: 'ทาเซรั่มวิตามินซีเพื่อผิวกระจ่างใส',
          frequency: 'Daily',
          frequencyTh: 'ทุกวัน',
          products: ['Timeless Vitamin C Serum', 'Melano CC'],
        },
        {
          order: 3,
          name: 'Moisturizer',
          nameTh: 'มอยส์เจอไรเซอร์',
          description: 'Apply hydrating moisturizer',
          descriptionTh: 'ทาครีมบำรุงผิว',
          frequency: 'Daily',
          frequencyTh: 'ทุกวัน',
        },
        {
          order: 4,
          name: 'Sunscreen SPF 50+',
          nameTh: 'ครีมกันแดด SPF 50+',
          description: 'Apply broad-spectrum sunscreen',
          descriptionTh: 'ทาครีมกันแดด',
          frequency: 'Daily',
          frequencyTh: 'ทุกวัน',
        },
      ],
      eveningRoutine: [
        {
          order: 1,
          name: 'Double Cleanse',
          nameTh: 'ดับเบิ้ลคลีนซิ่ง',
          description: 'Remove makeup/sunscreen, then cleanse',
          descriptionTh: 'ล้างเครื่องสำอาง/ครีมกันแดด แล้วล้างอีกครั้ง',
          frequency: 'Daily',
          frequencyTh: 'ทุกวัน',
        },
        {
          order: 2,
          name: 'Treatment Serum',
          nameTh: 'เซรั่มรักษา',
          description: 'Apply targeted treatment serum',
          descriptionTh: 'ทาเซรั่มรักษาเฉพาะจุด',
          frequency: 'Daily',
          frequencyTh: 'ทุกวัน',
        },
        {
          order: 3,
          name: 'Night Cream',
          nameTh: 'ครีมทาก่อนนอน',
          description: 'Apply richer night moisturizer',
          descriptionTh: 'ทาครีมบำรุงสูตรเข้มข้น',
          frequency: 'Daily',
          frequencyTh: 'ทุกวัน',
        },
      ],
      weeklyTreatments: [
        {
          order: 1,
          name: 'Exfoliation',
          nameTh: 'ผลัดเซลล์ผิว',
          description: 'Gentle chemical exfoliation',
          descriptionTh: 'ผลัดเซลล์ผิวแบบอ่อนโยน',
          frequency: '2-3 times per week',
          frequencyTh: 'สัปดาห์ละ 2-3 ครั้ง',
        },
      ],
      expectedResults: [
        'Improved skin texture',
        'Reduced breakouts',
        'More even skin tone',
        'Better hydration',
      ],
      expectedResultsTh: [
        'ผิวเนียนขึ้น',
        'สิวลดลง',
        'ผิวสม่ำเสมอขึ้น',
        'ผิวชุ่มชื้นขึ้น',
      ],
      warnings: [
        'Always patch test new products',
        'Use sunscreen daily',
        'Introduce active ingredients gradually',
      ],
      warningsTh: [
        'ทดสอบผลิตภัณฑ์ใหม่ก่อนใช้',
        'ใช้ครีมกันแดดทุกวัน',
        'ค่อยๆ เพิ่มส่วนผสมที่ใช้งาน',
      ],
      estimatedCost: {
        min: this.getBudgetMin(budget),
        max: this.getBudgetMax(budget),
        currency: 'THB',
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'ai',
    };
  }

  /**
   * Save treatment plan to database
   */
  async savePlan(plan: TreatmentPlan): Promise<string> {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('treatment_plans')
      .insert({
        user_id: plan.customerId,
        analysis_id: plan.analysisId,
        title: plan.title,
        title_th: plan.titleTh,
        summary: plan.summary,
        summary_th: plan.summaryTh,
        duration: plan.duration,
        duration_th: plan.durationTh,
        review_milestones: plan.reviewMilestones,
        morning_routine: plan.morningRoutine,
        evening_routine: plan.eveningRoutine,
        weekly_treatments: plan.weeklyTreatments,
        expected_results: plan.expectedResults,
        expected_results_th: plan.expectedResultsTh,
        warnings: plan.warnings,
        warnings_th: plan.warningsTh,
        estimated_cost: plan.estimatedCost,
        generated_by: plan.generatedBy,
        generated_at: plan.generatedAt,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to save treatment plan: ${error.message}`);
    }

    return data.id;
  }
}

// =============================================
// Factory Function
// =============================================

export function createTreatmentPlanner(): TreatmentPlanner {
  return new TreatmentPlanner();
}
