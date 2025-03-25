import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stepper } from '../components/Stepper';
import { Footer } from '../components/Footer';
import { Package, Meal, DeliveryAddress } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Plus, Trash2, AlertCircle } from 'lucide-react';
import { AddressModal } from '../components/AddressModal';
import { useAddresses } from '../hooks/useAddresses';
import { useAuth } from '../hooks/useAuth';

export const OrderSummary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { package: selectedPackage, selectedMeals } = location.state as {
    package: Package;
    selectedMeals: Meal[];
  };

  const [personalNote, setPersonalNote] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const { addresses, addAddress, removeAddress, userInfo, saveUserInfo } = useAddresses();
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);

  // Form state for user info (only used when not logged in)
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');

  const handleBack = () => {
    navigate(-1);
  };

  const handleCheckout = () => {
    // If user is not logged in, require name and email
    if (!user && (!name || !email)) return;
    if (!selectedAddress) return;

    // Save user info if not logged in
    if (!user) {
      saveUserInfo({ name, email });
      navigate('/login', {
        state: {
          returnTo: '/payment',
          orderData: {
            package: selectedPackage,
            selectedMeals,
            personalNote,
            deliveryAddress: selectedAddress
          }
        }
      });
      return;
    }

    // If logged in, proceed directly to payment
    navigate('/payment', {
      state: {
        package: selectedPackage,
        selectedMeals,
        personalNote,
        deliveryAddress: selectedAddress
      }
    });
  };

  const handleAddAddress = (address: DeliveryAddress) => {
    addAddress(address);
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pb-20">
        <Stepper
          steps={['Selección', 'Personalización', 'Resumen']}
          currentStep={2}
        />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">
              {user ? `¡Hola ${user.email}!` : 'Revisa tu pedido'}
            </h1>
            <p className="text-xl text-gray-600">
              {user 
                ? 'Vamos a revisar la orden'
                : 'Confirma los detalles de tu pedido antes de continuar'
              }
            </p>
          </motion.div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Resumen del pedido</h2>
            
            {!user && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 text-gray-700">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-medium">
                    Necesitamos estos datos para notificarte de las entregas
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-semibold mb-4">Paquete seleccionado:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg font-medium">{selectedPackage.name}</p>
                <p className="text-gray-600">{selectedPackage.description}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-4">Comidas seleccionadas:</h3>
              <div className="space-y-4">
                {selectedMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg"
                  >
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium">{meal.name}</p>
                      <p className="text-sm text-gray-600">{meal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-4">Dirección de entrega:</h3>
              {addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Aún no has agregado ninguna dirección de entrega</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar dirección
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{address.recipientName}</h4>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="text-gray-600">{address.address}</p>
                          <p className="text-gray-600">
                            {address.municipality}, {address.province}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAddress(address.id);
                            if (selectedAddress?.id === address.id) {
                              setSelectedAddress(null);
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Agregar otra dirección
                  </button>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-4">Nota personal:</h3>
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="Escribe un mensaje personal para tu familiar..."
                className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
              />
            </div>

            <div className="border-t-2 border-gray-100 pt-6">
              <div className="flex justify-between items-center text-xl font-bold mb-6">
                <span>Total:</span>
                <span>${selectedPackage.price}</span>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-gray-300"
                >
                  ← Atrás
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={!selectedAddress || (!user && (!name || !email))}
                  className={`px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 ${
                    selectedAddress && (user || (name && email))
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Pagar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddressModal && (
          <AddressModal
            onClose={() => setShowAddressModal(false)}
            onSave={handleAddAddress}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};