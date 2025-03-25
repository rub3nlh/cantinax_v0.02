import React, { useState } from 'react';
import { Meal } from '../types';
import { Info, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MealCardProps {
  meal: Meal;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
  onShowDetails: () => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  selected,
  onSelect,
  disabled,
  onShowDetails,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={meal.image}
          alt={meal.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{meal.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{meal.description}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={onShowDetails}
            className="text-gray-600 hover:text-red-500 flex items-center gap-1"
          >
            <Info className="w-4 h-4" />
            <span className="text-sm">Ver detalle</span>
          </button>
          <button
            onClick={onSelect}
            disabled={disabled && !selected}
            className={`p-2 rounded-full transition-colors ${
              selected
                ? 'bg-red-500 text-white'
                : disabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-red-100 text-red-500 hover:bg-red-500 hover:text-white'
            }`}
          >
            {selected ? (
              <Check className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};