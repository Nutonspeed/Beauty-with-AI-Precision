"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Sparkles, User } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/lib/i18n/language-context"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AIChatPage() {
  const { language } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: language === "th" 
        ? "สวัสดีครับ! ผมคือ AI Advisor ของ ClinicIQ พร้อมช่วยเหลือคุณในเรื่องการบริหารคลินิก การวิเคราะห์ข้อมูล และให้คำปรึกษาทางธุรกิจครับ 🏥"
        : "Hello! I'm ClinicIQ AI Advisor, ready to help you with clinic management, data analysis, and business consulting! 🏥"
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const suggestedQuestions = language === "th" ? [
    "วิเคราะห์ยอดขายเดือนนี้",
    "แนะนำวิธีเพิ่มลูกค้าใหม่",
    "สรุปผลการรักษายอดนิยม",
    "วิเคราะห์ประสิทธิภาพพนักงาน"
  ] : [
    "Analyze this month's sales",
    "Suggest ways to get new customers",
    "Summarize popular treatments",
    "Analyze staff performance"
  ]

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: language === "th"
          ? `ขอบคุณสำหรับคำถามครับ! นี่คือการวิเคราะห์เบื้องต้น:\n\n📊 จากข้อมูลของคลินิก พบว่า:\n- ยอดขายเฉลี่ยต่อเดือน: ฿450,000\n- การรักษายอดนิยม: Botox (35%), Filler (28%)\n- อัตราการกลับมาใช้บริการ: 72%\n\nแนะนำ: ควรเพิ่มโปรโมชั่นสำหรับลูกค้าใหม่และโปรแกรม Loyalty`
          : `Thank you for your question! Here's my initial analysis:\n\n📊 Based on your clinic data:\n- Average monthly revenue: ฿450,000\n- Popular treatments: Botox (35%), Filler (28%)\n- Return rate: 72%\n\nRecommendation: Consider adding promotions for new customers and a loyalty program`
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/10 text-primary">
              <Sparkles className="mr-2 h-3 w-3" />
              AI Advisor
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              {language === "th" ? "AI ที่ปรึกษาธุรกิจ" : "Business AI Advisor"}
            </h1>
            <p className="text-muted-foreground">
              {language === "th" 
                ? "ถามคำถามเกี่ยวกับธุรกิจ การตลาด หรือขอคำแนะนำจาก AI"
                : "Ask questions about business, marketing, or get AI recommendations"}
            </p>
          </div>

          {/* Chat Area */}
          <Card className="mb-4">
            <CardContent className="p-4 h-[400px] overflow-y-auto space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    <p className="whitespace-pre-line text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <div className="mb-4 flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(question)}
              >
                {question}
              </Button>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              placeholder={language === "th" ? "พิมพ์คำถามของคุณ..." : "Type your question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
