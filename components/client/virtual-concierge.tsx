"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, Bot, User, Minimize2, Info, Calendar, Pill } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Message {
  role: 'bot' | 'user'
  content: string
  timestamp: Date
  type?: 'text' | 'action'
}

interface VirtualConciergeProps {
  isPremium: boolean
}

export function VirtualConcierge({ isPremium }: VirtualConciergeProps) {
  const t = useTranslations()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: t('virtualConcierge.welcome'), timestamp: new Date() }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI Response
    setTimeout(() => {
      let botResponse = t('virtualConcierge.botResponses.analyzed')
      
      if (inputValue.toLowerCase().includes('booking') || inputValue.toLowerCase().includes('นัด')) {
        botResponse = t('virtualConcierge.botResponses.booking')
      }

      const botMessage: Message = {
        role: 'bot',
        content: botResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <Card className={cn(
      "border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col h-[600px]",
      !isPremium && "opacity-80 grayscale-[0.5]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      
      {!isPremium && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#020617]/60 backdrop-blur-sm p-10 text-center">
          <Badge className="mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30">{t('virtualConcierge.premiumIntelligence')}</Badge>
          <h3 className="text-2xl font-bold text-white italic mb-4">{t('virtualConcierge.title')}</h3>
          <p className="text-slate-400 max-w-sm font-light mb-8">
            {t('virtualConcierge.upgradeUnlock')}
          </p>
          <Button variant="premium" className="h-14 px-10 rounded-2xl border shadow-xl shadow-pink-500/20 uppercase text-[10px] font-black tracking-widest italic">
            {t('customerProfile.upgradeToPremium')}
          </Button>
        </div>
      )}

      <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <Bot className="h-6 w-6 text-pink-400 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white italic tracking-tight">{t('virtualConcierge.title')}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">{t('virtualConcierge.neuralActive')}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-500 hover:bg-white/5">
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea ref={scrollRef} className="h-full p-8 space-y-8">
          <div className="space-y-8 pb-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 shadow-inner",
                  msg.role === 'bot' 
                    ? "bg-pink-500/10 border-pink-500/20 text-pink-400" 
                    : "bg-white/[0.03] border-white/10 text-slate-400"
                )}>
                  {msg.role === 'bot' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className={cn(
                  "p-5 rounded-[2rem] space-y-2",
                  msg.role === 'bot' 
                    ? "bg-white/[0.02] border border-white/5 text-slate-300 rounded-tl-none" 
                    : "bg-pink-600 text-white rounded-tr-none shadow-xl shadow-pink-600/10"
                )}>
                  <p className="text-sm font-light leading-relaxed">{msg.content}</p>
                  <p className={cn(
                    "text-[8px] font-black uppercase tracking-widest",
                    msg.role === 'bot' ? "text-slate-600" : "text-pink-200"
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Bot className="h-5 w-5 animate-pulse" />
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] rounded-tl-none">
                  <div className="flex gap-1">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 bg-pink-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 bg-pink-500 rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 bg-pink-500 rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-8 border-t border-white/5 bg-white/[0.01] shrink-0">
        <div className="w-full space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" className="rounded-xl border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 italic">
              <Calendar className="mr-2 h-3 w-3" /> {t('virtualConcierge.bookingHelp')}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 italic">
              <Pill className="mr-2 h-3 w-3" /> {t('virtualConcierge.regimenSupport')}
            </Button>
          </div>
          <div className="flex gap-4">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('virtualConcierge.placeholder')}
              className="h-14 rounded-2xl border-white/5 bg-white/[0.03] text-white focus:border-pink-500/30 placeholder:text-slate-700 italic font-light"
            />
            <Button 
              onClick={handleSend}
              className="h-14 w-14 rounded-2xl bg-pink-600 hover:bg-pink-500 shadow-xl shadow-pink-600/20 shrink-0"
            >
              <Send className="h-5 w-5 text-white" />
            </Button>
          </div>
          <div className="flex items-center gap-3 px-2">
            <Info className="h-3 w-3 text-slate-600" />
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
              {t('virtualConcierge.disclaimer')}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
