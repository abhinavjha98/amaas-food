import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCheck, FiX } from 'react-icons/fi'

export default function ProfilePage() {
  const { user, fetchUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [producer, setProducer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address_line1: profile.address_line1 || '',
        address_line2: profile.address_line2 || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || ''
      })
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile')
      setProfile(response.data.user)
      if (response.data.producer) {
        setProducer(response.data.producer)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const response = await api.put('/users/profile', formData)
      setMessage('Profile updated successfully!')
      setEditing(false)
      setProfile(response.data.user)
      await fetchUser() // Refresh user context
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address_line1: profile.address_line1 || '',
        address_line2: profile.address_line2 || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || ''
      })
    }
    setError('')
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      customer: 'bg-blue-100 text-blue-800',
      producer: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Failed to load profile</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {message && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Basic Information</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 className="w-5 h-5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    className="input-field bg-gray-100 cursor-not-allowed"
                    value={profile.email}
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input-field"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FiCheck className="w-5 h-5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FiX className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiUser className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold">{profile.name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold">{profile.phone || 'Not set'}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile.role)}`}>
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Address Section */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Delivery Address</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <FiEdit2 className="w-5 h-5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    name="address_line1"
                    className="input-field"
                    value={formData.address_line1}
                    onChange={handleChange}
                    placeholder="Street address, P.O. box"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="address_line2"
                    className="input-field"
                    value={formData.address_line2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="input-field"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County/Region
                    </label>
                    <select
                      name="state"
                      className="input-field"
                      value={formData.state}
                      onChange={handleChange}
                    >
                      <option value="">Select County/Region</option>
                      <option value="England">England</option>
                      <option value="Scotland">Scotland</option>
                      <option value="Wales">Wales</option>
                      <option value="Northern Ireland">Northern Ireland</option>
                      <option value="Bedfordshire">Bedfordshire</option>
                      <option value="Berkshire">Berkshire</option>
                      <option value="Bristol">Bristol</option>
                      <option value="Buckinghamshire">Buckinghamshire</option>
                      <option value="Cambridgeshire">Cambridgeshire</option>
                      <option value="Cheshire">Cheshire</option>
                      <option value="Cornwall">Cornwall</option>
                      <option value="Cumbria">Cumbria</option>
                      <option value="Derbyshire">Derbyshire</option>
                      <option value="Devon">Devon</option>
                      <option value="Dorset">Dorset</option>
                      <option value="Durham">Durham</option>
                      <option value="East Riding of Yorkshire">East Riding of Yorkshire</option>
                      <option value="East Sussex">East Sussex</option>
                      <option value="Essex">Essex</option>
                      <option value="Gloucestershire">Gloucestershire</option>
                      <option value="Greater London">Greater London</option>
                      <option value="Greater Manchester">Greater Manchester</option>
                      <option value="Hampshire">Hampshire</option>
                      <option value="Herefordshire">Herefordshire</option>
                      <option value="Hertfordshire">Hertfordshire</option>
                      <option value="Isle of Wight">Isle of Wight</option>
                      <option value="Kent">Kent</option>
                      <option value="Lancashire">Lancashire</option>
                      <option value="Leicestershire">Leicestershire</option>
                      <option value="Lincolnshire">Lincolnshire</option>
                      <option value="Merseyside">Merseyside</option>
                      <option value="Norfolk">Norfolk</option>
                      <option value="North Yorkshire">North Yorkshire</option>
                      <option value="Northamptonshire">Northamptonshire</option>
                      <option value="Northumberland">Northumberland</option>
                      <option value="Nottinghamshire">Nottinghamshire</option>
                      <option value="Oxfordshire">Oxfordshire</option>
                      <option value="Rutland">Rutland</option>
                      <option value="Shropshire">Shropshire</option>
                      <option value="Somerset">Somerset</option>
                      <option value="South Yorkshire">South Yorkshire</option>
                      <option value="Staffordshire">Staffordshire</option>
                      <option value="Suffolk">Suffolk</option>
                      <option value="Surrey">Surrey</option>
                      <option value="Tyne and Wear">Tyne and Wear</option>
                      <option value="Warwickshire">Warwickshire</option>
                      <option value="West Midlands">West Midlands</option>
                      <option value="West Sussex">West Sussex</option>
                      <option value="West Yorkshire">West Yorkshire</option>
                      <option value="Wiltshire">Wiltshire</option>
                      <option value="Worcestershire">Worcestershire</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    className="input-field uppercase"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="SW1A 1AA"
                    pattern="[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}"
                    style={{ textTransform: 'uppercase' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">UK postcode format (e.g., SW1A 1AA)</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.address_line1 || profile.city || profile.state ? (
                  <div className="flex items-start space-x-3">
                    <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="text-gray-700">
                      {profile.address_line1 && <p>{profile.address_line1}</p>}
                      {profile.address_line2 && <p>{profile.address_line2}</p>}
                      {(profile.city || profile.state || profile.pincode) && (
                        <p>
                          {[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {!profile.address_line1 && !profile.city && !profile.state && (
                        <p className="text-gray-500 italic">No address set</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No address set</p>
                )}
              </div>
            )}
          </div>

          {/* Customer Preferences Section */}
          {profile.role === 'customer' && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Preferences</h2>
                <Link to="/preferences" className="btn-secondary text-sm">
                  Manage Preferences
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {profile.dietary_preferences && (
                  <div>
                    <p className="text-sm text-gray-500">Dietary Preference</p>
                    <p className="font-semibold capitalize">{profile.dietary_preferences}</p>
                  </div>
                )}
                {profile.spice_level && (
                  <div>
                    <p className="text-sm text-gray-500">Spice Level</p>
                    <p className="font-semibold capitalize">{profile.spice_level}</p>
                  </div>
                )}
                {profile.budget_preference && (
                  <div>
                    <p className="text-sm text-gray-500">Budget Preference</p>
                    <p className="font-semibold capitalize">{profile.budget_preference}</p>
                  </div>
                )}
                {profile.preferred_cuisines && (() => {
                  try {
                    const cuisines = Array.isArray(profile.preferred_cuisines) 
                      ? profile.preferred_cuisines 
                      : (typeof profile.preferred_cuisines === 'string' 
                          ? (profile.preferred_cuisines.startsWith('[') 
                              ? JSON.parse(profile.preferred_cuisines) 
                              : profile.preferred_cuisines.split(',').map(c => c.trim()).filter(c => c))
                          : [])
                    return cuisines.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Preferred Cuisines</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {cuisines.map((cuisine, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  } catch (e) {
                    return null
                  }
                })()}
                {profile.allergens && (() => {
                  try {
                    const allergens = Array.isArray(profile.allergens) 
                      ? profile.allergens 
                      : (typeof profile.allergens === 'string' 
                          ? (profile.allergens.startsWith('[') 
                              ? JSON.parse(profile.allergens) 
                              : profile.allergens.split(',').map(a => a.trim()).filter(a => a))
                          : [])
                    return allergens.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Allergens</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {allergens.map((allergen, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  } catch (e) {
                    return null
                  }
                })()}
              </div>
            </div>
          )}

          {/* Producer Profile Section */}
          {profile.role === 'producer' && producer && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Kitchen Information</h2>
                <Link to="/producer/dashboard" className="btn-secondary text-sm">
                  Manage Kitchen
                </Link>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Kitchen Name</p>
                  <p className="font-semibold">{producer.kitchen_name || 'Not set'}</p>
                </div>
                {producer.cuisine_specialty && (
                  <div>
                    <p className="text-sm text-gray-500">Cuisine Specialty</p>
                    <p className="font-semibold">{producer.cuisine_specialty}</p>
                  </div>
                )}
                {producer.bio && (
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="text-gray-700">{producer.bio}</p>
                  </div>
                )}
                <div className="flex space-x-4">
                  {producer.average_rating > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <p className="font-semibold">⭐ {producer.average_rating.toFixed(1)} ({producer.total_reviews} reviews)</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      producer.status === 'approved' && producer.is_active
                        ? 'bg-green-100 text-green-800'
                        : producer.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {producer.status === 'approved' && producer.is_active
                        ? 'Active'
                        : producer.status === 'pending'
                        ? 'Pending Approval'
                        : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Quick Actions */}
          {profile.role === 'customer' && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/orders" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                  <p className="font-semibold">My Orders</p>
                  <p className="text-sm text-gray-500">View order history</p>
                </Link>
                <Link to="/preferences" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center">
                  <p className="font-semibold">Preferences</p>
                  <p className="text-sm text-gray-500">Update preferences</p>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">{profile.name}</h3>
              <p className="text-gray-500">{profile.email}</p>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-semibold text-sm">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>

              {profile.role === 'customer' && (
                <Link to="/orders" className="block btn-primary w-full text-center">
                  View Orders
                </Link>
              )}

              {profile.role === 'producer' && (
                <Link to="/producer/dashboard" className="block btn-primary w-full text-center">
                  Go to Dashboard
                </Link>
              )}

              {profile.role === 'admin' && (
                <Link to="/admin/dashboard" className="block btn-primary w-full text-center">
                  Go to Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
