"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar, Edit } from "lucide-react"
import { useState } from "react"

interface ProfileCardProps {
  user: {
    id: string
    email?: string
    created_at: string
  }
  profile: {
    full_name?: string
    phone?: string
    role?: string
  } | null
}

export function ProfileCard({ user, profile }: ProfileCardProps) {
  const t = useTranslations()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('customerProfile.personalInfo')}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? t('common.cancel') : t('common.edit')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('customerProfile.fullName')}</Label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                <Input id="name" defaultValue={profile?.full_name || ""} placeholder={t('customerProfile.enterName')} />
              ) : (
                <span>{profile?.full_name || t('customerProfile.notSet')}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('common.email')}</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('common.phone')}</Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                <Input id="phone" defaultValue={profile?.phone || ""} placeholder={t('salesWizard.steps.customer.phonePlaceholder')} />
              ) : (
                <span>{profile?.phone || t('customerProfile.notSet')}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('customerProfile.memberSince')}</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(user.created_at).toLocaleDateString(t('common.locale'), {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {isEditing && <Button className="w-full">{t('customerProfile.saveChanges')}</Button>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('customerProfile.accountStatus')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('customerProfile.accountType')}</Label>
            <Badge className="text-sm">
              {profile?.role === "customer_premium" ? t('customerProfile.premiumCustomer') : t('customerProfile.freeCustomer')}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>{t('customerProfile.subscription')}</Label>
            <p className="text-sm text-muted-foreground">
              {profile?.role === "customer_premium" ? t('customerProfile.activePremium') : t('customerProfile.freePlan')}
            </p>
          </div>

          {profile?.role !== "customer_premium" && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-2 font-semibold">{t('customerProfile.upgradeToPremium')}</h4>
              <p className="mb-4 text-sm text-muted-foreground">
                {t('customerProfile.upgradeDesc')}
              </p>
              <Button className="w-full">{t('customerProfile.upgradeNow')}</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
