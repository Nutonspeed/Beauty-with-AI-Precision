"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Star, Clock, DollarSign } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export function TreatmentComparison() {
  const t = useTranslations()
  const locale = useLocale()
  
  // Localized mock data
  const treatments = [
    {
      id: "hydrafacial",
      name: "HydraFacial",
      category: "cleansing",
      price: 4500,
      duration: t('treatments.durations.min45'),
      description: t('treatments.hydrafacial.description'),
      benefits: [t('treatments.hydrafacial.benefit1'), t('treatments.hydrafacial.benefit2'), t('treatments.hydrafacial.benefit3')],
      suitability: [t('treatments.suitability.all'), t('treatments.suitability.oily'), t('treatments.suitability.combination')],
      rating: 4.8,
      reviews: 245,
      effectiveness: 85,
      sideEffects: t('treatments.sideEffects.minimal'),
      recoveryTime: t('treatments.recovery.none')
    },
    {
      id: "chemical_peel",
      name: "Chemical Peel",
      category: "exfoliation",
      price: 3200,
      duration: t('treatments.durations.min30'),
      description: t('treatments.chemical_peel.description'),
      benefits: [t('treatments.chemical_peel.benefit1'), t('treatments.chemical_peel.benefit2'), t('treatments.chemical_peel.benefit3')],
      suitability: [t('treatments.suitability.dull'), t('treatments.suitability.spots'), t('treatments.suitability.fine_lines')],
      rating: 4.6,
      reviews: 189,
      effectiveness: 78,
      sideEffects: t('treatments.sideEffects.redness'),
      recoveryTime: t('treatments.recovery.short')
    },
    {
      id: "rf_tightening",
      name: "RF Skin Tightening",
      category: "anti-aging",
      price: 8500,
      duration: t('treatments.durations.min60'),
      description: t('treatments.rf_tightening.description'),
      benefits: [t('treatments.rf_tightening.benefit1'), t('treatments.rf_tightening.benefit2'), t('treatments.rf_tightening.benefit3')],
      suitability: [t('treatments.suitability.sagging'), t('treatments.suitability.wrinkles'), t('treatments.suitability.aging')],
      rating: 4.9,
      reviews: 156,
      effectiveness: 92,
      sideEffects: t('treatments.sideEffects.heat'),
      recoveryTime: t('treatments.recovery.none')
    },
    {
      id: "microneedling",
      name: "Microneedling",
      category: "anti-aging",
      price: 5500,
      duration: t('treatments.durations.min50'),
      description: t('treatments.microneedling.description'),
      benefits: [t('treatments.microneedling.benefit1'), t('treatments.microneedling.benefit2'), t('treatments.microneedling.benefit3')],
      suitability: [t('treatments.suitability.deep_lines'), t('treatments.suitability.uneven'), t('treatments.suitability.aging')],
      rating: 4.7,
      reviews: 98,
      effectiveness: 88,
      sideEffects: t('treatments.sideEffects.swelling'),
      recoveryTime: t('treatments.recovery.moderate')
    }
  ]

  const packages = [
    {
      id: "basic",
      name: t('packages.basic.name'),
      treatments: ["hydrafacial", "chemical_peel"],
      totalPrice: 7700,
      savings: 0,
      description: t('packages.basic.description')
    },
    {
      id: "premium",
      name: t('packages.premium.name'),
      treatments: ["hydrafacial", "chemical_peel", "rf_tightening"],
      totalPrice: 16200,
      savings: 1800,
      description: t('packages.premium.description')
    },
    {
      id: "vip",
      name: t('packages.vip.name'),
      treatments: ["hydrafacial", "chemical_peel", "rf_tightening", "microneedling"],
      totalPrice: 21700,
      savings: 4300,
      description: t('packages.vip.description')
    }
  ]

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
            {t('treatmentComparison.aiTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-sm font-medium mb-2">{t('treatmentComparison.skinConcernLabel')}</div>
              <Select value={skinConcern} onValueChange={setSkinConcern}>
                <SelectTrigger>
                  <SelectValue placeholder={t('treatmentComparison.concerns.acne')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acne">{t('treatmentComparison.concerns.acne')}</SelectItem>
                  <SelectItem value="pigmentation">{t('treatmentComparison.concerns.pigmentation')}</SelectItem>
                  <SelectItem value="anti-aging">{t('treatmentComparison.concerns.anti_aging')}</SelectItem>
                  <SelectItem value="dryness">{t('treatmentComparison.concerns.dryness')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">{t('treatmentComparison.budgetLabel')}</div>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder={t('treatmentComparison.budgets.low')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('treatmentComparison.budgets.low')}</SelectItem>
                  <SelectItem value="medium">{t('treatmentComparison.budgets.medium')}</SelectItem>
                  <SelectItem value="high">{t('treatmentComparison.budgets.high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleGetRecommendation} className="w-full">
                <Star className="h-4 w-4 mr-2" />
                {t('treatmentComparison.getRecommendation')}
              </Button>
            </div>
          </div>

          {recommendedPackage && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">
                      {t('treatmentComparison.recommended')}: {recommendedPackage.name}
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      {recommendedPackage.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {t('format.currency', { amount: recommendedPackage.totalPrice.toLocaleString() })}
                      </span>
                      {recommendedPackage.savings > 0 && (
                        <span className="text-green-600 font-medium">
                          {t('treatmentComparison.savings', { amount: t('format.currency', { amount: recommendedPackage.savings.toLocaleString() }) })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    {t('treatmentComparison.choosePackage')}
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
          <CardTitle>{t('treatmentComparison.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">{t('treatmentComparison.gridView')}</TabsTrigger>
              <TabsTrigger value="comparison">{t('treatmentComparison.comparisonView')}</TabsTrigger>
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
                          {t('format.currency', { amount: treatment.price.toLocaleString() })}
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
                        <div className="text-xs font-medium mb-1">{t('treatmentComparison.table.effectiveness')}:</div>
                        <div className="flex flex-wrap gap-1">
                          {treatment.benefits.slice(0, 2).map((benefit, _index) => (
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
                  {t('treatmentComparison.noSelection')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">{t('treatmentComparison.table.treatment')}</th>
                        <th className="text-left p-2 font-medium">{t('treatmentComparison.table.price')}</th>
                        <th className="text-left p-2 font-medium">{t('treatmentComparison.table.duration')}</th>
                        <th className="text-left p-2 font-medium">{t('treatmentComparison.table.effectiveness')}</th>
                        <th className="text-left p-2 font-medium">{t('treatmentComparison.table.recovery')}</th>
                        <th className="text-left p-2 font-medium">{t('treatmentComparison.table.rating')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTreatmentData.map((treatment) => (
                        <tr key={treatment.id} className="border-b">
                          <td className="p-2 font-medium">{treatment.name}</td>
                          <td className="p-2">{t('format.currency', { amount: treatment.price.toLocaleString() })}</td>
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
            <CardTitle>{t('treatmentComparison.summaryTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('treatmentComparison.selectedCount', { count: selectedTreatmentData.length })}
                </p>
                <p className="text-2xl font-bold">
                  {t('treatmentComparison.total', { amount: t('format.currency', { amount: totalPrice.toLocaleString() }) })}
                </p>
              </div>
              <Button size="lg">
                {t('treatmentComparison.bookNow')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTreatmentData.map((treatment) => (
                <div key={treatment.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">{treatment.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{t('treatmentComparison.table.price')}: {t('format.currency', { amount: treatment.price.toLocaleString() })}</div>
                    <div>{t('treatmentComparison.table.duration')}: {treatment.duration}</div>
                    <div>{t('treatmentComparison.table.effectiveness')}: {treatment.effectiveness}%</div>
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
