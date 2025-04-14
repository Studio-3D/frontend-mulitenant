import { useState, useEffect } from 'react';
import { APIURL } from '@/configs/api';
import axios from 'axios';
import toast from 'react-hot-toast';

const TypeProjetForm = ({ id = null, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Load type projet data if editing
  useEffect(() => {
    if (id) {
      fetchTypeProjetData(id);
    }
  }, [id]);

  const fetchTypeProjetData = async (typeProjetId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.TYPEPROJETS}/${typeProjetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.typeProjet) {
        const typeProjetData = response.data.typeProjet;
        setFormData({
          type: typeProjetData.type || ''
        });
      }
    } catch (error) {
      console.error('Error fetching type projet data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.type.trim()) {
      newErrors.type = "Le type est requis";
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
      let url = APIURL.TYPEPROJETS;
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
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success(id ? 'Type modifié avec succès' : 'Type ajouté avec succès');
      
      // Ensure we wait for the toast before navigating
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {};
        setErrors(backendErrors);
        
        Object.values(backendErrors).forEach(errorArray => {
          errorArray.forEach(message => toast.error(message));
        });
      } else {
        toast.error('Erreur lors de l\'enregistrement');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (id) {
      // Reset to original data if editing
      fetchTypeProjetData(id);
    } else {
      // Clear form if adding new
      setFormData({
        type: ''
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
          Type de projet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`shadow appearance-none border ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            placeholder="Saisir le type de projet"
          />
          {errors.type && (
            <p className="text-red-500 text-xs italic">
              {typeof errors.type === 'string' ? errors.type : errors.type[0]}
            </p>
          )}
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={submitting}
          >
            {submitting ? 'Chargement...' : (id ? 'Modifier' : 'Ajouter')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TypeProjetForm;
