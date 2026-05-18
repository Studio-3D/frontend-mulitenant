"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { Box, SaveIcon, AlertCircleIcon, Loader, Trash2, Plus, CheckCircle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function LinkedInConfigTab() {
  const { user } = useAuth();
  const { projets } = useProjet();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [linkedInConfig, setLinkedInConfig] = useState({
    linkedin_page_id: "",
    linkedin_page_name: "",
    projet_id: "",
  });

  const [accessToken, setAccessToken] = useState(null);
  const [linkedInProfile, setLinkedInProfile] = useState(null);

  // Fetch existing LinkedIn configurations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        
        const configResponse = await axios.get(`${APIURL.ROOTV1}/linkedin-configurations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (configResponse.data && configResponse.data.configurations) {
          setConfigurations(configResponse.data.configurations);
        }
      } catch (error) {
        console.error("Error fetching LinkedIn data:", error);
        toast.error("Erreur lors du chargement des configurations LinkedIn");
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 1 || user.role === 2|| user.role === 10)) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLinkedInConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Start LinkedIn authentication
  const startLinkedInAuth = async () => {
    try {
      setIsAuthenticating(true);
      const token = localStorage.getItem("accessToken");
      localStorage.setItem('linkedin_admin_flow', 'true');
      
      const response = await axios.get(`${APIURL.ROOTV1}/linkedin-config/auth-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.setItem('linkedin_oauth_state', response.data.state);
        const authWindow = window.open(response.data.auth_url, 'linkedin-auth', 'width=600,height=700');

        const handleMessage = (event) => {
          if (event.origin !== window.location.origin) return;
          if (event.data.type === 'LINKEDIN_ADMIN_AUTH_SUCCESS') {
            setAccessToken(event.data.accessToken);
            setLinkedInProfile(event.data.profile);
            setIsAuthenticating(false);
            toast.success("Authentification LinkedIn réussie!");
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'LINKEDIN_ADMIN_AUTH_ERROR') {
            toast.error(`Erreur d'authentification: ${event.data.error}`);
            setIsAuthenticating(false);
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error("Error starting LinkedIn auth:", error);
      toast.error("Erreur lors de l'initialisation de l'authentification");
      setIsAuthenticating(false);
    }
  };

  // Save LinkedIn configuration
  const handleSaveLinkedIn = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      if (!linkedInConfig.linkedin_page_id || !linkedInConfig.linkedin_page_name || !linkedInConfig.projet_id || !accessToken) {
        toast.error("Veuillez remplir tous les champs et vous authentifier avec LinkedIn");
        return;
      }

      const dataToSave = {
        linkedin_page_id: linkedInConfig.linkedin_page_id,
        linkedin_page_name: linkedInConfig.linkedin_page_name,
        access_token: accessToken,
        projet_id: linkedInConfig.projet_id,
      };

      await axios.post(
        `${APIURL.ROOTV1}/linkedin-configurations`,
        dataToSave,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success("Configuration LinkedIn enregistrée avec succès");
      
      // Reset form and refresh configurations
      resetForm();
      setShowForm(false);
      
      // Refresh configurations list
      window.location.reload();
      
    } catch (error) {
      console.error("Error saving LinkedIn configuration:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement de la configuration LinkedIn");
    } finally {
      setSaving(false);
    }
  };

  // Delete LinkedIn configuration
  const handleDeleteConfiguration = async (configId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette configuration?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.ROOTV1}/linkedin-configurations/${configId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Configuration supprimée avec succès");
      
      // Refresh configurations list
      setConfigurations(prev => prev.filter(config => config.id !== configId));
      
    } catch (error) {
      console.error("Error deleting LinkedIn configuration:", error);
      toast.error("Erreur lors de la suppression de la configuration");
    }
  };

  const resetForm = () => {
    setLinkedInConfig({
      linkedin_page_id: "",
      linkedin_page_name: "",
      projet_id: "",
    });
    setAccessToken(null);
    setLinkedInProfile(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">Chargement des configurations LinkedIn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuration LinkedIn</h2>
          <p className="text-gray-600">Gérez vos configurations LinkedIn par projet</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-md hover:bg-[#004182]"
        >
          <Plus className="h-4 w-4" />
          Nouvelle configuration
        </button>
      </div>

      {/* Existing Configurations List */}
      {configurations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Configurations existantes</h3>
            <p className="mt-1 text-sm text-gray-600">Vos configurations LinkedIn par projet</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {configurations.map((config) => (
                <div key={config.id} className="border rounded-lg p-6">
                  {/* Configuration Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#0A66C2] rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {config.projet?.nom || 'Projet supprimé'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Page: {config.linkedin_page_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID: {config.linkedin_page_id}
                        </p>
                        <p className="text-xs text-gray-400">
                          Configuré le {new Date(config.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        config.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {config.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <button
                        onClick={() => handleDeleteConfiguration(config.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className="border-t pt-4">
                    <div className="bg-[#E7F3FF] p-3 rounded-md">
                      <h4 className="text-sm font-medium text-[#0A66C2] mb-2">
                        Analytics et Statistiques
                      </h4>
                      <p className="text-xs text-[#0A66C2]">
                        Les statistiques des publications sont collectées automatiquement toutes les 5 minutes. 
                        Consultez l'onglet Analytics pour voir les performances de vos posts LinkedIn.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="bg-[#E7F3FF] border-l-4 border-[#0A66C2] p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircleIcon className="h-5 w-5 text-[#0A66C2]" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-[#0A66C2]">
                  Comment configurer l&apos;intégration LinkedIn
                </h3>
                <div className="mt-2 text-sm text-[#0A66C2] space-y-1">
                  <p>
                    Pour intégrer LinkedIn à votre projet, vous avez besoin de:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 mt-2">
                    <li><strong>Projet à associer</strong>: Sélectionnez le projet immobilier</li>
                    <li><strong>Authentification LinkedIn</strong>: Connectez-vous à votre compte</li>
                    <li><strong>ID de la Page LinkedIn</strong>: Identifiant de votre page d'entreprise</li>
                    <li><strong>Nom de la Page</strong>: Nom d'affichage de votre page</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium">Guide de configuration LinkedIn</h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-700">
                  <strong>1. Créer une Page LinkedIn Entreprise :</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Connectez-vous à LinkedIn</li>
                  <li>Cliquez sur &quot;Produits&quot; puis &quot;Créer une page Entreprise&quot;</li>
                  <li>Choisissez le type d'entreprise approprié</li>
                  <li>Remplissez les informations de votre entreprise</li>
                  <li>Ajoutez un logo et une image de couverture</li>
                </ul>

                <p className="text-gray-700 mt-4">
                  <strong>2. Obtenir l&apos;ID de la Page :</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Allez sur votre page LinkedIn Entreprise</li>
                  <li>Regardez l&apos;URL: linkedin.com/company/[ID]</li>
                  <li>L&apos;ID est le numéro après &quot;/company/&quot;</li>
                  <li>Ou utilisez les outils développeur LinkedIn</li>
                </ul>

                <p className="text-gray-700 mt-4">
                  <strong>3. Permissions requises :</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Vous devez être administrateur de la page</li>
                  <li>Accès w_member_social pour publier du contenu</li>
                  <li>Application LinkedIn Developer configurée</li>
                  <li>URL de redirection autorisée</li>
                </ul>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 text-xs">
                    <strong>💡 Astuce :</strong> Assurez-vous que votre application LinkedIn 
                    a les bonnes permissions et que l&apos;URL de redirection est correctement configurée.
                  </p>
                </div>

                <p className="text-blue-600 mt-3">
                  <a
                    href="https://docs.microsoft.com/en-us/linkedin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:underline"
                  >
                    <Box className="h-4 w-4 mr-1" />
                    Documentation LinkedIn API
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Authentification LinkedIn</h3>
              
              {!accessToken ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    Connectez-vous à LinkedIn pour accéder à vos pages d'entreprise
                  </p>
                  <button
                    onClick={startLinkedInAuth}
                    disabled={isAuthenticating}
                    className="flex items-center gap-2 mx-auto px-6 py-3 bg-[#0A66C2] text-white rounded-md hover:bg-[#004182] disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Authentification...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Se connecter à LinkedIn
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">
                        Connecté à LinkedIn
                      </h4>
                      <p className="text-sm text-green-700">
                        {linkedInProfile?.name || linkedInProfile?.given_name || 'Utilisateur LinkedIn'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Nouvelle Configuration LinkedIn</h3>
            <div className="max-w-2xl space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Projet à associer *
                </label>
                <select
                  name="projet_id"
                  value={linkedInConfig.projet_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A66C2] focus:border-[#0A66C2]"
                  required
                >
                  <option value="">Sélectionner un projet</option>
                  {projets
                    .filter(projet => !configurations.some(config => config.projet_id === projet.id))
                    .map((projet) => (
                      <option key={projet.id} value={projet.id}>
                        {projet.nom}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500">
                  Sélectionnez le projet immobilier à associer à cette page LinkedIn
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  ID de la Page LinkedIn *
                </label>
                <input
                  type="text"
                  name="linkedin_page_id"
                  value={linkedInConfig.linkedin_page_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A66C2] focus:border-[#0A66C2]"
                  placeholder="Ex: 12345678"
                  required
                />
                <p className="text-xs text-gray-500">
                  L&apos;identifiant numérique de votre page LinkedIn Entreprise (obligatoire)
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Nom de la Page LinkedIn *
                </label>
                <input
                  type="text"
                  name="linkedin_page_name"
                  value={linkedInConfig.linkedin_page_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A66C2] focus:border-[#0A66C2]"
                  placeholder="Ex: Mon Entreprise Immobilière"
                  required
                />
                <p className="text-xs text-gray-500">
                  Le nom d&apos;affichage de votre page LinkedIn (obligatoire)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveLinkedIn}
                  disabled={saving || !linkedInConfig.linkedin_page_id || !linkedInConfig.linkedin_page_name || !linkedInConfig.projet_id || !accessToken}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-md hover:bg-[#004182] disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4" />
                      Enregistrer la configuration
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>

          {/* Types de contenu section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Types de contenu supportés</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">✅ Supporté</h4>
                <ul className="text-sm !text-green-700 space-y-1">
                  <li>• Images (JPEG, PNG, GIF)</li>
                  <li>• Texte avec liens</li>
                  <li>• Articles et posts professionnels</li>
                  <li>• Hashtags et mentions</li>
                  <li>• Partage de liens externes</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Limitations</h4>
                <ul className="text-sm !text-yellow-700 space-y-1">
                  <li>• Pas de support vidéo direct</li>
                  <li>• Images limitées à 20MB</li>
                  <li>• Nécessite permissions d'administration</li>
                  <li>• Rate limits API strictes</li>
                  <li>• Contenu soumis aux règles LinkedIn</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Info Section - Updated */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircleIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm !text-blue-700">
                  Chaque configuration LinkedIn est associée à un projet spécifique. 
                  Les statistiques des publications (vues, likes, commentaires, partages) 
                  sont collectées automatiquement toutes les 5 minutes via l'API LinkedIn.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}