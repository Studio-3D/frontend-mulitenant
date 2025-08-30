"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL } from "@/configs/api";
import toast from "react-hot-toast";
import LoadingSpin from "@/components/LoadingSpin";
import BreadCrumb from "@/app/(dashboard)/navigation/BreadCrumb";
import Button from "../Button";
import InputSelect from "../inputSelect";
import Input from "../Input";
import { fetchDataByProjet_params } from "@/configs/api-utils";

export default function BlocForm({ id, projetId, trancheId }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [tranches, setTranches] = useState([]);
  const [loadingTranches, setLoadingTranches] = useState(false);
  const [selectedTranche, setSelectedTranche] = useState(null);
  const hasFetchedInitialData = useRef(false);
  const isSubmittingRef = useRef(false);

  // Get selected project from localStorage
  const selectedProjet = JSON.parse(
    localStorage.getItem("selectedProjet") || "{}"
  );

  const defaultValues = {
    nom: "",
    tranche_id: trancheId || "",
    titre_foncier: "",
    nbre_immeubles: 0,
    nbre_biens: 0,
    projet_id: selectedProjet?.id,
  };

  const [formData, setFormData] = useState(defaultValues);
  const isEditing = !!id;

  const fetchBlocData = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.BLOCS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.bloc) {
        const bloc = response.data.bloc;
        setFormData({
          nom: bloc.nom || "",
          tranche_id: bloc.tranche_id || "",
          titre_foncier: bloc.titre_foncier || "",
          nbre_immeubles: bloc.nbre_immeubles || 0,
          nbre_biens: bloc.nbre_biens || 0,
          projet_id: bloc.projet_id || selectedProjet?.id,
        });

        if (bloc.tranche) {
          setSelectedTranche(bloc.tranche);
        }
      }
    } catch (error) {
      console.error("Failed to fetch bloc:", error);
      toast.error("Erreur lors du chargement du bloc");
    } finally {
      setIsLoading(false);
    }
  }, [id, selectedProjet?.id]);

  // Fetch bloc data if editing
  useEffect(() => {
    if (isEditing && id && !hasFetchedInitialData.current) {
      setIsLoading(true);
      hasFetchedInitialData.current = true;
      fetchBlocData();
    } else if (trancheId && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      setFormData((prev) => ({
        ...prev,
        tranche_id: trancheId,
      }));
    }
  }, [id, isEditing, trancheId]);

  // Fetch tranches for the project
  useEffect(() => {
    if (
      selectedProjet?.id &&
      selectedProjet.nbre_tranches !== 0 &&
      tranches.length === 0 &&
      !trancheId
    ) {
      fetchDataByProjet_params("tranches", setTranches, setLoadingTranches);
    }
  }, [selectedProjet?.id, trancheId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "tranche_id" && value) {
      const selectedTrancheObj = tranches.find(
        (t) => t.id.toString() === value.toString()
      );
      setSelectedTranche(selectedTrancheObj || null);
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleselectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field when a value is selected
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Also clear backend errors for this field
    if (backendErrors[field]) {
      setBackendErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom) {
      errors.nom = "Le nom du bloc est requis";
    }

    if (tranches.length > 0 && !formData.tranche_id) {
      errors.tranche_id = "La tranche est requise";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmittingRef.current) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    isSubmittingRef.current = true;
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
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`Bloc ${isEditing ? "modifié" : "créé"} avec succès`);

      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => {
        if (selectedProjet.nbre_tranches !== 0 && trancheId) {
          router.push(`/Tranches/${trancheId}?tab=blocs`);
        } else if (selectedProjet?.id) {
          router.push(`/Projets/${selectedProjet.id}?tab=blocs`);
        } else {
          router.push("/Projets");
        }
      }, 100);
    } catch (error) {
      console.error("Failed to save bloc:", error);

      const response = error.response;
      if (response?.status === 422) {
        setBackendErrors(response.data.errors || {});
      } else {
        toast.error(
          "Une erreur s'est produite lors de la soumission du formulaire"
        );
      }
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancel = () => {
    if (selectedProjet?.id) {
      router.push(`/Projets/${selectedProjet.id}?tab=blocs`);
    } else {
      router.push("/Projets");
    }
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={
            selectedProjet?.id
              ? `/Projets/${selectedProjet.id}?tab=blocs`
              : "/Projets"
          }
          step={`${id ? "Modifier" : "Ajouter"} un bloc`}
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
                disabled={true}
              />
            )}

            {!isEditing && selectedProjet.nbre_tranches !== 0 && !trancheId && (
              <InputSelect
                label="Tranche"
                options={tranches.map((t) => ({ label: t.nom, value: t.id }))}
                value={formData.tranche_id}
                onChange={(option) =>
                  handleselectChange("tranche_id", option?.value || null)
                }
                error={validationErrors.tranche_id || backendErrors.tranche_id}
                isLoading={loadingTranches}
                required
              />
            )}

            <Input
              label="Titre foncier"
              type="text"
              name="titre_foncier"
              value={formData.titre_foncier}
              onChange={handleChange}
              error={
                validationErrors.titre_foncier || backendErrors.titre_foncier
              }
            />

            {selectedProjet.nbre_immeubles > 0 && (
              <Input
                label="Nombre d'immeuble"
                type="number"
                name="nbre_immeubles"
                value={formData.nbre_immeubles}
                onChange={handleChange}
              />
            )}

            <Input
              label="Nombre de biens"
              type="number"
              name="nbre_biens"
              value={formData.nbre_biens}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={handleCancel}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  {isEditing ? "Modification en cours..." : "Ajout en cours..."}
                </>
              ) : id ? (
                "Modifier"
              ) : (
                "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
