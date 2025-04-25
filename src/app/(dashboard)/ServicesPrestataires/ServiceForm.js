"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL, ENDPOINTS } from "@/configs/api";
import toast from "react-hot-toast";
import { useProjet } from "@/context/ProjetContext";
import Button from "@/components/Button";
import BreadCrumb from "../navigation/BreadCrumb";

export default function ServiceForm({ id = null, onComplete }) {
  const router = useRouter();
  const [loading, setLoading] = useState(id ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const { selectedProjet } = useProjet();

  // Form state
  const [formData, setFormData] = useState({
    nom: "",
    
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Fetch service data if editing
  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.ServicesPrestataires}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const service = response.data.service;
        setFormData({
          nom: service.nom || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching service:", error);
        toast.error("Erreur lors du chargement du service");
        if (onComplete) onComplete();
      }
    };

    fetchService();
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

    if (!formData.nom.trim()) {
      newErrors.nom = "La nom est requise";
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
      const url = id ? `${APIURL.SERVICE}/${id}` : APIURL.SERVICE;

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`Service ${id ? "modifié" : "créé"} avec succès`);

      // Ensure we wait for the toast before navigating
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    } catch (error) {
      console.error("Error submitting service:", error);

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
          baseUrl={ENDPOINTS.ServicesPrestataires}
          step={`${id ? "Modifier" : "Ajouter"} un service`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Service <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.nom ? "border-red-500" : "border-gray-300"
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Saisir la nom"
            />
            {errors.nom && (
              <p className="text-red-500 text-xs italic">
                {typeof errors.nom === "string"
                  ? errors.nom
                  : errors.nom[0]}
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
}
