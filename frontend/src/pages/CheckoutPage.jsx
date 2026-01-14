import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

// Initialize Stripe - use provided key
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4'
const stripePromise = loadStripe(stripeKey)

function CheckoutForm({ onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState({
    address_line1: user?.address_line1 || '',
    address_line2: user?.address_line2 || '',
    city: user?.city || '',
    state: user?.state || '',
    postcode: user?.postcode || user?.pincode || '',
    latitude: user?.latitude || null,
    longitude: user?.longitude || null
  })

  // UK Counties/Regions
  const ukCounties = [
    'England', 'Scotland', 'Wales', 'Northern Ireland',
    'Bedfordshire', 'Berkshire', 'Bristol', 'Buckinghamshire', 'Cambridgeshire',
    'Cheshire', 'Cornwall', 'Cumbria', 'Derbyshire', 'Devon', 'Dorset',
    'Durham', 'East Riding of Yorkshire', 'East Sussex', 'Essex', 'Gloucestershire',
    'Greater London', 'Greater Manchester', 'Hampshire', 'Herefordshire',
    'Hertfordshire', 'Isle of Wight', 'Kent', 'Lancashire', 'Leicestershire',
    'Lincolnshire', 'Merseyside', 'Norfolk', 'North Yorkshire', 'Northamptonshire',
    'Northumberland', 'Nottinghamshire', 'Oxfordshire', 'Rutland', 'Shropshire',
    'Somerset', 'South Yorkshire', 'Staffordshire', 'Suffolk', 'Surrey',
    'Tyne and Wear', 'Warwickshire', 'West Midlands', 'West Sussex',
    'West Yorkshire', 'Wiltshire', 'Worcestershire'
  ]
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [paymentIntent, setPaymentIntent] = useState(null)

  useEffect(() => {
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    try {
      // Ensure postcode is sent (use postcode or pincode)
      const addressToSend = {
        ...deliveryAddress,
        pincode: deliveryAddress.postcode || deliveryAddress.pincode || ''
      }
      const response = await api.post('/checkout/create-payment-intent', {
        delivery_address: addressToSend
      })
      setPaymentIntent(response.data)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create payment intent')
    }
  }

  const handleAddressChange = (e) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!stripe || !elements) {
      setError('Stripe not loaded')
      setLoading(false)
      return
    }

    try {
      // In demo mode, skip actual payment confirmation
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''
      const isDemo = !stripeKey || stripeKey.includes('demo')
      
      if (isDemo) {
        // Demo mode - confirm order directly
        const addressToSend = {
          ...deliveryAddress,
          pincode: deliveryAddress.postcode || deliveryAddress.pincode || ''
        }
        const response = await api.post('/checkout/confirm-order', {
          payment_intent_id: paymentIntent?.payment_intent_id || 'pi_demo_' + Date.now(),
          delivery_address: addressToSend,
          delivery_instructions: deliveryInstructions
        })

        if (response.data) {
          await clearCart()
          navigate(`/orders/${response.data.order.id}`)
          if (onSuccess) onSuccess()
        }
      } else {
        // Real Stripe payment
        const cardElement = elements.getElement(CardElement)
        const { error: stripeError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
          paymentIntent.client_secret,
          {
            payment_method: {
              card: cardElement,
            }
          }
        )

        if (stripeError) {
          setError(stripeError.message)
          setLoading(false)
          return
        }

        if (confirmedIntent.status === 'succeeded') {
          const addressToSend = {
            ...deliveryAddress,
            pincode: deliveryAddress.postcode || deliveryAddress.pincode || ''
          }
          const response = await api.post('/checkout/confirm-order', {
            payment_intent_id: confirmedIntent.id,
            delivery_address: addressToSend,
            delivery_instructions: deliveryInstructions
          })

          if (response.data) {
            await clearCart()
            navigate(`/orders/${response.data.order.id}`)
            if (onSuccess) onSuccess()
          }
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (!paymentIntent) {
    return <div className="text-center py-8">Preparing checkout...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Delivery Address */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 1 *</label>
            <input
              type="text"
              name="address_line1"
              required
              className="input-field mt-1"
              value={deliveryAddress.address_line1}
              onChange={handleAddressChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
            <input
              type="text"
              name="address_line2"
              className="input-field mt-1"
              value={deliveryAddress.address_line2}
              onChange={handleAddressChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                type="text"
                name="city"
                required
                className="input-field mt-1"
                value={deliveryAddress.city}
                onChange={handleAddressChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">County/Region *</label>
              <select
                name="state"
                required
                className="input-field mt-1"
                value={deliveryAddress.state}
                onChange={handleAddressChange}
              >
                <option value="">Select County/Region</option>
                {ukCounties.map((county) => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Postcode *</label>
            <input
              type="text"
              name="postcode"
              required
              pattern="[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}"
              className="input-field mt-1 uppercase"
              value={deliveryAddress.postcode}
              onChange={handleAddressChange}
              placeholder="SW1A 1AA"
              style={{ textTransform: 'uppercase' }}
            />
            <p className="text-xs text-gray-500 mt-1">UK postcode format (e.g., SW1A 1AA)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Instructions</label>
            <textarea
              className="input-field mt-1"
              rows="3"
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="Any special instructions for delivery?"
            />
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>£{paymentIntent.order_summary?.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charge:</span>
            <span>£{paymentIntent.order_summary?.delivery_charge?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (VAT 20%):</span>
            <span>£{paymentIntent.order_summary?.tax?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-slate-700 font-bold">£{(paymentIntent.amount / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Payment</h2>
        {import.meta.env.VITE_STRIPE_PUBLIC_KEY && !import.meta.env.VITE_STRIPE_PUBLIC_KEY.includes('demo') ? (
          <div className="border rounded-lg p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Payment will be processed automatically. 
              In production, Stripe Elements will be used for secure payment processing.
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !stripe}
        className="btn-primary w-full py-3"
      >
        {loading ? 'Processing...' : `Pay £${(paymentIntent.amount / 100).toFixed(2)}`}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { cart } = useCart()
  const { user } = useAuth()

  if (!user || user.role !== 'customer') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Please login as a customer to checkout</div>
      </div>
    )
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <a href="/catalog" className="btn-primary">Browse Dishes</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  )
}
