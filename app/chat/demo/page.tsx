'use client';

import { ChatRoom } from '@/components/chat/chat-room';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ChatDemoPage() {
  // Demo: Simulate two users for testing
  const currentUser = {
    id: 'user-1',
    name: 'นพ.สมชาย ใจดี',
    role: 'staff' as const
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">ระบบแชทแบบเรียลไทม์</h1>
          <Badge variant="secondary" className="text-sm">
            Phase 2 - Task #5
          </Badge>
        </div>
        <p className="text-muted-foreground">
          ระบบแชทสำหรับคลินิก รองรับการพิมพ์แบบเรียลไทม์ การอ่านข้อความ และสถานะการส่ง
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Typing Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              แสดงสถานะการพิมพ์ของผู้ใช้อื่นแบบเรียลไทม์ พร้อมระบบ auto-stop หลัง 3 วินาที
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Read Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              ติดตามสถานะการอ่านข้อความด้วย checkmark สีน้ำเงินเมื่อผู้รับอ่านแล้ว
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Delivery Status</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              ระบบยืนยันการส่งและรับข้อความ พร้อม delivery confirmation
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Chat Room */}
      <Card>
        <CardHeader>
          <CardTitle>ห้องแชท: คลินิก - คำปรึกษา</CardTitle>
          <CardDescription>
            ผู้ใช้ปัจจุบัน: <span className="font-medium">{currentUser.name}</span>{' '}
            <Badge variant="outline" className="ml-2">{currentUser.role === 'staff' ? 'เจ้าหน้าที่' : 'ผู้ป่วย'}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChatRoom
            roomId="clinic-consult-demo"
            userId={currentUser.id}
            userName={currentUser.name}
            userRole={currentUser.role}
          />
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดทางเทคนิค</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Features Implemented:</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ Room-based chat subscriptions</li>
                <li>✅ In-memory message caching</li>
                <li>✅ Typing indicators with 3s timeout</li>
                <li>✅ Read receipts tracking</li>
                <li>✅ Delivery confirmations</li>
                <li>✅ Auto-scroll to latest message</li>
                <li>✅ Message timestamps</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Test Coverage:</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ ChatManager: 18/18 tests passing</li>
                <li>├─ Room Management (3 tests)</li>
                <li>├─ Message Handling (4 tests)</li>
                <li>├─ Typing Indicators (3 tests)</li>
                <li>├─ Read Receipts (3 tests)</li>
                <li>├─ Delivery Confirmations (3 tests)</li>
                <li>└─ Cleanup (2 tests)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">วิธีทดสอบ</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>เปิดหน้านี้ในแท็บใหม่เพื่อจำลองผู้ใช้ 2 คน</li>
            <li>พิมพ์ข้อความในแท็บหนึ่ง จะเห็น typing indicator ในอีกแท็บ</li>
            <li>ส่งข้อความ จะเห็น checkmark แสดงสถานะการส่ง (delivered)</li>
            <li>ข้อความที่ได้รับจะถูกมาร์คเป็นอ่านโดยอัตโนมัติหลัง 1 วินาที</li>
            <li>เมื่ออ่านแล้ว checkmark จะเปลี่ยนเป็นสีน้ำเงิน (read)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
