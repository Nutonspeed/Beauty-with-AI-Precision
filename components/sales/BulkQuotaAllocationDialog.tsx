
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


import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RefreshCw, Loader2, Users, Zap, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface BulkQuotaAllocationDialogProps {
  staffList: { id: string; name: string; email: string }[]
  onSuccess: () => void
  trigger?: React.ReactNode
}

export function BulkQuotaAllocationDialog({ staffList, onSuccess, trigger }: BulkQuotaAllocationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
  const [amount, setAmount] = useState(50)
  const [type, setType] = useState<'analysis' | 'ar'>('analysis')

  const toggleStaff = (id: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedStaffIds.length === staffList.length) {
      setSelectedStaffIds([])
    } else {
      setSelectedStaffIds(staffList.map(s => s.id))
    }
  }

  const handleAllocate = async () => {
    if (selectedStaffIds.length === 0) {
      toast.error('Please select at least one staff member')
      return
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than zero')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/quota/bulk-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sales_user_ids: selectedStaffIds,
          amount,
          type
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Successfully allocated ${amount} ${type} quota to ${selectedStaffIds.length} staff`)
        onSuccess()
        setIsOpen(false)
        setSelectedStaffIds([])
        setAmount(50)
      } else {
        toast.error(data.error || 'Failed to allocate quota')
      }
    } catch (error) {
      console.error('Allocation error:', error)
      toast.error('An error occurred during allocation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="premium" size="sm" className="gap-2 italic bg-blue-600 border-none">
            <Users className="h-4 w-4" />
            Bulk Allocation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#020617] border-white/10 text-white rounded-[2.5rem] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold italic flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            Bulk Quota Orchestration
          </DialogTitle>
          <DialogDescription className="text-slate-500 uppercase tracking-widest text-[10px] font-black">
            Distribute resources across multiple nodes simultaneously
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-8 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Select Target Nodes</Label>
              <Button variant="link" onClick={toggleAll} className="h-auto p-0 text-[10px] font-black text-blue-400 uppercase italic">
                {selectedStaffIds.length === staffList.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {staffList.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => toggleStaff(s.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer",
                    selectedStaffIds.includes(s.id) 
                      ? "bg-blue-500/10 border-blue-500/30 text-white" 
                      : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10"
                  )}
                >
                  <Checkbox checked={selectedStaffIds.includes(s.id)} className="border-white/20 data-[state=checked]:bg-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate italic">{s.name}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-50 truncate">{s.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Magnitude Per Node</Label>
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
            onClick={handleAllocate}
            disabled={loading || selectedStaffIds.length === 0}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-600/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <RefreshCw className="h-4 w-4 mr-3" />}
            Initialize Bulk Distribution ({selectedStaffIds.length} Nodes)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
