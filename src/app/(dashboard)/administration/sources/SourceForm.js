import { useState, useEffect } from 'react';
import { APIURL, ENDPOINTS } from '@/configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import BreadCrumb from '../../navigation/BreadCrumb';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useProjet } from '@/context/ProjetContext';

const SourceForm = ({ id = null, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    source: '',
  });
  const { selectedProjet } = useProjet();
  // Validation errors
  const [errors, setErrors] = useState({});

  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/administration/sources');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
  useEffect(() => {
    // Load source data if editing
    if (id) {
      fetchSourceData(id);
    }
  }, [id]);

  const fetchSourceData = async (sourceId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.SOURCES}/${sourceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.source) {
        const sourceData = response.data.source;
        setFormData({
          source: sourceData.source || '',
        });
      }
    } catch (error) {
      console.error('Error fetching source data:', error);
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

    if (!formData.source.trim()) {
      newErrors.source = 'La source est requise';
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
      let url = APIURL.SOURCES;
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
        id ? 'Source modifiée avec succès' : 'Source ajoutée avec succès'
      );

      router.push(ENDPOINTS.SOURCES);
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
      fetchSourceData(id);
    } else {
      // Clear form if adding new
      setFormData({
        source: '',
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
          baseUrl={ENDPOINTS.SOURCES}
          step={`${id ? 'Modifier' : 'Ajouter'} une source`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block !text-gray-700 text-sm font-bold mb-2">
              Source <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.source ? 'border-red-500' : 'border-gray-300'
              } rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Saisir la source"
            />
            {errors.source && (
              <p className="text-red-500 text-xs italic">
                {typeof errors.source === 'string'
                  ? errors.source
                  : errors.source[0]}
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

export default SourceForm;
