"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { useProjet } from '@/context/ProjetContext';
import CRMNavbar from '@/components/CRMNavbar';
import { 
  VISITE_INTERETS, 
  VISITE_STATUT_FORM, 
  VISITE_TYPE_NOTIF,
  MODE_FINANCE,
  MODE_PAIEMENT,
  ORIENTATIONS
} from '@/configs/enum';

export default function EditVisitePage({ params }) {
  const router = useRouter();
  const { visiteId } = params;
  const { selectedProjet } = useProjet();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [biens, setBiens] = useState([]);
  const [typeFreins, setTypeFreins] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [typologies, setTypologies] = useState([]);
  const [vues, setVues] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    selectedProjet: "",
    prospect_id: "",
    cin: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    telephone_num2: "",
    ville: "",
    notifie: 0,
    source_id: "",
    source_txt: "",
    partenaire_id: "",
    interet: "",
    date_relance: "",
    mode_relance: "",
    rdv: "",
    frein: [],
    tranches: [],
    etages: [],
    orientations: [],
    avance: "",
    typologies: [],
    vues: [],
    commentaire: "",
    prix_min: "",
    prix_max: "",
    sup_min: "",
    sup_max: "",
    bien_id: "",
    statut: "",
    description_autre: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Fetch resources and visite data
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

        // Fetch visite details
        const visiteRes = await axios.get(`${APIURL.VISITES}/${visiteId}`, { headers });
        const visiteData = visiteRes.data.visite;
        
        // Fetch sources
        const sourcesRes = await axios.get(`${APIURL.SOURCES}`, { headers });
        setSources(sourcesRes.data.sources || []);

        // Fetch partenaires for this project
        const partenairesRes = await axios.get(`${APIURL.PARTENAIRES}/projet/${selectedProjet.id}`, { headers });
        setPartenaires(partenairesRes.data.partenaires || []);

        // Fetch biens (properties) for this project
        const biensRes = await axios.get(`${APIURL.BIENS}/projet/${selectedProjet.id}`, { headers });
        setBiens(biensRes.data.biens || []);

        // Fetch type freins (obstacles)
        const typeFreinsRes = await axios.get(`${APIURL.TYPEFREINS}`, { headers });
        setTypeFreins(typeFreinsRes.data.typefreins || []);

        // Fetch tranches for this project
        const tranchesRes = await axios.get(`${APIURL.TRANCHES}/projet/${selectedProjet.id}`, { headers });
        setTranches(tranchesRes.data.tranches || []);

        // Fetch typologies
        const typologiesRes = await axios.get(`${APIURL.TYPOLOGIES}`, { headers });
        setTypologies(typologiesRes.data.typologies || []);

        // Fetch vues
        const vuesRes = await axios.get(`${APIURL.VUES}`, { headers });
        setVues(vuesRes.data.vues || []);

        // Format data for form fields
        setFormData({
          selectedProjet: selectedProjet.id,
          prospect_id: visiteData.prospect_id || "",
          cin: visiteData.cin || "",
          nom: visiteData.nom || "",
          prenom: visiteData.prenom || "",
          email: visiteData.email || "",
          telephone: visiteData.telephone || "",
          telephone_num2: visiteData.telephone_num2 || "",
          ville: visiteData.ville || "",
          notifie: visiteData.notifie || 0,
          source_id: visiteData.source?.id || "",
          source_txt: visiteData.source?.source || "",
          partenaire_id: visiteData.partenaire_id || "",
          interet: visiteData.interet?.toString() || "",
          date_relance: visiteData.date_relance ? new Date(visiteData.date_relance).toISOString().split('T')[0] : "",
          mode_relance: visiteData.mode_relance?.toString() || "",
          rdv: visiteData.rdv || "",
          frein: visiteData.frein || [],
          tranches: visiteData.tranches?.map(t => t.id) || [],
          etages: visiteData.etages || [],
          orientations: visiteData.orientations || [],
          avance: visiteData.avance || "",
          typologies: visiteData.typologies?.map(t => t.id) || [],
          vues: visiteData.vues?.map(v => v.id) || [],
          commentaire: visiteData.commentaire || "",
          prix_min: visiteData.prix_min || "",
          prix_max: visiteData.prix_max || "",
          sup_min: visiteData.sup_min || "",
          sup_max: visiteData.sup_max || "",
          bien_id: visiteData.bien_id || "",
          statut: visiteData.statut?.toString() || "",
          description_autre: visiteData.description_autre || "",
          date: visiteData.date ? new Date(visiteData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProjet, visiteId]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox/toggle changes
  const handleToggle = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle multiple select changes
  const handleMultipleSelect = (name, values) => {
    setFormData(prev => ({
      ...prev,
      [name]: values
    }));
  };

  // Handle interest change
  const handleInterestChange = (value) => {
    setFormData(prev => ({
      ...prev,
      interet: value,
      // Reset fields that are no longer needed based on the interest selection
      ...(value !== "1" && { bien_id: "", statut: "" }),
      ...(value !== "2" && { date_relance: "", mode_relance: "" }),
      ...(value !== "3" && { frein: [], description_autre: "", prix_min: "", prix_max: "", sup_min: "", sup_max: "", tranches: [], etages: [], orientations: [], typologies: [], vues: [] })
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`${APIURL.VISITES}/${visiteId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        router.push(`/CRM/Visites/${visiteId}`);
      }
    } catch (err) {
      console.error("Error updating visite:", err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de la visite");
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

  return (
    <div className="container mx-auto px-4">
      <CRMNavbar />

      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Modifier la visite</h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Client/Prospect Information */}
            <div className="col-span-3">
              <h2 className="text-lg font-medium border-b pb-2 mb-4">Informations du prospect</h2>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">CIN</label>
              <input
                type="text"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Téléphone 2</label>
              <input
                type="tel"
                name="telephone_num2"
                value={formData.telephone_num2}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Ville</label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Source</label>
              <select
                name="source_id"
                value={formData.source_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Sélectionner une source</option>
                {sources.map(source => (
                  <option key={source.id} value={source.id}>{source.source}</option>
                ))}
              </select>
            </div>

            {formData.source_txt === "Partenaire" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Partenaire</label>
                <select
                  name="partenaire_id"
                  value={formData.partenaire_id}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required={formData.source_txt === "Partenaire"}
                >
                  <option value="">Sélectionner un partenaire</option>
                  {partenaires.map(partenaire => (
                    <option key={partenaire.id} value={partenaire.id}>{partenaire.description}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.notifie === 1}
                  onChange={() => handleToggle('notifie', formData.notifie === 1 ? 0 : 1)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Accepte d'être contacté</span>
              </label>
            </div>

            {/* Visite Information */}
            <div className="col-span-3 mt-4">
              <h2 className="text-lg font-medium border-b pb-2 mb-4">Informations de la visite</h2>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Date de la visite</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
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

            {/* Same conditional fields based on interest as in the add page */}
            {/* ... */}

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
              onClick={() => router.push(`/CRM/Visites/${visiteId}`)}
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
