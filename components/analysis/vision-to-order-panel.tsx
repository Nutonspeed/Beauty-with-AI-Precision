"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Package, Zap, ChevronRight, ShieldCheck, Box, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface RecommendationItem {
  name?: string
  category?: string
  description: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

interface VisionToOrderPanelProps {
  analysisId: string
  recommendations?: {
    products?: RecommendationItem[]
    programs?: RecommendationItem[]
  }
}

export function VisionToOrderPanel({ analysisId: _analysisId, recommendations }: VisionToOrderPanelProps) {
  const _t = useTranslations()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)

  const toggleItem = (name: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(name)) {
      newSelected.delete(name)
    } else {
      newSelected.add(name)
    }
    setSelectedItems(newSelected)
  }

  const handleOrder = () => {
    if (selectedItems.size === 0) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      toast.success("Order sequence initialized and synchronized.")
      setSelectedItems(new Set())
    }, 2000)
  }

  const products = recommendations?.products || []

  return (
    <Card className="border-slate-100 bg-white shadow-premium rounded-[4rem] overflow-hidden relative group transition-all duration-1000 hover:border-pink-500/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-12 lg:p-16 pb-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <CardTitle className="text-3xl font-black text-slate-950 italic tracking-tighter flex items-center gap-6 uppercase leading-none">
            <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-700">
              <ShoppingCart className="h-8 w-8 text-pink-600 group-hover:text-white" />
            </div>
            Vision_to_Order
          </CardTitle>
          <CardDescription className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 italic">Synchronize diagnostic insights with targeted biological regimen</CardDescription>
        </div>
        <div className="flex items-center gap-6 relative z-10 bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-inner">
          <div className="text-right space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Selected_Nodes</p>
            <p className="text-2xl font-black text-pink-600 italic tracking-tighter uppercase leading-none">{selectedItems.size}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center">
            <Box className="h-6 w-6 text-pink-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10 lg:p-16 space-y-12 bg-white relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.01] pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {products.map((product, idx) => (
            <motion.div
              key={product.name || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className={cn(
                  "p-8 rounded-[3rem] border transition-all duration-700 cursor-pointer relative overflow-hidden group/item h-full flex flex-col justify-between",
                  selectedItems.has(product.name || '') 
                    ? "bg-white border-pink-200 shadow-premium scale-[1.02]" 
                    : "bg-slate-50 border-slate-100 hover:bg-white hover:border-pink-500/20 shadow-inner hover:shadow-sm"
                )}
                onClick={() => product.name && toggleItem(product.name)}
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-100 group-hover/item:bg-pink-600 transition-all duration-700" className={selectedItems.has(product.name || '') ? 'bg-pink-500' : ''} />
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-700 group-hover/item:scale-110 shadow-inner group-hover/item:bg-white",
                      selectedItems.has(product.name || '') ? "bg-pink-50 text-pink-600 border-pink-100" : "bg-white text-slate-300 border-slate-100"
                    )}>
                      <Package className="h-7 w-7" />
                    </div>
                    {selectedItems.has(product.name || '') && (
                      <div className="h-6 w-6 rounded-full bg-pink-600 flex items-center justify-center shadow-glow-pink">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <h4 className="text-xl font-black text-slate-950 italic uppercase tracking-tight leading-none group-hover/item:text-pink-600 transition-colors">{product.name}</h4>
                      {product.priority === 'high' && (
                        <Badge className="bg-rose-50 text-rose-600 border-none text-[8px] font-black italic uppercase px-3 py-0.5 rounded-full shadow-sm">CRITICAL_NODE</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 font-medium italic leading-relaxed tracking-tight group-hover/item:text-slate-900 transition-colors">"{product.description}"</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <Badge variant="outline" className="text-[8px] font-black border-slate-200 bg-white text-slate-400 italic px-4 py-1 rounded-full uppercase tracking-widest">{product.category || 'DERMAL_NODE'}</Badge>
                  <div className="flex items-center gap-2 text-pink-600 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-2 transition-all">
                    <span className="text-[9px] font-black uppercase italic">Sync_Item</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-20 text-center space-y-8 italic opacity-20 relative z-10">
            <div className="h-24 w-24 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto shadow-inner">
              <Package className="h-12 w-12 text-slate-300" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">NO_REGIMEN_NODES_SYNTHESIZED</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-10 lg:p-12 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-6 text-slate-400 group/status cursor-default">
          <ShieldCheck className="h-5 w-5 group-hover:text-emerald-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic group-hover:text-slate-950 transition-colors">Transaction_Node_Secure: NOMINAL</p>
        </div>
        
        <div className="flex items-center gap-8">
          <AnimatePresence>
            {selectedItems.size > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-4 bg-white border border-pink-100 px-6 py-3 rounded-2xl shadow-sm"
              >
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">Yield_Commitment</p>
                  <p className="text-sm font-black text-pink-600 uppercase tracking-tighter leading-none mt-1">{selectedItems.size} Protocol Items</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button 
            size="xl" 
            onClick={handleOrder}
            disabled={selectedItems.size === 0 || isProcessing}
            className="h-20 px-12 rounded-[2.5rem] bg-slate-950 text-white border-none shadow-2xl transition-all hover:scale-105 active:scale-95 italic font-black text-[11px] uppercase tracking-[0.4em] group/order relative overflow-hidden disabled:opacity-20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/order:translate-x-[100%] transition-transform duration-1000" />
            {isProcessing ? <RefreshCw className="mr-4 h-6 w-6 animate-spin" /> : <Zap className="mr-4 h-6 w-6 fill-current" />}
            {isProcessing ? 'SYNCHRONIZING...' : 'Authorize_Sync_Order'}
            <ArrowRight className="ml-4 h-6 w-6 group-hover/order:translate-x-2 transition-transform" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}
