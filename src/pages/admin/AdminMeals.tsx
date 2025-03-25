import React, { useState } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, Search, ArrowUp, ArrowDown, Eye, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { useMeals, MealWithStats } from '../../hooks/useMeals';
import { motion, AnimatePresence } from 'framer-motion';
import { MealDetails } from '../../components/MealDetails';
import { MealEditModal } from '../../components/MealEditModal';
import { MealCreateModal } from '../../components/MealCreateModal';
import { supabase } from '../../lib/supabase';

type SortField = 'name' | 'timesOrdered';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export const AdminMeals: React.FC = () => {
  const { meals, loading, error, refetch } = useMeals(true); // Show all meals, including inactive
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('timesOrdered');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<MealWithStats | null>(null);
  const [previewMeal, setPreviewMeal] = useState<MealWithStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const sortMeals = (a: MealWithStats, b: MealWithStats) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'name') {
      return direction * a.name.localeCompare(b.name);
    } else {
      return direction * (a.timesOrdered - b.timesOrdered);
    }
  };

  const filteredMeals = meals
    .filter(meal =>
      meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(sortMeals);

  const totalPages = Math.ceil(filteredMeals.length / ITEMS_PER_PAGE);
  const paginatedMeals = filteredMeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSave = () => {
    refetch();
  };

  const toggleMealStatus = async (meal: MealWithStats) => {
    try {
      setUpdatingStatus(meal.id);
      
      const { error: updateError } = await supabase
        .from('meals')
        .update({ active: !meal.active })
        .eq('id', meal.id);

      if (updateError) throw updateError;

      // Refetch meals to update the UI
      refetch();
    } catch (err) {
      console.error('Error toggling meal status:', err);
      // You could add a toast notification here
    } finally {
      setUpdatingStatus(null);
    }
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
        <h1 className="text-2xl font-bold">Gestión de Comidas</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Comida
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar comidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Nombre
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('timesOrdered')}>
                  <div className="flex items-center gap-2">
                    Veces Pedida
                    {sortField === 'timesOrdered' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedMeals.map((meal) => (
                <motion.tr
                  key={meal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleMealStatus(meal)}
                      disabled={updatingStatus === meal.id}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                        meal.active
                          ? 'border-green-500 text-green-700 bg-green-50'
                          : 'border-red-500 text-red-700 bg-red-50'
                      }`}
                    >
                      {updatingStatus === meal.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : meal.active ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {meal.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{meal.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {meal.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{meal.description}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {meal.ingredients.slice(0, 3).map((ingredient, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {meal.ingredients.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{meal.ingredients.length - 3} más
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{meal.timesOrdered}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setPreviewMeal(meal)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Ver vista previa"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setSelectedMeal(meal)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredMeals.length)} de {filteredMeals.length} resultados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 hover:text-red-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewMeal && (
          <MealDetails
            meal={previewMeal}
            onClose={() => setPreviewMeal(null)}
          />
        )}
        {selectedMeal && (
          <MealEditModal
            meal={selectedMeal}
            onClose={() => setSelectedMeal(null)}
            onSave={handleSave}
          />
        )}
        {showCreateModal && (
          <MealCreateModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};