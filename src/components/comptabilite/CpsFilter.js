'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

const CpsFilter = ({ onSubmit, initialValues = {} }) => {
  const [values, setValues] = useState({
    nature_travaux: '',
    cout: '',
    date_validation: '',
    ...initialValues
  });

  useEffect(() => {
    setValues({
      nature_travaux: '',
      cout: '',
      date_validation: '',
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
      nature_travaux: '',
      cout: '',
      date_validation: ''
    };
    setValues(emptyValues);
    onSubmit(emptyValues);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="nature_travaux" className="block text-sm font-medium !text-gray-700 mb-1">
            Nature des Travaux
          </label>
          <input
            id="nature_travaux"
            name="nature_travaux"
            type="text"
            value={values.nature_travaux}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="cout" className="block text-sm font-medium !text-gray-700 mb-1">
            Coût
          </label>
          <input
            id="cout"
            name="cout"
            type="text"
            value={values.cout}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="date_validation" className="block text-sm font-medium !text-gray-700 mb-1">
            Date de Validation
          </label>
          <input
            id="date_validation"
            name="date_validation"
            type="date"
            value={values.date_validation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium !text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
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

export default CpsFilter;
