import { computed } from 'vue'
import { useState } from '#imports'

export interface CartItem {
  id: number
  name: string
  type: string
  price: number
  quantity: number
}

export const useCart = () => {
  // Global state across components
  const cartItems = useState<CartItem[]>('cart-items', () => [])

  // Update Quantity
  const updateQuantity = (id: number, change: number) => {
    const item = cartItems.value.find(i => i.id === id)
    if (item) {
      const newQty = item.quantity + change
      if (newQty > 0) {
        item.quantity = newQty
      }
    }
  }

  // Remove Item
  const removeItem = (id: number) => {
    cartItems.value = cartItems.value.filter(i => i.id !== id)
  }
  
  // Add new item (mockup for future expansions)
  const addToCart = (product: any) => {
    const existingItem = cartItems.value.find(i => i.id === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cartItems.value.push({
        id: product.id,
        name: product.name,
        type: product.category,
        price: product.price ? parseInt(product.price.replace(/\D/g, '')) : 0, // Quick mockup parser
        quantity: 1
      })
    }
  }

  // Computed: Total quantity of items in cart
  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  // Computed: Total monetary cost
  const subtotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  // Format IDR helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Clear Cart
  const clearCart = () => {
    cartItems.value = []
  }

  return {
    cartItems,
    updateQuantity,
    removeItem,
    addToCart,
    clearCart,
    totalItems,
    subtotal,
    formatCurrency
  }
}
