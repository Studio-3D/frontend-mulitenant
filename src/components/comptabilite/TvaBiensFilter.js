'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import Input from '../Input';

const TvaBiensFilter = ({ onSubmit, initialValues = {} }) => {
  const [values, setValues] = useState({
    nom: '',
    superficie: '',
    code_reservation: '',
    prix_ttc: '',
    tva: '',
    ...initialValues,
  });

  useEffect(() => {
    setValues({
      nom: '',
      superficie: '',
      code_reservation: '',
      prix_ttc: '',
      tva: '',
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
      nom: '',
      superficie: '',
      code_reservation: '',
      prix_ttc: '',
      tva: '',
    };
    setValues(emptyValues);
    onSubmit(emptyValues);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow-sm border"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          name="nom"
          type="text"
          label="Propriété Dite Bien"
          value={values.nom}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />
        <Input
          name="code_reservation"
          type="text"
          label="Code Réservation"
          value={values.code_reservation}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        <Input
          name="Superficie"
          type="number"
          label="Superficie"
          value={values.superficie}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />
        <Input
          name="prix_ttc"
          type="number"
          label="Prix TTC"
          value={values.prix_ttc}
          onChange={handleChange}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        <Input
          name="tva"
          type="number"
          label="TVA"
          value={values.tva}
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

export default TvaBiensFilter;
