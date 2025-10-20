import { useState, useEffect } from 'react';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, ENDPOINTS } from '@/configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import BreadCrumb from '../../navigation/BreadCrumb';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';

const TypeBienForm = ({ id = null, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { selectedProjet } = useProjet();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    projet_id: selectedProjet?.id || '',
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Set project ID when project is selected
    if (selectedProjet) {
      setFormData((prev) => ({ ...prev, projet_id: selectedProjet.id }));
    }

    // Load type bien data if editing
    if (id) {
      fetchTypeBienData(id);
    }
  }, [id, selectedProjet]);

  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/administration/types-biens');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
  const fetchTypeBienData = async (typeBienId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.TYPEBIENS}/${typeBienId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.typeBien) {
        const typeBienData = response.data.typeBien;
        setFormData({
          type: typeBienData.type || '',
          projet_id: typeBienData.projet_id || selectedProjet?.id || '',
        });
      }
    } catch (error) {
      console.error('Error fetching type bien data:', error);
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

    if (!formData.type.trim()) {
      newErrors.type = 'Le type est requis';
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
      let url = APIURL.TYPEBIENS;
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
        id
          ? 'Type de bien modifié avec succès'
          : 'Type de bien ajouté avec succès'
      );

      // Ensure we wait for the toast before navigating
      router.push(ENDPOINTS.TYPEBIENS);
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
          baseUrl={ENDPOINTS.TYPEBIENS}
          step={`${id ? 'Modifier' : 'Ajouter'} une  type de bien`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block !text-gray-700 text-sm font-bold mb-2">
              Type de bien <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              } rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Saisir le type de bien"
            />
            {errors.type && (
              <p className="text-red-500 text-xs italic">
                {typeof errors.type === 'string' ? errors.type : errors.type[0]}
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

export default TypeBienForm;
