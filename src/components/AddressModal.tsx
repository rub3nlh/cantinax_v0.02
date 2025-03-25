import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { DeliveryAddress } from '../types';
import { provinces, Province } from '../data/provinces';
import { useAuth } from '../hooks/useAuth';

interface AddressModalProps {
  onClose: () => void;
  onSave: (address: DeliveryAddress) => void;
}

const COUNTRY_CODES = [
  { code: '+34', country: 'España' },
  { code: '+53', country: 'Cuba' },
  { code: '+1', country: 'Estados Unidos' },
  { code: '+49', country: 'Alemania' },
  { code: '+54', country: 'Argentina' },
  { code: '+61', country: 'Australia' },
  { code: '+32', country: 'Bélgica' },
  { code: '+55', country: 'Brasil' },
  { code: '+1', country: 'Canadá' },
  { code: '+56', country: 'Chile' },
  { code: '+86', country: 'China' },
  { code: '+57', country: 'Colombia' },
  { code: '+82', country: 'Corea del Sur' },
  { code: '+45', country: 'Dinamarca' },
  { code: '+593', country: 'Ecuador' },
  { code: '+20', country: 'Egipto' },
  { code: '+33', country: 'Francia' },
  { code: '+30', country: 'Grecia' },
  { code: '+31', country: 'Holanda' },
  { code: '+36', country: 'Hungría' },
  { code: '+91', country: 'India' },
  { code: '+62', country: 'Indonesia' },
  { code: '+353', country: 'Irlanda' },
  { code: '+39', country: 'Italia' },
  { code: '+81', country: 'Japón' },
  { code: '+52', country: 'México' },
  { code: '+47', country: 'Noruega' },
  { code: '+64', country: 'Nueva Zelanda' },
  { code: '+507', country: 'Panamá' },
  { code: '+595', country: 'Paraguay' },
  { code: '+51', country: 'Perú' },
  { code: '+48', country: 'Polonia' },
  { code: '+351', country: 'Portugal' },
  { code: '+44', country: 'Reino Unido' },
  { code: '+7', country: 'Rusia' },
  { code: '+46', country: 'Suecia' },
  { code: '+41', country: 'Suiza' },
  { code: '+886', country: 'Taiwán' },
  { code: '+598', country: 'Uruguay' },
  { code: '+58', country: 'Venezuela' }
].sort((a, b) => a.country.localeCompare(b.country));

export const AddressModal: React.FC<AddressModalProps> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [recipientName, setRecipientName] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load user info from localStorage if available and not logged in
  useEffect(() => {
    if (!user) {
      const userInfo = localStorage.getItem('comida_zunzun_user_info');
      if (userInfo) {
        const { name } = JSON.parse(userInfo);
        setRecipientName(name);
      }
    }
  }, [user]);

  const validatePhoneNumber = (value: string) => {
    // Only allow numbers
    return value.replace(/[^\d]/g, '');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validatedNumber = validatePhoneNumber(e.target.value);
    setPhoneNumber(validatedNumber);
  };

  const filteredCountries = COUNTRY_CODES.filter(country =>
    country.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvince || !selectedMunicipality) return;

    const newAddress: DeliveryAddress = {
      id: crypto.randomUUID(), // Use UUID for consistency with Supabase
      recipientName,
      phone: `${selectedCountryCode.code}${phoneNumber}`,
      address,
      province: selectedProvince.name,
      municipality: selectedMunicipality
    };

    try {
      await onSave(newAddress);
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      // Handle error (show message to user)
    }
  };

  useEffect(() => {
    setSelectedMunicipality('');
  }, [selectedProvince]);

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

        <h2 className="text-2xl font-bold mb-6">Nueva dirección de entrega</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del familiar
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryList(!showCountryList)}
                  className="h-full px-3 py-2 rounded-lg border border-gray-300 flex items-center gap-2 hover:bg-gray-50"
                >
                  <span>{selectedCountryCode.code}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showCountryList && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <div className="px-3 py-2 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Buscar país..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-4 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <button
                          key={`${country.code}-${country.country}`}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => {
                            setSelectedCountryCode(country);
                            setShowCountryList(false);
                            setSearchQuery('');
                          }}
                        >
                          <span>{country.country}</span>
                          <span className="text-gray-500">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                required
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Número de teléfono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia
            </label>
            <select
              value={selectedProvince?.id || ''}
              onChange={(e) => setSelectedProvince(provinces.find(p => p.id === e.target.value) || null)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Selecciona una provincia</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Municipio
            </label>
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              required
              disabled={!selectedProvince}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Selecciona un municipio</option>
              {selectedProvince?.municipalities.map((municipality) => (
                <option key={municipality} value={municipality}>
                  {municipality}
                </option>
              ))}
            </select>
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
              className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium"
            >
              Guardar dirección
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};