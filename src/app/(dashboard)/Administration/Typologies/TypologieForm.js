import { useState, useEffect } from "react";
import { useProjet } from "@/context/ProjetContext";
import { APIURL, ENDPOINTS } from "@/configs/api";
import axios from "axios";
import toast from "react-hot-toast";
import BreadCrumb from "../../navigation/BreadCrumb";

const TypologieForm = ({ id = null, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { selectedProjet } = useProjet();

  // Form state
  const [formData, setFormData] = useState({
    typologie: "",
    projet_id: selectedProjet?.id || "",
  });

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
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.TYPOLOGIES}/${typologieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.typologie) {
        const typologieData = response.data.typologie;
        setFormData({
          typologie: typologieData.typologie || "",
          projet_id: typologieData.projet_id || selectedProjet?.id || "",
        });
      }
    } catch (error) {
      console.error("Error fetching typologie data:", error);
      toast.error("Erreur lors du chargement des données");
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

    if (!formData.typologie.trim()) {
      newErrors.typologie = "La typologie est requise";
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
      const token = localStorage.getItem("accessToken");
      let url = APIURL.TYPOLOGIES;
      let method = "post";

      if (id) {
        url = `${url}/${id}`;
        method = "put";
      }

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(
        id ? "Typologie modifiée avec succès" : "Typologie ajoutée avec succès"
      );

      // Ensure we wait for the toast before navigating
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    } catch (error) {
      console.error("Error submitting form:", error);

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
        typologie: "",
        projet_id: selectedProjet?.id || "",
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
          step={`${id ? "Modifier" : "Ajouter"} une  banque`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nom de la banque <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.nom ? "border-red-500" : "border-gray-300"
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Saisir le nom de la banque"
            />
            {errors.nom && (
              <p className="text-red-500 text-xs italic">
                {typeof errors.nom === "string" ? errors.nom : errors.nom[0]}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting} loading={loading.form}>
              {submitting ? "Chargement..." : id ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TypologieForm;
