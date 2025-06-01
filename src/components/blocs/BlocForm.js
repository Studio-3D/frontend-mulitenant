"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import toast from "react-hot-toast";
import Link from "next/link";
import LoadingSpin from '@/components/LoadingSpin';
import BreadCrumb from "@/app/(dashboard)/navigation/BreadCrumb";
import Button from "../Button";
import InputSelect from "../inputSelect";
import Input from "../Input";
import { fetchDataByProjet_params } from "@/configs/api-utils";

export default function BlocForm({ id, projetId, trancheId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [tranches, setTranches] = useState([]);
  const [loadingTranches, setLoadingTranches] = useState(false);
  const [selectedTranche, setSelectedTranche] = useState(null);
  
  // Get selected project from localStorage if not provided via props
  const selectedProjet = projetId ? 
    { id: projetId } : 
    JSON.parse(localStorage.getItem("selectedProjet") || "{}");

  const defaultValues = {
    nom: "",
    tranche_id: trancheId || "",
    titre_foncier: "",
    nbre_immeubles: 0,
    nbre_biens: 0,
    projet_id: selectedProjet?.id
  };

  const [formData, setFormData] = useState(defaultValues);
  const isEditing = !!id;

  // Fetch bloc data if editing
  useEffect(() => {
    if (isEditing) {
      setLoading(true)
      const fetchBlocData = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.BLOCS}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data && response.data.bloc) {
            setLoading(false)
            const bloc = response.data.bloc;
            setFormData({
              nom: bloc.nom || "",
              tranche_id: bloc.tranche_id || "",
              titre_foncier: bloc.titre_foncier || "",
              nbre_immeubles: bloc.nbre_immeubles || 0,
              nbre_biens: bloc.nbre_biens || 0,
              projet_id: bloc.projet_id || selectedProjet?.id
            });
            
            // If the bloc has a tranche, store it for display
            if (bloc.tranche) {
              setSelectedTranche(bloc.tranche);
            }
          }
        } catch (error) {
          setLoading(false)
          console.error("Failed to fetch bloc:", error);
          toast.error("Erreur lors du chargement du bloc");
        }
      };
      
      fetchBlocData();
    } else if (trancheId) {
      // If creating a new bloc with a pre-selected tranche, set it in form data
      setFormData(prev => ({
        ...prev,
        tranche_id: trancheId
      }));
    }
  }, [id, isEditing, selectedProjet?.id, trancheId]);

  // Always fetch tranches for the project, regardless of nbre_tranches
  useEffect(() => {
    if (selectedProjet?.id) {
      if (selectedProjet.nbre_tranches!==0 &&  tranches.length===0 && !trancheId)  {
        fetchDataByProjet_params('tranches', setTranches, setLoadingTranches);
      }
      
    }
  }, [selectedProjet?.id,  trancheId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // For tranche selection, also update the selected tranche object
    if (name === 'tranche_id' && value) {
      const selectedTrancheObj = tranches.find(t => t.id.toString() === value.toString());
      setSelectedTranche(selectedTrancheObj || null);
    }
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

 const handleselectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };



  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.nom) {
      errors.nom = "Le nom du bloc est requis";
    }
    
    // Only require tranche if there are tranches available
    if (tranches.length > 0 && !formData.tranche_id) {
      errors.tranche_id = "La tranche est requise";
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
    let url = APIURL.BLOCS;
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

      toast.success(`Le bloc a été ${isEditing ? "modifié" : "créé"} avec succès`);
      
      // Navigate back to the project details page with blocs tab active
      if (selectedProjet?.id) {
        router.push(`/Projets/${selectedProjet.id}?tab=blocs`);
      } else {
        router.push("/Projets");
      }
    } catch (error) {
      console.error("Failed to save bloc:", error);
      
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
  if (isEditing && loading) {
      return (
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpin /> 
          </div>
        );
  }
  


  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={selectedProjet?.id ? `/Projets/${selectedProjet.id}?tab=blocs` : "/Projets"}
          step={`${id ? "Modifier" : "Ajouter"} un bloc`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
  
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Nom */}
              <Input
                label="Nom"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                error={validationErrors.nom || (backendErrors.nom )}
                required
              />
              
          {isEditing && selectedProjet.nbre_tranches !== 0 && (
              
                <Input
                  label="Tranche"
                  value={selectedTranche?.nom}
                  fullWidth
                  size="small"
                  variant="outlined"
                  disabled={true}
                  

                />
              
            )}
            {!isEditing && selectedProjet.nbre_tranches!==0 && !trancheId && (
              <InputSelect
                label="Tranche"
                options={tranches.map(t => ({ label: t.nom, value: t.id }))}
                value={formData.tranche_id}
                onChange={(option) => handleselectChange("tranche_id", option?.value || null)}
                error={validationErrors.tranche_id || backendErrors.tranche_id}
                isLoading={loadingTranches}
                required
              />
            )}

         
         
            <Input
              label={'Titre foncier'}
              type="text"
              name="titre_foncier"
              value={formData.titre_foncier}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              error={validationErrors.titre_foncier || backendErrors.titre_foncier}
              
            />

          {/* Nombre d'immeubles - only show if project has immeubles */}
          {selectedProjet.nbre_immeubles > 0 && (
            <Input
              label={'Nombre d\'immeuble'}
              type="number"
              name="nbre_immeubles"
              value={formData.nbre_immeubles}
              onChange={handleChange}
            />
        )}

          {/* Nombre de biens */}
           <Input
              label={'Nombre de biens '}
              type="number"
              name="nbre_biens"
              value={formData.nbre_biens}
              onChange={handleChange}
            />
        </div>

        {/* Form actions */}
        <div className="flex justify-center gap-4 items-center mt-6 mb-6">
          <Button type="button" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}  loading={loading}>
            {loading ? "Chargement..." : id ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </div>
    </div>
  );
}
