import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat, Package, Truck } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: ChefHat,
      exact: true
    },
    {
      name: 'Comidas',
      href: '/admin/meals',
      icon: ChefHat,
    },
    {
      name: 'Órdenes',
      href: '/admin/orders',
      icon: Package,
    },
    {
      name: 'Entregas',
      href: '/admin/deliveries',
      icon: Truck,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8 py-4">
            {navigation.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-500'
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};