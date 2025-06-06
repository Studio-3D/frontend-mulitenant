'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { toast } from 'react-hot-toast';
import { useProjet } from '@/context/ProjetContext';

const FournisseursForm = ({ fournisseur, onSave, onCancel }) => {
  const { selectedProjet } = useProjet();
  const [formData, setFormData] = useState({
    ice: '',
    code: '',
    nom: '',
    rc: '',
    adresse: '',
    projet_id: selectedProjet?.id || null
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [iceUnique, setIceUnique] = useState(true);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (fournisseur) {
      setFormData({
        ice: fournisseur.ice || '',
        code: fournisseur.code || '',
        nom: fournisseur.nom || '',
        rc: fournisseur.rc || '',
        adresse: fournisseur.adresse || '',
        projet_id: selectedProjet?.id || null
      });
    }
  }, [fournisseur, selectedProjet]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ice) newErrors.ice = "L'ICE est requis";
    if (!formData.code) newErrors.code = "Le code est requis";
    if (!formData.nom) newErrors.nom = "Le nom est requis";
    if (!formData.rc) newErrors.rc = "Le RC est requis";
    if (!iceUnique) newErrors.ice = "Cet ICE appartient déjà à un autre fournisseur";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkIceUniqueness = async (ice) => {
    if (!ice) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const id = fournisseur ? fournisseur.id : 0;
      const response = await axios.get(`${APIURL.ROOT}/v1/get_info_ice_unique/${id}/${ice}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const isUnique = response.data.info_count === 0;
      setIceUnique(isUnique);
      
      if (!isUnique) {
        setErrors(prev => ({
          ...prev,
          ice: "Cet ICE appartient déjà à un autre fournisseur"
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.ice;
          return newErrors;
        });
      }
    } catch (err) {
      console.error("Error checking ICE uniqueness:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'ice') {
      const timeoutId = setTimeout(() => {
        checkIceUniqueness(value);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    const dataToSend = new FormData();
    
    // Add fields in the exact order expected by the backend
    dataToSend.append('ice', formData.ice);
    dataToSend.append('code', formData.code);
    dataToSend.append('nom', formData.nom);
    dataToSend.append('rc', formData.rc);
    
    // Add file field (even if empty)
    if (file) {
      dataToSend.append('fichier_rc', file);
    } else {
      dataToSend.append('fichier_rc', '');
    }
    
    // Add address after file field
    dataToSend.append('adresse', formData.adresse || '');
    
    // Make sure projet_id is included and not null
    if (selectedProjet && selectedProjet.id) {
      dataToSend.append('projet_id', selectedProjet.id);
    } else {
      toast.error("Aucun projet n'est sélectionné. Veuillez sélectionner un projet.");
      setLoading(false);
      return;
    }
    
    try {
      // Use the correct API endpoint with v1 prefix
      let url = `${APIURL.ROOT}/v1/fournisseurs`;
      let method = 'post';
      
      if (fournisseur) {
        url = `${url}/${fournisseur.id}`;
        dataToSend.append('_method', 'PATCH');
      }
      
      const response = await axios({
        method,
        url,
        data: dataToSend,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200) {
        toast.success(`Fournisseur ${fournisseur ? 'modifié' : 'ajouté'} avec succès`);
        onSave();
      } else {
        toast.error("Une erreur est survenue lors de l'enregistrement");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Une erreur est survenue lors de l'enregistrement");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6">{fournisseur ? 'Modifier' : 'Ajouter'} un fournisseur</h2>
      
      {!iceUnique && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 !text-red-700">
          Cet ICE appartient déjà à un autre fournisseur
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="ice" className="block text-sm font-medium !text-gray-700 mb-1">
              ICE <span className="text-red-500">*</span>
            </label>
            <input
              id="ice"
              name="ice"
              type="number"
              value={formData.ice}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.ice ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.ice && <p className="mt-1 text-xs !text-red-500">{errors.ice}</p>}
          </div>
          
          <div>
            <label htmlFor="code" className="block text-sm font-medium !text-gray-700 mb-1">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.code ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.code && <p className="mt-1 text-xs !text-red-500">{errors.code}</p>}
          </div>
          
          <div>
            <label htmlFor="nom" className="block text-sm font-medium !text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.nom ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.nom && <p className="mt-1 text-xs !text-red-500">{errors.nom}</p>}
          </div>
          
          <div>
            <label htmlFor="rc" className="block text-sm font-medium !text-gray-700 mb-1">
              RC <span className="text-red-500">*</span>
            </label>
            <input
              id="rc"
              name="rc"
              type="number"
              value={formData.rc}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.rc ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.rc && <p className="mt-1 text-xs !text-red-500">{errors.rc}</p>}
          </div>
          
          <div>
            <label htmlFor="fichier_rc" className="block text-sm font-medium !text-gray-700 mb-1">
              Fichier RC
            </label>
            <input
              id="fichier_rc"
              name="fichier_rc"
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {fournisseur && fournisseur.fichier_rc && (
              <p className="mt-1 text-xs !text-blue-500">
                Fichier actuel: {fournisseur.fichier_rc}
              </p>
            )}
            {errors.fichier_rc && <p className="mt-1 text-xs !text-red-500">{errors.fichier_rc}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="adresse" className="block text-sm font-medium !text-gray-700 mb-1">
              Adresse
            </label>
            <textarea
              id="adresse"
              name="adresse"
              rows="3"
              value={formData.adresse}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.adresse && <p className="mt-1 text-xs !text-red-500">{errors.adresse}</p>}
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
            disabled={loading || !iceUnique}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${loading || !iceUnique ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FournisseursForm;
