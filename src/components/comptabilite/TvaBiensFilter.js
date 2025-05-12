'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

const TvaBiensFilter = ({ onSubmit, initialValues = {} }) => {
  const [values, setValues] = useState({
    nom: '',
    superficie: '',
    code_reservation: '',
    prix_ttc: '',
    tva: '',
    ...initialValues
  });

  useEffect(() => {
    setValues({
      nom: '',
      superficie: '',
      code_reservation: '',
      prix_ttc: '',
      tva: '',
      ...initialValues
    });
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  const handleClear = () => {
    const emptyValues = {
      nom: '',
      superficie: '',
      code_reservation: '',
      prix_ttc: '',
      tva: ''
    };
    setValues(emptyValues);
    onSubmit(emptyValues);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
            Propriété Dite Bien
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            value={values.nom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="code_reservation" className="block text-sm font-medium text-gray-700 mb-1">
            Code Réservation
          </label>
          <input
            id="code_reservation"
            name="code_reservation"
            type="text"
            value={values.code_reservation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="superficie" className="block text-sm font-medium text-gray-700 mb-1">
            Superficie
          </label>
          <input
            id="superficie"
            name="superficie"
            type="text"
            value={values.superficie}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="prix_ttc" className="block text-sm font-medium text-gray-700 mb-1">
            Prix TTC
          </label>
          <input
            id="prix_ttc"
            name="prix_ttc"
            type="text"
            value={values.prix_ttc}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="tva" className="block text-sm font-medium text-gray-700 mb-1">
            TVA
          </label>
          <input
            id="tva"
            name="tva"
            type="text"
            value={values.tva}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
        >
          <XCircle className="mr-2" size={18} />
          Vider
        </button>
        
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#009FFF] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Appliquer
        </button>
      </div>
    </form>
  );
};

export default TvaBiensFilter;
