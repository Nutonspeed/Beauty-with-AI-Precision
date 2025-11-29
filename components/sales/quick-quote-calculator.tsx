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

interface TreatmentItem {
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
  initialItems?: TreatmentItem[];
  onSendQuote?: (quote: QuoteResult) => void;
  className?: string;
}

interface QuoteResult {
  items: TreatmentItem[];
  subtotal: number;
  discount: number;
  promotionApplied?: Promotion;
  total: number;
  savings: number;
  validUntil: Date;
}

// Available promotions
const PROMOTIONS: Promotion[] = [
  {
    id: 'first_time',
    name: 'ลูกค้าใหม่',
    type: 'percentage',
    value: 15,
    code: 'NEW15'
  },
  {
    id: 'bundle_3',
    name: 'ซื้อ 3 ลด 20%',
    type: 'percentage',
    value: 20,
    minPurchase: 3
  },
  {
    id: 'flash_sale',
    name: 'Flash Sale',
    type: 'percentage',
    value: 25,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  {
    id: 'cash_discount',
    name: 'ชำระเงินสด',
    type: 'fixed',
    value: 1000,
    minPurchase: 10000
  }
];

// Treatment catalog
const TREATMENT_CATALOG = [
  { id: 'botox', name: 'Botox', nameTh: 'โบท็อกซ์', basePrice: 8900, category: 'Anti-Aging' },
  { id: 'filler', name: 'Filler', nameTh: 'ฟิลเลอร์', basePrice: 15900, category: 'Volume' },
  { id: 'hifu', name: 'HIFU', nameTh: 'ไฮฟู่', basePrice: 25900, category: 'Lifting' },
  { id: 'laser', name: 'Laser', nameTh: 'เลเซอร์', basePrice: 12900, category: 'Skin' },
  { id: 'thread', name: 'Thread Lift', nameTh: 'ร้อยไหม', basePrice: 35900, category: 'Lifting' },
  { id: 'hydra', name: 'HydraFacial', nameTh: 'ไฮดราเฟเชียล', basePrice: 4900, category: 'Facial' },
  { id: 'prp', name: 'PRP', nameTh: 'PRP', basePrice: 18900, category: 'Regenerative' },
  { id: 'coolsculpt', name: 'CoolSculpting', nameTh: 'สลายไขมัน', basePrice: 45900, category: 'Body' },
];

export function QuickQuoteCalculator({
  initialItems = [],
  onSendQuote,
  className = ''
}: QuickQuoteProps) {
  const [items, setItems] = useState<TreatmentItem[]>(initialItems);
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
  
  const addItem = (catalogItem: typeof TREATMENT_CATALOG[0]) => {
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
    }).filter(Boolean) as TreatmentItem[]);
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
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Quick Quote</CardTitle>
              <p className="text-sm text-gray-400">คำนวณราคาและส่งใบเสนอราคา</p>
            </div>
          </div>
          {urgencyEnabled && (
            <Badge className="bg-red-500 animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              Limited Time
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer Name */}
        <div className="space-y-2">
          <Label className="text-gray-300">ชื่อลูกค้า</Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="กรอกชื่อลูกค้า"
            className="bg-white/5 border-white/20 text-white"
          />
        </div>
        
        {/* Items List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-gray-300">รายการ Treatment</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCatalog(!showCatalog)}
              className="border-white/20 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              เพิ่ม
            </Button>
          </div>
          
          {/* Catalog Dropdown */}
          <AnimatePresence>
            {showCatalog && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-white/5 border border-white/10"
              >
                {TREATMENT_CATALOG.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left transition-all"
                  >
                    <p className="text-sm font-medium text-white">{item.nameTh}</p>
                    <p className="text-xs text-green-400">฿{item.basePrice.toLocaleString()}</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Selected Items */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <p className="text-gray-400 text-sm">ยังไม่มีรายการ</p>
              </div>
            ) : (
              items.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.nameTh}</p>
                    <p className="text-sm text-green-400">฿{item.basePrice.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center text-white font-bold">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
        
        {/* Promo Code */}
        <div className="space-y-2">
          <Label className="text-gray-300">โค้ดส่วนลด</Label>
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="กรอกโค้ดส่วนลด"
              className="bg-white/5 border-white/20 text-white"
            />
            <Button
              onClick={applyPromoCode}
              className="bg-green-600 hover:bg-green-700"
            >
              <Tag className="w-4 h-4" />
            </Button>
          </div>
          
          {appliedPromo && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{appliedPromo.name} - ลด {appliedPromo.value}{appliedPromo.type === 'percentage' ? '%' : '฿'}</span>
            </div>
          )}
        </div>
        
        {/* Available Promotions */}
        <div className="space-y-2">
          <Label className="text-gray-300">โปรโมชั่นที่ใช้ได้</Label>
          <div className="flex flex-wrap gap-2">
            {PROMOTIONS.filter(p => !p.minPurchase || quote.subtotal >= (p.minPurchase * 1000)).map(promo => (
              <Badge
                key={promo.id}
                variant="outline"
                className={`cursor-pointer transition-all ${
                  appliedPromo?.id === promo.id 
                    ? 'border-green-500 bg-green-500/20 text-green-400' 
                    : 'border-white/20 text-gray-400 hover:border-white/40'
                }`}
                onClick={() => setAppliedPromo(promo)}
              >
                {promo.type === 'percentage' ? <Percent className="w-3 h-3 mr-1" /> : <Gift className="w-3 h-3 mr-1" />}
                {promo.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Quote Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 space-y-2">
          <div className="flex justify-between text-gray-300">
            <span>ราคาปกติ</span>
            <span>฿{quote.subtotal.toLocaleString()}</span>
          </div>
          
          {quote.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>ส่วนลด</span>
              <span>-฿{quote.discount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="border-t border-white/10 pt-2">
            <div className="flex justify-between">
              <span className="text-white font-bold text-lg">รวมทั้งสิ้น</span>
              <span className="text-2xl font-bold text-green-400">฿{quote.total.toLocaleString()}</span>
            </div>
          </div>
          
          {quote.savings > 0 && (
            <div className="text-center">
              <Badge className="bg-yellow-500 text-black">
                <Sparkles className="w-3 h-3 mr-1" />
                ประหยัด ฿{quote.savings.toLocaleString()}
              </Badge>
            </div>
          )}
        </div>
        
        {/* Urgency Timer */}
        {urgencyEnabled && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <p className="text-red-400 text-sm flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              ราคาพิเศษนี้ใช้ได้ถึง {quote.validUntil.toLocaleDateString('th-TH')}
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-white/20 text-white"
            onClick={() => {
              // Download PDF logic
              console.log('Download PDF');
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            className="bg-gradient-to-r from-green-600 to-emerald-600"
            onClick={handleSendQuote}
            disabled={items.length === 0}
          >
            <Send className="w-4 h-4 mr-2" />
            ส่งใบเสนอราคา
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickQuoteCalculator;
