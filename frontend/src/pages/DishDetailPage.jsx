import { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import api from '../services/api'
import ReviewForm from '../components/ReviewForm'

export default function DishDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [dish, setDish] = useState(null)
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    fetchDish()
    fetchReviews()
    // Check if order_id is in URL params (from order detail page)
    const orderId = searchParams.get('order_id')
    if (orderId) {
      setShowReviewForm(true)
    }
    // Check if user has already reviewed
    if (user && user.role === 'customer') {
      checkIfReviewed()
    }
  }, [id, user])

  const fetchDish = async () => {
    try {
      const response = await api.get(`/dishes/${id}`)
      setDish(response.data)
    } catch (error) {
      console.error('Failed to fetch dish:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/dish/${id}`)
      setReviews(response.data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }

  const checkIfReviewed = async () => {
    try {
      const response = await api.get(`/reviews/dish/${id}`)
      const userReviews = response.data.reviews || []
      const userReview = userReviews.find(r => r.user_id === user.id)
      setHasReviewed(!!userReview)
    } catch (error) {
      console.error('Failed to check reviews:', error)
    }
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    setHasReviewed(true)
    fetchReviews()
    fetchDish() // Refresh dish to get updated rating
    setMessage('Thank you for your review!')
    setTimeout(() => setMessage(''), 3000)
  }

  const handleAddToCart = async () => {
    if (!user) {
      setMessage('Please login to add items to cart')
      return
    }

    const result = await addToCart(id, quantity)
    if (result.success) {
      setMessage('Added to cart!')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(result.error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!dish) {
    return <div className="text-center py-12">Dish not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'}
            alt={dish.name}
            className="w-full h-96 object-cover rounded-lg bg-gray-200"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'
            }}
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">{dish.name}</h1>
          <p className="text-xl text-slate-700 font-semibold mb-4">£{dish.price}</p>
          <p className="text-gray-700 mb-6">{dish.description}</p>

          <div className="mb-6 space-y-2">
            <div><strong>Category:</strong> {dish.category || 'N/A'}</div>
            <div><strong>Type:</strong> {dish.dietary_type || 'N/A'}</div>
            <div><strong>Spice Level:</strong> {dish.spice_level || 'N/A'}</div>
            {dish.average_rating > 0 && (
              <div>
                <strong>Rating:</strong> ⭐ {dish.average_rating.toFixed(1)} ({dish.total_reviews} reviews)
              </div>
            )}
            {dish.producer && (
              <div>
                <strong>Chef:</strong> <Link to={`/producers/${dish.producer.id}`} className="text-blue-600 hover:text-blue-800">{dish.producer.kitchen_name}</Link>
              </div>
            )}
          </div>

          {user && user.role === 'customer' && (
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <label className="font-medium">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={dish.max_orders_per_day}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="input-field w-20"
                />
              </div>
              {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('Added') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}
              <button onClick={handleAddToCart} className="btn-primary w-full py-3">
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Reviews</h2>
          {user && user.role === 'customer' && !hasReviewed && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-primary"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && !hasReviewed && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <ReviewForm
              dishId={parseInt(id)}
              orderId={searchParams.get('order_id') ? parseInt(searchParams.get('order_id')) : undefined}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}

        {hasReviewed && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">You have already reviewed this dish. Thank you!</p>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">{review.user?.name || 'Anonymous'}</div>
                    <div className="text-yellow-500 flex items-center gap-1">
                      {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} {review.rating}/5
                    </div>
                    {review.is_verified && (
                      <span className="text-xs text-green-600">✓ Verified Purchase</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                {review.comment && <p className="text-gray-700 mb-2">{review.comment}</p>}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {review.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {review.producer_response && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Chef's Response:</p>
                    <p className="text-sm text-gray-600">{review.producer_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



