import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { PackageSelection } from './pages/PackageSelection';
import { MealSelection } from './pages/MealSelection';
import { OrderSummary } from './pages/OrderSummary';
import { PaymentPage } from './pages/PaymentPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { SignupPage } from './pages/SignupPage';
import { LoginPage } from './pages/LoginPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminPage } from './pages/admin/AdminPage';
import { AdminMeals } from './pages/admin/AdminMeals';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminDeliveries } from './pages/admin/AdminDeliveries';
import { ChefHat, User, LogIn, ChevronDown, ShoppingBag, Menu, X, Settings } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { UserAvatar } from './components/UserAvatar';
import { DebugPanel } from './components/DebugPanel';

function App() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-white shadow-sm relative z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center gap-2 text-red-500">
                <ChefHat className="w-8 h-8" />
                <span className="text-xl font-bold">LaCantinaXL</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link
                      to="/my-orders"
                      className="flex items-center gap-2 text-gray-700 hover:text-red-500"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Mis Órdenes</span>
                    </Link>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-gray-700 hover:text-red-500"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 text-gray-700 hover:text-red-500"
                      >
                        <UserAvatar 
                          name={user.user_metadata?.display_name || user.email} 
                          size={32}
                        />
                        <span>{user.email}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isMenuOpen && (
                        <div 
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1"
                        >
                          <button
                            onClick={() => {
                              signOut();
                              closeAllMenus();
                            }}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                          >
                            Cerrar sesión
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link
                      to="/login"
                      className="flex items-center gap-2 text-gray-700 hover:text-red-500"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Iniciar sesión</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Crear cuenta
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-700 hover:text-red-500"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 py-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700 px-2">
                      <UserAvatar 
                        name={user.user_metadata?.display_name || user.email}
                        size={32}
                      />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <Link
                      to="/my-orders"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2 text-gray-700 hover:text-red-500 px-2 py-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span>Mis Órdenes</span>
                    </Link>
                    <Link
                      to="/admin"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2 text-gray-700 hover:text-red-500 px-2 py-2"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        closeAllMenus();
                      }}
                      className="w-full text-left text-gray-700 hover:text-red-500 px-2 py-2 flex items-center gap-2"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link
                      to="/login"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2 text-gray-700 hover:text-red-500 px-2 py-2"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Iniciar sesión</span>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeAllMenus}
                      className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-colors mx-2"
                    >
                      <User className="w-5 h-5" />
                      <span>Crear cuenta</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/packages" element={<PackageSelection />} />
            <Route path="/meal-selection" element={<MealSelection />} />
            <Route path="/order-summary" element={<OrderSummary />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminPage />} />
              <Route path="meals" element={<AdminMeals />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="deliveries" element={<AdminDeliveries />} />
            </Route>
          </Routes>
        </main>

        {/* Debug Panel */}
        <DebugPanel />
      </div>
    </Router>
  );
}

export default App;