"use client"

import { useAuth } from "@/lib/auth/context"
import { useLocalizePath } from "@/lib/i18n/locale-link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, Home, ArrowLeft, Crown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export default function UnauthorizedPage() {
  const t = useTranslations()
  const router = useRouter()
  const lp = useLocalizePath()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{t('unauthorized.checking')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('unauthorized.title')}</CardTitle>
          <CardDescription>
            {t('unauthorized.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {user ? (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {t('unauthorized.loggedInAs')} <strong>{user.email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('unauthorized.role')} <span className="font-mono bg-muted px-2 py-1 rounded">{user.role}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('unauthorized.tier')} <span className="font-mono bg-muted px-2 py-1 rounded">{user.tier}</span>
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                {t('unauthorized.notLoggedIn')}
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h3 className="font-semibold text-sm">{t('unauthorized.reasons.title')}</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{t('unauthorized.reasons.item1')}</li>
              <li>{t('unauthorized.reasons.item2')}</li>
              <li>{t('unauthorized.reasons.item3')}</li>
              <li>{t('unauthorized.reasons.item4')}</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>
            <Button asChild className="w-full">
              <Link href={lp("/")}> 
                <Home className="mr-2 h-4 w-4" />
                {t('nav.home')}
              </Link>
            </Button>
          </div>

          {user && (user.role?.startsWith("customer") || user.tier === "free") && (
            <Button
              asChild
              variant="default"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Link href={lp("/pricing")}>
                <Crown className="mr-2 h-4 w-4" />
                {t('unauthorized.upgradeToUnlock')}
              </Link>
            </Button>
          )}

          {!user && (
            <Button asChild variant="default" className="w-full">
              <Link href={lp("/auth/login")}>{t('common.login')}</Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground max-w-md space-y-2">
        <p>
          <strong>{t('unauthorized.help.title')}</strong>
        </p>
        <p>
          {t('unauthorized.help.description')}{" "}
          <Link href={lp("/contact")} className="text-primary hover:underline">
            {t('nav.contact')}
          </Link>
        </p>
      </div>
    </div>
  )
}
