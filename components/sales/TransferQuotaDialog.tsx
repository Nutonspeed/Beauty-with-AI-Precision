
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RefreshCw, Loader2, ArrowRightLeft, Zap, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface TransferQuotaDialogProps {
  staffList: { id: string; name: string; email: string; remaining: number; total: number }[]
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function TransferQuotaDialog({ staffList, onSuccess, trigger }: TransferQuotaDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fromStaff, setFromStaff] = useState('')
  const [toStaff, setToStaff] = useState('')
  const [amount, setAmount] = useState(10)
  const [type, setType] = useState<'analysis' | 'ar'>('analysis')

  const selectedFromStaff = staffList.find(s => s.id === fromStaff) as any

  const handleTransfer = async () => {
    if (!fromStaff || !toStaff || fromStaff === toStaff) {
      toast.error('Please select different staff members')
      return
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than zero')
      return
    }

    if (selectedFromStaff && selectedFromStaff.remaining !== -1 && amount > selectedFromStaff.remaining) {
      toast.error(`Source staff only has ${selectedFromStaff.remaining} remaining cycles`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/quota/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_sales_user_id: fromStaff,
          to_sales_user_id: toStaff,
          amount,
          type
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Successfully transferred ${amount} ${type} quota`)
        onSuccess()
        setIsOpen(false)
        // Reset form
        setFromStaff('')
        setToStaff('')
        setAmount(10)
      } else {
        toast.error(data.error || 'Failed to transfer quota')
      }
    } catch (error) {
      console.error('Transfer error:', error)
      toast.error('An error occurred during transfer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 italic">
            <ArrowRightLeft className="h-4 w-4" />
            Transfer Quota
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#020617] border-white/10 text-white rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold italic flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
              <ArrowRightLeft className="h-5 w-5 text-pink-400" />
            </div>
            Quota Rebalancing Node
          </DialogTitle>
          <DialogDescription className="text-slate-500 uppercase tracking-widest text-[10px] font-black">
            Execute inter-node resource allocation sync
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Source Node (From)</Label>
              <Select value={fromStaff} onValueChange={setFromStaff}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 text-white rounded-xl">
                  {staffList.map(s => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name} ({s.remaining === -1 ? '∞' : s.remaining} cycles)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFromStaff && (
                <p className="text-[9px] text-pink-400 font-bold italic px-1">
                  Available: {selectedFromStaff.remaining === -1 ? 'Infinite' : `${selectedFromStaff.remaining} cycles`}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Target Node (To)</Label>
              <Select value={toStaff} onValueChange={setToStaff}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent className="bg-[#020617] border-white/10 text-white rounded-xl">
                  {staffList.map(s => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Resource Type</Label>
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                <button
                  onClick={() => setType('analysis')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all",
                    type === 'analysis' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Zap className="h-3 w-3" />
                  ANALYSIS
                </button>
                <button
                  onClick={() => setType('ar')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all",
                    type === 'ar' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  AR SIM
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Transfer Magnitude</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="bg-white/5 border-white/10 rounded-xl h-11 text-white italic"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleTransfer}
            disabled={loading}
            className="w-full h-14 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-pink-600/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <RefreshCw className="h-4 w-4 mr-3" />}
            Initialize Resource Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
