import React from 'react';
import { Meal } from '../types';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface MealDetailsProps {
  meal: Meal;
  onClose: () => void;
}

export const MealDetails: React.FC<MealDetailsProps> = ({ meal, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
        
        <img
          src={meal.image}
          alt={meal.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        
        <h3 className="text-2xl font-bold mb-4">{meal.name}</h3>
        
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Ingredientes:</h4>
          <div className="flex flex-wrap gap-2">
            {meal.ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
        
        {meal.allergens.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Alérgenos:</h4>
            <div className="flex flex-wrap gap-2">
              {meal.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="font-semibold mb-2">Nota del Chef:</h4>
          <p className="text-gray-600 italic">{meal.chefNote}</p>
        </div>
      </motion.div>
    </div>
  );
};