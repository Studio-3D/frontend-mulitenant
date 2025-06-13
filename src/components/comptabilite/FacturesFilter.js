'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

const FacturesFilter = ({ onSubmit, initialValues = {} }) => {
  const [values, setValues] = useState({
    code_fourn: '',
    nom_fourn: '',
    num_facture: '',
    num_decompte: '',
    montant: '',
    date: '',
    ...initialValues
  });

  useEffect(() => {
    setValues({
      code_fourn: '',
      nom_fourn: '',
      num_facture: '',
      num_decompte: '',
      montant: '',
      date: '',
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
      code_fourn: '',
      nom_fourn: '',
      num_facture: '',
      num_decompte: '',
      montant: '',
      date: ''
    };
    setValues(emptyValues);
    onSubmit(emptyValues);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="code_fourn" className="block text-sm font-medium !text-gray-700 mb-1">
            Code Fournisseur
          </label>
          <input
            id="code_fourn"
            name="code_fourn"
            type="text"
            value={values.code_fourn}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="nom_fourn" className="block text-sm font-medium !text-gray-700 mb-1">
            Nom Fournisseur
          </label>
          <input
            id="nom_fourn"
            name="nom_fourn"
            type="text"
            value={values.nom_fourn}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="num_facture" className="block text-sm font-medium !text-gray-700 mb-1">
            N° Facture
          </label>
          <input
            id="num_facture"
            name="num_facture"
            type="text"
            value={values.num_facture}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="num_decompte" className="block text-sm font-medium !text-gray-700 mb-1">
            N° Décompte
          </label>
          <input
            id="num_decompte"
            name="num_decompte"
            type="text"
            value={values.num_decompte}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="montant" className="block text-sm font-medium !text-gray-700 mb-1">
            Montant
          </label>
          <input
            id="montant"
            name="montant"
            type="text"
            value={values.montant}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium !text-gray-700 mb-1">
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

export default FacturesFilter;
