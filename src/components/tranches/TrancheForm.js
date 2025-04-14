"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function TrancheForm({ id, projetId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  
  // Get selected project from localStorage if not provided via props
  const selectedProjet = projetId ? 
    { id: projetId } : 
    JSON.parse(localStorage.getItem("selectedProjet") || "{}");

  const defaultValues = {
    nom: "",
    date_lancement: "",
    date_livraison: "",
    niveau_etages: "",
    nbre_blocs: 0,
    nbre_immeubles: 0,
    nbre_biens: 0,
    projet_id: selectedProjet?.id
  };

  const [formData, setFormData] = useState(defaultValues);
  const isEditing = !!id;

  // Fetch tranche data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchTrancheData = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.TRANCHES}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.tranche) {
            const tranche = response.data.tranche;
            setFormData({
              nom: tranche.nom || "",
              date_lancement: tranche.date_lancement || "",
              date_livraison: tranche.date_livraison || "",
              niveau_etages: tranche.niveau_etages || "",
              nbre_biens: tranche.nbre_biens || 0,
              nbre_blocs: tranche.nbre_blocs || 0,
              nbre_immeubles: tranche.nbre_immeubles || 0,
              projet_id: tranche.projet_id || selectedProjet?.id
            });
          }
        } catch (error) {
          console.error("Failed to fetch tranche:", error);
          toast.error("Erreur lors du chargement de la tranche");
        }
      };
      
      fetchTrancheData();
    }
  }, [id, isEditing, selectedProjet?.id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Clear form handler
  const handleClear = () => {
    setFormData(defaultValues);
    setBackendErrors({});
    setValidationErrors({});
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.nom) {
      errors.nom = "Le nom de tranche est requis";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setBackendErrors({});

    const token = localStorage.getItem("accessToken");
    let url = APIURL.TRANCHES;
    let method = "post";

    if (isEditing) {
      url = `${url}/${id}`;
      method = "put";
    }

    try {
      await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(`La tranche a été ${isEditing ? "modifiée" : "créée"} avec succès`);
      
      // Navigate back to the project details page with tranches tab active
      if (selectedProjet?.id) {
        router.push(`/Projets/${selectedProjet.id}?tab=tranches`);
      } else {
        router.push("/Projets");
      }
    } catch (error) {
      console.error("Failed to save tranche:", error);
      
      const response = error.response;
      if (response && response.status === 422) {
        setBackendErrors(response.data.errors || {});
        setTimeout(() => setBackendErrors({}), 5000);
      } else {
        toast.error("Une erreur s'est produite lors de la soumission du formulaire");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? "Modifier la tranche" : "Ajouter une nouvelle tranche"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <div>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  validationErrors.nom || backendErrors.nom ? "border-red-500" : "border-gray-300"
                } px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              {(validationErrors.nom || backendErrors.nom) && (
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.nom || (backendErrors.nom && backendErrors.nom[0])}
                </p>
              )}
            </div>
          </div>

          {/* Date Lancement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de lancement
            </label>
            <input
              type="date"
              name="date_lancement"
              value={formData.date_lancement}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Date Livraison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de livraison
            </label>
            <input
              type="date"
              name="date_livraison"
              value={formData.date_livraison}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Niveau d'étages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau d'étages
            </label>
            <input
              type="number"
              name="niveau_etages"
              value={formData.niveau_etages}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Nombre de blocs */}
          {selectedProjet?.nbre_blocs !== 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de blocs
              </label>
              <input
                type="number"
                name="nbre_blocs"
                value={formData.nbre_blocs}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Nombre d'immeubles */}
          {selectedProjet?.nbre_immeubles !== 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre d'immeubles
              </label>
              <input
                type="number"
                name="nbre_immeubles"
                value={formData.nbre_immeubles}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Nombre de biens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de biens
            </label>
            <input
              type="number"
              name="nbre_biens"
              value={formData.nbre_biens}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-4 pt-4">
          <Link
            href={selectedProjet?.id ? `/Projets/${selectedProjet.id}?tab=tranches` : "/Projets"}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Annuler
          </Link>
          
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Vider
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
