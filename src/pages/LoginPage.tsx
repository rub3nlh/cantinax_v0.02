import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, Apple } from 'lucide-react';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get return path and order data from location state
  const returnTo = location.state?.returnTo || '/';
  const orderData = location.state?.orderData;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      await signIn(email, password);
      // Navigate back to the return path with order data if it exists
      navigate(returnTo, { state: orderData });
    } catch (err) {
      console.error('Error during login:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // Navigate back to the return path with order data if it exists
      navigate(returnTo, { state: orderData });
    } catch (err) {
      console.error('Error during Google login:', err);
      setError('Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      // Implement Apple login
      setError('Inicio de sesión con Apple próximamente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h1 className="text-3xl font-bold text-center mb-8">Iniciar sesión</h1>

              <div className="space-y-4 mb-8">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Continuar con Google
                </button>

                <button
                  onClick={handleAppleLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  <Apple className="w-5 h-5" />
                  Continuar con Apple
                </button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">O</span>
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-600">
                      <p className="font-medium">{error}</p>
                      {error === 'Su email no ha sido confirmado' && (
                        <p className="mt-1">
                          Por favor, revisa tu correo electrónico y haz clic en el enlace de confirmación.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <Link to="/forgot-password" className="text-sm text-red-500 hover:text-red-600">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link to="/signup" className="text-red-500 hover:text-red-600 font-medium">
                  Regístrate
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};