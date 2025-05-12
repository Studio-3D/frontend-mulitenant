'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { toast } from 'react-hot-toast';
import { useProjet } from '@/context/ProjetContext';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

const DecomptesForm = ({ decompte, onSave, onCancel }) => {
  const { selectedProjet } = useProjet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numeroUnique, setNumeroUnique] = useState(true);
  
  // Form validation schema
  const schema = yup.object().shape({
    numero: yup.string().required('Le numéro est requis'),
    montant: yup.string().required('Le montant est requis'),
    date: yup.string().required('La date est requise'),
  });
  
  // Initialize react-hook-form
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      numero: '',
      montant: '',
      date: '',
      projet_id: selectedProjet?.id || null
    }
  });
  
  // Set form values when decompte changes
  useEffect(() => {
    if (decompte) {
      setValue('numero', decompte.numero || '');
      setValue('montant', decompte.montant || '');
      setValue('date', decompte.date || '');
      setValue('projet_id', selectedProjet?.id || null);
    }
  }, [decompte, selectedProjet, setValue]);
  
  // Check if numero is unique
  const checkNumeroUniqueness = async (numero) => {
    if (!numero) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const id = decompte ? decompte.id : 0;
      const response = await axios.get(`${APIURL.ROOT}/v1/get_info_numero_decompte_unique/${id}/${numero}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const isUnique = response.data.info_count === 0;
      setNumeroUnique(isUnique);
    } catch (err) {
      console.error("Error checking numero uniqueness:", err);
    }
  };
  
  // Handle form submission
  const onSubmitForm = async (data) => {
    // Don't proceed if numero is not unique
    if (!numeroUnique) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Determine if we're adding or editing
      let url = `${APIURL.ROOT}/v1/decomptes`;
      let method = 'post';
      
      if (decompte) {
        url = `${url}/${decompte.id}`;
        method = 'put';
      }
      
      // Make API request
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        toast.success(`Décompte ${decompte ? 'modifié' : 'ajouté'} avec succès`);
        onSave();
      } else {
        toast.error("Une erreur est survenue lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">{decompte ? 'Modifier' : 'Ajouter'} un décompte</h2>
      
      {!numeroUnique && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
          Ce numéro appartient déjà à un autre décompte
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              {...register("date")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
          </div>
          
          <div>
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
              Numéro <span className="text-red-500">*</span>
            </label>
            <input
              id="numero"
              type="text"
              {...register("numero", {
                onChange: (e) => checkNumeroUniqueness(e.target.value)
              })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.numero || !numeroUnique ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.numero && <p className="mt-1 text-xs text-red-500">{errors.numero.message}</p>}
          </div>
          
          <div>
            <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-1">
              Montant <span className="text-red-500">*</span>
            </label>
            <input
              id="montant"
              type="number"
              step="any"
              {...register("montant")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.montant ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.montant && <p className="mt-1 text-xs text-red-500">{errors.montant.message}</p>}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !numeroUnique}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting || !numeroUnique ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DecomptesForm;
