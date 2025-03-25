import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, ChevronRight, ShoppingBag } from 'lucide-react';
import { OrderSummary } from '../types';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
}

export const ThankYouPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { package: selectedPackage, purchaseDate } = location.state as OrderSummary & { purchaseDate: Date };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-block text-green-500 mb-6"
              >
                <CheckCircle className="w-20 h-20" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>
              <p className="text-xl text-gray-600">
                Tu pedido ha sido confirmado y será preparado con mucho cariño
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Detalles del pedido</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Calendar className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-green-800">Fecha de compra</h3>
                    <p className="text-green-600">{formatDate(new Date(purchaseDate))}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <h3 className="font-medium">Paquete seleccionado</h3>
                    <p className="text-gray-600">{selectedPackage.name}</p>
                    <p className="text-gray-600">{selectedPackage.meals} comidas</p>
                    <p className="font-medium mt-2">Total: ${selectedPackage.price}</p>
                  </div>
                </div>
              </div>
            </div>

            {user ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Seguimiento de tu pedido</h2>
                <p className="text-gray-600 mb-6">
                  Puedes ver el estado de tus entregas y hacer seguimiento de tu pedido en cualquier momento
                </p>
                <button
                  onClick={() => navigate('/my-orders')}
                  className="w-full py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Ver mis órdenes
                </button>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">¿Quieres crear una cuenta?</h2>
                <p className="text-gray-600 mb-6">
                  Crea una cuenta para hacer seguimiento de tus pedidos y gestionar tus direcciones de entrega
                </p>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  Crear cuenta
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};