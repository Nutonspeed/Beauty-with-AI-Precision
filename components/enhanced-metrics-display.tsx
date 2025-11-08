/**
 * Enhanced Metrics Display Component
 * แสดงผลลัพธ์จาก Enhanced AI Analysis อย่างสวยงามและครบถ้วน
 */

'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { EnhancedMetricsResult } from '@/lib/ai/enhanced-skin-metrics'

interface EnhancedMetricsDisplayProps {
  metrics: EnhancedMetricsResult
  showDetailed?: boolean
}

export function EnhancedMetricsDisplay({ metrics, showDetailed = false }: EnhancedMetricsDisplayProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string): string => {
    if (grade === 'A') return 'bg-green-100 text-green-800'
    if (grade === 'B') return 'bg-blue-100 text-blue-800'
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800'
    if (grade === 'D') return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">สุขภาพผิวโดยรวม</h3>
          <Badge className={getGradeColor(metrics.overallHealth.grade)}>
            เกรด {metrics.overallHealth.grade}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold">{metrics.overallHealth.score} คะแนน</span>
            <span className="text-sm text-gray-500">
              ความมั่นใจ: {(metrics.overallHealth.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <Progress value={metrics.overallHealth.score} className="h-3" />
        </div>
      </Card>

      {/* Skin Age */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">อายุผิว</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>อายุผิวโดยประมาณ:</span>
            <span className="font-bold text-xl">{metrics.skinAge.estimated} ปี</span>
          </div>
          {metrics.skinAge.chronological && (
            <>
              <div className="flex justify-between">
                <span>อายุจริง:</span>
                <span className="font-semibold">{metrics.skinAge.chronological} ปี</span>
              </div>
              <div className="flex justify-between">
                <span>ความแตกต่าง:</span>
                <span className={metrics.skinAge.difference > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                  {metrics.skinAge.difference > 0 ? '+' : ''}{metrics.skinAge.difference} ปี
                </span>
              </div>
            </>
          )}
          <div className="text-sm text-gray-500 mt-2">
            ความมั่นใจ: {(metrics.skinAge.confidence * 100).toFixed(0)}%
          </div>
        </div>
      </Card>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spots */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">ฝ้า-กระ</h4>
            <Badge variant={metrics.spots.severity === 'low' ? 'default' : 'destructive'}>
              {metrics.spots.severity === 'low' ? 'เล็กน้อย' : metrics.spots.severity === 'medium' ? 'ปานกลาง' : 'มาก'}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.spots.score)}`}>
            {metrics.spots.score} คะแนน
          </div>
          <Progress value={metrics.spots.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>จำนวน: {metrics.spots.count} จุด</div>
              <div>ขนาดเฉลี่ย: {metrics.spots.averageSize.toFixed(1)} px</div>
              <div>การกระจาย: {
                metrics.spots.distribution === 'clustered' ? 'กระจุกตัว' :
                metrics.spots.distribution === 'scattered' ? 'กระจาย' : 'สม่ำเสมอ'
              }</div>
            </div>
          )}
        </Card>

        {/* Pores */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">รูขุมขน</h4>
            <Badge variant={metrics.pores.visibility === 'minimal' ? 'default' : 'secondary'}>
              {metrics.pores.visibility === 'minimal' ? 'น้อย' : metrics.pores.visibility === 'moderate' ? 'ปานกลาง' : 'เด่นชัด'}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.pores.score)}`}>
            {metrics.pores.score} คะแนน
          </div>
          <Progress value={metrics.pores.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>จำนวน: {metrics.pores.count} รู</div>
              <div>ขนาดเฉลี่ย: {metrics.pores.averageSize.toFixed(1)} px</div>
            </div>
          )}
        </Card>

        {/* Wrinkles */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">ริ้วรอย</h4>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">ละเอียด: {metrics.wrinkles.types.fine}</Badge>
              <Badge variant="outline" className="text-xs">ลึก: {metrics.wrinkles.types.deep}</Badge>
            </div>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.wrinkles.score)}`}>
            {metrics.wrinkles.score} คะแนน
          </div>
          <Progress value={metrics.wrinkles.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>จำนวนทั้งหมด: {metrics.wrinkles.count} เส้น</div>
              <div>ความลึกเฉลี่ย: {metrics.wrinkles.averageDepth.toFixed(2)}</div>
              <div>พื้นที่: {metrics.wrinkles.areas.map(a => 
                a === 'forehead' ? 'หน้าผาก' :
                a === 'eyes' ? 'รอบดวงตา' :
                a === 'mouth' ? 'รอบปาก' : 'แก้ม'
              ).join(', ')}</div>
            </div>
          )}
        </Card>

        {/* Texture */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">พื้นผิวผิว</h4>
            <Badge className={
              metrics.texture.quality === 'excellent' ? 'bg-green-100 text-green-800' :
              metrics.texture.quality === 'good' ? 'bg-blue-100 text-blue-800' :
              metrics.texture.quality === 'fair' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }>
              {metrics.texture.quality === 'excellent' ? 'ดีเยี่ยม' :
               metrics.texture.quality === 'good' ? 'ดี' :
               metrics.texture.quality === 'fair' ? 'พอใช้' : 'ควรปรับปรุง'}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.texture.score)}`}>
            {metrics.texture.score} คะแนน
          </div>
          <Progress value={metrics.texture.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>ความเรียบ: {(metrics.texture.smoothness * 100).toFixed(0)}%</div>
              <div>ความหยาบ: {(metrics.texture.roughness * 100).toFixed(0)}%</div>
            </div>
          )}
        </Card>

        {/* Redness */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">ความแดง</h4>
            <Badge variant={metrics.redness.pattern === 'localized' ? 'default' : 'destructive'}>
              {metrics.redness.pattern === 'localized' ? 'เฉพาะจุด' :
               metrics.redness.pattern === 'diffuse' ? 'กระจาย' : 'เป็นแผ่น'}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.redness.score)}`}>
            {metrics.redness.score} คะแนน
          </div>
          <Progress value={metrics.redness.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>ความเข้ม: {(metrics.redness.intensity * 100).toFixed(0)}%</div>
              <div>พื้นที่: {metrics.redness.coverage.toFixed(1)}% ของใบหน้า</div>
              {metrics.redness.causes.length > 0 && (
                <div>สาเหตุที่เป็นไปได้: {metrics.redness.causes.map(c =>
                  c === 'rosacea' ? 'โรคผิวหน้าแดง' :
                  c === 'inflammation' ? 'การอักเสบ' :
                  c === 'sun_damage' ? 'แดดเผา' : 'ผิวแพ้ง่าย'
                ).join(', ')}</div>
              )}
            </div>
          )}
        </Card>

        {/* Hydration */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">ความชุ่มชื้น</h4>
            <Badge>
              {metrics.hydration.level === 'very_dry' ? 'แห้งมาก' :
               metrics.hydration.level === 'dry' ? 'แห้ง' :
               metrics.hydration.level === 'normal' ? 'ปกติ' : 'มัน'}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.hydration.score)}`}>
            {metrics.hydration.score} คะแนน
          </div>
          <Progress value={metrics.hydration.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>T-Zone: {metrics.hydration.areas.tZone} คะแนน</div>
              <div>แก้ม: {metrics.hydration.areas.cheeks} คะแนน</div>
            </div>
          )}
        </Card>

        {/* Skin Tone */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">สีผิว</h4>
            <Badge>
              {metrics.skinTone.undertone === 'cool' ? 'โทนเย็น' :
               metrics.skinTone.undertone === 'warm' ? 'โทนอุ่น' : 'โทนกลาง'}
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.skinTone.score)}`}>
            {metrics.skinTone.score} คะแนน
          </div>
          <Progress value={metrics.skinTone.score} className="mb-2" />
          {showDetailed && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>ความสม่ำเสมอ: {(metrics.skinTone.uniformity * 100).toFixed(0)}%</div>
              <div>Fitzpatrick Type: {metrics.skinTone.fitzpatrickType}</div>
            </div>
          )}
        </Card>

        {/* Elasticity */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">ความยืดหยุ่น</h4>
            <Badge variant="outline">
              ความกระชับ: {(metrics.elasticity.firmness * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className={`text-2xl font-bold mb-2 ${getScoreColor(metrics.elasticity.score)}`}>
            {metrics.elasticity.score} คะแนน
          </div>
          <Progress value={metrics.elasticity.score} className="mb-2" />
          {showDetailed && metrics.elasticity.areas.length > 0 && (
            <div className="text-sm text-gray-600">
              พื้นที่ที่ต้องดูแล: {metrics.elasticity.areas.map(a =>
                a === 'jawline' ? 'กรามและคาง' :
                a === 'cheeks' ? 'แก้ม' : 'คอ'
              ).join(', ')}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default EnhancedMetricsDisplay
