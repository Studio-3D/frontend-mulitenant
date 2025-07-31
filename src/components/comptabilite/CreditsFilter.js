'use client';

import { useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import Input from '../Input';
import DateRangePicker from '../DateRangePicker';

const CreditsFilter = ({ onSubmit, initialValues = {} }) => {
  const [values, setValues] = useState({
    num_contrat: '',
    taux_interet: '',
    date: '',
    de: '',
    a: '',
    ...initialValues,
  });

  useEffect(() => {
    setValues({
      num_contrat: '',
      taux_interet: '',
      date: '',
      de: '',
      a: '',
      ...initialValues,
    });
  }, [initialValues]);

  // Single optimized handler for all filter changes
  const handleChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      a: '',
    };
    setValues(emptyValues);
    onSubmit(emptyValues);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow-sm border"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <Input
          name="num_contrat"
          type="text"
          label="N° Contrat"
          value={values.num_contrat}
          onChange={(e) => handleChange('num_contrat', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        <Input
          name="taux_interet"
          type="text"
          label="Taux Intérêt"
          value={values.taux_interet}
          onChange={(e) => handleChange('taux_interet', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        <Input
          name="date"
          type="date"
          label="Date"
          value={values.date}
          onChange={(e) => handleChange('date', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DateRangePicker
          startName="de"
          endName="a"
          placeholder="Choisir une Période"
          startValue={values.de}
          endValue={values.a}
          onChange={handleChange}
          label="Choisir une Période"
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

export default CreditsFilter;
