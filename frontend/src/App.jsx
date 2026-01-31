import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Sidebar from './components/Layout/Sidebar';

// Public Pages
import Home from './pages/customer/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/Forgotpassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProductList from './pages/customer/Products';
import ProductDetail from './pages/customer/Productdetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerOrders from './pages/customer/Myorders';
import CustomerInvoices from './pages/customer/Invoices';
import CustomerProfile from './pages/customer/Profile';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/Productmanagement';
import VendorOrders from './pages/vendor/Ordermanagement';
import VendorInvoices from './pages/vendor/Invoicemanagement';
import VendorReports from './pages/vendor/Reports';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/Usermanagement';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminSettings from './pages/admin/Settings';
import AdminReports from './pages/admin/Reports';

// Error Pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route Component (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'vendor') return <Navigate to="/vendor/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return children;
};

// Main Layout Component
const MainLayout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

// App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <Home />
                </MainLayout>
              }
            />
            
            <Route
              path="/products"
              element={
                <MainLayout>
                  <ProductList />
                </MainLayout>
              }
            />
            
            <Route
              path="/products/:id"
              element={
                <MainLayout>
                  <ProductDetail />
                </MainLayout>
              }
            />
            
            <Route
              path="/cart"
              element={
                <MainLayout>
                  <Cart />
                </MainLayout>
              }
            />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            
            <Route
              path="/reset-password/:token"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MainLayout showSidebar>
                    <CustomerDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customer/orders"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MainLayout showSidebar>
                    <CustomerOrders />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customer/invoices"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MainLayout showSidebar>
                    <CustomerInvoices />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MainLayout showSidebar>
                    <CustomerProfile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MainLayout>
                    <Checkout />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Vendor Routes */}
            <Route
              path="/vendor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <MainLayout showSidebar>
                    <VendorDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/vendor/products"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <MainLayout showSidebar>
                    <VendorProducts />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/vendor/orders"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <MainLayout showSidebar>
                    <VendorOrders />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/vendor/invoices"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <MainLayout showSidebar>
                    <VendorInvoices />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/vendor/reports"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <MainLayout showSidebar>
                    <VendorReports />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout showSidebar>
                    <AdminDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout showSidebar>
                    <AdminUsers />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout showSidebar>
                    <AdminProducts />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout showSidebar>
                    <AdminOrders />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout showSidebar>
                    <AdminSettings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout showSidebar>
                    <AdminReports />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;