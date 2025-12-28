"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2,
  Building2,
  Users,
  Sparkles
} from "lucide-react"
import { useTranslations } from "next-intl"

export default function ContactPage() {
  const t = useTranslations()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clinicName: "",
    message: "",
    interest: "premium"
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log("Contact form submitted:", formData)
    setSubmitted(true)
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-16">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary" variant="secondary">
              <Sparkles className="mr-2 h-3 w-3" />
              {t('contact.hero.badge')}
            </Badge>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              {t('contact.hero.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t('contact.hero.description')}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {t('contact.form.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('contact.form.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            {t('contact.form.fullName')} *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder={t('contact.form.namePlaceholder')}
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            {t('contact.form.email')} *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            {t('contact.form.phone')}
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="08X-XXX-XXXX"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clinicName">
                            {t('contact.form.clinicName')}
                          </Label>
                          <Input
                            id="clinicName"
                            name="clinicName"
                            placeholder={t('contact.form.clinicPlaceholder')}
                            value={formData.clinicName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interest">
                          {t('contact.form.packageInterest')}
                        </Label>
                        <select
                          id="interest"
                          name="interest"
                          aria-label="Package Interest"
                          value={formData.interest}
                          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="free">{t('contact.form.packages.free')}</option>
                          <option value="premium">{t('contact.form.packages.premium')}</option>
                          <option value="enterprise">{t('contact.form.packages.enterprise')}</option>
                          <option value="consultation">{t('contact.form.packages.consultation')}</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">
                          {t('contact.form.message')} *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder={t('contact.form.messagePlaceholder')}
                          value={formData.message}
                          onChange={handleChange}
                          rows={5}
                          required
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            {t('contact.form.sending')}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {t('contact.form.sendMessage')}
                          </>
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="mb-2 text-2xl font-bold">
                        {t('contact.form.success.title')}
                      </h3>
                      <p className="mb-6 text-muted-foreground">
                        {t('contact.form.success.description')}
                      </p>
                      <Button onClick={() => setSubmitted(false)} variant="outline">
                        {t('contact.form.success.sendAnother')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('contact.info.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">Email</div>
                      <a href="mailto:contact@ai367bar.com" className="text-sm text-muted-foreground hover:text-primary">
                        contact@ai367bar.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {t('contact.info.phone')}
                      </div>
                      <a href="tel:+66123456789" className="text-sm text-muted-foreground hover:text-primary">
                        +66 (0) 12-345-6789
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {t('contact.info.address')}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('contact.info.addressText')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">
                        {t('contact.info.businessHours')}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('contact.info.hoursText')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t('contact.enterprise.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      {t('contact.enterprise.discount')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      {t('contact.enterprise.customization')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      {t('contact.enterprise.support')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
