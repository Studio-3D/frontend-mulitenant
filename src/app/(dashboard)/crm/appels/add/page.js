"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { useProjet } from '@/context/ProjetContext';
import CRMNavbar from '@/components/CRMNavbar';
import { VISITE_INTERETS } from '@/configs/enum';

// Define types of calls enum
const TYPES_APPELS = {
  1: { code: 1, label: 'Entrant' },
  2: { code: 2, label: 'Sortant' }
};

export default function AddAppelPage() {
  const router = useRouter();
  const { selectedProjet } = useProjet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  const [cinLookupInfo, setCinLookupInfo] = useState(null);
  const [showProspectInfo, setShowProspectInfo] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    selectedProjet: "",
    prospect_id: "",
    cin: "",
    nom: "",
    prenom: "",
    telephone: "",
    telephone_num2: "",
    ville: "",
    type_appel: "",
    source_id: "",
    source_txt: "",
    partenaire_id: "",
    interet: "",
    commentaire: ""
  });

  // Fetch resources
  useEffect(() => {
    if (!selectedProjet) {
      setError("Veuillez sélectionner un projet pour ajouter un appel");
      return;
    }

    const fetchResources = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch sources
        const sourcesRes = await axios.get(`${APIURL.SOURCES}`, { headers });
        setSources(sourcesRes.data.sources || []);

        // Fetch partenaires for this project
        const partenairesRes = await axios.get(`${APIURL.PARTENAIRES}/projet/${selectedProjet.id}`, { headers });
        setPartenaires(partenairesRes.data.partenaires || []);

        setFormData(prev => ({
          ...prev,
          selectedProjet: selectedProjet.id
        }));

      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedProjet]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch prospect by CIN
  const handleCINLookup = async () => {
    if (formData.cin.length < 3) return;
    
    setLoading(true);
    setCinLookupInfo(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.ROOT}/v1/search_prospect_by_param/cin/${formData.cin}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { prospect, client } = response.data;
      const prospectData = prospect || (client ? client.prospect : null);
      
      if (prospectData) {
        setFormData(prev => ({
          ...prev,
          prospect_id: prospectData.id || "",
          nom: prospectData.nom || "",
          prenom: prospectData.prenom || "",
          telephone: prospectData.telephone || "",
          telephone_num2: prospectData.telephone_num2 || "",
          ville: prospectData.ville || "",
          source_id: prospectData.source?.id || "",
          source_txt: prospectData.source?.source || "",
          partenaire_id: prospectData.partenaire_id || ""
        }));
        
        // Show prospect info dialog
        setCinLookupInfo({
          nom: prospectData.nom,
          prenom: prospectData.prenom,
          isClient: !!client,
          hasAppels: (prospectData.appels && prospectData.appels.length > 0),
          hasVisites: (prospectData.visites && prospectData.visites.length > 0),
          appelId: prospectData.appels?.length > 0 ? prospectData.appels[0].id : null,
          visiteId: prospectData.visites?.length > 0 ? prospectData.visites[0].id : null
        });
        setShowProspectInfo(true);
      }
    } catch (err) {
      console.error("Error fetching prospect:", err);
    } finally {
      setLoading(false);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(APIURL.APPELS, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201 || response.status === 200) {
        router.push('/CRM/Appels');
      }
    } catch (err) {
      console.error("Error creating appel:", err);
      setError(err.response?.data?.message || "Erreur lors de la création de l'appel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <CRMNavbar />

      {/* Prospect info dialog */}
      {showProspectInfo && cinLookupInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Information Prospect</h3>
            
            <p className="mb-2">
              <span className="font-medium">Nom & Prénom:</span> {cinLookupInfo.nom} {cinLookupInfo.prenom}
            </p>
            
            <p className="mb-2">
              <span className="font-medium">Statut:</span> {cinLookupInfo.isClient ? 'Client' : 'Prospect'}
            </p>
            
            {cinLookupInfo.hasAppels && (
              <p className="mb-2 flex items-center">
                <span className="font-medium mr-2">A déjà fait un Appel</span>
                <button
                  onClick={() => window.open(`/CRM/Appels/${cinLookupInfo.appelId}`, '_blank')}
                  className="text-[#009FFF] hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </p>
            )}
            
            {cinLookupInfo.hasVisites && (
              <p className="mb-4 flex items-center">
                <span className="font-medium mr-2">A déjà fait une Visite</span>
                <button
                  onClick={() => window.open(`/CRM/Visites/${cinLookupInfo.visiteId}`, '_blank')}
                  className="text-green-600 hover:text-green-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </p>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowProspectInfo(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Ajouter un appel</h1>
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
              <div className="flex">
                <input
                  type="text"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  onBlur={handleCINLookup}
                  className="w-full p-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={handleCINLookup}
                  className="ml-2 p-2 bg-gray-200 rounded-md"
                  disabled={formData.cin.length < 3}
                >
                  Vérifier
                </button>
              </div>
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
              <label className="block text-sm font-medium">Projet</label>
              <input
                type="text"
                value={selectedProjet?.nom || ""}
                className="w-full p-2 border rounded-md bg-gray-100"
                readOnly
              />
            </div>

            {/* Appel Information */}
            <div className="col-span-3 mt-4">
              <h2 className="text-lg font-medium border-b pb-2 mb-4">Informations de l'appel</h2>
            </div>

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
              <label className="block text-sm font-medium">Source</label>
              <select
                name="source_id"
                value={formData.source_id}
                onChange={(e) => {
                  handleChange(e);
                  // Find the selected source
                  const selectedSource = sources.find(s => s.id.toString() === e.target.value);
                  if (selectedSource) {
                    setFormData(prev => ({
                      ...prev,
                      source_txt: selectedSource.source
                    }));
                  }
                }}
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
              <label className="block text-sm font-medium">Intérêt</label>
              <select
                name="interet"
                value={formData.interet}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Sélectionner un niveau d'intérêt</option>
                {Object.values(VISITE_INTERETS).map(interet => (
                  <option key={interet.code} value={interet.code}>{interet.label}</option>
                ))}
              </select>
            </div>

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
              onClick={() => router.push('/CRM/Appels')}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
