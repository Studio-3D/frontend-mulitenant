'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

const TvaFilter = ({ onSubmit, initialValues = {} }) => {
  const [values, setValues] = useState({
    nom: '',
    coefficient: '',
    qp_bati: '',
    ...initialValues
  });

  useEffect(() => {
    setValues({
      nom: '',
      coefficient: '',
      qp_bati: '',
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
      coefficient: '',
      qp_bati: ''
    };
    setValues(emptyValues);
    onSubmit(emptyValues);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
            Tranche
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
          <label htmlFor="coefficient" className="block text-sm font-medium text-gray-700 mb-1">
            Coefficient
          </label>
          <input
            id="coefficient"
            name="coefficient"
            type="text"
            value={values.coefficient}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="qp_bati" className="block text-sm font-medium text-gray-700 mb-1">
            QP Terrain Bati
          </label>
          <input
            id="qp_bati"
            name="qp_bati"
            type="text"
            value={values.qp_bati}
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

export default TvaFilter;
