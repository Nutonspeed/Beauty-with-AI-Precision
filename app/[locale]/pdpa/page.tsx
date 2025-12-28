"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, FileText, Lock, UserCheck, Mail, Phone, Building2, CheckCircle2 } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function PDPAPage() {
  const t = useTranslations()

  const rights = [
    {
      icon: FileText,
      title: t('pdpa.rights.access.title'),
      desc: t('pdpa.rights.access.desc'),
    },
    {
      icon: UserCheck,
      title: t('pdpa.rights.rectification.title'),
      desc: t('pdpa.rights.rectification.desc'),
    },
    {
      icon: Lock,
      title: t('pdpa.rights.erasure.title'),
      desc: t('pdpa.rights.erasure.desc'),
    },
    {
      icon: Shield,
      title: t('pdpa.rights.restriction.title'),
      desc: t('pdpa.rights.restriction.desc'),
    },
    {
      icon: FileText,
      title: t('pdpa.rights.portability.title'),
      desc: t('pdpa.rights.portability.desc'),
    },
    {
      icon: UserCheck,
      title: t('pdpa.rights.object.title'),
      desc: t('pdpa.rights.object.desc'),
    },
    {
      icon: Shield,
      title: t('pdpa.rights.withdraw.title'),
      desc: t('pdpa.rights.withdraw.desc'),
    },
    {
      icon: FileText,
      title: t('pdpa.rights.complaint.title'),
      desc: t('pdpa.rights.complaint.desc'),
    },
  ]

  const steps = [
    {
      step: "1",
      title: t('pdpa.exercise.step1.title'),
      desc: t('pdpa.exercise.step1.desc'),
    },
    {
      step: "2",
      title: t('pdpa.exercise.step2.title'),
      desc: t('pdpa.exercise.step2.desc'),
    },
    {
      step: "3",
      title: t('pdpa.exercise.step3.title'),
      desc: t('pdpa.exercise.step3.desc'),
    },
    {
      step: "4",
      title: t('pdpa.exercise.step4.title'),
      desc: t('pdpa.exercise.step4.desc'),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-background to-muted/50 py-12 sm:py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">
                <Shield className="mr-1 h-3 w-3" />
                {t('pdpa.hero.badge')}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {t('pdpa.hero.title')}
                <span className="block text-2xl sm:text-3xl md:text-4xl mt-2 text-primary">{t('pdpa.hero.subtitle')}</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t('pdpa.hero.description')}
              </p>
            </div>
          </div>
        </section>

        {/* Rights Section */}
        <section className="py-8 sm:py-12 border-b border-border bg-background">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl font-bold">
                  {t('pdpa.rights.title')}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('pdpa.rights.subtitle')}
                </p>
              </div>

              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {rights.map((right, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                    <CardContent className="p-4 sm:p-5">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <right.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="mb-2 text-sm sm:text-base font-semibold leading-tight">
                        {right.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {right.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How to Exercise Rights */}
        <section className="py-8 sm:py-12">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 text-center">
                <h2 className="mb-3 text-2xl sm:text-3xl font-bold">
                  {t('pdpa.exercise.title')}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t('pdpa.exercise.subtitle')}
                </p>
              </div>

              <div className="mb-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary text-2xl sm:text-3xl font-bold text-primary-foreground">
                        {item.step}
                      </div>
                      <h3 className="mb-2 text-base sm:text-lg font-semibold">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
                    )}
                  </div>
                ))}
              </div>

              {/* Contact Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Email */}
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {t('pdpa.contact.email')}
                    </h3>
                    <a
                      href="mailto:pdpa@aibeautyplatform.com"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      pdpa@aibeautyplatform.com
                    </a>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t('pdpa.contact.emailResponse')}
                    </p>
                  </CardContent>
                </Card>

                {/* Phone */}
                <Card className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {t('pdpa.contact.phone')}
                    </h3>
                    <a href="tel:+66-2-xxx-xxxx" className="text-sm text-primary hover:underline">
                      +66 2 XXX XXXX
                    </a>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t('pdpa.contact.phoneHours')}
                    </p>
                  </CardContent>
                </Card>

                {/* Office */}
                <Card className="border-2 hover:border-primary/50 transition-all sm:col-span-2 lg:col-span-1">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {t('pdpa.contact.office')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('pdpa.contact.officeAddress')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* DPO Section */}
        <section className="border-t border-border bg-muted/50 py-8 sm:py-12">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <UserCheck className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-3 text-xl sm:text-2xl font-bold">
                        {t('pdpa.dpo.title')}
                        <span className="ml-2 text-primary">(DPO)</span>
                      </h2>
                      <p className="mb-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {t('pdpa.dpo.description')}
                      </p>
                      <div className="space-y-2 text-sm sm:text-base mb-6">
                        <p>
                          <strong>{t('pdpa.dpo.name')}</strong> {t('pdpa.dpo.nameValue')}
                        </p>
                        <p>
                          <strong>{t('pdpa.dpo.email')}</strong>{" "}
                          <a href="mailto:dpo@aibeautyplatform.com" className="text-primary hover:underline">
                            dpo@aibeautyplatform.com
                          </a>
                        </p>
                        <p>
                          <strong>{t('pdpa.dpo.phone')}</strong>{" "}
                          <a href="tel:+66-2-xxx-xxxx" className="text-primary hover:underline">
                            +66 2 XXX XXXX ต่อ 101
                          </a>
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/contact">
                          <Button className="w-full sm:w-auto">
                            <Mail className="mr-2 h-4 w-4" />
                            {t('pdpa.dpo.contactDpo')}
                          </Button>
                        </Link>
                        <Link href="/privacy">
                          <Button variant="outline" className="w-full sm:w-auto">
                            <Shield className="mr-2 h-4 w-4" />
                            {t('pdpa.dpo.privacyPolicy')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Legal Authority */}
        <section className="border-t border-border bg-background py-8">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg sm:text-xl font-bold">
                    {t('pdpa.authority.title')}
                  </h3>
                  <p className="mb-4 text-sm sm:text-base text-muted-foreground">
                    {t('pdpa.authority.description')}
                  </p>
                  <a
                    href="https://www.pdpc.or.th"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    www.pdpc.or.th
                  </a>
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
