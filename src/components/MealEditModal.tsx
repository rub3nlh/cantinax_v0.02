import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MealWithStats } from '../hooks/useMeals';
import { supabase } from '../lib/supabase';

interface MealEditModalProps {
  meal: MealWithStats;
  onClose: () => void;
  onSave: () => void;
}

export const MealEditModal: React.FC<MealEditModalProps> = ({ meal, onClose, onSave }) => {
  const [name, setName] = useState(meal.name);
  const [description, setDescription] = useState(meal.description);
  const [imageUrl, setImageUrl] = useState(meal.image);
  const [chefNote, setChefNote] = useState(meal.chefNote);
  const [ingredients, setIngredients] = useState<string[]>(meal.ingredients);
  const [allergens, setAllergens] = useState<string[]>(meal.allergens);
  const [active, setActive] = useState(meal.active);
  const [newIngredient, setNewIngredient] = useState('');
  const [newAllergen, setNewAllergen] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddAllergen = () => {
    if (newAllergen.trim()) {
      setAllergens([...allergens, newAllergen.trim()]);
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (index: number) => {
    setAllergens(allergens.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // Basic validation
      if (!name.trim()) throw new Error('El nombre es requerido');
      if (!description.trim()) throw new Error('La descripción es requerida');
      if (!imageUrl.trim()) throw new Error('La URL de la imagen es requerida');
      if (ingredients.length === 0) throw new Error('Debe haber al menos un ingrediente');

      // Update meal in Supabase
      const { error: updateError } = await supabase
        .from('meals')
        .update({
          name: name.trim(),
          description: description.trim(),
          image_url: imageUrl.trim(),
          ingredients,
          allergens,
          chef_note: chefNote.trim() || null,
          active
        })
        .eq('id', meal.id);

      if (updateError) throw updateError;

      onSave();
      onClose();
    } catch (err) {
      console.error('Error updating meal:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la comida');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key in ingredient/allergen inputs
  const handleKeyPress = (
    e: React.KeyboardEvent,
    type: 'ingredient' | 'allergen'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'ingredient') {
        handleAddIngredient();
      } else {
        handleAddAllergen();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Editar Comida</h2>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                active
                  ? 'border-green-500 text-green-700 bg-green-50'
                  : 'border-red-500 text-red-700 bg-red-50'
              }`}
            >
              {active ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  Activo
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  Inactivo
                </>
              )}
            </button>
            <p className="mt-1 text-sm text-gray-500">
              {active
                ? 'Esta comida está disponible para ser ordenada'
                : 'Esta comida no está disponible para ser ordenada'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la imagen
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota del Chef
            </label>
            <textarea
              value={chefNote}
              onChange={(e) => setChefNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredientes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'ingredient')}
                placeholder="Nuevo ingrediente"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <span>{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alérgenos
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'allergen')}
                placeholder="Nuevo alérgeno"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddAllergen}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergens.map((allergen, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full"
                >
                  <span>{allergen}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergen(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border-2 border-gray-200 hover:border-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};