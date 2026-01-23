"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Sparkles, User } from "lucide-react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AIChatPage() {
  const t = useTranslations()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t('aiChat.initialMessage')
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const suggestedQuestions = [
    t('aiChat.suggestions.sales'),
    t('aiChat.suggestions.clients' as any) || t('aiChat.suggestions.customers'),
    t('aiChat.suggestions.programs'),
    t('aiChat.suggestions.staff')
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
        content: t('aiChat.aiResponse')
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-pink-500/10">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background - Light Theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.015]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 flex-1 flex flex-col max-w-5xl">
          {/* Precision Header Section */}
          <div className="text-center mb-16 space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-600 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.3em] text-[10px] font-black shadow-premium animate-pulse">
                <Sparkles className="mr-3 h-3.5 w-3.5" />
                {t('aiChat.badge' as any) || 'Aesthetic AI Advisor'}
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl font-black tracking-tighter text-slate-950 leading-[0.9] italic uppercase"
            >
              Aesthetic AI Advisor
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-slate-500 max-w-2xl mx-auto text-xl font-light leading-relaxed tracking-tight italic"
            >
              Deploy our neural-driven advisor node to orchestrate your aesthetic journey with precision.
            </motion.p>
          </div>

          {/* Chat Infrastructure - Premium Light Interface */}
          <Card className="flex-1 border-slate-100 bg-white shadow-premium rounded-[3.5rem] overflow-hidden relative flex flex-col min-h-[650px]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent" />
            
            <CardContent className="flex-1 p-10 lg:p-14 overflow-y-auto space-y-10 scrollbar-hide">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`flex gap-8 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-700 shadow-sm ${
                      message.role === "user" 
                        ? "bg-pink-500 text-white border-pink-400 shadow-glow-pink/30 scale-110" 
                        : "bg-slate-50 border-slate-100 text-slate-400"
                    }`}>
                      {message.role === "user" ? <User className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
                    </div>
                    
                    <div className={`max-w-[80%] rounded-[2.5rem] p-8 lg:p-10 relative group shadow-sm ${
                      message.role === "user" 
                        ? "bg-slate-900 text-white rounded-tr-none" 
                        : "bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none"
                    }`}>
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="whitespace-pre-line text-lg font-light leading-relaxed tracking-tight italic">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-8"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-pink-500 animate-pulse shadow-sm">
                    <Bot className="h-7 w-7" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-[2rem] rounded-tl-none p-8 px-12 shadow-inner">
                    <div className="flex gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500/40 animate-bounce" />
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500/40 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500/40 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>

            {/* Input Infrastructure */}
            <div className="p-10 lg:p-14 border-t border-slate-50 bg-slate-50/30">
              <div className="mb-10 flex flex-wrap gap-4 justify-center">
                {suggestedQuestions.map((question, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + (index * 0.1) }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-pink-600 hover:border-pink-500/30 hover:bg-white transition-all h-12 px-8 shadow-sm italic"
                      onClick={() => setInput(question)}
                    >
                      {question}
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="relative group max-w-4xl mx-auto">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-600/10 rounded-[3rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                <div className="relative flex gap-6">
                  <Input
                    placeholder={t('aiChat.placeholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                    className="h-20 rounded-[2rem] border-slate-100 bg-white text-slate-900 placeholder:text-slate-400 focus:border-pink-500/30 focus:ring-pink-500/10 transition-all px-10 text-xl font-light italic shadow-premium"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    variant="premium"
                    size="icon"
                    className="h-20 w-20 rounded-[2rem] shadow-2xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all shrink-0 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 border-none text-white"
                  >
                    <Send className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
