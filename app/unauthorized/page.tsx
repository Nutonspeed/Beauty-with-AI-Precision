"use client"

import { useAuth } from "@/lib/auth/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, Home, ArrowLeft, Crown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
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
          <CardTitle className="text-2xl">ไม่มีสิทธิ์เข้าถึง</CardTitle>
          <CardDescription>
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาตรวจสอบสิทธิ์การเข้าถึงของคุณ
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {user ? (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    คุณกำลังเข้าสู่ระบบในฐานะ: <strong>{user.email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    บทบาท: <span className="font-mono bg-muted px-2 py-1 rounded">{user.role}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    แพ็กเกจ: <span className="font-mono bg-muted px-2 py-1 rounded">{user.tier}</span>
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h3 className="font-semibold text-sm">เหตุผลที่อาจทำให้คุณไม่สามารถเข้าถึงหน้านี้:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>หน้านี้ต้องการบทบาทหรือสิทธิ์พิเศษ</li>
              <li>แพ็กเกจของคุณไม่รองรับฟีเจอร์นี้</li>
              <li>คุณต้องอัพเกรดเป็นแพ็กเกจที่สูงกว่า</li>
              <li>หน้านี้เฉพาะสำหรับบุคลากรของคลินิก หรือแอดมิน</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              ย้อนกลับ
            </Button>
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                หน้าแรก
              </Link>
            </Button>
          </div>

          {user && (user.role === "customer" || user.tier === "free") && (
            <Button asChild variant="default" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                อัพเกรดเพื่อปลดล็อคฟีเจอร์
              </Link>
            </Button>
          )}

          {!user && (
            <Button asChild variant="default" className="w-full">
              <Link href="/auth/login">
                เข้าสู่ระบบ
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground max-w-md space-y-2">
        <p>💡 <strong>ต้องการความช่วยเหลือ?</strong></p>
        <p>
          หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณา{" "}
          <Link href="/contact" className="text-primary hover:underline">
            ติดต่อเรา
          </Link>
        </p>
      </div>
    </div>
  )
}
