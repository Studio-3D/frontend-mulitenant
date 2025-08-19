'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { toast } from 'react-hot-toast';
import { useProjet } from '@/context/ProjetContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const CpsForm = ({ cps, onSave, onCancel }) => {
  const { selectedProjet } = useProjet();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form validation schema
  const schema = yup.object().shape({
    nature_travaux: yup.string().required('La nature des travaux est requise'),
    cout: yup
      .number()
      .required('Le coût est requis')
      .typeError('Le coût doit être un nombre'),
    date_validation: yup.string().required('La date de validation est requise'),
  });

  // Initialize react-hook-form
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nature_travaux: '',
      cout: '',
      date_validation: '',
      projet_id: selectedProjet?.id || null,
    },
  });

  // Set form values when cps changes
  useEffect(() => {
    if (cps) {
      setValue('nature_travaux', cps.nature_travaux || '');
      setValue('cout', cps.cout || '');
      setValue('date_validation', cps.date_validation?.split('T')[0] || '');
      setValue('projet_id', selectedProjet?.id || null);
    } else {
      reset({
        nature_travaux: '',
        cout: '',
        date_validation: '',
        projet_id: selectedProjet?.id || null,
      });
    }
  }, [cps, selectedProjet, setValue, reset]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onSubmitForm = async (data) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Add file if it exists
      if (file) {
        formData.append('piece_jointe', file);
      }

      // Determine if we're adding or editing
      let url = APIURL.CPS;
      let method = 'post';

      if (cps) {
        url = `${url}/${cps.id}`;
        formData.append('_method', 'PATCH');
      }

      // Make API request
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success(`CPS ${cps ? 'modifié' : 'ajouté'} avec succès`);
        onSave();
      } else {
        toast.error("Une erreur est survenue lors de l'enregistrement");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">
        {cps ? 'Modifier' : 'Ajouter'} un CPS
      </h2>

      <form onSubmit={handleSubmit(onSubmitForm)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="md:col-span-2">
            <label
              htmlFor="nature_travaux"
              className="block text-sm font-medium !text-gray-700 mb-1"
            >
              Nature des Travaux <span className="text-red-500">*</span>
            </label>
            <input
              id="nature_travaux"
              type="text"
              {...register('nature_travaux')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.nature_travaux ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nature_travaux && (
              <p className="mt-1 text-xs !text-red-500">
                {errors.nature_travaux.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="date_validation"
              className="block text-sm font-medium !text-gray-700 mb-1"
            >
              Date de Validation <span className="text-red-500">*</span>
            </label>
            <input
              id="date_validation"
              type="date"
              {...register('date_validation')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.date_validation ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date_validation && (
              <p className="mt-1 text-xs !text-red-500">
                {errors.date_validation.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="cout"
              className="block text-sm font-medium !text-gray-700 mb-1"
            >
              Coût Marché <span className="text-red-500">*</span>
            </label>
            <input
              id="cout"
              type="number"
              step="0.01"
              {...register('cout')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.cout ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cout && (
              <p className="mt-1 text-xs !text-red-500">
                {errors.cout.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="piece_jointe"
              className="block text-sm font-medium !text-gray-700 mb-1"
            >
              Pièce Jointe{' '}
              {!cps?.piece_jointe && <span className="text-red-500">*</span>}
            </label>
            <input
              required={
                !cps?.piece_jointe || watch('piece_jointe') == '' ? true : false
              }
              id="piece_jointe"
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {cps && cps.piece_jointe && (
              <p className="mt-1 text-xs !text-blue-600">
                Fichier actuel: {cps.piece_jointe}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium !text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CpsForm;
