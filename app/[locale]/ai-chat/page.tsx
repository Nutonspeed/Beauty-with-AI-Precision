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
    t('aiChat.suggestions.customers'),
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
    <div className="flex min-h-screen flex-col bg-[#020617] text-slate-200 selection:bg-pink-500/30">
      <Header />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Infrastructure Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/5 rounded-full blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
        </div>

        <div className="container relative z-10 py-12 md:py-20 flex-1 flex flex-col max-w-5xl">
          {/* Precision Header Section */}
          <div className="text-center mb-12 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-6 py-2 rounded-full border-pink-500/30 text-pink-400 bg-pink-500/5 backdrop-blur-md uppercase tracking-[0.2em] text-[10px] font-black shadow-2xl shadow-pink-500/10">
                <Sparkles className="mr-3 h-3.5 w-3.5 animate-pulse" />
                {t('aiChat.badge' as any) || 'Aesthetic AI Advisor'}
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight italic"
            >
              {t('aiChat.title')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed tracking-wide italic"
            >
              {t('aiChat.description')}
            </motion.p>
          </div>

          {/* Chat Infrastructure - Glassmorphism Interface */}
          <Card className="flex-1 border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col min-h-[600px]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
            
            <CardContent className="flex-1 p-8 lg:p-10 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`flex gap-6 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-inner ${
                      message.role === "user" 
                        ? "bg-pink-600/20 border-pink-500/30 text-pink-400" 
                        : "bg-white/[0.03] border-white/10 text-slate-400"
                    }`}>
                      {message.role === "user" ? <User className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
                    </div>
                    
                    <div className={`max-w-[80%] rounded-3xl p-6 lg:p-8 relative group ${
                      message.role === "user" 
                        ? "bg-pink-600/10 border border-pink-500/20 text-white rounded-tr-none" 
                        : "bg-white/[0.03] border border-white/10 text-slate-300 rounded-tl-none"
                    }`}>
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="whitespace-pre-line text-lg font-light leading-relaxed tracking-wide">
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
                  className="flex gap-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-500 animate-pulse">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl rounded-tl-none p-6 px-10">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500/50 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-pink-500/50 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-pink-500/50 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>

            {/* Input Infrastructure */}
            <div className="p-8 lg:p-10 border-t border-white/5 bg-white/[0.01]">
              <div className="mb-8 flex flex-wrap gap-3">
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
                      className="rounded-full border-white/5 bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-pink-400 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all h-10 px-6"
                      onClick={() => setInput(question)}
                    >
                      {question}
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-1000" />
                <div className="relative flex gap-4">
                  <Input
                    placeholder={t('aiChat.placeholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                    className="h-16 rounded-[1.5rem] border-white/10 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-pink-500/30 focus:ring-pink-500/20 transition-all px-8 text-lg font-light"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()}
                    variant="premium"
                    size="icon"
                    className="h-16 w-16 rounded-[1.5rem] shadow-2xl shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    <Send className="h-6 w-6" />
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
