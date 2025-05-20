'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { toast } from 'react-hot-toast';
import { useProjet } from '@/context/ProjetContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AlertTriangle } from 'lucide-react';

const CreditsForm = ({ credit, onSave, onCancel }) => {
  const { selectedProjet } = useProjet();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [banques, setBanques] = useState([]);
  const [numeroUnique, setNumeroUnique] = useState(true);

  // Form validation schema
  const schema = yup.object().shape({
    banque_id: yup.string().required('La banque est requise'),
    num_contrat: yup.string().required('Le numéro de contrat est requis'),
    date: yup.string().required('La date est requise'),
    montant_capital: yup.number().required('Le montant capital est requis').typeError('Le montant capital doit être un nombre'),
    frais_dossier: yup.number().required('Les frais de dossier sont requis').typeError('Les frais de dossier doivent être un nombre'),
    de: yup.string().required('La date de début est requise'),
    a: yup.string().required('La date de fin est requise'),
    nb_mois: yup.number().required('Le nombre de mois est requis').typeError('Le nombre de mois doit être un nombre'),
    taux_interet: yup.number().required('Le taux d\'intérêt est requis').typeError('Le taux d\'intérêt doit être un nombre'),
    montant_interet: yup.number().required('Le montant d\'intérêt est requis').typeError('Le montant d\'intérêt doit être un nombre'),
  });

  // Initialize react-hook-form
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      banque_id: '',
      num_contrat: '',
      date: '',
      piece_jointe: '',
      montant_capital: '',
      frais_dossier: '',
      de: '',
      a: '',
      nb_mois: '',
      taux_interet: '',
      montant_interet: '',
      projet_id: selectedProjet?.id || null
    }
  });

  // Set form values when credit changes
  useEffect(() => {
    if (credit) {
      setValue('banque_id', credit.banque_id || '');
      setValue('num_contrat', credit.num_contrat || '');
      setValue('date', credit.date?.split('T')[0] || '');
      setValue('piece_jointe', credit.piece_jointe || '');
      setValue('montant_capital', credit.montant_capital || '');
      setValue('frais_dossier', credit.frais_dossier || '');
      setValue('de', credit.de?.split('T')[0] || '');
      setValue('a', credit.a?.split('T')[0] || '');
      setValue('nb_mois', credit.nb_mois || '');
      setValue('taux_interet', credit.taux_interet || '');
      setValue('montant_interet', credit.montant_interet || '');
      setValue('projet_id', selectedProjet?.id || null);
    }
  }, [credit, setValue, selectedProjet]);

  // Fetch banques
  useEffect(() => {
    const fetchBanques = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(APIURL.BANQUES, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBanques(response.data.banques || []);
      } catch (error) {
        console.error('Error fetching banques:', error);
        toast.error('Erreur lors du chargement des banques');
      }
    };

    fetchBanques();
  }, []);

  // Check if the contract number is unique
  const checkNumeroUnique = async (numero) => {
    if (!numero) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const id = credit ? credit.id : 0;
      const response = await axios.get(`${APIURL.ROOT}/v1/get_info_numero_credit_unique/${id}/${numero}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const isUnique = response.data.info_count === 0;
      setNumeroUnique(isUnique);
    } catch (err) {
      console.error("Error checking numero uniqueness:", err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onSubmitForm = async (data) => {
    if (!numeroUnique) {
      toast.error('Le numéro de contrat existe déjà');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'piece_jointe') {
          formData.append(key, value);
        }
      });

      // Add file if it exists
      if (file) {
        formData.append('piece_jointe', file);
      }

      // Determine if we're adding or editing
      let url = APIURL.CREDITS;
      let method = 'post';

      if (credit) {
        url = `${url}/${credit.id}`;
        formData.append('_method', 'PATCH');
      }

      // Make API request
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        toast.success(`Crédit ${credit ? 'modifié' : 'ajouté'} avec succès`);
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
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">{credit ? 'Modifier' : 'Ajouter'} un crédit</h2>
      
      {!numeroUnique && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2">
          <AlertTriangle size={20} />
          <p>Le numéro que vous avez saisi appartient à un autre crédit</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Banque */}
          <div>
            <label htmlFor="banque_id" className="block text-sm font-medium text-gray-700 mb-1">
              Banque <span className="text-red-500">*</span>
            </label>
            <select
              id="banque_id"
              {...register('banque_id')}
              className={`w-full px-3 py-2 border rounded-md ${errors.banque_id ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Sélectionner une banque</option>
              {banques.map(banque => (
                <option key={banque.id} value={banque.id}>{banque.nom}</option>
              ))}
            </select>
            {errors.banque_id && <p className="mt-1 text-xs text-red-500">{errors.banque_id.message}</p>}
          </div>

          {/* N° Contrat */}
          <div>
            <label htmlFor="num_contrat" className="block text-sm font-medium text-gray-700 mb-1">
              N° Contrat <span className="text-red-500">*</span>
            </label>
            <input
              id="num_contrat"
              type="text"
              {...register('num_contrat', {
                onChange: (e) => checkNumeroUnique(e.target.value)
              })}
              className={`w-full px-3 py-2 border rounded-md ${errors.num_contrat || !numeroUnique ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.num_contrat && <p className="mt-1 text-xs text-red-500">{errors.num_contrat.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              {...register('date')}
              className={`w-full px-3 py-2 border rounded-md ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
          </div>

          {/* Pièce Jointe */}
          <div>
            <label htmlFor="piece_jointe" className="block text-sm font-medium text-gray-700 mb-1">
              Pièce Jointe
            </label>
            <input
              id="piece_jointe"
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {credit && credit.piece_jointe && (
              <p className="mt-1 text-xs text-blue-600">Fichier actuel: {credit.piece_jointe}</p>
            )}
          </div>

          {/* Montant Capital */}
          <div>
            <label htmlFor="montant_capital" className="block text-sm font-medium text-gray-700 mb-1">
              Montant Capital <span className="text-red-500">*</span>
            </label>
            <input
              id="montant_capital"
              type="number"
              step="0.01"
              {...register('montant_capital')}
              className={`w-full px-3 py-2 border rounded-md ${errors.montant_capital ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.montant_capital && <p className="mt-1 text-xs text-red-500">{errors.montant_capital.message}</p>}
          </div>

          {/* Frais Dossier */}
          <div>
            <label htmlFor="frais_dossier" className="block text-sm font-medium text-gray-700 mb-1">
              Frais Dossier <span className="text-red-500">*</span>
            </label>
            <input
              id="frais_dossier"
              type="number"
              step="0.01"
              {...register('frais_dossier')}
              className={`w-full px-3 py-2 border rounded-md ${errors.frais_dossier ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.frais_dossier && <p className="mt-1 text-xs text-red-500">{errors.frais_dossier.message}</p>}
          </div>

          {/* Période - De */}
          <div>
            <label htmlFor="de" className="block text-sm font-medium text-gray-700 mb-1">
              Période - De <span className="text-red-500">*</span>
            </label>
            <input
              id="de"
              type="date"
              {...register('de')}
              className={`w-full px-3 py-2 border rounded-md ${errors.de ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.de && <p className="mt-1 text-xs text-red-500">{errors.de.message}</p>}
          </div>

          {/* Période - A */}
          <div>
            <label htmlFor="a" className="block text-sm font-medium text-gray-700 mb-1">
              Période - À <span className="text-red-500">*</span>
            </label>
            <input
              id="a"
              type="date"
              {...register('a')}
              className={`w-full px-3 py-2 border rounded-md ${errors.a ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.a && <p className="mt-1 text-xs text-red-500">{errors.a.message}</p>}
          </div>

          {/* Nombre de Mois */}
          <div>
            <label htmlFor="nb_mois" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Mois <span className="text-red-500">*</span>
            </label>
            <input
              id="nb_mois"
              type="number"
              {...register('nb_mois')}
              className={`w-full px-3 py-2 border rounded-md ${errors.nb_mois ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.nb_mois && <p className="mt-1 text-xs text-red-500">{errors.nb_mois.message}</p>}
          </div>

          {/* Taux Intérêt */}
          <div>
            <label htmlFor="taux_interet" className="block text-sm font-medium text-gray-700 mb-1">
              Taux Intérêt <span className="text-red-500">*</span>
            </label>
            <input
              id="taux_interet"
              type="number"
              step="0.01"
              {...register('taux_interet')}
              className={`w-full px-3 py-2 border rounded-md ${errors.taux_interet ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.taux_interet && <p className="mt-1 text-xs text-red-500">{errors.taux_interet.message}</p>}
          </div>

          {/* Montant Intérêt */}
          <div>
            <label htmlFor="montant_interet" className="block text-sm font-medium text-gray-700 mb-1">
              Montant Intérêt <span className="text-red-500">*</span>
            </label>
            <input
              id="montant_interet"
              type="number"
              step="0.01"
              {...register('montant_interet')}
              className={`w-full px-3 py-2 border rounded-md ${errors.montant_interet ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.montant_interet && <p className="mt-1 text-xs text-red-500">{errors.montant_interet.message}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !numeroUnique}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              loading || !numeroUnique ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreditsForm;
