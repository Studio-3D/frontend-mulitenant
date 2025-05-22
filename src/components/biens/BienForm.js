"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import ProjectStepper from "@/components/ProjectStepper";
import toast from "react-hot-toast";

export default function BienForm({ id, projetId, blocId, immeubleId }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fetchingData, setFetchingData] = useState(false);

  // Reference data
  const [typeBiens, setTypeBiens] = useState([]);
  const [vues, setVues] = useState([]);
  const [typologies, setTypologies] = useState([]);
  const [projet, setProjet] = useState(null);

  // States for cascade dropdowns
  const [tranches, setTranches] = useState([]);
  const [blocs, setBlocs] = useState([]);
  const [immeubles, setImmeubles] = useState([]);
  const [filteredBlocs, setFilteredBlocs] = useState([]);
  const [filteredImmeubles, setFilteredImmeubles] = useState([]);
  const [selectedTranche, setSelectedTranche] = useState(null);
  const [selectedBloc, setSelectedBloc] = useState(null);
  const [selectedImmeuble, setSelectedImmeuble] = useState(null);

  // Loading states
  const [loadingTranches, setLoadingTranches] = useState(false);
  const [loadingBlocs, setLoadingBlocs] = useState(false);
  const [loadingImmeubles, setLoadingImmeubles] = useState(false);

  // Orientation options
  const orientations = [
    { id: "N", label: "Nord" },
    { id: "E", label: "Est" },
    { id: "S", label: "Sud" },
    { id: "O", label: "Ouest" },
    { id: "N_E", label: "Nord-Est" },
    { id: "N_O", label: "Nord-Ouest" },
    { id: "N_S", label: "Nord-Sud" },
    { id: "O_E", label: "Ouest-Est" },
    { id: "O_S", label: "Ouest-Sud" },
    { id: "E_S", label: "Est-Sud" }
  ];

  // Property status options
  const etatOptions = [
    { id: "disponible", label: "Disponible" },
    { id: "reserve", label: "Réservé" },
    { id: "vendu", label: "Vendu" }
  ];

  // Steps
  const steps = ["Détails du bien", "Superficies du bien", "Composition du bien"];

  // Form state with default values
  const [formData, setFormData] = useState({
    // Basic details
    projet_id: projetId || "",
    propriete_dite_bien: "",
    numero: "",
    niveau: "",
    orientation: "",
    conventionne: false,
    prix_unitaire: 0,
    prix: 0,
    tranche_id: "",
    bloc_id: blocId || "",
    immeuble_id: immeubleId || "",
    etat: "disponible", // Explicitly set default etat
    // ...other fields with defaults...
  });

  // Fetch reference data and initial data on component mount
  useEffect(() => {
    if (id) fetchBienData(id);
    if (projetId) fetchProjectData(projetId);
    fetchReferenceData();
  }, [id, projetId]);

  // If blocId is provided, fetch its details and set tranche_id accordingly
  useEffect(() => {
    if (blocId && !id) {
      const fetchBlocDetails = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.BLOCS}/${blocId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data && response.data.bloc) {
            const bloc = response.data.bloc;
            setSelectedBloc(bloc);

            // If bloc has a tranche, select it
            if (bloc.tranche_id) {
              setFormData(prev => ({
                ...prev,
                tranche_id: bloc.tranche_id
              }));

              // Load the bloc's tranche
              const trancheResponse = await axios.get(`${APIURL.TRANCHES}/${bloc.tranche_id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (trancheResponse.data && trancheResponse.data.tranche) {
                setSelectedTranche(trancheResponse.data.tranche);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching bloc details:", error);
        }
      };

      fetchBlocDetails();
    }
  }, [blocId, id]);

  // If immeubleId is provided, fetch its details and set bloc_id and tranche_id
  useEffect(() => {
    if (immeubleId && !id) {
      const fetchImmeubleDetails = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.IMMEUBLES}/${immeubleId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data && response.data.immeuble) {
            const immeuble = response.data.immeuble;
            setSelectedImmeuble(immeuble);

            // If immeuble has a bloc, select it
            if (immeuble.bloc_id) {
              setFormData(prev => ({
                ...prev,
                bloc_id: immeuble.bloc_id
              }));

              // Load the immeuble's bloc
              const blocResponse = await axios.get(`${APIURL.BLOCS}/${immeuble.bloc_id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (blocResponse.data && blocResponse.data.bloc) {
                const bloc = blocResponse.data.bloc;
                setSelectedBloc(bloc);

                // If bloc has a tranche, select it too
                if (bloc.tranche_id) {
                  setFormData(prev => ({
                    ...prev,
                    tranche_id: bloc.tranche_id
                  }));

                  // Load the bloc's tranche
                  const trancheResponse = await axios.get(`${APIURL.TRANCHES}/${bloc.tranche_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });

                  if (trancheResponse.data && trancheResponse.data.tranche) {
                    setSelectedTranche(trancheResponse.data.tranche);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching immeuble details:", error);
        }
      };

      fetchImmeubleDetails();
    }
  }, [immeubleId, id]);

  // Dynamic data fetching based on selections
  useEffect(() => {
    // Handle dependency between tranche, bloc, immeuble
    if (formData.tranche_id && projet?.nbre_blocs > 0) {
      fetchBlocsByTranche(formData.tranche_id);
    }
    if (formData.bloc_id && projet?.nbre_immeubles > 0) {
      fetchImmeublesByBloc(formData.bloc_id);
    }
  }, [formData.tranche_id, formData.bloc_id, projet]);

  // Fetch reference data for dropdowns
  const fetchReferenceData = async () => {
    setFetchingData(true);
    try {
      const token = localStorage.getItem("accessToken");

      // Fetch property types, views, typologies in parallel
      const [typesResponse, vuesResponse, typologiesResponse] = await Promise.all([
        axios.get(APIURL.TYPEBIENS, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(APIURL.VUES, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(APIURL.TYPOLOGIES, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setTypeBiens(typesResponse.data.typeBiens || []);
      setVues(vuesResponse.data.vues || []);
      setTypologies(typologiesResponse.data.typologies || []);
    } catch (error) {
      console.error("Error fetching reference data:", error);
      toast.error("Erreur lors du chargement des données de référence");
    } finally {
      setFetchingData(false);
    }
  };

  // Fetch project data
  const fetchProjectData = async (projectId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.PROJETS}/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProjet(response.data.projet);

      // If project has tranches, fetch them
      if (response.data.projet.nbre_tranches > 0) {
        fetchTranchesForProject(projectId);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  // Additional data fetching functions for tranches, blocs, immeubles
  const fetchTranchesForProject = async (projectId) => {
    setLoadingTranches(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.TRANCHES}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { projet_id: projectId }
      });

      setTranches(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tranches:", error);
      toast.error("Erreur lors du chargement des tranches");
    } finally {
      setLoadingTranches(false);
    }
  };

  const fetchBlocsByTranche = async (trancheId) => {
    setLoadingBlocs(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.BLOCS}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { tranche_id: trancheId }
      });

      // Store both fetched and filtered blocs from the API response
      const fetchedBlocs = response.data.data || [];
      setBlocs(prev => [...prev]); // Keep existing blocs for reference
      setFilteredBlocs(fetchedBlocs); // Only set the filtered collection to blocs for this tranche

      // If we have a bloc_id that doesn't belong to this tranche, reset it
      if (formData.bloc_id) {
        const blocStillValid = fetchedBlocs.some(b => b.id.toString() === formData.bloc_id.toString());
        if (!blocStillValid) {
          setFormData(prev => ({
            ...prev,
            bloc_id: "",
            immeuble_id: ""
          }));
          setSelectedBloc(null);
          setSelectedImmeuble(null);
        }
      }
    } catch (error) {
      console.error("Error fetching blocs:", error);
      toast.error("Erreur lors du chargement des blocs");
      setFilteredBlocs([]);
    } finally {
      setLoadingBlocs(false);
    }
  };

  const fetchImmeublesByBloc = async (blocId) => {
    setLoadingImmeubles(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.IMMEUBLES}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { bloc_id: blocId }
      });

      // Store all immeubles and update filtered immeubles
      const fetchedImmeubles = response.data.data || [];
      setImmeubles(fetchedImmeubles);
      setFilteredImmeubles(fetchedImmeubles); // Set filtered immeubles to be the same as fetched
    } catch (error) {
      console.error("Error fetching immeubles:", error);
      toast.error("Erreur lors du chargement des immeubles");
    } finally {
      setLoadingImmeubles(false);
    }
  };

  // Fetch property data for editing
  const fetchBienData = async (bienId) => {
    setFetchingData(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.BIENS}/${bienId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.bien) {
        const bienData = response.data.bien;

        // Set project ID
        if (bienData.projet_id) {
          fetchProjectData(bienData.projet_id);
        }

        // Convert checkbox values from 0/1 to boolean
        bienData.conventionne = !!bienData.conventionne;

        // Format nested objects to their IDs for form fields
        if (bienData.immeuble) {
          setSelectedImmeuble(bienData.immeuble);
        }

        if (bienData.bloc) {
          setSelectedBloc(bienData.bloc);
        }

        if (bienData.tranche) {
          setSelectedTranche(bienData.tranche);
        }

        // Set form data
        setFormData({
          ...bienData,
          // Convert nulls to empty strings for form fields
          ...Object.fromEntries(
            Object.entries(bienData).map(([key, value]) => [key, value === null ? "" : value])
          ),
          // Explicitly set these IDs for dropdowns
          tranche_id: bienData.tranche_id || "",
          bloc_id: bienData.bloc_id || "",
          immeuble_id: bienData.immeuble_id || "",
          type_id: bienData.type_id || "",
          vue_id: bienData.vue_id || "",
          typologie_id: bienData.typologie_id || "",
          // Ensure etat has a valid value
          etat: bienData.etat || "disponible"
        });

        // After setting basic form data, also trigger area calculations
        if (bienData.superficie_terrasse) {
          handleTerraceChange(bienData.superficie_terrasse);
        }

        if (bienData.superficie_balcon) {
          handleBalconChange(bienData.superficie_balcon);
        }

        if (bienData.superficie_jardin) {
          handleJardinChange(bienData.superficie_jardin);
        }

        // Trigger cascade dropdowns if needed
        if (bienData.tranche_id) {
          fetchBlocsByTranche(bienData.tranche_id);
        }

        if (bienData.bloc_id) {
          fetchImmeublesByBloc(bienData.bloc_id);
        }
      }
    } catch (error) {
      console.error("Error fetching bien data:", error);
      toast.error("Erreur lors du chargement des données du bien");
    } finally {
      setFetchingData(false);
    }
  };

  // Calculate derived values
  const handleTerraceChange = (value, currentFormData) => {
    const terraceValue = parseFloat(value) || 0;
    // Calculate 50% of the terrace area for the calculated field
    const terraceCalculated = terraceValue * 0.5;

    setFormData(prev => ({
      ...prev,
      superficie_terrasse_calculer: terraceCalculated
    }));

    // Use the latest form data
    updateVendableAndTotalArea({
      ...currentFormData,
      superficie_terrasse: terraceValue,
      superficie_terrasse_calculer: terraceCalculated
    });
  };

  // New function to handle balcon changes
  const handleBalconChange = (value, currentFormData) => {
    const balconValue = parseFloat(value) || 0;
    // Calculate 50% of the balcon area (adjust calculation as needed)
    const balconCalculated = balconValue * 0.5;

    setFormData(prev => ({
      ...prev,
      superficie_balcon_calculer: balconCalculated
    }));

    // Update vendable and total areas
    updateVendableAndTotalArea({
      ...currentFormData,
      superficie_balcon: balconValue,
      superficie_balcon_calculer: balconCalculated
    });
  };

  // New function to handle jardin changes
  const handleJardinChange = (value, currentFormData) => {
    const jardinValue = parseFloat(value) || 0;
    // Calculate 25% of the garden area (adjust calculation as needed)
    const jardinCalculated = jardinValue * 0.25;

    setFormData(prev => ({
      ...prev,
      superficie_jardin_calculer: jardinCalculated
    }));

    // Update vendable and total areas
    updateVendableAndTotalArea({
      ...currentFormData,
      superficie_jardin: jardinValue,
      superficie_jardin_calculer: jardinCalculated
    });
  };

  // Calculate vendable and total areas based on all fields
  const updateVendableAndTotalArea = (data) => {
    const habitable = parseFloat(data.superficie_habitable) || 0;
    const terraceCalc = parseFloat(data.superficie_terrasse_calculer) || 0;
    const balconCalc = parseFloat(data.superficie_balcon_calculer) || 0;
    const jardinCalc = parseFloat(data.superficie_jardin_calculer) || 0;

    // Calculate vendable area
    const vendable = habitable + terraceCalc + balconCalc + jardinCalc;

    // Calculate total area - this needs to match the backend's expectation
    // According to BienController.php and database schema, superficie_total exists
    const total = habitable +
      (parseFloat(data.superficie_terrasse) || 0) +
      (parseFloat(data.superficie_balcon) || 0) +
      (parseFloat(data.superficie_jardin) || 0);

    setFormData(prev => ({
      ...prev,
      superficie_vendable: vendable,
      superficie_total: total
    }));

    // Also recalculate price when areas change
    if (data.prix_unitaire) {
      recalculatePrice(data.prix_unitaire, vendable);
    }
  };

  const recalculatePrice = (unitPrice, vendableArea) => {
    const unitPriceValue = parseFloat(unitPrice) || 0;
    const superficieVendable = parseFloat(vendableArea) || 0;
    const calculatedPrice = unitPriceValue * superficieVendable;
    setFormData(prev => ({ ...prev, prix: calculatedPrice }));
  };

  // Handle form input changes with special calculations
  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Special field handlers
      if (field === "superficie_terrasse") {
        handleTerraceChange(value, updated);
      } else if (field === "superficie_balcon") {
        handleBalconChange(value, updated);
      } else if (field === "superficie_jardin") {
        handleJardinChange(value, updated);
      } else if (field === "superficie_habitable") {
        updateVendableAndTotalArea({
          ...updated,
          superficie_habitable: value
        });
      } else if (field === "prix_unitaire") {
        recalculatePrice(value, updated.superficie_vendable);
      }
      // Cascade dropdown logic
      if (field === "tranche_id") {
        updated.bloc_id = "";
        updated.immeuble_id = "";
        setSelectedBloc(null);
        setSelectedImmeuble(null);
        setFilteredImmeubles([]);
        if (value) {
          const selectedTrancheObj = tranches.find(t => t.id.toString() === value.toString());
          setSelectedTranche(selectedTrancheObj || null);
          fetchBlocsByTranche(value);
        } else {
          setFilteredBlocs([]);
          setSelectedTranche(null);
        }
      } else if (field === "bloc_id") {
        updated.immeuble_id = "";
        setSelectedImmeuble(null);
        if (value) {
          const selectedBlocObj = filteredBlocs.find(b => b.id.toString() === value.toString());
          setSelectedBloc(selectedBlocObj || null);
          fetchImmeublesByBloc(value);
        } else {
          setFilteredImmeubles([]);
          setSelectedBloc(null);
        }
      } else if (field === "immeuble_id" && value) {
        const selectedImmeubleObj = filteredImmeubles.find(i => i.id.toString() === value.toString());
        setSelectedImmeuble(selectedImmeubleObj || null);
      }
      return updated;
    });
  };

// Step navigation
const handleNext = () => {
  if (validateCurrentStep()) {
    setActiveStep(prev => prev + 1);
  }
};

const handleBack = () => {
  setActiveStep(prev => prev - 1);
};

// Validation by step
const validateCurrentStep = () => {
  const newErrors = {};

  // Step-specific validation logic
  if (activeStep === 0) {
    // Validate details step
    if (!formData.propriete_dite_bien) {
      newErrors.propriete_dite_bien = ["La propriété dite bien est requise"];
    }
    // ...other validations
  } else if (activeStep === 1) {
    // Validate areas step
    if (!formData.superficie_habitable && !formData.superficie_architecte) {
      newErrors.superficie_habitable = ["Au moins une superficie est requise"];
    }
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    toast.error(Object.values(newErrors)[0][0]);
    return false;
  }

  setErrors({});
  return true;
};

// Form submission
const handleSubmit = async () => {
  if (!validateCurrentStep()) return;

  setLoading(true);
  try {
    const token = localStorage.getItem("accessToken");

    // Create a clean copy with only the necessary fields for submission
    const requiredFields = [
      "id", "projet_id", "propriete_dite_bien", "numero", "niveau", "orientation",
      "conventionne", "prix_unitaire", "prix", "tranche_id", "bloc_id", "immeuble_id",
      "etat", "nbre_facades", "avance_minimale", "titre_foncier", "type_id", "vue_id",
      "typologie_id", "superficie_habitable", "superficie_architecte", "superficie_terrasse",
      "superficie_terrasse_calculer", "superficie_balcon", "superficie_balcon_calculer",
      "superficie_jardin", "superficie_jardin_calculer", "superficie_vendable",
      "superficie_total", "num_parking", "prix_parking", "superficie_parking",
      "num_box", "prix_box", "superficie_box", "nbre_chambres", "nbre_salons",
      "nbre_sdb", "nbre_cuisines", "nbre_terasses", "nbre_balcons", "nbre_halls",
      "nbre_receptions", "nbre_buanderies", "nbre_placards"
    ];

    // Extract only needed fields from formData
    const dataToSubmit = {};
    requiredFields.forEach(field => {
      if (formData[field] !== undefined) {
        dataToSubmit[field] = formData[field];
      }
    });

    // Convert checkbox value to 1/0
    dataToSubmit.conventionne = dataToSubmit.conventionne ? 1 : 0;

    // Ensure numeric fields are actually numbers
    const numericFields = [
      "prix_unitaire", "prix", "superficie_habitable", "superficie_architecte",
      "superficie_terrasse", "superficie_terrasse_calculer", "superficie_balcon",
      "superficie_balcon_calculer", "superficie_jardin", "superficie_jardin_calculer",
      "superficie_vendable", "superficie_total", "prix_parking", "superficie_parking",
      "prix_box", "superficie_box", "avance_minimale"
    ];

    numericFields.forEach(field => {
      if (dataToSubmit[field] !== undefined) {
        dataToSubmit[field] = parseFloat(dataToSubmit[field]) || 0;
      }
    });

    // Ensure etat is lowercase if it's not already (API expects lowercase)
    if (dataToSubmit.etat) {
      dataToSubmit.etat = dataToSubmit.etat.toLowerCase();
    } else {
      dataToSubmit.etat = "disponible"; // Default value
    }

    console.log("Submitting data:", dataToSubmit);

    const response = id ?
      await axios.put(`${APIURL.BIENS}/${id}`, dataToSubmit, { headers: { Authorization: `Bearer ${token}` } }) :
      await axios.post(APIURL.BIENS, dataToSubmit, { headers: { Authorization: `Bearer ${token}` } });

    toast.success(id ? "Bien mis à jour avec succès" : "Bien créé avec succès");

    // Redirect appropriately
    if (formData.projet_id) {
      router.push(`/Projets/${formData.projet_id}`);
    } else {
      router.push(`/Biens/${response.data.bien.id || id}`);
    }
  } catch (error) {
    console.error("Error submitting property:", error);
    if (error.response?.data?.errors) {
      setErrors(error.response.data.errors);
    }

    // Add more detailed error information to help debug database field issues
    if (error.response?.data?.message) {
      console.error("Backend error message:", error.response.data.message);

      // If the error message mentions a column name, show it in the toast
      if (error.response.data.message.includes("Unknown column")) {
        const columnMatch = error.response.data.message.match(/Unknown column '([^']+)'/);
        if (columnMatch && columnMatch[1]) {
          toast.error(`Erreur: La colonne "${columnMatch[1]}" n'existe pas dans la base de données`);
          return;
        }
      }
    }

    toast.error("Erreur lors de l'enregistrement du bien");
  } finally {
    setLoading(false);
  }
};

// Render form content based on active step
const renderStepContent = () => {
  switch (activeStep) {
    case 0: return renderDetailsStep();
    case 1: return renderAreasStep();
    case 2: return renderCompositionStep();
    default: return null;
  }
};

// Render details step with corrected bloc dropdown
const renderDetailsStep = () => (
  <div className="bg-white p-6 rounded-md shadow-sm">
    <h3 className="text-lg font-medium mb-6">Détails du bien</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Propriété dite bien <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.propriete_dite_bien || ''}
          onChange={(e) => handleChange("propriete_dite_bien", e.target.value)}
          className={`w-full px-3 py-2 border ${errors.propriete_dite_bien ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.propriete_dite_bien && <p className="mt-1 text-sm text-red-600">{errors.propriete_dite_bien[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.numero || ''}
          onChange={(e) => handleChange("numero", e.target.value)}
          className={`w-full px-3 py-2 border ${errors.numero ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.numero && <p className="mt-1 text-sm text-red-600">{errors.numero[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Niveau <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.niveau || ''}
          onChange={(e) => handleChange("niveau", e.target.value)}
          className={`w-full px-3 py-2 border ${errors.niveau ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.niveau && <p className="mt-1 text-sm text-red-600">{errors.niveau[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Orientation <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.orientation || ''}
          onChange={(e) => handleChange("orientation", e.target.value)}
          className={`w-full px-3 py-2 border ${errors.orientation ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        >
          <option value="">Sélectionner</option>
          {orientations.map(option => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
        {errors.orientation && <p className="mt-1 text-sm text-red-600">{errors.orientation[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de bien
        </label>
        <select
          value={formData.type_id || ''}
          onChange={(e) => handleChange("type_id", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Sélectionner</option>
          {typeBiens.map(type => (
            <option key={type.id} value={type.id}>{type.type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vue
        </label>
        <select
          value={formData.vue_id || ''}
          onChange={(e) => handleChange("vue_id", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Sélectionner</option>
          {vues.map(vue => (
            <option key={vue.id} value={vue.id}>{vue.vue}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Typologie
        </label>
        <select
          value={formData.typologie_id || ''}
          onChange={(e) => handleChange("typologie_id", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Sélectionner</option>
          {typologies.map(typologie => (
            <option key={typologie.id} value={typologie.id}>{typologie.typologie}</option>
          ))}
        </select>
      </div>

      {/* Project structure selectors based on project composition */}
      {projet && projet.nbre_tranches > 0 && (
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
              Aucune tranche disponible pour ce projet.
            </div>
          ) : (
            <select
              value={formData.tranche_id || ''}
              onChange={(e) => handleChange("tranche_id", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.tranche_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Sélectionner une tranche</option>
              {tranches.map(tranche => (
                <option key={tranche.id} value={tranche.id}>{tranche.nom}</option>
              ))}
            </select>
          )}
          {errors.tranche_id && <p className="mt-1 text-sm text-red-600">{errors.tranche_id}</p>}
          {selectedTranche && (
            <p className="mt-1 text-xs text-[#009FFF]">
              Tranche sélectionnée: {selectedTranche.nom}
            </p>
          )}
        </div>
      )}

      {projet && projet.nbre_blocs > 0 && (
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
              Aucun bloc disponible pour cette tranche.
            </div>
          ) : (
            <select
              value={formData.bloc_id || ''}
              onChange={(e) => handleChange("bloc_id", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.bloc_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Sélectionner un bloc</option>
              {filteredBlocs.map(bloc => (
                <option key={bloc.id} value={bloc.id}>{bloc.nom}</option>
              ))}
            </select>
          )}
          {errors.bloc_id && <p className="mt-1 text-sm text-red-600">{errors.bloc_id}</p>}
          {selectedBloc && (
            <p className="mt-1 text-xs text-[#009FFF]">
              Bloc sélectionné: {selectedBloc.nom}
            </p>
          )}
        </div>
      )}

      {projet && projet.nbre_immeubles > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Immeuble <span className="text-red-500">*</span>
          </label>
          {loadingImmeubles ? (
            <div className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-gray-500 text-sm">Chargement des immeubles...</span>
            </div>
          ) : !formData.bloc_id ? (
            <div className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 text-sm">
              Veuillez d'abord sélectionner un bloc
            </div>
          ) : filteredImmeubles.length === 0 ? (
            <div className="w-full rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-yellow-700 text-sm">
              Aucun immeuble disponible pour ce bloc.
            </div>
          ) : (
            <select
              value={formData.immeuble_id || ''}
              onChange={(e) => handleChange("immeuble_id", e.target.value)}
              className={`w-full px-3 py-2 border ${errors.immeuble_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">Sélectionner un immeuble</option>
              {filteredImmeubles.map(immeuble => (
                <option key={immeuble.id} value={immeuble.id}>{immeuble.nom}</option>
              ))}
            </select>
          )}
          {errors.immeuble_id && <p className="mt-1 text-sm text-red-600">{errors.immeuble_id}</p>}
          {selectedImmeuble && (
            <p className="mt-1 text-xs text-[#009FFF]">
              Immeuble sélectionné: {selectedImmeuble.nom}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de façades <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.nbre_facades || ''}
          onChange={(e) => handleChange("nbre_facades", e.target.value)}
          className={`w-full px-3 py-2 border ${errors.nbre_facades ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.nbre_facades && <p className="mt-1 text-sm text-red-600">{errors.nbre_facades[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prix unitaire (Dhs) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.prix_unitaire || ''}
          onChange={(e) => handleChange("prix_unitaire", e.target.value)}
          className={`w-full px-3 py-2 border ${errors.prix_unitaire ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.prix_unitaire && <p className="mt-1 text-sm text-red-600">{errors.prix_unitaire[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prix (Dhs)
        </label>
        <input
          type="number"
          value={formData.prix || ''}
          readOnly
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Avance minimale (Dhs) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.avance_minimale || ''}
          onChange={(e) => handleChange("avance_minimale", e.target.value)}
          className={`w-full px-3 py-2 border ${errors.avance_minimale ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.avance_minimale && <p className="mt-1 text-sm text-red-600">{errors.avance_minimale[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre foncier
        </label>
        <input
          type="text"
          value={formData.titre_foncier || ''}
          onChange={(e) => handleChange("titre_foncier", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          État <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.etat || 'disponible'}
          onChange={(e) => handleChange("etat", e.target.value)}
          className={`w-full px-3 py-2 border ${errors.etat ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        >
          {etatOptions.map(option => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
        {errors.etat && <p className="mt-1 text-sm text-red-600">{errors.etat[0]}</p>}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="conventionne"
          checked={formData.conventionne || false}
          onChange={(e) => handleChange("conventionne", e.target.checked)}
          className="h-4 w-4 text-[#009FFF] border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="conventionne" className="ml-2 block text-sm text-gray-700">
          Conventionné
        </label>
      </div>
    </div>
  </div>
);

// Render areas step
const renderAreasStep = () => (
  <div className="bg-white p-6 rounded-md shadow-sm">
    <h3 className="text-lg font-medium mb-6">Superficies du bien</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie habitable (m²) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.superficie_habitable || ''}
          onChange={(e) => handleChange("superficie_habitable", e.target.value)}
          className={`w-full px-3 py-2 border ${errors.superficie_habitable ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.superficie_habitable && <p className="mt-1 text-sm text-red-600">{errors.superficie_habitable[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie architecte (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_architecte || ''}
          onChange={(e) => handleChange("superficie_architecte", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie terrasse (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_terrasse || ''}
          onChange={(e) => handleChange("superficie_terrasse", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie terrasse calculée (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_terrasse_calculer || ''}
          readOnly
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie balcon (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_balcon || ''}
          onChange={(e) => handleChange("superficie_balcon", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie balcon calculée (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_balcon_calculer || ''}
          readOnly
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie jardin (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_jardin || ''}
          onChange={(e) => handleChange("superficie_jardin", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie jardin calculée (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_jardin_calculer || ''}
          readOnly
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie vendable (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_vendable || ''}
          readOnly
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie totale (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_total || ''}
          readOnly
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro parking
        </label>
        <input
          type="text"
          value={formData.num_parking || ''}
          onChange={(e) => handleChange("num_parking", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prix parking (Dhs)
        </label>
        <input
          type="number"
          value={formData.prix_parking || ''}
          onChange={(e) => handleChange("prix_parking", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie parking (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_parking || ''}
          onChange={(e) => handleChange("superficie_parking", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numéro box
        </label>
        <input
          type="text"
          value={formData.num_box || ''}
          onChange={(e) => handleChange("num_box", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prix box (Dhs)
        </label>
        <input
          type="number"
          value={formData.prix_box || ''}
          onChange={(e) => handleChange("prix_box", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie box (m²)
        </label>
        <input
          type="number"
          value={formData.superficie_box || ''}
          onChange={(e) => handleChange("superficie_box", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  </div>
);

// Render composition step
const renderCompositionStep = () => (
  <div className="bg-white p-6 rounded-md shadow-sm">
    <h3 className="text-lg font-medium mb-6">Composition du bien</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de chambres
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_chambres || 0}
          onChange={(e) => handleChange("nbre_chambres", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de salons
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_salons || 0}
          onChange={(e) => handleChange("nbre_salons", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de salles de bain
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_sdb || 0}
          onChange={(e) => handleChange("nbre_sdb", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de cuisines
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_cuisines || 0}
          onChange={(e) => handleChange("nbre_cuisines", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de terrasses
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_terasses || 0}
          onChange={(e) => handleChange("nbre_terasses", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de balcons
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_balcons || 0}
          onChange={(e) => handleChange("nbre_balcons", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de halls
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_halls || 0}
          onChange={(e) => handleChange("nbre_halls", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de réceptions
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_receptions || 0}
          onChange={(e) => handleChange("nbre_receptions", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de buanderies
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_buanderies || 0}
          onChange={(e) => handleChange("nbre_buanderies", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de placards
        </label>
        <input
          type="number"
          min="0"
          value={formData.nbre_placards || 0}
          onChange={(e) => handleChange("nbre_placards", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  </div>
);

return (
  <div className="container mx-auto bg-white rounded-lg shadow-md">
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{id ? "Modifier un bien" : "Ajouter un bien"}</h1>

      <ProjectStepper
        steps={steps}
        activeStep={activeStep}
      />

      <div className="mt-8">
        {renderStepContent()}
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={activeStep === 0 ? () => router.back() : handleBack}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          {activeStep === 0 ? "Annuler" : "Précédent"}
        </button>

        <button
          type="button"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {activeStep === steps.length - 1 ?
            (loading ? "Enregistrement..." : "Enregistrer") :
            "Suivant"}
        </button>
      </div>
    </div>
  </div>
);
}
