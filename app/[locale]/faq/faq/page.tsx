"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { 
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Camera,
  Lock,
  Zap,
  CreditCard,
  Users,
  ArrowRight
} from "lucide-react"
import { useTranslations } from "next-intl"

export default function FAQPage() {
  const t = useTranslations('faqPage')
  const [searchQuery, setSearchQuery] = useState("")
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  const categoryKeys = [
    { key: 'aboutSystem', icon: Sparkles },
    { key: 'aiSkinAnalysis', icon: Camera },
    { key: 'securityPrivacy', icon: Lock },
    { key: 'pricingPackages', icon: CreditCard },
    { key: 'usage', icon: Zap },
    { key: 'support', icon: Users }
  ]

  const categories = categoryKeys.map(cat => ({
    title: t(`content.${cat.key}.title`),
    icon: cat.icon,
    faqs: [0, 1, 2, 3, 4].map(i => {
      try {
        const question = t(`content.${cat.key}.faqs.${i}.q`)
        const answer = t(`content.${cat.key}.faqs.${i}.a`)
        // next-intl returns the key if translation is missing
        if (question === `faqPage.content.${cat.key}.faqs.${i}.q` || question.includes(`.faqs.${i}.q`)) return null
        return { question, answer }
      } catch (e) {
        return null
      }
    }).filter(Boolean) as { question: string, answer: string }[]
  }))

  const allFAQs = categories.flatMap(cat => 
    cat.faqs.map(faq => ({ ...faq, category: cat.title, icon: cat.icon }))
  )

  const filteredFAQs = searchQuery 
    ? allFAQs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-muted/30 to-background py-20">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-primary/10 text-primary" variant="secondary">
                <HelpCircle className="mr-2 h-3 w-3" />
                {t('badge')}
              </Badge>

              <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
                {t('title')}
                <br />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {t('titleHighlight')}
                </span>
              </h1>

              <p className="mb-8 text-balance text-lg text-muted-foreground leading-relaxed">
                {t('description')}
              </p>

              {/* Search Bar */}
              <div className="relative mx-auto max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="h-14 pl-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20">
          <div className="container">
            {searchQuery && filteredFAQs ? (
              /* Search Results */
              <div className="mx-auto max-w-4xl">
                <p className="mb-6 text-sm text-muted-foreground">
                  {t('foundQuestions', { count: filteredFAQs.length })}
                </p>
                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => {
                    const Icon = faq.icon
                    const faqId = `search-${index}`
                    return (
                      <Card key={faqId}>
                        <CardHeader
                          className="cursor-pointer transition-colors hover:bg-muted/50"
                          onClick={() => setOpenIndex(openIndex === faqId ? null : faqId)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <Badge variant="outline" className="mb-2 text-xs">
                                  {faq.category}
                                </Badge>
                                <CardTitle className="text-lg font-semibold">
                                  {faq.question}
                                </CardTitle>
                              </div>
                            </div>
                            {openIndex === faqId ? (
                              <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                        {openIndex === faqId && (
                          <CardContent className="pt-0">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Category View */
              <div className="mx-auto max-w-6xl space-y-16">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <div key={category.title}>
                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">{category.title}</h2>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {category.faqs.map((faq, index) => {
                          const globalIndex = `${category.title}-${index}`
                          return (
                            <Card key={globalIndex} className="border-2">
                              <CardHeader
                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <CardTitle className="text-lg font-semibold">
                                    {faq.question}
                                  </CardTitle>
                                  {openIndex === globalIndex ? (
                                    <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                                  )}
                                </div>
                              </CardHeader>
                              {openIndex === globalIndex && (
                                <CardContent className="pt-0">
                                  <p className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                  </p>
                                </CardContent>
                              )}
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="border-y border-border bg-muted/30 py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                {t('stillHaveQuestions')}
              </h2>
              <p className="mb-8 text-balance text-muted-foreground leading-relaxed">
                {t('stillHaveQuestionsDesc')}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/contact">
                    {t('contactUs')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/demo">{t('viewDemo')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                {t('helpfulLinks')}
              </h2>
            </div>

            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
              <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <Sparkles className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{t('gettingStarted')}</CardTitle>
                  <CardDescription>
                    {t('gettingStartedDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/analysis">{t('startNow')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <CreditCard className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{t('pricingTitle')}</CardTitle>
                  <CardDescription>
                    {t('pricingDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/pricing">{t('viewPricing')}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <Users className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>{t('aboutUsTitle')}</CardTitle>
                  <CardDescription>
                    {t('aboutUsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/about">{t('learnMore')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}