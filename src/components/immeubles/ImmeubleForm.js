"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import toast from "react-hot-toast";
import Link from "next/link";
import LoadingSpin from "@/components/LoadingSpin";
import BreadCrumb from "@/app/(dashboard)/navigation/BreadCrumb";
import Button from "../Button";
import InputSelect from "../inputSelect";
import { useProjet } from "@/context/ProjetContext";
import { fetchDataByProjet_params } from "@/configs/api-utils";
import Input from "../Input";

export default function ImmeubleForm({ id, projetId, blocId, trancheId }) {
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
  const selectedProjet = JSON.parse(
    localStorage.getItem("selectedProjet") || "{}"
  );
  const defaultValues = {
    nom: "",
    bloc_id: blocId || "",
    tranche_id: trancheId || "",
    titre_foncier: "",
    nbre_biens: 0,
    projet_id: selectedProjet?.id,
  };

  const handleselectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [formData, setFormData] = useState(defaultValues);
  const isEditing = !!id;

  // Fetch immeuble data if editing
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      const fetchImmeubleData = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.IMMEUBLES}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data && response.data.immeuble) {
            setLoading(false);
            const immeuble = response.data.immeuble;
            setFormData({
              nom: immeuble.nom || "",
              bloc_id: immeuble.bloc_id || "",
              tranche_id: immeuble.bloc?.tranche_id || "",
              titre_foncier: immeuble.titre_foncier || "",
              nbre_biens: immeuble.nbre_biens || 0,
              projet_id: immeuble.projet_id || selectedProjet?.id,
            });

            if (immeuble.tranche) {
              setSelectedTranche(immeuble.tranche);
            }
            // If the immeuble has a bloc, store it for display
            if (immeuble.bloc) {
              setSelectedBloc(immeuble.bloc);
            }
          }
        } catch (error) {
          setLoading(false);
          console.error("Failed to fetch immeuble:", error);
          toast.error("Erreur lors du chargement de l'immeuble");
        }
      };

      fetchImmeubleData();
    } else if (blocId) {
      // If creating a new immeuble with a pre-selected bloc, set it in form data
      setFormData((prev) => ({
        ...prev,
        bloc_id: blocId,
      }));

      // We'll need to fetch the bloc to get its tranche_id
    }
  }, [id, isEditing, selectedProjet?.id, blocId]);

  // Fetch tranches for the project
  useEffect(() => {
    if (!isEditing) {
      if (
        selectedProjet.nbre_tranches !== 0 &&
        !trancheId &&
        !formData.tranche_id
      ) {
        fetchDataByProjet_params("tranches", setTranches, setLoadingTranches);
      }

      if (selectedProjet.nbre_blocs !== 0 && !formData.tranche_id) {
        if (!blocId && trancheId && selectedProjet.nbre_tranches !== 0) {
          fetchDataByProjet_params("blocs", setBlocs, setLoadingBlocs, {
            tranche_id: trancheId,
          });
        } else if (!blocId && selectedProjet.nbre_tranches === 0) {
          fetchDataByProjet_params("blocs", setBlocs, setLoadingBlocs);
        }
      }
      if (selectedProjet.nbre_blocs !== 0 && formData.tranche_id && !blocId) {
        fetchDataByProjet_params("blocs", setBlocs, setLoadingBlocs, {
          tranche_id: formData.tranche_id,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocId, trancheId, formData.tranche_id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // For tranche selection, also update the selected tranche object and reset bloc
    if (name === "tranche_id") {
      const selectedTrancheObj = tranches.find(
        (t) => t.id.toString() === value.toString()
      );
      setSelectedTranche(selectedTrancheObj || null);

      // Reset bloc selection if tranche changes
      if (value !== formData.tranche_id) {
        setFormData((prev) => ({
          ...prev,
          bloc_id: "",
        }));
        setSelectedBloc(null);
      }
    }

    // For bloc selection, also update the selected bloc object
    if (name === "bloc_id" && value) {
      const selectedBlocObj = filteredBlocs.find(
        (b) => b.id.toString() === value.toString()
      );
      setSelectedBloc(selectedBlocObj || null);
    }

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.nom) {
      errors.nom = "Le nom de l'immeuble est requis";
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
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(
        `L'immeuble a été ${isEditing ? "modifié" : "créé"} avec succès`
      );

      // Navigate back to the project details page with immeubles tab active
      if (selectedProjet?.id) {
        router.push(router.back());
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
        toast.error(
          "Une erreur s'est produite lors de la soumission du formulaire"
        );
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
          baseUrl={
            selectedProjet?.id
              ? `/Projets/${selectedProjet.id}?tab=immeubles`
              : "/Projets"
          }
          step={`${id ? "Modifier" : "Ajouter"} un immeuble`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Nom"
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              error={validationErrors.nom || backendErrors.nom}
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
            {isEditing && selectedProjet.nbre_blocs !== 0 && (
              <Input
                label="Bloc"
                value={selectedBloc?.nom}
                fullWidth
                size="small"
                variant="outlined"
                disabled={true}
              />
            )}
            {/* {!isEditing && selectedProjet.nbre_tranches!==0 &&!trancheId&& (
            <InputSelect
              label="Tranche"
              options={tranches.map(t => ({ label: t.nom, value: t.id }))}
              value={formData.tranche_id}
              onChange={(option) => handleselectChange("tranche_id", option?.value || null)}
              error={validationErrors.tranche_id || backendErrors.tranche_id}
              isLoading={loadingTranches}
              required
            />
          )} */}
            {!isEditing &&
              (selectedProjet.nbre_tranches !== 0 && !trancheId && !blocId ? (
                <InputSelect
                  label="Tranche"
                  options={tranches.map((t) => ({ label: t.nom, value: t.id }))}
                  value={formData.tranche_id}
                  onChange={(option) => {
                    handleselectChange("tranche_id", option?.value || null);
                    //handleChange('bloc_id','') // ta deuxième action ici
                  }}
                  error={
                    validationErrors.tranche_id || backendErrors.tranche_id
                  }
                  isLoading={loadingTranches}
                  required
                />
              ) : selectedProjet.nbre_tranches === 0 &&
                selectedProjet.nbre_blocs !== 0 &&
                !blocId ? (
                <InputSelect
                  label="Bloc"
                  options={blocs.map((t) => ({ label: t.nom, value: t.id }))}
                  value={formData.bloc_id}
                  onChange={(option) =>
                    handleselectChange("bloc_id", option?.value || null)
                  }
                  error={validationErrors.bloc_id || backendErrors.bloc_id}
                  isLoading={loadingBlocs}
                  required
                />
              ) : null)}

            {!isEditing &&
              (!formData.tranche_id &&
              selectedProjet.nbre_tranches !== 0 &&
              selectedProjet.nbre_blocs !== 0 &&
              !blocId &&
              !trancheId ? (
                <Input
                  label="Bloc"
                  disabled={true}
                  value="Veuillez d'abord sélectionner une tranche"
                />
              ) : (formData.tranche_id || trancheId) &&
                selectedProjet.nbre_tranches !== 0 &&
                selectedProjet.nbre_blocs !== 0 &&
                !blocId ? (
                <InputSelect
                  label="Bloc"
                  options={blocs.map((t) => ({ label: t.nom, value: t.id }))}
                  value={formData.bloc_id}
                  onChange={(option) =>
                    handleselectChange("bloc_id", option?.value || null)
                  }
                  error={validationErrors.bloc_id || backendErrors.bloc_id}
                  isLoading={loadingBlocs}
                  required
                />
              ) : null)}

            {/* Titre foncier */}
            <Input
              label={"Titre foncier"}
              type="text"
              name="titre_foncier"
              value={formData.titre_foncier}
              onChange={handleChange}
            />

            {/* Nombre de biens */}
            <Input
              label={"Nombre de biens "}
              type="number"
              name="nbre_biens"
              value={formData.nbre_biens}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} loading={loading}>
              {loading ? "Chargement..." : id ? "Modifier" : "Ajouter"}
            </Button>
          </div>

          {/* Form actions */}
        </form>
      </div>
    </div>
  );
}
