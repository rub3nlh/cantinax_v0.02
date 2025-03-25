import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle, XCircle, Package, Calendar, Truck } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';

const ITEMS_PER_PAGE = 10;

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  ready: 'bg-green-100 text-green-800 border-green-200',
  delivered: 'bg-purple-100 text-purple-800 border-purple-200',
  failed: 'bg-red-100 text-red-800 border-red-200'
};

const STATUS_ICONS = {
  pending: Clock,
  processing: Package,
  completed: CheckCircle,
  cancelled: XCircle,
  in_progress: Truck,
  ready: CheckCircle,
  delivered: CheckCircle,
  failed: XCircle
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  in_progress: 'En preparación',
  ready: 'Lista para entrega',
  delivered: 'Entregada',
  failed: 'Fallida'
};

export const AdminOrders: React.FC = () => {
  const { orders, loading, error } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const filteredOrders = orders.filter(order =>
    order.delivery_address_data.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente o número de orden..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {paginatedOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-gray-500">
                      Orden #{order.id.slice(0, 8)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleOrderExpansion(order.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronDown
                    className={`w-6 h-6 transition-transform ${
                      expandedOrders.includes(order.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              <AnimatePresence>
                {expandedOrders.includes(order.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-medium mb-4">Entregas programadas</h4>
                        <div className="space-y-6">
                          {order.deliveries.map((delivery) => (
                            <div
                              key={delivery.id}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="font-medium">
                                    {formatDate(delivery.scheduled_date)}
                                  </p>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_COLORS[delivery.status]}`}>
                                    {STATUS_LABELS[delivery.status]}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {delivery.meals.map((meal) => (
                                  <div
                                    key={meal.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                                      meal.status === 'completed'
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-gray-200 bg-white'
                                    }`}
                                  >
                                    <img
                                      src={meal.image}
                                      alt={meal.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">{meal.name}</p>
                                      <p className="text-sm text-gray-600">{meal.description}</p>
                                    </div>
                                    {meal.status === 'completed' && (
                                      <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Completada
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {delivery.delivered_at && (
                                <p className="text-sm text-gray-600 mt-3">
                                  Entregado: {formatDate(delivery.delivered_at)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-4">Datos de entrega</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-medium">{order.delivery_address_data.recipient_name}</p>
                          <p className="text-gray-600">{order.delivery_address_data.phone}</p>
                          <p className="text-gray-600">{order.delivery_address_data.address}</p>
                          <p className="text-gray-600">
                            {order.delivery_address_data.municipality}, {order.delivery_address_data.province}
                          </p>
                        </div>

                        {order.personal_note && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Nota personal</h4>
                            <p className="text-gray-600 italic">"{order.personal_note}"</p>
                          </div>
                        )}

                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Detalles del paquete</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium">{order.package_data.name}</p>
                            <p className="text-gray-600">{order.package_data.meals} comidas</p>
                            <p className="text-gray-600">Total: ${order.total}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} de {filteredOrders.length} resultados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
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

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};