'use client'

/**
 * Register Page - DISABLED (Invitation-Only System)
 */

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div>
            <CardTitle className="text-2xl font-bold">
              ระบบเชิญเข้าใช้งานเท่านั้น
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Invitation-Only System
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong className="block mb-2">การสมัครสมาชิกถูกปิดการใช้งาน</strong>
              <p className="text-sm text-blue-700">
                ระบบนี้ใช้สำหรับคลินิกเท่านั้น ผู้ใช้งานทุกคนจะได้รับอีเมลเชิญจากผู้จัดการของคลินิก
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-gray-600">
            <p className="font-medium text-gray-900">วิธีเข้าใช้งาน:</p>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>
                <strong>เจ้าของคลินิก:</strong> ติดต่อ Super Admin เพื่อขอสร้างคลินิกใหม่
              </li>
              <li>
                <strong>พนักงานคลินิก:</strong> รอรับอีเมลเชิญจากเจ้าของคลินิก
              </li>
              <li>
                <strong>พนักงานขาย:</strong> รอรับอีเมลเชิญจากผู้จัดการ
              </li>
              <li>
                <strong>ลูกค้า:</strong> รอรับอีเมลเชิญจากพนักงานขาย
              </li>
            </ul>
          </div>

          <Alert className="bg-purple-50 border-purple-200">
            <AlertDescription className="text-purple-900">
              <strong className="block mb-1">ได้รับอีเมลเชิญแล้ว?</strong>
              <p className="text-sm text-purple-700">
                คลิกลิงก์ในอีเมลเพื่อสร้างบัญชีและตั้งรหัสผ่าน
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardContent className="pt-0">
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="w-full"
              asChild
            >
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                ต้องการสร้างคลินิกใหม่?{" "}
                <a 
                  href="mailto:admin@beautyclinic.com?subject=ขอสร้างคลินิกใหม่"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ติดต่อเรา
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
