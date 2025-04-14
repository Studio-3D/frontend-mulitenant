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

export default function AddVisitePage() {
  const router = useRouter();
  const { selectedProjet } = useProjet();
  const [loading, setLoading] = useState(false);
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

  // Fetch resources
  useEffect(() => {
    if (!selectedProjet) {
      setError("Veuillez sélectionner un projet pour ajouter une visite");
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

  // Fetch prospect by CIN
  const handleCINLookup = async () => {
    if (formData.cin.length < 3) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.ROOT}/v1/search_prospect_by_param/cin/${formData.cin}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { prospect } = response.data;
      
      if (prospect) {
        setFormData(prev => ({
          ...prev,
          prospect_id: prospect.id || "",
          nom: prospect.nom || "",
          prenom: prospect.prenom || "",
          email: prospect.email || "",
          telephone: prospect.telephone || "",
          telephone_num2: prospect.telephone_num2 || "",
          ville: prospect.ville || "",
          notifie: prospect.notifie || 0,
          source_id: prospect.source?.id || "",
          source_txt: prospect.source?.source || "",
          partenaire_id: prospect.partenaire_id || ""
        }));
      }
    } catch (err) {
      console.error("Error fetching prospect:", err);
    } finally {
      setLoading(false);
    }
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
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(APIURL.VISITES, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201 || response.status === 200) {
        router.push('/CRM/Visites');
      }
    } catch (err) {
      console.error("Error creating visite:", err);
      setError(err.response?.data?.message || "Erreur lors de la création de la visite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <CRMNavbar />

      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Ajouter une visite</h1>
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

            {/* Conditional fields based on interest */}
            {formData.interet === "1" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Bien</label>
                  <select
                    name="bien_id"
                    value={formData.bien_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required={formData.interet === "1"}
                  >
                    <option value="">Sélectionner un bien</option>
                    {biens.map(bien => (
                      <option key={bien.id} value={bien.id}>{bien.propriete_dite_bien}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Statut</label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required={formData.interet === "1"}
                  >
                    <option value="">Sélectionner un statut</option>
                    {Object.values(VISITE_STATUT_FORM).map(statut => (
                      <option key={statut.code} value={statut.code}>{statut.label}</option>
                    ))}
                  </select>
                </div>

                {formData.statut === "1" && (
                  <>
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
                  </>
                )}
              </>
            )}

            {formData.interet === "2" && (
              <>
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
              </>
            )}

            {formData.interet === "3" && (
              <>
                <div className="space-y-2 col-span-3">
                  <label className="block text-sm font-medium mb-2">Freins</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {typeFreins.map(frein => (
                      <label key={frein.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.frein.includes(frein.description.toUpperCase())}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const freinDesc = frein.description.toUpperCase();
                            setFormData(prev => ({
                              ...prev,
                              frein: checked 
                                ? [...prev.frein, freinDesc]
                                : prev.frein.filter(f => f !== freinDesc)
                            }));
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{frein.description}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.frein.includes("AUTRE") && (
                  <div className="space-y-2 col-span-3">
                    <label className="block text-sm font-medium">Description autre frein</label>
                    <textarea
                      name="description_autre"
                      value={formData.description_autre}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      rows="3"
                      required={formData.frein.includes("AUTRE")}
                    />
                  </div>
                )}

                {formData.frein.includes("PRIX") && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Prix Min</label>
                      <input
                        type="number"
                        name="prix_min"
                        value={formData.prix_min}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                        required={formData.frein.includes("PRIX")}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Prix Max</label>
                      <input
                        type="number"
                        name="prix_max"
                        value={formData.prix_max}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                        required={formData.frein.includes("PRIX")}
                      />
                    </div>
                  </>
                )}

                {formData.frein.includes("SUPERFICIE") && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Superficie Min</label>
                      <input
                        type="number"
                        name="sup_min"
                        value={formData.sup_min}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                        required={formData.frein.includes("SUPERFICIE")}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Superficie Max</label>
                      <input
                        type="number"
                        name="sup_max"
                        value={formData.sup_max}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md"
                        required={formData.frein.includes("SUPERFICIE")}
                      />
                    </div>
                  </>
                )}

                {/* Additional conditional fields for other frein types would go here */}
              </>
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
              onClick={() => router.push('/CRM/Visites')}
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
