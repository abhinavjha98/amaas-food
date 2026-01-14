import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function PreferencesPage() {
  const { user, fetchUser } = useAuth()
  const [formData, setFormData] = useState({
    dietary_preferences: 'non-veg',
    spice_level: 'medium',
    preferred_cuisines: [],
    budget_preference: 'medium',
    meal_preferences: [],
    allergens: [],
    dietary_restrictions: [],
    delivery_time_windows: []
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        dietary_preferences: user.dietary_preferences || 'non-veg',
        spice_level: user.spice_level || 'medium',
        preferred_cuisines: user.preferred_cuisines || [],
        budget_preference: user.budget_preference || 'medium',
        meal_preferences: user.meal_preferences || [],
        allergens: user.allergens || [],
        dietary_restrictions: user.dietary_restrictions || [],
        delivery_time_windows: user.delivery_time_windows || []
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      if (['allergens', 'preferred_cuisines', 'meal_preferences', 'dietary_restrictions', 'delivery_time_windows'].includes(name)) {
        const currentArray = formData[name] || []
        if (checked) {
          setFormData({ ...formData, [name]: [...currentArray, value] })
        } else {
          setFormData({ ...formData, [name]: currentArray.filter(item => item !== value) })
        }
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await api.put('/users/preferences', formData)
      setMessage('Preferences updated successfully! Refreshing recommendations...')
      
      // Refresh user data in context
      await fetchUser()
      
      // Give a moment for user data to update, then redirect to home to see new recommendations
      setTimeout(() => {
        setMessage('')
        // Force a page reload to refresh recommendations on home page
        window.location.href = '/'
      }, 1500)
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update preferences')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Food Preferences</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Preference *
          </label>
          <select
            name="dietary_preferences"
            required
            className="input-field"
            value={formData.dietary_preferences}
            onChange={handleChange}
          >
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Restrictions
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Gluten-free', 'Lactose-free', 'Jain', 'Sugar-free', 'Oil-free'].map((restriction) => (
              <label key={restriction} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="dietary_restrictions"
                  value={restriction}
                  checked={formData.dietary_restrictions.includes(restriction)}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm">{restriction}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Spice Level *
          </label>
          <select
            name="spice_level"
            required
            className="input-field"
            value={formData.spice_level}
            onChange={handleChange}
          >
            <option value="mild">Mild</option>
            <option value="medium">Medium</option>
            <option value="hot">Hot</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Cuisines
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['North Indian', 'South Indian', 'Bengali', 'Gujarati', 'Maharashtrian', 'Punjabi', 'Rajasthani', 'Kerala'].map((cuisine) => (
              <label key={cuisine} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="preferred_cuisines"
                  value={cuisine}
                  checked={formData.preferred_cuisines.includes(cuisine)}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm">{cuisine}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Preference
          </label>
          <select
            name="budget_preference"
            className="input-field"
            value={formData.budget_preference}
            onChange={handleChange}
          >
            <option value="low">Low (£0-10 per meal)</option>
            <option value="medium">Medium (£10-20 per meal)</option>
            <option value="high">High (£20+ per meal)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Meal Times
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
              <label key={meal} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="meal_preferences"
                  value={meal}
                  checked={formData.meal_preferences.includes(meal)}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm">{meal}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Delivery Time Windows
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['Morning (7-11 AM)', 'Afternoon (11 AM-3 PM)', 'Evening (3-7 PM)', 'Night (7-11 PM)'].map((window) => (
              <label key={window} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="delivery_time_windows"
                  value={window}
                  checked={formData.delivery_time_windows?.includes(window) || false}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm">{window}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergens (select if applicable)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Nuts', 'Dairy', 'Soy', 'Seafood', 'Eggs', 'Gluten', 'Sesame'].map((allergen) => (
              <label key={allergen} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="allergens"
                  value={allergen}
                  checked={formData.allergens.includes(allergen)}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm">{allergen}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center">
          Your preferences help us provide better recommendations and filter dishes according to your needs.
        </p>
      </form>
    </div>
  )
}

