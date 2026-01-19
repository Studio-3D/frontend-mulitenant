import { useState, useEffect } from 'react';
import { APIURL, ENDPOINTS } from '@/configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import BreadCrumb from '../../navigation/BreadCrumb';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useProjet } from '@/context/ProjetContext';
import LoadingSpin from '@/components/LoadingSpin';

const Gestion_roles = ({ id = null }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    nom: '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  const { selectedProjet } = useProjet();
  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/administration/banques');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);

  useEffect(() => {
    // Load banque data if editing
    if (id) {
      fetchBanqueData(id);
    }
  }, [id]);

  const fetchBanqueData = async (banqueId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.BANQUES}/${banqueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.banque) {
        const banqueData = response.data.banque;
        setFormData({
          nom: banqueData.nom || '',
        });
      }
    } catch (error) {
      console.error('Error fetching banque data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom de la banque est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      let url = APIURL.BANQUES;
      let method = 'post';

      if (id) {
        url = `${url}/${id}`;
        method = 'put';
      }

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(
        id ? 'Banque modifiée avec succès' : 'Banque ajoutée avec succès'
      );

      router.push(ENDPOINTS.BANQUES);
    } catch (error) {
      console.error('Error submitting form:', error);

      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {};
        setErrors(backendErrors);

        Object.values(backendErrors).forEach((errorArray) => {
          errorArray.forEach((message) => toast.error(message));
        });
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpin />;
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={ENDPOINTS.BANQUES}
          step={`${id ? 'Modifier' : 'Ajouter'} une  banque`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block !text-gray-700 text-sm font-bold mb-2">
              Nom de la banque <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              } rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Saisir le nom de la banque"
            />
            {errors.nom && (
              <p className="text-red-500 text-xs italic">
                {typeof errors.nom === 'string' ? errors.nom : errors.nom[0]}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting} loading={loading.form}>
              {submitting ? 'Chargement...' : id ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Gestion_roles;
