/**
 * Email Templates
 * Phase 1: Email Integration
 * 
 * 4 Templates:
 * 1. Weekly Progress Digest
 * 2. Automated Progress Report
 * 3. Goal Achievement
 * 4. Re-engagement
 */

import { HybridSkinAnalysis } from '../types/skin-analysis';

// ========================================
// 1. WEEKLY PROGRESS DIGEST
// ========================================

export interface WeeklyDigestData {
  userName: string;
  weekStart: string;
  weekEnd: string;
  totalAnalyses: number;
  improvements: {
    parameter: string;
    change: number; // percentage
  }[];
  goalsCompleted: number;
  totalGoals: number;
  nextSteps: string[];
  viewReportUrl: string;
}

export function generateWeeklyProgressDigest(data: WeeklyDigestData): string {
  const improvementRows = data.improvements
    .map(
      (imp) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${imp.parameter}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">
          <span style="color: ${imp.change >= 0 ? '#10b981' : '#ef4444'}; font-weight: bold;">
            ${imp.change > 0 ? '+' : ''}${imp.change}%
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  const nextStepsHtml = data.nextSteps
    .map((step) => `<li style="margin-bottom: 8px;">${step}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>สรุปความคืบหน้าประจำสัปดาห์</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px;">📊 สรุปความคืบหน้าประจำสัปดาห์</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">${data.weekStart} - ${data.weekEnd}</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <!-- Greeting -->
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              สวัสดีคุณ ${data.userName} 👋
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 30px;">
              นี่คือสรุปผลการดูแลผิวของคุณในสัปดาห์ที่ผ่านมา มาดูกันว่าคุณก้าวหน้าไปแค่ไหนแล้ว!
            </p>

            <!-- Stats Cards -->
            <div style="display: flex; gap: 15px; margin-bottom: 30px;">
              <div style="flex: 1; background: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #0284c7;">${data.totalAnalyses}</div>
                <div style="font-size: 14px; color: #666; margin-top: 5px;">การวิเคราะห์</div>
              </div>
              <div style="flex: 1; background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
                <div style="font-size: 32px; font-weight: bold; color: #10b981;">${data.goalsCompleted}/${data.totalGoals}</div>
                <div style="font-size: 14px; color: #666; margin-top: 5px;">เป้าหมายสำเร็จ</div>
              </div>
            </div>

            <!-- Improvements Table -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 20px; color: #333; margin-bottom: 15px;">📈 การเปลี่ยนแปลงของผิว</h2>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #666;">พารามิเตอร์</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #666;">การเปลี่ยนแปลง</th>
                  </tr>
                </thead>
                <tbody>
                  ${improvementRows}
                </tbody>
              </table>
            </div>

            <!-- Next Steps -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #92400e;">💡 ขั้นตอนถัดไป</h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                ${nextStepsHtml}
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${data.viewReportUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                ดูรายงานฉบับเต็ม
              </a>
            </div>

            <p style="font-size: 14px; color: #999; text-align: center;">
              เก่งมาก! 🎉 ดำเนินต่อไปแบบนี้นะ
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
              © 2025 AI367 Beauty. All rights reserved.
            </p>
            <p style="margin: 0; font-size: 12px; color: #999;">
              ไม่ต้องการรับอีเมลนี้? <a href="#" style="color: #667eea;">ยกเลิกการสมัคร</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ========================================
// 2. AUTOMATED PROGRESS REPORT
// ========================================

export interface ProgressReportData {
  userName: string;
  reportPeriod: string;
  currentAnalysis: HybridSkinAnalysis;
  previousAnalysis: HybridSkinAnalysis;
  improvements: { concern: string; before: number; after: number; change: number }[];
  treatmentFollowed: number; // percentage
  recommendations: string[];
  pdfUrl?: string;
  viewOnlineUrl: string;
}

export function generateAutomatedProgressReport(data: ProgressReportData): string {
  const improvementsHtml = data.improvements
    .map(
      (imp) => `
      <div style="padding: 15px; border-bottom: 1px solid #f0f0f0;">
        <div style="font-weight: 600; color: #333; margin-bottom: 5px;">${imp.concern}</div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="color: #999; text-decoration: line-through;">${imp.before}/10</span>
          <span style="font-size: 20px;">→</span>
          <span style="color: #10b981; font-weight: bold; font-size: 18px;">${imp.after}/10</span>
          <span style="background: ${imp.change >= 0 ? '#d4edda' : '#f8d7da'}; color: ${imp.change >= 0 ? '#155724' : '#721c24'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
            ${imp.change > 0 ? '+' : ''}${imp.change}%
          </span>
        </div>
      </div>
    `
    )
    .join('');

  const recommendationsHtml = data.recommendations
    .map((rec, idx) => `<li style="margin-bottom: 10px;"><strong>${idx + 1}.</strong> ${rec}</li>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รายงานความคืบหน้าอัตโนมัติ</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0 0 10px 0; font-size: 28px;">📊 รายงานความคืบหน้า</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">${data.reportPeriod}</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              สวัสดีคุณ ${data.userName} 👋
            </p>
            <p style="font-size: 14px; color: #666; margin-bottom: 30px;">
              นี่คือรายงานความคืบหน้าที่สร้างขึ้นโดยอัตโนมัติจากการเปรียบเทียบการวิเคราะห์ล่าสุดของคุณ
            </p>

            <!-- Treatment Adherence -->
            <div style="background: #f0fdf4; border: 1px solid #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 600; color: #333;">การปฏิบัติตามแผนการรักษา</span>
                <span style="font-size: 24px; font-weight: bold; color: #10b981;">${data.treatmentFollowed}%</span>
              </div>
              <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; width: ${data.treatmentFollowed}%;"></div>
              </div>
            </div>

            <!-- Improvements -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 20px; color: #333; margin-bottom: 15px;">✨ การปรับปรุงที่เห็นได้ชัด</h2>
              <div style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                ${improvementsHtml}
              </div>
            </div>

            <!-- Recommendations -->
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1e40af;">💡 คำแนะนำสำหรับคุณ</h3>
              <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px;">
                ${recommendationsHtml}
              </ul>
            </div>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin-bottom: 20px;">
              ${
                data.pdfUrl
                  ? `
              <a href="${data.pdfUrl}" style="display: inline-block; background: white; border: 2px solid #10b981; color: #10b981; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 10px;">
                📄 ดาวน์โหลด PDF
              </a>
              `
                  : ''
              }
              <a href="${data.viewOnlineUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                ดูรายงานออนไลน์
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
              © 2025 AI367 Beauty. All rights reserved.
            </p>
            <p style="margin: 0; font-size: 12px; color: #999;">
              รายงานนี้ส่งอัตโนมัติทุก 2 สัปดาห์
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ========================================
// 3. GOAL ACHIEVEMENT
// ========================================

export interface GoalAchievementData {
  userName: string;
  goalName: string;
  goalType: string;
  startValue: number;
  targetValue: number;
  currentValue: number;
  daysToComplete: number;
  celebrationMessage: string;
  nextGoalSuggestion: string;
  viewProgressUrl: string;
  shareUrl?: string;
}

export function generateGoalAchievement(data: GoalAchievementData): string {
  return `
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎉 คุณบรรลุเป้าหมายแล้ว!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <!-- Header with Confetti -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
            <h1 style="margin: 0 0 10px 0; font-size: 32px;">ยินดีด้วย!</h1>
            <p style="margin: 0; font-size: 18px; opacity: 0.9;">คุณบรรลุเป้าหมายแล้ว!</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px; text-align: center; font-weight: 600;">
              สวัสดีคุณ ${data.userName} 🌟
            </p>
            
            <!-- Achievement Card -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 15px;">🏆</div>
              <h2 style="margin: 0 0 10px 0; font-size: 24px; color: #92400e;">${data.goalName}</h2>
              <p style="margin: 0; font-size: 14px; color: #78350f;">
                เป้าหมาย: ${data.goalType}
              </p>
            </div>

            <!-- Progress Stats -->
            <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
              <div style="display: flex; justify-content: space-around; text-align: center;">
                <div>
                  <div style="font-size: 14px; color: #999; margin-bottom: 5px;">เริ่มต้น</div>
                  <div style="font-size: 24px; font-weight: bold; color: #666;">${data.startValue}</div>
                </div>
                <div style="font-size: 30px; color: #10b981; align-self: center;">→</div>
                <div>
                  <div style="font-size: 14px; color: #999; margin-bottom: 5px;">ปัจจุบัน</div>
                  <div style="font-size: 24px; font-weight: bold; color: #10b981;">${data.currentValue}</div>
                </div>
                <div style="font-size: 30px; color: #10b981; align-self: center;">✓</div>
                <div>
                  <div style="font-size: 14px; color: #999; margin-bottom: 5px;">เป้าหมาย</div>
                  <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${data.targetValue}</div>
                </div>
              </div>
              <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  ⏱️ ใช้เวลา <strong>${data.daysToComplete} วัน</strong> ในการบรรลุเป้าหมาย
                </p>
              </div>
            </div>

            <!-- Celebration Message -->
            <div style="text-align: center; margin-bottom: 30px;">
              <p style="font-size: 16px; color: #333; line-height: 1.6;">
                ${data.celebrationMessage}
              </p>
            </div>

            <!-- Next Goal Suggestion -->
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1e40af;">🎯 เป้าหมายถัดไป</h3>
              <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
                ${data.nextGoalSuggestion}
              </p>
            </div>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin-bottom: 20px;">
              ${
                data.shareUrl
                  ? `
              <a href="${data.shareUrl}" style="display: inline-block; background: white; border: 2px solid #f59e0b; color: #f59e0b; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 10px;">
                🎊 แชร์ความสำเร็จ
              </a>
              `
                  : ''
              }
              <a href="${data.viewProgressUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                ดูความคืบหน้าทั้งหมด
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
              © 2025 AI367 Beauty. All rights reserved.
            </p>
            <p style="margin: 0; font-size: 12px; color: #999;">
              ขอบคุณที่ไว้วางใจและมุ่งมั่นในการดูแลผิว! 💜
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ========================================
// 4. RE-ENGAGEMENT EMAIL
// ========================================

export interface ReEngagementData {
  userName: string;
  daysSinceLastAnalysis: number;
  lastAnalysisDate: string;
  lastScore: number;
  personalizedMessage: string;
  incentive?: {
    type: 'discount' | 'free_analysis' | 'upgrade';
    value: string;
    code?: string;
  };
  quickActionUrl: string;
}

export function generateReEngagement(data: ReEngagementData): string {
  const incentiveHtml = data.incentive
    ? `
    <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center;">
      <div style="font-size: 40px; margin-bottom: 10px;">🎁</div>
      <h3 style="margin: 0 0 10px 0; font-size: 20px;">ข้อเสนอพิเศษสำหรับคุณ!</h3>
      <p style="margin: 0 0 15px 0; font-size: 16px; opacity: 0.9;">
        ${data.incentive.type === 'discount' ? `ส่วนลด ${data.incentive.value}` : data.incentive.type === 'free_analysis' ? 'วิเคราะห์ฟรี 1 ครั้ง' : `อัพเกรดเป็น ${data.incentive.value}`}
      </p>
      ${
        data.incentive.code
          ? `
      <div style="background: white; color: #db2777; padding: 12px 20px; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 18px; letter-spacing: 2px;">
        ${data.incentive.code}
      </div>
      `
          : ''
      }
    </div>
  `
    : '';

  return `
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>เราคิดถึงคุณ! 💜</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">💜</div>
            <h1 style="margin: 0 0 10px 0; font-size: 28px;">เราคิดถึงคุณ!</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 16px;">มานานแล้วนะที่ไม่ได้เจอกัน</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              สวัสดีคุณ ${data.userName} 👋
            </p>
            
            <!-- Days Since Last Analysis -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: #fef2f2; border: 2px solid #fecaca; padding: 20px 40px; border-radius: 12px;">
                <div style="font-size: 48px; font-weight: bold; color: #dc2626; margin-bottom: 5px;">
                  ${data.daysSinceLastAnalysis}
                </div>
                <div style="font-size: 14px; color: #991b1b;">
                  วันที่ไม่ได้วิเคราะห์ผิว
                </div>
              </div>
            </div>

            <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 30px;">
              การวิเคราะห์ครั้งล่าสุดของคุณเมื่อ: <strong>${data.lastAnalysisDate}</strong><br>
              คะแนนผิว: <strong>${data.lastScore}/10</strong>
            </p>

            <!-- Personalized Message -->
            <div style="background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0; font-size: 15px; color: #5b21b6; line-height: 1.6;">
                ${data.personalizedMessage}
              </p>
            </div>

            ${incentiveHtml}

            <!-- Why Come Back -->
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 18px; color: #333; margin-bottom: 15px; text-align: center;">
                ✨ เหตุผลที่ควรกลับมาวิเคราะห์ผิว
              </h3>
              <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="display: flex; align-items: start; gap: 12px;">
                  <div style="background: #ddd6fe; color: #5b21b6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold;">1</div>
                  <div>
                    <div style="font-weight: 600; color: #333; margin-bottom: 3px;">ติดตามความคืบหน้า</div>
                    <div style="font-size: 14px; color: #666;">ดูว่าผิวของคุณเปลี่ยนแปลงไปอย่างไรบ้าง</div>
                  </div>
                </div>
                <div style="display: flex; align-items: start; gap: 12px;">
                  <div style="background: #ddd6fe; color: #5b21b6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold;">2</div>
                  <div>
                    <div style="font-weight: 600; color: #333; margin-bottom: 3px;">รับคำแนะนำใหม่</div>
                    <div style="font-size: 14px; color: #666;">AI จะแนะนำการรักษาที่เหมาะกับคุณ</div>
                  </div>
                </div>
                <div style="display: flex; align-items: start; gap: 12px;">
                  <div style="background: #ddd6fe; color: #5b21b6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold;">3</div>
                  <div>
                    <div style="font-weight: 600; color: #333; margin-bottom: 3px;">ประหยัดเวลา</div>
                    <div style="font-size: 14px; color: #666;">แค่ 2 นาทีก็ได้ข้อมูลผิวแบบละเอียด</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${data.quickActionUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 50px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                วิเคราะห์ผิวตอนนี้ →
              </a>
            </div>

            <p style="font-size: 13px; color: #999; text-align: center;">
              ใช้เวลาแค่ 2 นาที • ไม่มีค่าใช้จ่าย
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
              © 2025 AI367 Beauty. All rights reserved.
            </p>
            <p style="margin: 0; font-size: 12px; color: #999;">
              ไม่ต้องการรับอีเมลนี้? <a href="#" style="color: #8b5cf6;">ยกเลิกการสมัคร</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
