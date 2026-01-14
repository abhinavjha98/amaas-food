import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import CatalogPage from './pages/CatalogPage'
import DishDetailPage from './pages/DishDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ProfilePage from './pages/ProfilePage'
import PreferencesPage from './pages/PreferencesPage'
import ProducerDashboard from './pages/ProducerDashboard'
import AdminDashboard from './pages/AdminDashboard'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-600 mb-2">Loading...</div>
          <div className="text-sm text-gray-500">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/reset-password" element={!user ? <ResetPasswordPage /> : <Navigate to="/" />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/dishes/:id" element={<DishDetailPage />} />

      {/* Protected Customer Routes */}
      <Route
        path="/cart"
        element={user && user.role === 'customer' ? <CartPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/checkout"
        element={user && user.role === 'customer' ? <CheckoutPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/orders"
        element={user && user.role === 'customer' ? <OrdersPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/orders/:id"
        element={user && user.role === 'customer' ? <OrderDetailPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={user ? <ProfilePage /> : <Navigate to="/login" />}
      />
      <Route
        path="/preferences"
        element={user && user.role === 'customer' ? <PreferencesPage /> : <Navigate to="/login" />}
      />

      {/* Producer Routes */}
      <Route
        path="/producer/dashboard"
        element={user && user.role === 'producer' ? <ProducerDashboard /> : <Navigate to="/login" />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App


