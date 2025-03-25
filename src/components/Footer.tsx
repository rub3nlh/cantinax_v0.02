import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4">Contáctanos</h3>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700"
              />
              <textarea
                placeholder="Tu mensaje"
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700"
                rows={4}
              />
              <button className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded">
                Enviar mensaje
              </button>
            </form>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-red-500">
                <Instagram className="w-8 h-8" />
              </a>
              <a href="#" className="hover:text-red-500">
                <MessageCircle className="w-8 h-8" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};