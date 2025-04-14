"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { useProjet } from '@/context/ProjetContext';
import CRMNavbar from '@/components/CRMNavbar';
import { VISITE_INTERETS, VISITE_TYPE_NOTIF, ORIENTATIONS } from '@/configs/enum';

// Define types of calls enum
const TYPES_APPELS = {
  1: { code: 1, label: 'Entrant' },
  2: { code: 2, label: 'Sortant' }
};

export default function EditAppelPage({ params }) {
  const router = useRouter();
  const { traitementId } = params;
  const { selectedProjet } = useProjet();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [typeFreins, setTypeFreins] = useState([]);
  const [traitementData, setTraitementData] = useState(null);
  const [appel, setAppel] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type_appel: "",
    interet: "",
    date_relance: "",
    mode_relance: "",
    rdv: "",
    freins: [],
    commentaire: "",
    description_autre: "",
  });

  // Fetch traitement data and resources
  useEffect(() => {
    if (!selectedProjet) {
      setError("Veuillez sélectionner un projet");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch traitement details
        const traitementRes = await axios.get(`${APIURL.ROOT}/v1/get_traitement_appel/${traitementId}`, { headers });
        const traitementData = traitementRes.data.traitement;
        setTraitementData(traitementData);

        // Fetch appel details
        const appelRes = await axios.get(`${APIURL.APPELS}/${traitementData.appel_id}`, { headers });
        setAppel(appelRes.data.appel);

        // Fetch freins
        const typeFreinsRes = await axios.get(`${APIURL.TYPEFREINS}`, { headers });
        setTypeFreins(typeFreinsRes.data.typefreins || []);

        // Format data for form fields
        setFormData({
          type_appel: traitementData.type_appel?.toString() || "",
          interet: traitementData.interet?.toString() || "",
          date_relance: traitementData.date_relance ? new Date(traitementData.date_relance).toISOString().split('T')[0] : "",
          mode_relance: traitementData.mode_relance?.toString() || "",
          rdv: traitementData.rdv || "",
          freins: traitementData.freins || [],
          commentaire: traitementData.commentaire || "",
          description_autre: traitementData.description_autre || ""
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProjet, traitementId]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle interest change
  const handleInterestChange = (value) => {
    setFormData(prev => ({
      ...prev,
      interet: value,
      // Reset fields that are no longer needed based on the interest selection
      ...(value !== "1" && { rdv: "" }),
      ...(value !== "2" && { date_relance: "", mode_relance: "" }),
      ...(value !== "3" && { freins: [], description_autre: "" })
    }));
  };

  // Handle checkbox selection for freins
  const handleFreinChange = (freinDesc, checked) => {
    setFormData(prev => ({
      ...prev,
      freins: checked
        ? [...prev.freins, freinDesc.toUpperCase()]
        : prev.freins.filter(f => f !== freinDesc.toUpperCase())
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`${APIURL.ROOT}/v1/update_traitement_appel/${traitementId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        router.push(`/CRM/Appels/${appel.id}`);
      }
    } catch (err) {
      console.error("Error updating appel:", err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de l'appel");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <CRMNavbar />
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!traitementData || !appel) {
    return (
      <div className="container mx-auto px-4">
        <CRMNavbar />
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error || "Données non trouvées"}</p>
          </div>
          <div className="mt-4">
            <button 
              onClick={() => router.push('/CRM/Appels')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <CRMNavbar />

      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Modifier l'appel</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-medium mb-2">Informations du prospect</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nom & Prénom</p>
              <p className="font-medium">{appel.prospect?.nom} {appel.prospect?.prenom}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">CIN</p>
              <p className="font-medium">{appel.prospect?.cin || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Téléphone</p>
              <p className="font-medium">{appel.prospect?.telephone || '-'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Appel Information */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Type d'appel</label>
              <select
                name="type_appel"
                value={formData.type_appel}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Sélectionner un type</option>
                {Object.values(TYPES_APPELS).map(type => (
                  <option key={type.code} value={type.code}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Intérêt</label>
              <select
                name="interet"
                value={formData.interet}
                onChange={(e) => {
                  handleChange(e);
                  handleInterestChange(e.target.value);
                }}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Sélectionner un niveau d'intérêt</option>
                {Object.values(VISITE_INTERETS).map(interet => (
                  <option key={interet.code} value={interet.code}>{interet.label}</option>
                ))}
              </select>
            </div>

            {/* Conditional fields based on interest */}
            {formData.interet === "1" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">RDV</label>
                <input
                  type="datetime-local"
                  name="rdv"
                  value={formData.rdv}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            )}

            {(formData.interet === "1" || formData.interet === "2") && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Date de relance</label>
                  <input
                    type="date"
                    name="date_relance"
                    value={formData.date_relance}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Mode de relance</label>
                  <select
                    name="mode_relance"
                    value={formData.mode_relance}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Sélectionner un mode</option>
                    {Object.values(VISITE_TYPE_NOTIF).map(mode => (
                      <option key={mode.code} value={mode.code}>{mode.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {formData.interet === "3" && (
              <div className="space-y-2 col-span-3">
                <label className="block text-sm font-medium mb-2">Freins</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {typeFreins.map(frein => (
                    <label key={frein.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.freins.includes(frein.description.toUpperCase())}
                        onChange={(e) => handleFreinChange(frein.description, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">{frein.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.freins && formData.freins.includes("AUTRE") && (
              <div className="space-y-2 col-span-3">
                <label className="block text-sm font-medium">Description autre frein</label>
                <textarea
                  name="description_autre"
                  value={formData.description_autre}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  required={formData.freins.includes("AUTRE")}
                />
              </div>
            )}

            <div className="space-y-2 col-span-3">
              <label className="block text-sm font-medium">Commentaire</label>
              <textarea
                name="commentaire"
                value={formData.commentaire}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                rows="3"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push(`/CRM/Appels/${appel.id}`)}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
