import { useState, useEffect } from 'react';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, ENDPOINTS } from '@/configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import BreadCrumb from '../../navigation/BreadCrumb';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useSociete } from '@/context/SocieteContext';

const VueForm = ({ id = null, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { selectedProjet } = useProjet();
  const { selectedSociete } = useSociete();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    vue: '',
    projet_id: selectedProjet?.id || '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);
      const [oldSocieteId, setOldSocieteId] = useState(null);
    
   	useEffect(() => {
      if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
        if (oldProjetId||oldSocieteId) {
          // Projet ou société a changé
            console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
          router.push('/administration/vues');
        }
        setOldSocieteId(selectedSociete?.id)
        setOldProjetId(selectedProjet?.id);
      }
    }, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);
  useEffect(() => {
    // Set project ID when project is selected
    if (selectedProjet) {
      setFormData((prev) => ({ ...prev, projet_id: selectedProjet.id }));
    }

    // Load vue data if editing
    if (id) {
      fetchVueData(id);
    }
  }, [id, selectedProjet]);

  const fetchVueData = async (vueId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.VUES}/${vueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.vue) {
        const vueData = response.data.vue;
        setFormData({
          vue: vueData.vue || '',
          projet_id: vueData.projet_id || selectedProjet?.id || '',
        });
      }
    } catch (error) {
      console.error('Error fetching vue data:', error);
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

    if (!formData.vue.trim()) {
      newErrors.vue = 'La vue est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check if project is selected
    if (!selectedProjet) {
      toast.error("Veuillez d'abord sélectionner un projet");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      let url = APIURL.VUES;
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
        id ? 'Vue modifiée avec succès' : 'Vue ajoutée avec succès'
      );

      router.push(ENDPOINTS.VUES);
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

  const handleReset = () => {
    if (id) {
      // Reset to original data if editing
      fetchVueData(id);
    } else {
      // Clear form if adding new
      setFormData({
        vue: '',
        projet_id: selectedProjet?.id || '',
      });
    }
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={ENDPOINTS.VUES}
          step={`${id ? 'Modifier' : 'Ajouter'} un vue`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block !text-gray-700 text-sm font-bold mb-2">
              Vue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vue"
              value={formData.vue}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.vue ? 'border-red-500' : 'border-gray-300'
              } rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Saisir la vue"
            />
            {errors.vue && (
              <p className="text-red-500 text-xs italic">
                {typeof errors.vue === 'string' ? errors.vue : errors.vue[0]}
              </p>
            )}
          </div>

          <input type="hidden" name="projet_id" value={formData.projet_id} />

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

export default VueForm;
