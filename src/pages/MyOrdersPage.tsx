import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingBag, Calendar, MapPin, AlertCircle, ChevronDown, Truck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Footer } from '../components/Footer';
import { Package as PackageType, Meal } from '../types';

interface OrderDelivery {
  id: string;
  scheduled_date: string;
  meals_count: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  delivered_at?: string;
  notes?: string;
}

interface Order {
  id: string;
  created_at: string;
  package_data: PackageType;
  meals: Meal[];
  status: 'pending' | 'processing' | 'delivered';
  delivery_address_data: {
    recipient_name: string;
    address: string;
    municipality: string;
    province: string;
  };
  personal_note?: string;
  total: number;
  deliveries?: OrderDelivery[];
}

const ORDERS_PER_PAGE = 5;

export const MyOrdersPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        // First, get total count of orders
        const { count, error: countError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) throw countError;
        setTotalOrders(count || 0);

        // Then fetch paginated orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE - 1);

        if (ordersError) throw ordersError;

        // For each order, fetch its deliveries
        const ordersWithDeliveries = await Promise.all(
          (ordersData || []).map(async (order) => {
            const { data: deliveriesData, error: deliveriesError } = await supabase
              .from('order_deliveries')
              .select('*')
              .eq('order_id', order.id)
              .order('scheduled_date', { ascending: true });

            if (deliveriesError) throw deliveriesError;

            return {
              ...order,
              deliveries: deliveriesData
            };
          })
        );

        setOrders(ordersWithDeliveries);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('No pudimos cargar tus órdenes. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate, authLoading, currentPage]);

  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getStatusColor = (status: Order['status'] | OrderDelivery['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status'] | OrderDelivery['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'En proceso';
      case 'in_transit':
        return 'En tránsito';
      case 'delivered':
      case 'completed':
        return 'Entregado';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Mis Órdenes</h1>
            <button
              onClick={() => navigate('/packages')}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Nueva orden
            </button>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No tienes órdenes aún</h2>
              <p className="text-gray-600 mb-6">
                ¡Comienza a enviar comida casera a tu familia en Cuba!
              </p>
              <button
                onClick={() => navigate('/packages')}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Hacer mi primer pedido
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-sm text-gray-500">
                            Orden #{order.id.slice(0, 8)}
                          </span>
                          <h3 className="text-lg font-semibold mt-1">
                            {order.package_data.name}
                          </h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Comidas
                            </p>
                            <ul className="text-sm text-gray-600 mt-1">
                              {order.meals.map((meal) => (
                                <li key={meal.id}>{meal.name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Dirección de entrega
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {order.delivery_address_data.recipient_name}
                              <br />
                              {order.delivery_address_data.address}
                              <br />
                              {order.delivery_address_data.municipality},{' '}
                              {order.delivery_address_data.province}
                            </p>
                          </div>
                        </div>
                      </div>

                      {order.personal_note && (
                        <div className="text-sm text-gray-600 italic border-t border-gray-100 pt-4">
                          "{order.personal_note}"
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-gray-100 mt-4 pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.created_at)}
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold">${order.total}</p>
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <ChevronDown
                              className={`w-5 h-5 transition-transform ${
                                expandedOrders.includes(order.id) ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedOrders.includes(order.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-100 mt-4 pt-4">
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Estado de las entregas
                              </h4>
                              <div className="space-y-4">
                                {order.deliveries?.map((delivery) => (
                                  <div
                                    key={delivery.id}
                                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                                  >
                                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                                    <div className="flex-grow">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-700">
                                          Entrega de {delivery.meals_count} comida{delivery.meals_count > 1 ? 's' : ''}
                                        </p>
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                            delivery.status
                                          )}`}
                                        >
                                          {getStatusText(delivery.status)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        Programada para: {formatDate(delivery.scheduled_date)}
                                      </p>
                                      {delivery.delivered_at && (
                                        <p className="text-sm text-gray-600">
                                          Entregada: {formatDate(delivery.delivered_at)}
                                        </p>
                                      )}
                                      {delivery.notes && (
                                        <p className="text-sm text-gray-600 mt-2 italic">
                                          {delivery.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          currentPage === page
                            ? 'bg-red-500 text-white'
                            : 'hover:bg-red-50 text-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};