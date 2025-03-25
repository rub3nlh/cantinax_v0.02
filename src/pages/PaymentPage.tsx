import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, AlertCircle, Lock } from 'lucide-react';
import { OrderSummary, PaymentMethod } from '../types';
import { usePayment } from '../hooks/usePayment';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderSummary = location.state as OrderSummary;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const { processPayment, loading: paymentLoading, error: paymentError } = usePayment();
  const [processing, setProcessing] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      name: 'Tarjeta de crédito',
      icon: CreditCard,
      description: 'Pago seguro con tarjeta'
    },
    {
      id: 'tropipay' as PaymentMethod,
      name: 'Tropipay',
      icon: Wallet,
      description: 'Transferencia instantánea con Tropipay'
    }
  ];

  // Prepara los meals para la base de datos
  function prepareMealsForDatabase(meals: any[]): any[] {
    if (!Array.isArray(meals)) {
      console.error("meals no es un array:", meals);
      throw new Error("No hay comidas seleccionadas");
    }
    
    console.log("Raw meals data:", JSON.stringify(meals, null, 2));
    
    const validMeals = [];
    
    for (let i = 0; i < meals.length; i++) {
      const mealItem = meals[i];
      console.log(`Processing meal ${i}:`, { meal: mealItem });
      
      // Extraer el objeto meal (ya sea directo o anidado)
      let mealObject;
      
      if (mealItem && typeof mealItem === 'object') {
        // Si el objeto tiene una propiedad 'meal', usar ese objeto
        if (mealItem.meal && typeof mealItem.meal === 'object') {
          console.log("Caso 1: Usando propiedad 'meal' anidada");
          mealObject = mealItem.meal;
        } else {
          // Usar el objeto directamente
          console.log("Caso 2: Usando objeto directamente");
          mealObject = mealItem;
        }
      } else {
        console.error(`Meal en posición ${i} no es un objeto válido:`, mealItem);
        throw new Error(`Comida en posición ${i} no es un objeto válido`);
      }
      
      console.log("Processing meal:", mealObject);
      
      // Validar ID
      if (!mealObject.id || typeof mealObject.id !== 'string' || mealObject.id.trim() === '') {
        console.error(`Meal en posición ${i} tiene ID inválido:`, mealObject);
        throw new Error(`Comida "${mealObject.name || `en posición ${i}`}" no tiene un ID válido`);
      }
      
      console.log(`Validating meal ID:`, {
        raw: mealObject.id,
        type: typeof mealObject.id
      });
      
      const validId = mealObject.id.trim();
      
      console.log(`Processed meal ID:`, {
        original: mealObject.id,
        processed: validId
      });
      
      // Crear un objeto meal limpio
      validMeals.push({
        id: validId,
        name: mealObject.name || `Comida ${i + 1}`,
        description: mealObject.description || '',
        image: mealObject.image || '',
        ingredients: Array.isArray(mealObject.ingredients) ? mealObject.ingredients : [],
        allergens: Array.isArray(mealObject.allergens) ? mealObject.allergens : [],
        chefNote: mealObject.chefNote || ''
      });
      
      console.log(`Validated meal ${i}:`, {
        originalId: mealObject.id,
        validId
      });
    }
    
    console.log("Validated meals:", {
      meals: validMeals,
      count: validMeals.length,
      ids: validMeals.map(m => m.id)
    });
    
    return validMeals;
  }

  const handlePayment = async () => {
    if (!selectedMethod || !user || processing) return;

    try {
      setProcessing(true);
      setError(null);

      let orderId = createdOrderId;
      
      if (!orderId) {
        // Validación básica
        if (!orderSummary || !orderSummary.selectedMeals) {
          throw new Error('No hay comidas seleccionadas');
        }
        
        // Procesar y validar cada comida
        const validatedMeals = prepareMealsForDatabase(orderSummary.selectedMeals);
        
        // Verificar que todos los meals tengan IDs válidos
        for (let i = 0; i < validatedMeals.length; i++) {
          if (!validatedMeals[i].id || typeof validatedMeals[i].id !== 'string' || validatedMeals[i].id.trim() === '') {
            throw new Error(`Comida en posición ${i} no tiene un ID válido después de validación`);
          }
        }

        // Preparar datos para la orden - IMPORTANTE: Hacemos que los meals sean objetos simples, no anidados
        const orderPayload = {
          user_id: user.id,
          package_id: orderSummary.package.id,
          package_data: orderSummary.package,
          // Aquí enviamos los meals como un array de objetos directos
          meals: validatedMeals,
          delivery_address_id: orderSummary.deliveryAddress.id,
          delivery_address_data: {
            recipient_name: orderSummary.deliveryAddress.recipientName || '',
            phone: orderSummary.deliveryAddress.phone || '',
            address: orderSummary.deliveryAddress.address || '',
            province: orderSummary.deliveryAddress.province || '',
            municipality: orderSummary.deliveryAddress.municipality || ''
          },
          personal_note: orderSummary.personalNote || '',
          total: orderSummary.package.price || 0
        };
        
        console.log("Creating order with data:", {
          orderData: orderPayload,
          mealsCount: validatedMeals.length,
          mealIds: validatedMeals.map(m => m.id)
        });

        // Create order in Supabase
        const { data: createdOrder, error: createError } = await supabase
          .from('orders')
          .insert([orderPayload])
          .select()
          .single();

        if (createError) {
          console.error("Order creation error:", {
            error: createError,
            orderData: orderPayload,
            meals: validatedMeals
          });
          throw new Error(`Error al crear la orden: ${createError.message}`);
        }
        
        if (!createdOrder) throw new Error('No se pudo crear la orden');

        orderId = createdOrder.id;
        setCreatedOrderId(orderId);
      }

      if (selectedMethod === 'tropipay') {
        // Get user metadata for additional info
        const { data: { user: userData } } = await supabase.auth.getUser();
        const userMetadata = userData?.user_metadata || {};

        // Prepare client data for TropiPay
        const clientData = {
          name: userMetadata.display_name?.split(' ')[0] || '',
          lastName: userMetadata.display_name?.split(' ').slice(1).join(' ') || '',
          phone: userMetadata.phone || '',
          email: user.email || '',
          address: orderSummary.deliveryAddress.address || '',
          countryId: 1, // Default to Spain
          termsAndConditions: 'true'
        };

        const result = await processPayment('tropipay', {
          orderId,
          reference: orderId,
          concept: `Pedido #${orderId.slice(0, 8)}`,
          amount: (orderSummary.package.price || 0) * 100, // Convert to cents
          currency: 'EUR',
          description: `${orderSummary.package.name} - ${orderSummary.selectedMeals.length} comidas`,
          urlSuccess: `${window.location.origin}/thank-you?order=${orderId}`,
          urlFailed: `${window.location.origin}/payment?order=${orderId}`,
          client: clientData
        });

        // Redirect to TropiPay payment URL
        if (result.shortUrl) {
          window.location.href = result.shortUrl;
        } else {
          throw new Error('No se pudo obtener la URL de pago');
        }
      }
    } catch (err: any) {
      console.error('Payment processing error:', {
        error: err,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'Ha ocurrido un error al procesar el pago');
      setProcessing(false);
    }
  };

  // If there's no order summary data, redirect to packages
  if (!orderSummary) {
    navigate('/packages');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Método de Pago</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            {(paymentError || error) && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{paymentError || error}</p>
              </div>
            )}

            <div className="grid gap-4">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedMethod === method.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center gap-4">
                    <method.icon className="w-6 h-6 text-red-500" />
                    <div>
                      <h3 className="font-medium">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                        {selectedMethod === method.id && (
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg">Total a pagar:</span>
                <span className="text-2xl font-bold">${orderSummary.package.price}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedMethod || processing}
                className={`w-full py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 ${
                  selectedMethod && !processing
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Lock className="w-5 h-5" />
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Procesar Pago'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};