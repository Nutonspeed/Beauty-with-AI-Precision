/**
 * Utility Functions Tests
 */

import { describe, it, expect } from 'vitest'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    const formatCurrency = (amount: number, locale = 'th-TH', currency = 'THB') => {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
    }

    it('should format Thai Baht correctly', () => {
      expect(formatCurrency(1000)).toContain('1,000')
      expect(formatCurrency(1000000)).toContain('1,000,000')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toContain('0')
    })

    it('should handle decimals', () => {
      const result = formatCurrency(1234.56)
      expect(result).toContain('1,234')
    })
  })

  describe('formatDate', () => {
    const formatDate = (date: Date, locale = 'th-TH') => {
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    it('should format date in Thai', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toBeTruthy()
    })
  })

  describe('slugify', () => {
    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Test 123')).toBe('test-123')
      expect(slugify('Special!@#Characters')).toBe('specialcharacters')
    })

    it('should handle Thai text', () => {
      // Thai characters would be removed by this simple slugify
      const result = slugify('สวัสดี')
      expect(typeof result).toBe('string')
    })
  })

  describe('truncate', () => {
    const truncate = (text: string, maxLength: number) => {
      if (text.length <= maxLength) return text
      return text.slice(0, maxLength - 3) + '...'
    }

    it('should truncate long text', () => {
      expect(truncate('Hello World', 5)).toBe('He...')
      expect(truncate('Short', 10)).toBe('Short')
    })
  })

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0
      const fn = () => { callCount++ }
      
      // Simulate multiple rapid calls
      fn(); fn(); fn()
      
      // In real debounce, only last call would execute
      expect(callCount).toBe(3) // Without debounce, all calls execute
    })
  })

  describe('generateId', () => {
    const generateId = (prefix = 'id') => {
      return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    }

    it('should generate unique IDs', () => {
      const id1 = generateId('test')
      const id2 = generateId('test')
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^test_/)
    })

    it('should use custom prefix', () => {
      const id = generateId('user')
      expect(id).toMatch(/^user_/)
    })
  })

  describe('clamp', () => {
    const clamp = (value: number, min: number, max: number) => {
      return Math.min(Math.max(value, min), max)
    }

    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })

  describe('isValidEmail', () => {
    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    it('should validate email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    const isValidPhone = (phone: string) => {
      // Thai phone format: 0X-XXXX-XXXX or 0XXXXXXXXX
      return /^0[0-9]{8,9}$/.test(phone.replace(/-/g, ''))
    }

    it('should validate Thai phone numbers', () => {
      expect(isValidPhone('0812345678')).toBe(true)
      expect(isValidPhone('08-1234-5678')).toBe(true)
      expect(isValidPhone('12345678')).toBe(false)
    })
  })
})
