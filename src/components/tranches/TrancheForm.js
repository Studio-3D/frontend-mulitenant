"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL, ENDPOINTS } from "@/configs/api";
import toast from "react-hot-toast";
import Link from "next/link";
import LoadingSpin from "@/components/LoadingSpin";
import BreadCrumb from "@/app/(dashboard)/navigation/BreadCrumb";
import Button from "../Button";

export default function TrancheForm({ id, projet }) {
  const router = useRouter();
  const [loading_btn, setLoading_btn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Get selected project from localStorage if not provided via props
  const selectedProjet = projet
    ? {
        id: projet?.id,
        nbre_blocs: projet?.nbre_blocs,
        nbre_immeubles: projet?.nbre_immeubles,
      }
    : JSON.parse(localStorage.getItem("selectedProjet") || "{}");

  const defaultValues = {
    nom: "",
    date_lancement: "",
    date_livraison: "",
    niveau_etages: "",
    nbre_blocs: 0,
    nbre_immeubles: 0,
    nbre_biens: 0,
    projet_id: selectedProjet?.id,
  };

  const [formData, setFormData] = useState(defaultValues);
  const isEditing = !!id;

  // Fetch tranche data if editing
  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      const fetchTrancheData = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`${APIURL.TRANCHES}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data && response.data.tranche) {
            setLoading(false);

            const tranche = response.data.tranche;
            setFormData({
              nom: tranche.nom || "",
              date_lancement: tranche.date_lancement || "",
              date_livraison: tranche.date_livraison || "",
              niveau_etages: tranche.niveau_etages || "",
              nbre_biens: tranche.nbre_biens || 0,
              nbre_blocs: tranche.nbre_blocs || 0,
              nbre_immeubles: tranche.nbre_immeubles || 0,
              projet_id: tranche.projet_id || selectedProjet?.id,
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

    setLoading_btn(true);
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
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`Tranche ${isEditing ? "modifiée" : "créée"} avec succès`);

      // Navigate back to the project details page with tranches tab active
      if (selectedProjet?.id) {
        localStorage.setItem(
          `project-${selectedProjet.id}-activeTab`,
          "tranche"
        );
        router.push(`/Projets/${selectedProjet.id}`);
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
        toast.error(
          "Une erreur s'est produite lors de la soumission du formulaire"
        );
      }
    } finally {
      setLoading_btn(false);
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
            selectedProjet?.id ? `/Projets/${selectedProjet.id}` : "/Projets"
          }
          onNavigate={() => {
            if (selectedProjet?.id) {
              localStorage.setItem(
                `project-${selectedProjet.id}-activeTab`,
                "tranche"
              );
            }
          }}
          step={`${id ? "Modifier" : "Ajouter"} une tranche`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium !text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    validationErrors.nom || backendErrors.nom
                      ? "border-red-500"
                      : "border-gray-300"
                  } px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                {(validationErrors.nom || backendErrors.nom) && (
                  <p className="mt-1 text-sm !text-red-500">
                    {validationErrors.nom ||
                      (backendErrors.nom && backendErrors.nom[0])}
                  </p>
                )}
              </div>
            </div>

            {/* Date Lancement */}
            <div>
              <label className="block text-sm font-medium !text-gray-700 mb-1">
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
              <label className="block text-sm font-medium !text-gray-700 mb-1">
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
              <label className="block text-sm font-medium !text-gray-700 mb-1">
                Niveau {"d'"}étages
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
            {selectedProjet?.nbre_blocs != 0 && (
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
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
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Nombre{"d'"}immeubles
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
              <label className="block text-sm font-medium !text-gray-700 mb-1">
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
          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" loading={loading_btn}>
              {loading_btn ? "Chargement..." : id ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
