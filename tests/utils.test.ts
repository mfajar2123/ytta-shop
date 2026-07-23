import { describe, it, expect } from 'vitest'

// Basic test to verify Vitest configuration
describe('Basic Utils', () => {
  it('formats currency correctly', () => {
    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(val)
    }

    const result = formatCurrency(150000)
    // Depending on Node version, the space might be a non-breaking space
    expect(result.replace(/\s/g, ' ')).toMatch(/Rp\s?150\.000/)
  })
})
