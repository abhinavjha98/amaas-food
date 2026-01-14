import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'customer'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: role,
    kitchen_name: '',
    cuisine_specialty: '',
    delivery_radius_km: 5.0,
    // Customer preferences (for recommendation system)
    dietary_preferences: 'non-veg',
    spice_level: 'medium',
    allergens: [],
    preferred_cuisines: [],
    budget_preference: 'medium',
    meal_preferences: [],
    dietary_restrictions: [],
    delivery_time_windows: []
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPreferences, setShowPreferences] = useState(role === 'customer')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      // Handle all array-based checkbox fields
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
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const { confirmPassword, ...registerData } = formData
    const result = await register(registerData)
    
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                name="name"
                type="text"
                required
                className="input-field mt-1"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                required
                className="input-field mt-1"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                name="phone"
                type="tel"
                className="input-field mt-1"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {role === 'producer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kitchen Name</label>
                  <input
                    name="kitchen_name"
                    type="text"
                    required
                    className="input-field mt-1"
                    value={formData.kitchen_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cuisine Specialty</label>
                  <input
                    name="cuisine_specialty"
                    type="text"
                    placeholder="e.g., North Indian, South Indian"
                    className="input-field mt-1"
                    value={formData.cuisine_specialty}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {role === 'customer' && (
              <>
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Food Preferences (for better recommendations)</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference *</label>
                    <select
                      name="dietary_preferences"
                      required
                      className="input-field mt-1"
                      value={formData.dietary_preferences}
                      onChange={handleChange}
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Spice Level *</label>
                    <select
                      name="spice_level"
                      required
                      className="input-field mt-1"
                      value={formData.spice_level}
                      onChange={handleChange}
                    >
                      <option value="mild">Mild</option>
                      <option value="medium">Medium</option>
                      <option value="hot">Hot</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {['Gluten-free', 'Lactose-free', 'Jain', 'Sugar-free'].map((restriction) => (
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

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Cuisines</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
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

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Preference</label>
                    <select
                      name="budget_preference"
                      className="input-field mt-1"
                      value={formData.budget_preference}
                      onChange={handleChange}
                    >
                      <option value="low">Low (£0-10 per meal)</option>
                      <option value="medium">Medium (£10-20 per meal)</option>
                      <option value="high">High (£20+ per meal)</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Meal Times</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
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

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergens (select if applicable)</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
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
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                required
                className="input-field mt-1"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="input-field mt-1"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <input type="hidden" name="role" value={formData.role} />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}


