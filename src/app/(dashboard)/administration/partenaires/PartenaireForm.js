"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL, ENDPOINTS } from "@/configs/api";
import toast from "react-hot-toast";
import { useProjet } from "@/context/ProjetContext";
import BreadCrumb from "../../navigation/BreadCrumb";
import Button from "@/components/Button";

export default function PartenaireForm({ id = null, onComplete }) {
  const router = useRouter();
  const [loading, setLoading] = useState(id ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const { selectedProjet } = useProjet();

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    remise: "",
    projet_id: selectedProjet?.id || "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Fetch partenaire data if editing
  useEffect(() => {
    if (!id) return;

    const fetchPartenaire = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.PARTENAIRES}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const partenaire = response.data.partenaire;
        setFormData({
          description: partenaire.description || "",
          remise: partenaire.remise || "",
          projet_id: partenaire.projet_id || selectedProjet?.id || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching partenaire:", error);
        toast.error("Erreur lors du chargement du partenaire");
        if (onComplete) onComplete();
      }
    };

    fetchPartenaire();
  }, [id, selectedProjet, onComplete]);

  useEffect(() => {
    // Update projet_id in form when selectedProjet changes
    if (selectedProjet) {
      setFormData((prev) => ({ ...prev, projet_id: selectedProjet.id }));
    }
  }, [selectedProjet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
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
      const method = id ? "put" : "post";
      const url = id ? `${APIURL.PARTENAIRES}/${id}` : APIURL.PARTENAIRES;

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`Partenaire ${id ? "modifié" : "créé"} avec succès`);

      // Ensure we wait for the toast before navigating
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    } catch (error) {
      console.error("Error submitting partenaire:", error);

      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        toast.error("Une erreur est survenue lors de l'enregistrement");
      }
    } finally {
      setSubmitting(false);
    }
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
          baseUrl={ENDPOINTS.PARTENAIRES}
          step={`${id ? "Modifier" : "Ajouter"} un partenaire`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block !text-gray-700 text-sm font-bold mb-2">
              Partenaire <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Saisir la description"
            />
            {errors.description && (
              <p className="text-red-500 text-xs italic">
                {typeof errors.description === "string"
                  ? errors.description
                  : errors.description[0]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block !text-gray-700 text-sm font-bold mb-2">
              Remise (%)
            </label>
            <input
              type="number"
              name="remise"
              min="0"
              max="100"
              step="0.01"
              value={formData.remise}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.remise ? "border-red-500" : "border-gray-300"
              } rounded w-full py-2 px-3 !text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Saisir la remise"
            />
            {errors.remise && (
              <p className="text-red-500 text-xs italic">
                {typeof errors.remise === "string"
                  ? errors.remise
                  : errors.remise[0]}
              </p>
            )}
          </div>

          <input type="hidden" name="projet_id" value={formData.projet_id} />

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
}
