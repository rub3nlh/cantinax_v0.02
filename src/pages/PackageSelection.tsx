import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../components/Stepper';
import { PackageCard } from '../components/PackageCard';
import { Footer } from '../components/Footer';
import { packages } from '../data/packages';
import { Package } from '../types';
import { motion } from 'framer-motion';

export const PackageSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  const handleNext = () => {
    if (selectedPackage) {
      navigate('/meal-selection', { state: { package: selectedPackage } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pb-20">
        <Stepper
          steps={['Selección', 'Personalización', 'Resumen']}
          currentStep={0}
        />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">
              ¿Cuántas comidas quieres regalar?
            </h1>
            <p className="text-xl text-gray-600">
              Elige el paquete que mejor se adapte a las necesidades de tu familia
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                selected={selectedPackage?.id === pkg.id}
                onSelect={handlePackageSelect}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={!selectedPackage}
              className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all ${
                selectedPackage
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};