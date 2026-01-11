"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Star, Clock, DollarSign } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export function ProgramComparison() {
  const t = useTranslations()
  const locale = useLocale()
  
  // Localized mock data
  const programs = [
    {
      id: "hydrafacial",
      name: "HydraFacial",
      category: "cleansing",
      price: 4500,
      duration: t('programs.durations.min45'),
      description: t('programs.hydrafacial.description'),
      benefits: [t('programs.hydrafacial.benefit1'), t('programs.hydrafacial.benefit2'), t('programs.hydrafacial.benefit3')],
      suitability: [t('programs.suitability.all'), t('programs.suitability.oily'), t('programs.suitability.combination')],
      rating: 4.8,
      reviews: 245,
      effectiveness: 85,
      sideEffects: t('programs.sideEffects.minimal'),
      recoveryTime: t('programs.recovery.none')
    },
    {
      id: "chemical_peel",
      name: "Chemical Peel",
      category: "exfoliation",
      price: 3200,
      duration: t('programs.durations.min30'),
      description: t('programs.chemical_peel.description'),
      benefits: [t('programs.chemical_peel.benefit1'), t('programs.chemical_peel.benefit2'), t('programs.chemical_peel.benefit3')],
      suitability: [t('programs.suitability.dull'), t('programs.suitability.spots'), t('programs.suitability.fine_lines')],
      rating: 4.6,
      reviews: 189,
      effectiveness: 78,
      sideEffects: t('programs.sideEffects.redness'),
      recoveryTime: t('programs.recovery.short')
    },
    {
      id: "rf_tightening",
      name: "RF Skin Tightening",
      category: "anti-aging",
      price: 8500,
      duration: t('programs.durations.min60'),
      description: t('programs.rf_tightening.description'),
      benefits: [t('programs.rf_tightening.benefit1'), t('programs.rf_tightening.benefit2'), t('programs.rf_tightening.benefit3')],
      suitability: [t('programs.suitability.sagging'), t('programs.suitability.wrinkles'), t('programs.suitability.aging')],
      rating: 4.9,
      reviews: 156,
      effectiveness: 92,
      sideEffects: t('programs.sideEffects.heat'),
      recoveryTime: t('programs.recovery.none')
    },
    {
      id: "microneedling",
      name: "Microneedling",
      category: "anti-aging",
      price: 5500,
      duration: t('programs.durations.min50'),
      description: t('programs.microneedling.description'),
      benefits: [t('programs.microneedling.benefit1'), t('programs.microneedling.benefit2'), t('programs.microneedling.benefit3')],
      suitability: [t('programs.suitability.deep_lines'), t('programs.suitability.uneven'), t('programs.suitability.aging')],
      rating: 4.7,
      reviews: 98,
      effectiveness: 88,
      sideEffects: t('programs.sideEffects.swelling'),
      recoveryTime: t('programs.recovery.moderate')
    }
  ]

  const packages = [
    {
      id: "basic",
      name: t('packages.basic.name'),
      programs: ["hydrafacial", "chemical_peel"],
      totalPrice: 7700,
      savings: 0,
      description: t('packages.basic.description')
    },
    {
      id: "premium",
      name: t('packages.premium.name'),
      programs: ["hydrafacial", "chemical_peel", "rf_tightening"],
      totalPrice: 16200,
      savings: 1800,
      description: t('packages.premium.description')
    },
    {
      id: "vip",
      name: t('packages.vip.name'),
      programs: ["hydrafacial", "chemical_peel", "rf_tightening", "microneedling"],
      totalPrice: 21700,
      savings: 4300,
      description: t('packages.vip.description')
    }
  ]

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [skinConcern, setSkinConcern] = useState("")
  const [budget, setBudget] = useState("")
  const [recommendedPackage, setRecommendedPackage] = useState<typeof packages[0] | null>(null)

  const handleProgramToggle = (programId: string) => {
    setSelectedPrograms(prev =>
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
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

  const selectedProgramData = programs.filter(t => selectedPrograms.includes(t.id))
  const totalPrice = selectedProgramData.reduce((sum, t) => sum + t.price, 0)

  return (
    <div className="space-y-6">
      {/* AI Recommendation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {t('programComparison.aiTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-sm font-medium mb-2">{t('programComparison.skinConcernLabel')}</div>
              <Select value={skinConcern} onValueChange={setSkinConcern}>
                <SelectTrigger>
                  <SelectValue placeholder={t('programComparison.concerns.acne')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acne">{t('programComparison.concerns.acne')}</SelectItem>
                  <SelectItem value="pigmentation">{t('programComparison.concerns.pigmentation')}</SelectItem>
                  <SelectItem value="anti-aging">{t('programComparison.concerns.anti_aging')}</SelectItem>
                  <SelectItem value="dryness">{t('programComparison.concerns.dryness')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">{t('programComparison.budgetLabel')}</div>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder={t('programComparison.budgets.low')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('programComparison.budgets.low')}</SelectItem>
                  <SelectItem value="medium">{t('programComparison.budgets.medium')}</SelectItem>
                  <SelectItem value="high">{t('programComparison.budgets.high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleGetRecommendation} className="w-full">
                <Star className="h-4 w-4 mr-2" />
                {t('programComparison.getRecommendation')}
              </Button>
            </div>
          </div>

          {recommendedPackage && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">
                      {t('programComparison.recommended')}: {recommendedPackage.name}
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
                          {t('programComparison.savings', { amount: t('format.currency', { amount: recommendedPackage.savings.toLocaleString() }) })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    {t('programComparison.choosePackage')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Program Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>{t('programComparison.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">{t('programComparison.gridView')}</TabsTrigger>
              <TabsTrigger value="comparison">{t('programComparison.comparisonView')}</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((program) => (
                  <Card
                    key={program.id}
                    className={`cursor-pointer transition-colors ${
                      selectedPrograms.includes(program.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => handleProgramToggle(program.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{program.name}</h3>
                        {selectedPrograms.includes(program.id) && (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground mb-3">
                        {program.description}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          {t('format.currency', { amount: program.price.toLocaleString() })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {program.duration}
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          {program.rating} ({program.reviews} reviews)
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">{t('programComparison.table.effectiveness')}:</div>
                        <div className="flex flex-wrap gap-1">
                          {program.benefits.slice(0, 2).map((benefit, _index) => (
                            <Badge key={benefit} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                          {program.benefits.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{program.benefits.length - 2}
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
              {selectedProgramData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('programComparison.noSelection')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">{t('programComparison.table.program')}</th>
                        <th className="text-left p-2 font-medium">{t('programComparison.table.price')}</th>
                        <th className="text-left p-2 font-medium">{t('programComparison.table.duration')}</th>
                        <th className="text-left p-2 font-medium">{t('programComparison.table.effectiveness')}</th>
                        <th className="text-left p-2 font-medium">{t('programComparison.table.recovery')}</th>
                        <th className="text-left p-2 font-medium">{t('programComparison.table.rating')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProgramData.map((program) => (
                        <tr key={program.id} className="border-b">
                          <td className="p-2 font-medium">{program.name}</td>
                          <td className="p-2">{t('format.currency', { amount: program.price.toLocaleString() })}</td>
                          <td className="p-2">{program.duration}</td>
                          <td className="p-2">{program.effectiveness}%</td>
                          <td className="p-2">{program.recoveryTime}</td>
                          <td className="p-2 flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {program.rating}
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

      {/* Selected Programs Summary */}
      {selectedProgramData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('programComparison.summaryTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('programComparison.selectedCount', { count: selectedProgramData.length })}
                </p>
                <p className="text-2xl font-bold">
                  {t('programComparison.total', { amount: t('format.currency', { amount: totalPrice.toLocaleString() }) })}
                </p>
              </div>
              <Button size="lg">
                {t('programComparison.bookNow')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedProgramData.map((program) => (
                <div key={program.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">{program.name}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{t('programComparison.table.price')}: {t('format.currency', { amount: program.price.toLocaleString() })}</div>
                    <div>{t('programComparison.table.duration')}: {program.duration}</div>
                    <div>{t('programComparison.table.effectiveness')}: {program.effectiveness}%</div>
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
