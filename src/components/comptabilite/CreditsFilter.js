'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

const CreditsFilter = ({ onSubmit, initialValues = {} }) => {
  const [values, setValues] = useState({
    num_contrat: '',
    taux_interet: '',
    date: '',
    de: '',
    a: '',
    ...initialValues
  });

  useEffect(() => {
    setValues({
      num_contrat: '',
      taux_interet: '',
      date: '',
      de: '',
      a: '',
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
      num_contrat: '',
      taux_interet: '',
      date: '',
      de: '',
      a: ''
    };
    setValues(emptyValues);
    onSubmit(emptyValues);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="num_contrat" className="block text-sm font-medium text-gray-700 mb-1">
            N° Contrat
          </label>
          <input
            id="num_contrat"
            name="num_contrat"
            type="text"
            value={values.num_contrat}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="taux_interet" className="block text-sm font-medium text-gray-700 mb-1">
            Taux Intérêt
          </label>
          <input
            id="taux_interet"
            name="taux_interet"
            type="text"
            value={values.taux_interet}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={values.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="de" className="block text-sm font-medium text-gray-700 mb-1">
            Période - De
          </label>
          <input
            id="de"
            name="de"
            type="date"
            value={values.de}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="a" className="block text-sm font-medium text-gray-700 mb-1">
            Période - À
          </label>
          <input
            id="a"
            name="a"
            type="date"
            value={values.a}
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

export default CreditsFilter;
