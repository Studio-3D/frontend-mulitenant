"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { APIURL } from "@/configs/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useSociete } from "@/context/SocieteContext";
import { useProjet } from "@/context/ProjetContext";
import { Settings, Plus, Trash2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { isAdmin, isSuperAdmin } from "@/configs/enum";

export default function LinkedInConfigTab() {
  const { user } = useAuth();
  const { selectedSociete } = useSociete();
  const { projets } = useProjet();
  
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // LinkedIn auth states
  const [linkedInPages, setLinkedInPages] = useState([]);
  const [linkedInProfile, setLinkedInProfile] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  
  // Form states
  const [selectedProjet, setSelectedProjet] = useState("");
  const [selectedPage, setSelectedPage] = useState("");
  const [manualPageId, setManualPageId] = useState("");
  const [manualPageName, setManualPageName] = useState("");

  // Check if user has admin privileges
  const canManageLinkedIn = isAdmin(user?.role) || isSuperAdmin(user?.role);

  useEffect(() => {
    if (canManageLinkedIn && selectedSociete) {
      fetchConfigurations();
    }
  }, [canManageLinkedIn, selectedSociete]);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.ROOTV1}/linkedin-config`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setConfigurations(response.data.configurations);
      }
    } catch (error) {
      console.error("Error fetching LinkedIn configurations:", error);
      // Don't show error toast for 401s as it might trigger logout
      if (error.response?.status !== 401) {
        toast.error("Erreur lors du chargement des configurations");
      }
    } finally {
      setLoading(false);
    }
  };

  const startLinkedInAuth = async () => {
    try {
      setIsAuthenticating(true);
      const token = localStorage.getItem("accessToken");
      
      // Protect against token deletion during LinkedIn auth
      const originalToken = token;
      
      // Set flag to indicate this is an admin configuration flow
      localStorage.setItem('linkedin_admin_flow', 'true');
      
      const response = await axios.get(`${APIURL.ROOTV1}/linkedin-config/auth-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const authWindow = window.open(
          response.data.auth_url,
          'linkedin-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Poll for window closure and handle callback
        const checkClosed = setInterval(async () => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            setIsAuthenticating(false);
            // Ensure token is still there
            if (!localStorage.getItem("accessToken") && originalToken) {
              localStorage.setItem("accessToken", originalToken);
            }
          }
        }, 1000);

        // Handle message from auth window
        const handleMessage = async (event) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'LINKEDIN_ADMIN_AUTH_SUCCESS') {
            setAccessToken(event.data.accessToken);
            setLinkedInProfile(event.data.profile);
            setLinkedInPages(event.data.pages);
            setIsAuthenticating(false);
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            toast.success("Authentification LinkedIn réussie!");
          } else if (event.data.type === 'LINKEDIN_ADMIN_AUTH_ERROR') {
            toast.error(`Erreur d'authentification: ${event.data.error}`);
            setIsAuthenticating(false);
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);
        
        // Cleanup
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          if (!authWindow.closed) {
            authWindow.close();
            setIsAuthenticating(false);
          }
          // Clean up admin flow flag even if auth fails
          localStorage.removeItem('linkedin_admin_flow');
        }, 300000); // 5 minutes timeout
      }
    } catch (error) {
      console.error("Error starting LinkedIn auth:", error);
      toast.error("Erreur lors de l'initialisation de l'authentification LinkedIn. Vérifiez que l'URL de redirection est configurée.");
      setIsAuthenticating(false);
      localStorage.removeItem('linkedin_admin_flow');
    }
  };

  const saveConfiguration = async () => {
    if (!selectedProjet || !accessToken) {
      toast.error("Veuillez sélectionner un projet et vous authentifier avec LinkedIn");
      return;
    }
    
    if (!manualPageId || !manualPageName) {
      toast.error("Veuillez saisir l'ID et le nom de la page LinkedIn");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(`${APIURL.ROOTV1}/linkedin-config`, {
        projet_id: selectedProjet,
        linkedin_page_id: manualPageId,
        linkedin_page_name: manualPageName,
        access_token: accessToken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Configuration LinkedIn enregistrée avec succès");
        setIsModalOpen(false);
        resetForm();
        fetchConfigurations();
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const deleteConfiguration = async (configId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette configuration?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.delete(`${APIURL.ROOTV1}/linkedin-config/${configId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Configuration supprimée avec succès");
        fetchConfigurations();
      }
    } catch (error) {
      console.error("Error deleting configuration:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setSelectedProjet("");
    setSelectedPage("");
    setManualPageId("");
    setManualPageName("");
    setAccessToken(null);
    setLinkedInPages([]);
    setLinkedInProfile(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (!canManageLinkedIn) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Accès non autorisé
              </h3>
              <p className="mt-2 text-sm text-red-700">
                Vous devez être administrateur pour gérer les configurations LinkedIn.
              </p>
            </div>
          </div>
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
          <p className="text-gray-600">
            Configurez les pages LinkedIn pour chaque projet
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-md hover:bg-[#004182]"
        >
          <Plus className="w-4 h-4" />
          Nouvelle configuration
        </button>
      </div>

      {/* Configurations list */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : configurations.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucune configuration
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par configurer LinkedIn pour vos projets.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {configurations.map((config) => (
                <div
                  key={config.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {config.projet?.nom}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Page: {config.linkedin_page_name}
                      </p>
                      <div className="flex items-center mt-1">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">
                          Configuré
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteConfiguration(config.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configurer LinkedIn"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={saveConfiguration}
              disabled={!selectedProjet || !manualPageId || !manualPageName || !accessToken}
              className="px-4 py-2 bg-[#0A66C2] text-white rounded-md hover:bg-[#004182] disabled:opacity-50"
            >
              Enregistrer
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Step 1: LinkedIn Authentication */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              1. Authentification LinkedIn
            </h3>
            
            {!accessToken ? (
              <div className="text-center py-6">
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
                      {linkedInProfile?.name || 'Utilisateur LinkedIn'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Manual LinkedIn Page Entry */}
          {accessToken && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                2. Informations de la page LinkedIn
              </h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Votre application LinkedIn n'a pas accès aux pages d'entreprise. 
                  Veuillez saisir manuellement les informations de votre page LinkedIn.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID de la page LinkedIn *
                </label>
                <input
                  type="text"
                  value={manualPageId}
                  onChange={(e) => setManualPageId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 12345678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Vous pouvez trouver l'ID dans l'URL de votre page LinkedIn d'entreprise
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la page LinkedIn *
                </label>
                <input
                  type="text"
                  value={manualPageName}
                  onChange={(e) => setManualPageName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Mon Entreprise"
                />
              </div>
            </div>
          )}

          {/* Step 3: Select Project */}
          {accessToken && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                3. Associer à un projet
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projet
                </label>
                <select
                  value={selectedProjet}
                  onChange={(e) => setSelectedProjet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                {projets.filter(projet => !configurations.some(config => config.projet_id === projet.id)).length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Tous les projets ont déjà une configuration LinkedIn
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}