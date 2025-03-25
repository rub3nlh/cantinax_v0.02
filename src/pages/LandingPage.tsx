import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Heart, Leaf, Truck, Clock, ShieldCheck, Instagram, MessageCircle, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { packages } from '../data/packages';
import { MealDetails } from '../components/MealDetails';
import { FAQ } from '../components/FAQ';
import { Meal } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeals } from '../hooks/useMeals';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAllMeals, setShowAllMeals] = useState(false);
  const [selectedMealDetails, setSelectedMealDetails] = useState<Meal | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const { meals, loading, error } = useMeals();

  const handlePackageSelection = () => {
    navigate('/packages');
  };

  const handleSelectPackage = (packageId: string) => {
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
      navigate('/meal-selection', { state: { package: selectedPackage } });
    }
  };

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayedMeals = showAllMeals ? meals : meals.slice(0, 4);

  return (
    <div className="font-sans">
      <section className="relative min-h-screen bg-[#FDF6F0]">
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
            <div className="text-left space-y-8">
              <div className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                ¡20% de descuento en tu primer pedido!
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Garantiza comidas caseras y saludables para tu familia en Cuba
              </h1>
              <p className="text-xl text-gray-600">
                Tu madre merece comer bien, sin que tú te preocupes. Nosotros preparamos y entregamos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handlePackageSelection}
                  className="bg-red-500 hover:bg-red-600 text-white text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
                >
                  Elige tu paquete ahora
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={scrollToMenu}
                  className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  Ver menú semanal
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">3h</div>
                  <div className="text-sm text-gray-600">Tendrás tu primera entrega</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">Fresco y casero</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600">Calificación</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#FDF6F0] to-transparent lg:hidden z-10" />
              <div className="grid grid-cols-2 gap-4 transform translate-y-[-2rem]">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform translate-y-8">
                    <img
                      src="https://images.unsplash.com/photo-1624300629298-e9de39c13be5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                      alt="Bistec con arroz moro"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold">Bistec con Moro</h3>
                      <p className="text-sm text-gray-600">Lunes</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                      alt="Ropa vieja"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold">Ropa Vieja</h3>
                      <p className="text-sm text-gray-600">Martes</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 transform translate-y-16">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                      alt="Pollo asado"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold">Pollo Asado</h3>
                      <p className="text-sm text-gray-600">Miércoles</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                      alt="Pescado a la plancha"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold">Pescado Plancha</h3>
                      <p className="text-sm text-gray-600">Jueves</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <ChefHat className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comidas diarias variadas</h3>
              <p className="text-gray-600">Menús tradicionales cubanos preparados por expertos</p>
            </div>
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <Heart className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chefs expertos</h3>
              <p className="text-gray-600">Cocineros con años de experiencia en comida cubana</p>
            </div>
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <Leaf className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ingredientes frescos</h3>
              <p className="text-gray-600">Seleccionamos los mejores ingredientes locales</p>
            </div>
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <Truck className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Entregas cada 48 horas</h3>
              <p className="text-gray-600">Puntualidad garantizada en cada entrega</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Selecciona el paquete</h3>
              <p className="text-gray-600">Elige entre nuestros planes de 3, 5 o 7 días</p>
            </div>
            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Personaliza el menú</h3>
              <p className="text-gray-600">Adapta las comidas a los gustos de tu familia</p>
            </div>
            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Programa la entrega</h3>
              <p className="text-gray-600">Escoge los días y horarios que prefieras</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-lg text-red-500 font-medium">
              Todas las entregas incluidas en el precio
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Nuestros Paquetes</h2>
          <p className="text-center text-xl text-red-500 font-semibold mb-16">
            ¡Primer pedido con 20% OFF usando CUBANCARE20!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg bg-white border border-gray-200">
              <h3 className="text-2xl font-bold mb-2">3 días</h3>
              <p className="text-4xl font-bold mb-4">$29,99</p>
              <p className="mb-4">3 comidas</p>
              <button 
                onClick={() => handleSelectPackage('basic')}
                className="w-full py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Seleccionar
              </button>
            </div>
            <div className="p-8 rounded-lg bg-red-500 text-white">
              <h3 className="text-2xl font-bold mb-2">5 días</h3>
              <p className="text-4xl font-bold mb-4">$44,99</p>
              <p className="mb-4">5 comidas</p>
              <button 
                onClick={() => handleSelectPackage('family')}
                className="w-full py-2 rounded bg-white text-red-500 hover:bg-red-50 transition-colors"
              >
                Seleccionar
              </button>
              <div className="mt-2 text-sm">Más popular</div>
            </div>
            <div className="p-8 rounded-lg bg-white border border-gray-200">
              <h3 className="text-2xl font-bold mb-2">7 días</h3>
              <p className="text-4xl font-bold mb-4">$59,99</p>
              <p className="mb-4">7 comidas</p>
              <button 
                onClick={() => handleSelectPackage('premium')}
                className="w-full py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Seleccionar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section ref={menuRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Mira nuestro menú</h2>
          
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayedMeals.map((meal) => (
                  <div key={meal.id} className="bg-white rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105">
                    <div className="relative">
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-48 object-cover"
                      />
                      {meal.allergens.length > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                          Alérgenos
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{meal.name}</h3>
                      <p className="text-gray-600 mb-4">{meal.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {meal.ingredients.slice(0, 3).map((ingredient, index) => (
                          <span key={index} className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                            {ingredient}
                          </span>
                        ))}
                        {meal.ingredients.length > 3 && (
                          <span className="text-gray-500 text-sm">+{meal.ingredients.length - 3} más</span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedMealDetails(meal)}
                        className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Info className="w-4 h-4" />
                        Ver detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {meals.length > 4 && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setShowAllMeals(!showAllMeals)}
                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors"
                  >
                    {showAllMeals ? 'Mostrar menos' : 'Mostrar más'}
                    <ChevronDown className={`w-5 h-5 transition-transform ${showAllMeals ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <Leaf className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Fresco</h3>
              <p className="text-gray-600">Ingredientes frescos y de primera calidad</p>
            </div>
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <Clock className="w-16 h-16 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Entregas puntuales</h3>
              <p className="text-gray-600">Garantizamos la entrega en el horario acordado</p>
            </div>
            <div className="text-center p-6">
              <div className="mb-4 flex justify-center">
                <ShieldCheck className="w-16 h-16 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguridad alimentaria</h3>
              <p className="text-gray-600">Máximos estándares de higiene y seguridad</p>
            </div>
          </div>
        </div>
      </section>

      <FAQ />

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

      <AnimatePresence>
        {selectedMealDetails && (
          <MealDetails
            meal={selectedMealDetails}
            onClose={() => setSelectedMealDetails(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};