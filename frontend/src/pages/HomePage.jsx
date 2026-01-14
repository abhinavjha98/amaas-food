import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { useState, useEffect, useCallback } from 'react'

export default function HomePage() {
  const { user } = useAuth()
  const [popularDishes, setPopularDishes] = useState([])
  const [recommendedDishes, setRecommendedDishes] = useState([])
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [loadingRecommended, setLoadingRecommended] = useState(false)
  const [userLocation, setUserLocation] = useState({ lat: null, lon: null })

  // Define functions before useEffects
  const fetchPopularDishes = useCallback(async () => {
    try {
      const response = await api.get('/ai/popular?limit=6')
      setPopularDishes(response.data.dishes || [])
    } catch (error) {
      console.error('Failed to fetch popular dishes:', error)
      setPopularDishes([])
    } finally {
      setLoadingPopular(false)
    }
  }, [])

  const fetchRecommendations = useCallback(async () => {
    if (!user || user.role !== 'customer') {
      setRecommendedDishes([])
      setLoadingRecommended(false)
      return
    }
    
    setLoadingRecommended(true)
    try {
      const params = new URLSearchParams({ limit: '6' })
      if (userLocation.lat && userLocation.lon) {
        params.append('lat', userLocation.lat.toString())
        params.append('lon', userLocation.lon.toString())
      }
      
      console.log('[HomePage] Fetching recommendations...', {
        user_id: user.id,
        preferred_cuisines: user.preferred_cuisines,
        dietary: user.dietary_preferences,
        spice: user.spice_level
      })
      
      const response = await api.get(`/ai/recommendations?${params.toString()}`)
      
      console.log('[HomePage] Recommendations response:', response.data)
      
      // Handle response format: { recommendations: [...] }
      const recommendations = response.data?.recommendations || []
      
      console.log('[HomePage] Parsed recommendations count:', Array.isArray(recommendations) ? recommendations.length : 0)
      console.log('[HomePage] Recommendations:', recommendations)
      
      if (Array.isArray(recommendations)) {
        setRecommendedDishes(recommendations)
      } else {
        console.error('[HomePage] ERROR: Recommendations is not an array:', recommendations)
        setRecommendedDishes([])
      }
    } catch (error) {
      console.error('[HomePage] Failed to fetch recommendations:', error)
      console.error('[HomePage] Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      // If 401/403, user might not be authenticated or doesn't have access
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('[HomePage] Authentication required for recommendations')
      }
      setRecommendedDishes([])
    } finally {
      setLoadingRecommended(false)
    }
  }, [user, userLocation])

  // Fetch popular dishes on mount
  useEffect(() => {
    fetchPopularDishes()
  }, [fetchPopularDishes])

  // Get user location if available (for better recommendations)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied or unavailable:', error)
          // Use user's saved location if available
          if (user && user.latitude && user.longitude) {
            setUserLocation({
              lat: user.latitude,
              lon: user.longitude
            })
          }
        },
        { timeout: 5000, enableHighAccuracy: false }
      )
    } else if (user && user.latitude && user.longitude) {
      // Fallback to user's saved location
      setUserLocation({
        lat: user.latitude,
        lon: user.longitude
      })
    }
  }, [user])

  // Fetch recommendations when user is logged in, location changes, or user preferences change
  useEffect(() => {
    if (user && user.role === 'customer') {
      // Small delay to ensure user preferences are loaded
      const timer = setTimeout(() => {
        fetchRecommendations()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [user, userLocation, fetchRecommendations])
  
  // Also refresh recommendations when user data changes (e.g., after updating preferences)
  useEffect(() => {
    if (user && user.role === 'customer' && user.preferred_cuisines) {
      fetchRecommendations()
    }
  }, [user?.preferred_cuisines, fetchRecommendations])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Authentic Indian Home-Cooked Meals</h1>
          <p className="text-xl mb-8 text-slate-200">
            Discover delicious, hygienic meals prepared by local home chefs
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/catalog" className="btn-primary bg-white text-slate-800 hover:bg-slate-100 font-semibold">
              Browse Dishes
            </Link>
            {!user && (
              <Link to="/register?role=producer" className="btn-secondary bg-slate-600 text-white hover:bg-slate-700">
                Become a Chef
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Recommended for You - Only for logged-in customers */}
      {user && user.role === 'customer' && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Recommended for You</h2>
              {user.preferred_cuisines && user.preferred_cuisines.length > 0 && (
                <Link 
                  to="/preferences" 
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <span>Update Preferences</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
            {loadingRecommended ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Finding perfect dishes for you...</p>
              </div>
            ) : recommendedDishes.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">
                  {!user.preferred_cuisines || user.preferred_cuisines.length === 0
                    ? "Set your food preferences to get personalized recommendations!"
                    : "No recommendations available at the moment. Try updating your preferences or location."}
                </p>
                <Link 
                  to="/preferences" 
                  className="inline-block btn-primary"
                >
                  {!user.preferred_cuisines || user.preferred_cuisines.length === 0
                    ? "Set Preferences"
                    : "Update Preferences"}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedDishes.map((dish) => (
                  <Link
                    key={dish.id}
                    to={`/dishes/${dish.id}`}
                    className="card hover:shadow-lg transition-shadow border-2 border-blue-50"
                  >
                    <img
                      src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                      alt={dish.name}
                      className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
                      }}
                    />
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded">
                        Recommended
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dish.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-slate-700">£{dish.price}</span>
                      {dish.average_rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-lg">⭐</span>
                          <span className="font-semibold">{dish.average_rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({dish.total_reviews})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No ratings yet</span>
                      )}
                    </div>
                    {dish.producer && (
                      <div className="mt-2 text-sm text-gray-500">
                        by {dish.producer.kitchen_name}
                        {dish.producer.cuisine_specialty && (
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                            {dish.producer.cuisine_specialty}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popular Dishes */}
      <section className={`py-16 ${user && user.role === 'customer' ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Dishes</h2>
          {loadingPopular ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading popular dishes...</p>
            </div>
          ) : popularDishes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No popular dishes available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularDishes.map((dish) => (
                <Link
                  key={dish.id}
                  to={`/dishes/${dish.id}`}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <img
                    src={dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                    alt={dish.name}
                    className="w-full h-48 object-cover rounded-lg mb-4 bg-gray-200"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
                    }}
                  />
                  <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dish.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-slate-700">£{dish.price}</span>
                {dish.average_rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-lg">⭐</span>
                    <span className="font-semibold">{dish.average_rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({dish.total_reviews})</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">No ratings yet</span>
                )}
              </div>
                  {dish.producer && (
                    <div className="mt-2 text-sm text-gray-500">
                      by {dish.producer.kitchen_name}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🍛</div>
              <h3 className="text-xl font-semibold mb-2">Authentic Taste</h3>
              <p className="text-gray-600">Home-cooked meals with traditional recipes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">Verified chefs with high ratings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


