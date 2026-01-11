'use client';

/**
 * Quick Quote Calculator
 * คำนวณราคาแบบ real-time พร้อมส่วนลดและ promotions
 * Competitive advantage: Instant pricing with upsell suggestions
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Calculator, 
  Plus, 
  Minus, 
  Tag, 
  Gift, 
  Percent,
  Send,
  Download,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProgramItem {
  id: string;
  name: string;
  nameTh: string;
  basePrice: number;
  quantity: number;
  sessions?: number;
  discount?: number;
}

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bundle';
  value: number;
  minPurchase?: number;
  validUntil?: Date;
  code?: string;
}

interface QuickQuoteProps {
  initialItems?: ProgramItem[];
  onSendQuote?: (quote: QuoteResult) => void;
  className?: string;
}

interface QuoteResult {
  items: ProgramItem[];
  subtotal: number;
  discount: number;
  promotionApplied?: Promotion;
  total: number;
  savings: number;
  validUntil: Date;
}

export function QuickQuoteCalculator({
  initialItems = [],
  onSendQuote,
  className = ''
}: QuickQuoteProps) {
  const t = useTranslations();
  const locale = useLocale();

  // Available promotions moved inside component to use translations
  const PROMOTIONS: Promotion[] = [
    {
      id: 'first_time',
      name: t('salesTools.quote.promotions.firstTime'),
      type: 'percentage',
      value: 15,
      code: 'NEW15'
    },
    {
      id: 'bundle_3',
      name: t('salesTools.quote.promotions.bundle3'),
      type: 'percentage',
      value: 20,
      minPurchase: 3
    },
    {
      id: 'flash_sale',
      name: t('salesTools.quote.promotions.flashSale'),
      type: 'percentage',
      value: 25,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    {
      id: 'cash_discount',
      name: t('salesTools.quote.promotions.cash'),
      type: 'fixed',
      value: 1000,
      minPurchase: 10000
    }
  ];

  // Program catalog moved inside component
  const PROGRAM_CATALOG = [
    { id: 'botox', name: 'Botox', nameTh: t('salesTools.quote.catalog.botox'), basePrice: 8900, category: 'Anti-Aging' },
    { id: 'filler', name: 'Filler', nameTh: t('salesTools.quote.catalog.filler'), basePrice: 15900, category: 'Volume' },
    { id: 'hifu', name: 'HIFU', nameTh: t('salesTools.quote.catalog.hifu'), basePrice: 25900, category: 'Lifting' },
    { id: 'laser', name: 'Laser', nameTh: t('salesTools.quote.catalog.laser'), basePrice: 12900, category: 'Skin' },
    { id: 'thread', name: 'Thread Lift', nameTh: t('salesTools.quote.catalog.thread'), basePrice: 35900, category: 'Lifting' },
    { id: 'hydra', name: 'HydraFacial', nameTh: t('salesTools.quote.catalog.hydra'), basePrice: 4900, category: 'Facial' },
    { id: 'prp', name: 'PRP', nameTh: t('salesTools.quote.catalog.prp'), basePrice: 18900, category: 'Regenerative' },
    { id: 'coolsculpt', name: 'CoolSculpting', nameTh: t('salesTools.quote.catalog.coolsculpt'), basePrice: 45900, category: 'Body' },
  ];

  const [items, setItems] = useState<ProgramItem[]>(initialItems);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [urgencyEnabled, _setUrgencyEnabled] = useState(true);
  
  // Calculate quote
  const quote = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.basePrice * item.quantity * (item.sessions || 1);
      const itemDiscount = item.discount ? itemTotal * (item.discount / 100) : 0;
      return sum + (itemTotal - itemDiscount);
    }, 0);
    
    let discount = 0;
    let promoApplied = appliedPromo;
    
    // Auto-apply bundle discount
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const bundlePromo = PROMOTIONS.find(p => p.id === 'bundle_3');
    if (totalItems >= 3 && bundlePromo && (!promoApplied || bundlePromo.value > (promoApplied.value || 0))) {
      promoApplied = bundlePromo;
    }
    
    // Calculate promotion discount
    if (promoApplied) {
      if (promoApplied.type === 'percentage') {
        discount = subtotal * (promoApplied.value / 100);
      } else if (promoApplied.type === 'fixed') {
        discount = promoApplied.value;
      }
    }
    
    const total = Math.max(0, subtotal - discount);
    const savings = subtotal - total;
    
    return {
      items,
      subtotal,
      discount,
      promotionApplied: promoApplied || undefined,
      total,
      savings,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }, [items, appliedPromo]);
  
  const addItem = (catalogItem: typeof PROGRAM_CATALOG[0]) => {
    const existing = items.find(i => i.id === catalogItem.id);
    if (existing) {
      setItems(items.map(i => 
        i.id === catalogItem.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setItems([...items, {
        ...catalogItem,
        quantity: 1,
        sessions: 1
      }]);
    }
    setShowCatalog(false);
  };
  
  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as ProgramItem[]);
  };
  
  const applyPromoCode = () => {
    const promo = PROMOTIONS.find(p => p.code?.toLowerCase() === promoCode.toLowerCase());
    if (promo) {
      setAppliedPromo(promo);
    }
  };
  
  const handleSendQuote = () => {
    if (onSendQuote) {
      onSendQuote(quote);
      alert(t('salesTools.messages.quoteSuccess', { amount: quote.total.toLocaleString() }));
    }
  };

  return (
    <Card className={`border-white bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-premium relative overflow-hidden ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 shadow-inner">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-slate-900 italic font-bold tracking-tight">{t('salesTools.quote.title')}</CardTitle>
              <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">{t('salesTools.quote.subtitle')}</p>
            </div>
          </div>
          {urgencyEnabled && (
            <Badge className="bg-red-50 text-red-600 border-none animate-pulse text-[10px] font-black uppercase tracking-widest">
              <Clock className="w-3 h-3 mr-1.5" />
              {t('salesTools.quote.limitedTime')}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Customer Name */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{t('salesTools.quote.customerName')}</Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={t('salesTools.quote.namePlaceholder')}
            className="bg-slate-50/50 border-slate-200 rounded-2xl h-12 focus:ring-blue-500/20 italic"
          />
        </div>
        
        {/* Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{t('salesTools.quote.treatmentList')}</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCatalog(!showCatalog)}
              className="border-slate-200 rounded-xl h-9 text-[10px] font-black uppercase tracking-widest italic hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t('salesTools.quote.add')}
            </Button>
          </div>
          
          {/* Catalog Dropdown */}
          <AnimatePresence>
            {showCatalog && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 gap-2 p-3 rounded-[2rem] bg-slate-50 border border-slate-200 shadow-inner mb-2"
              >
                {PROGRAM_CATALOG.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 text-left transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{t(`booking.treatments.${item.id}`)}</p>
                    <p className="text-[10px] text-blue-600 font-black italic mt-1">{t('format.currency', { amount: item.basePrice.toLocaleString() })}</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Selected Items */}
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-200 border-dashed text-center">
                <p className="text-slate-400 text-xs font-medium tracking-widest uppercase italic">{t('salesTools.quote.empty')}</p>
              </div>
            ) : (
              items.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 px-6 rounded-3xl bg-white border border-slate-100 shadow-sm group/item"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 italic">{t(`booking.treatments.${item.id}`)}</p>
                    <p className="text-xs text-blue-600 font-black italic">{t('format.currency', { amount: item.basePrice.toLocaleString() })}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-1 border border-slate-100">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 rounded-xl hover:bg-white hover:text-blue-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="w-6 text-center text-slate-900 font-black text-xs">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 rounded-xl hover:bg-white hover:text-blue-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
        
        {/* Promo Code */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{t('salesTools.quote.promoCode')}</Label>
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={t('salesTools.quote.promoPlaceholder')}
              className="bg-slate-50/50 border-slate-200 rounded-2xl h-12 italic"
            />
            <Button
              onClick={applyPromoCode}
              className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
            >
              <Tag className="w-4 h-4" />
            </Button>
          </div>
          
          {appliedPromo && (
            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-left-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t('salesTools.quote.applied', { name: appliedPromo.name, value: appliedPromo.value, type: appliedPromo.type === 'percentage' ? '%' : '฿' })}</span>
            </div>
          )}
        </div>
        
        {/* Available Promotions */}
        <div className="space-y-3">
          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">{t('salesTools.quote.availablePromos')}</Label>
          <div className="flex flex-wrap gap-2">
            {PROMOTIONS.filter(p => !p.minPurchase || quote.subtotal >= (p.minPurchase * 1000)).map(promo => (
              <Badge
                key={promo.id}
                variant="outline"
                className={`cursor-pointer transition-all px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  appliedPromo?.id === promo.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' 
                    : 'border-slate-200 bg-white text-slate-400 hover:border-blue-200 hover:text-blue-500'
                }`}
                onClick={() => setAppliedPromo(promo)}
              >
                {promo.type === 'percentage' ? <Percent className="w-3 h-3 mr-1.5" /> : <Gift className="w-3 h-3 mr-1.5" />}
                {promo.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Quote Summary */}
        <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-inner space-y-4">
          <div className="flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
            <span>{t('salesTools.quote.subtotal')}</span>
            <span>{t('format.currency', { amount: quote.subtotal.toLocaleString() })}</span>
          </div>
          
          {quote.discount > 0 && (
            <div className="flex justify-between text-emerald-600 text-[10px] font-black uppercase tracking-widest italic">
              <span>{t('salesTools.quote.discount')}</span>
              <span>-{t('format.currency', { amount: quote.discount.toLocaleString() })}</span>
            </div>
          )}
          
          <div className="border-t border-blue-200/50 pt-4">
            <div className="flex justify-between items-end">
              <span className="text-slate-900 font-bold text-xl italic tracking-tight">{t('salesTools.quote.total')}</span>
              <span className="text-3xl font-black text-blue-600 tracking-tighter italic">{t('format.currency', { amount: quote.total.toLocaleString() })}</span>
            </div>
          </div>
          
          {quote.savings > 0 && (
            <div className="text-center pt-2">
              <Badge className="bg-amber-400 text-amber-950 border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] italic shadow-sm">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                {t('salesTools.quote.savings', { amount: t('format.currency', { amount: quote.savings.toLocaleString() }) })}
              </Badge>
            </div>
          )}
        </div>
        
        {/* Urgency Timer */}
        {urgencyEnabled && (
          <div className="p-4 rounded-3xl bg-red-50 border border-red-100 text-center shadow-sm">
            <p className="text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center italic">
              <AlertCircle className="w-4 h-4 mr-2" />
              {t('salesTools.quote.validUntil', { date: quote.validUntil.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US') })}
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-14 rounded-2xl border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest italic hover:bg-slate-50"
            onClick={() => {
              // Download PDF logic
              console.log('Download PDF');
            }}
          >
            <Download className="w-4 h-4 mr-2.5" />
            PDF Report
          </Button>
          <Button
            className="h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-blue-600/20 hover:scale-105 transition-transform"
            onClick={handleSendQuote}
            disabled={items.length === 0}
          >
            <Send className="w-4 h-4 mr-2.5" />
            {t('salesTools.quote.sendQuote')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickQuoteCalculator;
