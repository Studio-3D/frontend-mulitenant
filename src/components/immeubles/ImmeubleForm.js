"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ImmeubleForm({ id, projetId, blocId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [blocs, setBlocs] = useState([]);
  const [filteredBlocs, setFilteredBlocs] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [loadingBlocs, setLoadingBlocs] = useState(false);
  const [loadingTranches, setLoadingTranches] = useState(false);
  const [selectedBloc, setSelectedBloc] = useState(null);
  const [selectedTranche, setSelectedTranche] = useState(null);
  
  // Get selected project from localStorage if not provided via props
  const selectedProjet = projetId ? 
    { id: projetId } : 
    JSON.parse(localStorage.getItem("selectedProjet") || "{}");

  const defaultValues = {
    nom: "",
    bloc_id: blocId || "",
    tranche_id: "",
    titre_foncier: "",
    nbre_biens: 0,
    projet_id: selectedProjet?.id
  };

  const [formData, setFormData] = useState(defaultValues);
  const isEditing = !!id;

  // Fetch immeuble data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchImmeubleData = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.IMMEUBLES}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.immeuble) {
            const immeuble = response.data.immeuble;
            setFormData({
              nom: immeuble.nom || "",
              bloc_id: immeuble.bloc_id || "",
              tranche_id: immeuble.bloc?.tranche_id || "",
              titre_foncier: immeuble.titre_foncier || "",
              nbre_biens: immeuble.nbre_biens || 0,
              projet_id: immeuble.projet_id || selectedProjet?.id
            });
            
            // If the immeuble has a bloc, store it for display
            if (immeuble.bloc) {
              setSelectedBloc(immeuble.bloc);
              
              // If the bloc has a tranche, store it too
              if (immeuble.bloc.tranche_id) {
                // We'll fetch the actual tranche object when tranches are loaded
                setFormData(prev => ({
                  ...prev,
                  tranche_id: immeuble.bloc.tranche_id
                }));
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch immeuble:", error);
          toast.error("Erreur lors du chargement de l'immeuble");
        }
      };
      
      fetchImmeubleData();
    } else if (blocId) {
      // If creating a new immeuble with a pre-selected bloc, set it in form data
      setFormData(prev => ({
        ...prev,
        bloc_id: blocId
      }));
      
      // We'll need to fetch the bloc to get its tranche_id
      const fetchBlocData = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.BLOCS}/${blocId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.bloc) {
            const bloc = response.data.bloc;
            setSelectedBloc(bloc);
            
            // Update tranche_id in form if available
            if (bloc.tranche_id) {
              setFormData(prev => ({
                ...prev,
                tranche_id: bloc.tranche_id
              }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch bloc:", error);
        }
      };
      
      fetchBlocData();
    }
  }, [id, isEditing, selectedProjet?.id, blocId]);

  // Fetch tranches for the project
  useEffect(() => {
    if (selectedProjet?.id) {
      const fetchTranches = async () => {
        setLoadingTranches(true);
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.TRANCHES}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { projet_id: selectedProjet.id }
          });
          
          if (response.data && response.data.data) {
            setTranches(response.data.data);
            
            // If we already have a tranche_id (from editing), find and set the selected tranche
            if (formData.tranche_id) {
              const found = response.data.data.find(t => t.id.toString() === formData.tranche_id.toString());
              if (found) {
                setSelectedTranche(found);
              }
            }
          }
        } catch (err) {
          console.error("Failed to load tranches:", err);
          toast.error("Erreur lors du chargement des tranches");
        } finally {
          setLoadingTranches(false);
        }
      };
      
      fetchTranches();
    }
  }, [selectedProjet?.id, formData.tranche_id]);

  // Fetch all blocs for the project, will be filtered by tranche
  useEffect(() => {
    if (selectedProjet?.id) {
      const fetchBlocs = async () => {
        setLoadingBlocs(true);
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.BLOCS}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { projet_id: selectedProjet.id }
          });
          
          if (response.data && response.data.data) {
            setBlocs(response.data.data);
            
            // If we have a blocId (from editing or passed as prop), find and set the selected bloc
            if (formData.bloc_id && !selectedBloc) {
              const found = response.data.data.find(b => b.id.toString() === formData.bloc_id.toString());
              if (found) {
                setSelectedBloc(found);
                
                // Also set the tranche_id if this bloc has one
                if (found.tranche_id) {
                  setFormData(prev => ({
                    ...prev,
                    tranche_id: found.tranche_id
                  }));
                }
              }
            }
          }
        } catch (err) {
          console.error("Failed to load blocs:", err);
          toast.error("Erreur lors du chargement des blocs");
        } finally {
          setLoadingBlocs(false);
        }
      };
      
      fetchBlocs();
    }
  }, [selectedProjet?.id, formData.bloc_id, selectedBloc]);

  // Filter blocs when tranche is selected
  useEffect(() => {
    if (formData.tranche_id && blocs.length > 0) {
      const filtered = blocs.filter(bloc => 
        bloc.tranche_id && bloc.tranche_id.toString() === formData.tranche_id.toString()
      );
      setFilteredBlocs(filtered);
      
      // If current selected bloc is not in this tranche, reset it
      if (formData.bloc_id && filtered.every(b => b.id.toString() !== formData.bloc_id.toString())) {
        setFormData(prev => ({
          ...prev,
          bloc_id: ""
        }));
        setSelectedBloc(null);
      }
    } else {
      setFilteredBlocs([]);
    }
  }, [formData.tranche_id, blocs, formData.bloc_id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // For tranche selection, also update the selected tranche object and reset bloc
    if (name === 'tranche_id') {
      const selectedTrancheObj = tranches.find(t => t.id.toString() === value.toString());
      setSelectedTranche(selectedTrancheObj || null);
      
      // Reset bloc selection if tranche changes
      if (value !== formData.tranche_id) {
        setFormData(prev => ({
          ...prev,
          bloc_id: ""
        }));
        setSelectedBloc(null);
      }
    }
    
    // For bloc selection, also update the selected bloc object
    if (name === 'bloc_id' && value) {
      const selectedBlocObj = filteredBlocs.find(b => b.id.toString() === value.toString());
      setSelectedBloc(selectedBlocObj || null);
    }
    
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
    setSelectedBloc(null);
    setSelectedTranche(null);
    setBackendErrors({});
    setValidationErrors({});
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.nom) {
      errors.nom = "Le nom de l'immeuble est requis";
    }
    
    // Require tranche selection
    if (tranches.length > 0 && !formData.tranche_id) {
      errors.tranche_id = "La tranche est requise";
    }
    
    // Only require bloc if there are blocs available for the selected tranche
    if (filteredBlocs.length > 0 && !formData.bloc_id) {
      errors.bloc_id = "Le bloc est requis";
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
    let url = APIURL.IMMEUBLES;
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

      toast.success(`L'immeuble a été ${isEditing ? "modifié" : "créé"} avec succès`);
      
      // Navigate back to the project details page with immeubles tab active
      if (selectedProjet?.id) {
        router.push(`/Projets/${selectedProjet.id}?tab=immeubles`);
      } else {
        router.push("/Projets");
      }
    } catch (error) {
      console.error("Failed to save immeuble:", error);
      
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
        {isEditing ? "Modifier l'immeuble" : "Ajouter un nouvel immeuble"}
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

          {/* Tranche selection dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tranche <span className="text-red-500">*</span>
            </label>
            
            {loadingTranches ? (
              <div className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-gray-500 text-sm">Chargement des tranches...</span>
              </div>
            ) : tranches.length === 0 ? (
              <div className="w-full rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-yellow-700 text-sm">
                Aucune tranche disponible pour ce projet. Veuillez créer une tranche d'abord.
              </div>
            ) : (
              <>
                <select
                  name="tranche_id"
                  value={formData.tranche_id}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    validationErrors.tranche_id || backendErrors.tranche_id ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">Sélectionner une tranche</option>
                  {tranches.map(tranche => (
                    <option key={tranche.id} value={tranche.id}>
                      {tranche.nom}
                    </option>
                  ))}
                </select>
                
                {selectedTranche && (
                  <p className="mt-1 text-xs text-[#009FFF]">
                    Tranche sélectionnée: {selectedTranche.nom}
                  </p>
                )}
                
                {(validationErrors.tranche_id || backendErrors.tranche_id) && (
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.tranche_id || (backendErrors.tranche_id && backendErrors.tranche_id[0])}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Bloc selection - Only enabled if a tranche is selected */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bloc <span className="text-red-500">*</span>
            </label>
            
            {loadingBlocs ? (
              <div className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-gray-500 text-sm">Chargement des blocs...</span>
              </div>
            ) : !formData.tranche_id ? (
              <div className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 text-sm">
                Veuillez d'abord sélectionner une tranche
              </div>
            ) : filteredBlocs.length === 0 ? (
              <div className="w-full rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-yellow-700 text-sm">
                Aucun bloc disponible pour cette tranche. Veuillez créer un bloc d'abord.
              </div>
            ) : (
              <>
                <select
                  name="bloc_id"
                  value={formData.bloc_id}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    validationErrors.bloc_id || backendErrors.bloc_id ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                >
                  <option value="">Sélectionner un bloc</option>
                  {filteredBlocs.map(bloc => (
                    <option key={bloc.id} value={bloc.id}>
                      {bloc.nom}
                    </option>
                  ))}
                </select>
                
                {selectedBloc && (
                  <p className="mt-1 text-xs text-[#009FFF]">
                    Bloc sélectionné: {selectedBloc.nom}
                  </p>
                )}
                
                {(validationErrors.bloc_id || backendErrors.bloc_id) && (
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.bloc_id || (backendErrors.bloc_id && backendErrors.bloc_id[0])}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Titre foncier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre foncier
            </label>
            <input
              type="text"
              name="titre_foncier"
              value={formData.titre_foncier}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

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
            href={selectedProjet?.id ? `/Projets/${selectedProjet.id}?tab=immeubles` : "/Projets"}
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
            disabled={loading || tranches.length === 0 || (formData.tranche_id && filteredBlocs.length === 0)}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
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
