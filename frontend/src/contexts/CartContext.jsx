import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cart')
      setCart(response.data)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (dishId, quantity = 1) => {
    try {
      await api.post('/cart', { dish_id: dishId, quantity })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to cart'
      }
    }
  }

  const updateCartItem = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update cart'
      }
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove from cart'
      }
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart')
      setCart({ items: [], total: 0, count: 0 })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to clear cart'
      }
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchCart()
    }
  }, [])

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}




