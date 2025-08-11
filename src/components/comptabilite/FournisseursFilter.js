'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import Input from '../Input';

const FournisseursFilter = ({ onSubmit, initialValues = {} }) => {
  const [values, setValues] = useState({
    ice: '',
    nom: '',
    code: '',
    rc: '',
    ...initialValues,
  });

  useEffect(() => {
    setValues({
      ice: '',
      nom: '',
      code: '',
      rc: '',
      ...initialValues,
    });
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  const handleClear = () => {
    const emptyValues = {
      ice: '',
      nom: '',
      code: '',
      rc: '',
    };
    setValues(emptyValues);
    onSubmit(emptyValues);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow-sm border"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          name="ice"
          type="number"
          label=" ICE"
          value={values.ice}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />
        <Input
          name="nom"
          type="text"
          label="Nom"
          value={values.nom}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        <Input
          name="code"
          type="text"
          label="Code"
          value={values.code}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        <Input
          name="rc"
          type="text"
          label="RC"
          value={values.rc}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Appliquer les filtres
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
        >
          Réinitialiser
        </button>
      </div>
    </form>
  );
};

export default FournisseursFilter;
