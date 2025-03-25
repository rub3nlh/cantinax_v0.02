import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Package, Truck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminCounts } from '../../hooks/useAdminCounts';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { pendingOrders, pendingDeliveries, loading, error } = useAdminCounts();

  const adminSections = [
    {
      title: 'Gestión de Menús',
      description: 'Administra las comidas disponibles, precios y detalles',
      icon: ChefHat,
      color: 'bg-green-500',
      path: '/admin/meals'
    },
    {
      title: 'Gestión de Órdenes',
      description: 'Visualiza y gestiona los pedidos de los clientes',
      icon: Package,
      color: 'bg-blue-500',
      path: '/admin/orders',
      count: pendingOrders,
      countLabel: 'órdenes pendientes'
    },
    {
      title: 'Gestión de Entregas',
      description: 'Coordina y monitorea las entregas a domicilio',
      icon: Truck,
      color: 'bg-purple-500',
      path: '/admin/deliveries',
      count: pendingDeliveries,
      countLabel: 'entregas pendientes'
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminSections.map((section, index) => (
          <motion.div
            key={section.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => navigate(section.path)}
          >
            <div className={`${section.color} p-4 flex items-center justify-center relative`}>
              <section.icon className="w-8 h-8 text-white" />
              {section.count !== undefined && section.count > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {section.count}
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                {loading && section.count !== undefined && (
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
                )}
              </div>
              <p className="text-gray-600 mb-2">{section.description}</p>
              {section.count !== undefined && section.count > 0 && (
                <p className="text-sm font-medium text-red-500">
                  {section.count} {section.countLabel}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};