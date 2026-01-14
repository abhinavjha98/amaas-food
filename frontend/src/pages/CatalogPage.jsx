import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function CatalogPage() {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    dietary_type: '',
    spice_level: '',
    category: '',
    sort_by: 'popularity'
  })

  useEffect(() => {
    fetchDishes()
  }, [filters])

  const fetchDishes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.dietary_type) params.append('dietary_type', filters.dietary_type)
      if (filters.spice_level) params.append('spice_level', filters.spice_level)
      if (filters.category) params.append('category', filters.category)
      if (filters.sort_by) params.append('sort_by', filters.sort_by)

      const response = await api.get(`/dishes?${params.toString()}`)
      setDishes(response.data.dishes || [])
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Dishes</h1>

      {/* Filters */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search dishes..."
            className="input-field"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="input-field"
            value={filters.dietary_type}
            onChange={(e) => setFilters({ ...filters, dietary_type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
          <select
            className="input-field"
            value={filters.spice_level}
            onChange={(e) => setFilters({ ...filters, spice_level: e.target.value })}
          >
            <option value="">All Spice Levels</option>
            <option value="mild">Mild</option>
            <option value="medium">Medium</option>
            <option value="hot">Hot</option>
          </select>
          <select
            className="input-field"
            value={filters.sort_by}
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : dishes.length === 0 ? (
        <div className="text-center text-gray-500">No dishes found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
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
  )
}



