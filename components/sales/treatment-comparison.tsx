"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Star, Clock, DollarSign } from "lucide-react"

// Mock data - ในโปรดักชั่นจะดึงจาก API
const treatments = [
  {
    id: "hydrafacial",
    name: "HydraFacial",
    category: "cleansing",
    price: 4500,
    duration: "45 นาที",
    description: "ทำความสะอาดผิวล้ำลึกด้วยน้ำยาพิเศษ",
    benefits: ["ลดสิว", "ลดรูขุมขน", "เพิ่มความชุ่มชื้น"],
    suitability: ["ทุกสภาพผิว", "ผิวมัน", "ผิวผสม"],
    rating: 4.8,
    reviews: 245,
    effectiveness: 85,
    sideEffects: "น้อยมาก",
    recoveryTime: "ไม่ต้องพักฟื้น"
  },
  {
    id: "chemical_peel",
    name: "Chemical Peel",
    category: "exfoliation",
    price: 3200,
    duration: "30 นาที",
    description: "ผลัดเซลล์ผิวเก่าด้วยกรดอ่อน",
    benefits: ["ลดจุดด่างดำ", "ปรับสีผิว", "ลดริ้วรอยเล็กน้อย"],
    suitability: ["ผิวหมองคล้ำ", "จุดด่างดำ", "ริ้วรอยเริ่มต้น"],
    rating: 4.6,
    reviews: 189,
    effectiveness: 78,
    sideEffects: "ผิวแดงชั่วคราว",
    recoveryTime: "1-2 วัน"
  },
  {
    id: "rf_tightening",
    name: "RF Skin Tightening",
    category: "anti-aging",
    price: 8500,
    duration: "60 นาที",
    description: "กระตุ้นคอลลาเจนด้วยคลื่นวิทยุ",
    benefits: ["ยกกระชับผิว", "ลดริ้วรอย", "เพิ่มความยืดหยุ่น"],
    suitability: ["ผิวหย่อนคล้อย", "ริ้วรอย", "ผิวแก่"],
    rating: 4.9,
    reviews: 156,
    effectiveness: 92,
    sideEffects: "ร้อนผิวชั่วคราว",
    recoveryTime: "ไม่ต้องพักฟื้น"
  },
  {
    id: "microneedling",
    name: "Microneedling",
    category: "anti-aging",
    price: 5500,
    duration: "50 นาที",
    description: "กระตุ้นการสร้างคอลลาเจนด้วยเข็มเล็ก",
    benefits: ["ลดร่องลึก", "เพิ่มความหนาแน่น", "ปรับผิวให้เรียบ"],
    suitability: ["ร่องลึก", "ผิวไม่เรียบ", "ผิวแก่"],
    rating: 4.7,
    reviews: 98,
    effectiveness: 88,
    sideEffects: "แดงบวมชั่วคราว",
    recoveryTime: "2-3 วัน"
  }
]

const packages = [
  {
    id: "basic",
    name: "แพ็คเกจพื้นฐาน",
    treatments: ["hydrafacial", "chemical_peel"],
    totalPrice: 7700,
    savings: 0,
    description: "เหมาะสำหรับผู้เริ่มต้น"
  },
  {
    id: "premium",
    name: "แพ็คเกจพรีเมี่ยม",
    treatments: ["hydrafacial", "chemical_peel", "rf_tightening"],
    totalPrice: 16200,
    savings: 1800,
    description: "ครบครันสำหรับผลลัพธ์ที่ดีที่สุด"
  },
  {
    id: "vip",
    name: "แพ็คเกจ VIP",
    treatments: ["hydrafacial", "chemical_peel", "rf_tightening", "microneedling"],
    totalPrice: 21700,
    savings: 4300,
    description: "แพ็คเกจครบครันระดับมืออาชีพ"
  }
]

export function TreatmentComparison() {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([])
  const [skinConcern, setSkinConcern] = useState("")
  const [budget, setBudget] = useState("")
  const [recommendedPackage, setRecommendedPackage] = useState<typeof packages[0] | null>(null)

  const handleTreatmentToggle = (treatmentId: string) => {
    setSelectedTreatments(prev =>
      prev.includes(treatmentId)
        ? prev.filter(id => id !== treatmentId)
        : [...prev, treatmentId]
    )
  }

  const handleGetRecommendation = () => {
    // Simple AI recommendation logic
    if (skinConcern === "anti-aging" && budget === "high") {
      setRecommendedPackage(packages.find(p => p.id === "vip") || null)
    } else if (skinConcern === "anti-aging" || budget === "medium") {
      setRecommendedPackage(packages.find(p => p.id === "premium") || null)
    } else {
      setRecommendedPackage(packages.find(p => p.id === "basic") || null)
    }
  }

  const selectedTreatmentData = treatments.filter(t => selectedTreatments.includes(t.id))
  const totalPrice = selectedTreatmentData.reduce((sum, t) => sum + t.price, 0)

  return (
    <div className="space-y-6">
      {/* AI Recommendation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            AI Treatment Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-sm font-medium mb-2">ปัญหาผิวหลัก</div>
              <Select value={skinConcern} onValueChange={setSkinConcern}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกปัญหาผิว..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acne">สิวและรูขุมขน</SelectItem>
                  <SelectItem value="pigmentation">จุดด่างดำ</SelectItem>
                  <SelectItem value="anti-aging">ริ้วรอยและผิวแก่</SelectItem>
                  <SelectItem value="dryness">ผิวแห้ง</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">งบประมาณ</div>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกงบประมาณ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">ต่ำ (3,000-8,000 บาท)</SelectItem>
                  <SelectItem value="medium">กลาง (8,000-15,000 บาท)</SelectItem>
                  <SelectItem value="high">สูง (15,000+ บาท)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleGetRecommendation} className="w-full">
                <Star className="h-4 w-4 mr-2" />
                รับคำแนะนำจาก AI
              </Button>
            </div>
          </div>

          {recommendedPackage && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">
                      แนะนำ: {recommendedPackage.name}
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      {recommendedPackage.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ฿{recommendedPackage.totalPrice.toLocaleString()}
                      </span>
                      {recommendedPackage.savings > 0 && (
                        <span className="text-green-600 font-medium">
                          ประหยัด ฿{recommendedPackage.savings.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    เลือกแพ็คเกจนี้
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Treatment Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="comparison">Comparison View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {treatments.map((treatment) => (
                  <Card
                    key={treatment.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTreatments.includes(treatment.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleTreatmentToggle(treatment.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{treatment.name}</h3>
                        {selectedTreatments.includes(treatment.id) && (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground mb-3">
                        {treatment.description}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          ฿{treatment.price.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {treatment.duration}
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          {treatment.rating} ({treatment.reviews} reviews)
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">Benefits:</div>
                        <div className="flex flex-wrap gap-1">
                          {treatment.benefits.slice(0, 2).map((benefit, index) => (
                            <Badge key={benefit} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                          {treatment.benefits.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{treatment.benefits.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              {selectedTreatmentData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  เลือกทรีตเมนต์อย่างน้อย 1 อย่างเพื่อเปรียบเทียบ
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Treatment</th>
                        <th className="text-left p-2 font-medium">Price</th>
                        <th className="text-left p-2 font-medium">Duration</th>
                        <th className="text-left p-2 font-medium">Effectiveness</th>
                        <th className="text-left p-2 font-medium">Recovery</th>
                        <th className="text-left p-2 font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTreatmentData.map((treatment) => (
                        <tr key={treatment.id} className="border-b">
                          <td className="p-2 font-medium">{treatment.name}</td>
                          <td className="p-2">฿{treatment.price.toLocaleString()}</td>
                          <td className="p-2">{treatment.duration}</td>
                          <td className="p-2">{treatment.effectiveness}%</td>
                          <td className="p-2">{treatment.recoveryTime}</td>
                          <td className="p-2 flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {treatment.rating}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Treatments Summary */}
      {selectedTreatmentData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Treatments Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  เลือกแล้ว {selectedTreatmentData.length} ทรีตเมนต์
                </p>
                <p className="text-2xl font-bold">
                  รวม ฿{totalPrice.toLocaleString()}
                </p>
              </div>
              <Button size="lg">
                จองทรีตเมนต์
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTreatmentData.map((treatment) => (
                <div key={treatment.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">{treatment.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>ราคา: ฿{treatment.price.toLocaleString()}</div>
                    <div>ระยะเวลา: {treatment.duration}</div>
                    <div>ประสิทธิภาพ: {treatment.effectiveness}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
