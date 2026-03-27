import { useState, useEffect } from 'react';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, ENDPOINTS } from '@/configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import BreadCrumb from '../../navigation/BreadCrumb';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useSociete } from '@/context/SocieteContext';

const TypologieForm = ({ id = null, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { selectedProjet,refreshProjets} = useProjet();
  const { selectedSociete } = useSociete();
  const router = useRouter();
  const [originalFormData, setOriginalFormData] = useState({});
  // Form state
  const [formData, setFormData] = useState({
    typologie: '',
    projet_id: selectedProjet?.id || '',
  });

   // Simple cache et comparaison for return back en cas de changer projet
   const [oldProjetId, setOldProjetId] = useState(null);
      const [oldSocieteId, setOldSocieteId] = useState(null);
    
   	useEffect(() => {
      if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
        if (oldProjetId||oldSocieteId) {
          // Projet ou société a changé
          //  console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
          router.push('/administration/typologies');
        }
        setOldSocieteId(selectedSociete?.id)
        setOldProjetId(selectedProjet?.id);
      }
    }, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Set project ID when project is selected
    if (selectedProjet) {
      setFormData((prev) => ({ ...prev, projet_id: selectedProjet.id }));
    }

    // Load typologie data if editing
    if (id) {
      fetchTypologieData(id);
    }
  }, [id, selectedProjet]);

  const fetchTypologieData = async (typologieId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.TYPOLOGIES}/${typologieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.typologie) {
        const typologieData = response.data.typologie;
        setFormData({
          typologie: typologieData.typologie || '',
          projet_id: typologieData.projet_id || selectedProjet?.id || '',
        });
        setOriginalFormData({
          typologie: typologieData.typologie || '',
          projet_id: typologieData.projet_id || selectedProjet?.id || '',
        });
      }
    } catch (error) {
      console.error('Error fetching typologie data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hasChanges = () => {
    const normalizedForm = {
      ...formData,
      typologie: (formData.typologie ?? '').trim().toLowerCase(),
    };

    const normalizedOriginal = {
      ...originalFormData,
      typologie: (originalFormData.typologie ?? '').trim().toLowerCase(),
    };

    return (
      JSON.stringify(normalizedForm) !== JSON.stringify(normalizedOriginal)
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.typologie.trim()) {
      newErrors.typologie = 'La typologie est requise';
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
      let url = APIURL.TYPOLOGIES;
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
        id ? 'Typologie modifiée avec succès' : 'Typologie ajoutée avec succès'
      );

      // Refresh the project data to include the new/updated typologie
      if (selectedProjet?.id) {
        try {
          await refreshProjets(selectedProjet.id);
        } catch (refreshError) {
          console.error('Error refreshing project data:', refreshError);
          // Don't block navigation even if refresh fails
        }
      }
      router.push(ENDPOINTS.TYPOLOGIES);
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
      fetchTypologieData(id);
    } else {
      // Clear form if adding new
      setFormData({
        typologie: '',
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
          baseUrl={ENDPOINTS.TYPOLOGIES}
          step={`${id ? 'Modifier' : 'Ajouter'} une typologie`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block !text-gray-700 text-sm font-bold mb-2">
              Typologie <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="typologie"
              value={formData.typologie}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.typologie ? 'border-red-500' : 'border-gray-300'
              } rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Saisir la typologie"
            />
            {errors.typologie && (
              <p className="text-red-500 text-xs italic">
                {typeof errors.typologie === 'string'
                  ? errors.typologie
                  : errors.typologie[0]}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting || !hasChanges()}
              loading={submitting}
            >
              {submitting ? 'Chargement...' : id ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TypologieForm;
