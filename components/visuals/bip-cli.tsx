"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, ChevronRight, Binary, Code } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function BIPCLI() {
  const t = useTranslations()
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([
    t('ui.terminal.initializing'),
    t('ui.terminal.nodeEstablished'),
    t('ui.terminal.authVerified'),
    t('ui.terminal.helpPrompt')
  ])
  const terminalEndRef = useRef<HTMLDivElement>(null)

  const commands: Record<string, string> = {
    'help': t('ui.terminal.availableCommands'),
    'status': t('ui.terminal.statusResponse'),
    'scan-nodes': t('ui.terminal.nodesFound'),
    'roi-projection': t('ui.terminal.roiResponse'),
    'neural-health': t('ui.terminal.neuralHealthResponse'),
  }

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const cmd = input.toLowerCase().trim()
    let response = t('ui.terminal.commandNotRecognized', { cmd })

    if (cmd === 'clear') {
      setHistory([])
      setInput("")
      return
    }

    if (commands[cmd]) {
      response = commands[cmd]
    }

    setHistory(prev => [...prev, `> ${input}`, response])
    setInput("")
  }

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  return (
    <div className="w-full bg-black border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative font-mono group animate-neural-pulse">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      {/* Terminal Header */}
      <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
          </div>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-3 text-slate-500">
            <Terminal className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{t('bipCli.active')}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-[8px] font-black border-white/10 text-emerald-500 italic uppercase">
          {t('ui.terminal.secureNode')}
        </Badge>
      </div>

      <div className="p-8 h-[400px] overflow-y-auto custom-scrollbar flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {history.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "text-[11px] leading-relaxed",
                line.startsWith('>') ? "text-cyan-400 font-bold" : 
                line.startsWith('SYSTEM') || line.includes('SUCCESS') ? "text-emerald-400" : "text-slate-400"
              )}
            >
              {line}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={terminalEndRef} />
      </div>

      <form onSubmit={handleCommand} className="p-8 pt-0 flex items-center gap-4">
        <ChevronRight className="h-4 w-4 text-emerald-500" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-emerald-400 text-[11px] placeholder:text-slate-800"
          placeholder={t('ui.terminal.enterCommand')}
          autoFocus
        />
        <div className="flex items-center gap-4 text-slate-700">
          <Binary className="h-3 w-3" />
          <span className="text-[8px] font-black uppercase tracking-widest">BIP_Neural_v4.2</span>
        </div>
      </form>

      <div className="px-8 py-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Code className="h-3 w-3 text-slate-700" />
          <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] italic">{t('ui.terminal.commandShell')}</p>
        </div>
        <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{t('ui.terminal.encryptedTransmission')}</p>
      </div>
    </div>
  )
}
