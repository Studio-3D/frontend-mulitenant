"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { APIURL, ENDPOINTS } from "@/configs/api";
import toast from "react-hot-toast";
import { useProjet } from "@/context/ProjetContext";
import Button from "@/components/Button";
import BreadCrumb from "../../navigation/BreadCrumb";
import LoadingSpin from "@/components/LoadingSpin";

export default function ObjectifForm({ id = null }) {
  const router = useRouter();
  const { selectedProjet } = useProjet();

  const [loading, setLoading] = useState(id ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    user_id: "",
    projet_id: selectedProjet?.id,
    visites: { semaine: 0, mois: 0, jours: 0 },
    appels: { semaine: 0, mois: 0, jours: 0 },
    reservations: { semaine: 0, mois: 0, jours: 0 },
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedProjet) return;

      setFetchingUsers(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `${APIURL.ROOTV1}/commerciaux_objectif/${selectedProjet.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Erreur lors du chargement des utilisateurs");
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [selectedProjet]);

  // Fetch objectif data if editing
  useEffect(() => {
    if (!id || !selectedProjet) return;

    const fetchObjectif = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.OBJECTIFS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const objectif = response.data.objectif;

        setFormData({
          user_id: objectif.user_id || "",
          projet_id: objectif.projet_id || selectedProjet.id,
          visites: objectif.visites || { semaine: 0, mois: 0, jours: 0 },
          appels: objectif.appels || { semaine: 0, mois: 0, jours: 0 },
          reservations: objectif.reservations || {
            semaine: 0,
            mois: 0,
            jours: 0,
          },
        });
        setUser(objectif.user);
      } catch (error) {
        console.error("Error fetching objectif:", error);
        toast.error("Erreur lors du chargement de l'objectif");
        router.push("/administration/objectifs");
      } finally {
        setLoading(false);
      }
    };

    fetchObjectif();
  }, [id, selectedProjet, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMetricChange = (metricType, field, value) => {
    setFormData({
      ...formData,
      [metricType]: {
        ...formData[metricType],
        [field]: parseFloat(value) || 0,
      },
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_id && !id) {
      newErrors.user_id = "Veuillez sélectionner un utilisateur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const method = id ? "put" : "post";
      const url = id ? `${APIURL.OBJECTIFS}/${id}` : APIURL.OBJECTIFS;

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`Objectif ${id ? "modifié" : "créé"} avec succès`);
      router.push(ENDPOINTS.OBJECTIFS);
    } catch (error) {
      console.error("Error submitting objectif:", error);

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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={ENDPOINTS.OBJECTIFS}
          step={`${id ? "Modifier" : "Ajouter"} un objectif`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          {/* User selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium !text-gray-700 mb-1">
              Commercial <span className="text-red-500">*</span>
            </label>
            {id ? (
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                value={
                  user.name+' '+user.prenom || "Utilisateur non trouvé"
                }
                disabled
              />
            ) : (
              <div>
                <select
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.user_id ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={formData.user_id}
                  onChange={handleChange}
                  name="user_id"
                  disabled={fetchingUsers}
                >
                  <option value="">Sélectionner un commercial</option>
                  {users.map((userItem) => (
                    <option key={userItem.user_id} value={userItem.user_id}>
                      {userItem.user?.name} {userItem.user?.prenom}
                    </option>
                  ))}
                </select>
                {errors.user_id && (
                  <p className="mt-1 text-sm !text-red-600">{errors.user_id}</p>
                )}
                {fetchingUsers && (
                  <p className="mt-1 text-sm !text-blue-500">
                    Chargement des utilisateurs...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Visites section */}
          <div className="mb-6">
            <div className="bg-blue-50 p-3 rounded-t-md border-l-4 border-blue-500">
              <h3 className="font-medium !text-blue-700">Visites</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 mb-6">
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Jours
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.visites.jours}
                  onChange={(e) =>
                    handleMetricChange("visites", "jours", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Semaine
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.visites.semaine}
                  onChange={(e) =>
                    handleMetricChange("visites", "semaine", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Mois
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.visites.mois}
                  onChange={(e) =>
                    handleMetricChange("visites", "mois", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Appels section */}
          <div className="mb-6">
            <div className="bg-blue-50 p-3 rounded-t-md border-l-4 border-blue-500">
              <h3 className="font-medium !text-blue-700">Appels</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 mb-6">
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Jours
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.appels.jours}
                  onChange={(e) =>
                    handleMetricChange("appels", "jours", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Semaine
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.appels.semaine}
                  onChange={(e) =>
                    handleMetricChange("appels", "semaine", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Mois
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.appels.mois}
                  onChange={(e) =>
                    handleMetricChange("appels", "mois", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Reservations section */}
          <div className="mb-6">
            <div className="bg-blue-50 p-3 rounded-t-md border-l-4 border-blue-500">
              <h3 className="font-medium text-blue-700">Réservations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 mb-6">
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Jours
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.reservations.jours}
                  onChange={(e) =>
                    handleMetricChange("reservations", "jours", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Semaine
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.reservations.semaine}
                  onChange={(e) =>
                    handleMetricChange(
                      "reservations",
                      "semaine",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Mois
                </label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.reservations.mois}
                  onChange={(e) =>
                    handleMetricChange("reservations", "mois", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Submit and Cancel buttons */}
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
