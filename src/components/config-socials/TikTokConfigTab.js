"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { APIURL } from '@/configs/api';
import { Video, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { useProjet } from '@/context/ProjetContext';

export function TikTokConfigTab() {
  const [loading, setLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState("");

  // Use projet context
  const { projets } = useProjet();

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.ROOTV1}/tiktok-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setConfigurations(response.data.configurations);
      }
    } catch (error) {
      console.error("Error fetching TikTok configurations:", error);
      toast.error("Erreur lors du chargement des configurations");
    } finally {
      setLoading(false);
    }
  };

  const startTikTokAuth = async () => {
    try {
      setIsAuthenticating(true);
      const token = localStorage.getItem("accessToken");
      localStorage.setItem('tiktok_admin_flow', 'true');
      
      const response = await axios.get(`${APIURL.ROOTV1}/tiktok/auth-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        localStorage.setItem('tiktok_oauth_state', response.data.state);
        const authWindow = window.open(response.data.auth_url, 'tiktok-auth', 'width=600,height=700');

        const handleMessage = (event) => {
          if (event.origin !== window.location.origin) return;
          if (event.data.type === 'TIKTOK_AUTH_SUCCESS') {
            setAccessToken(event.data.access_token);
            setIsAuthenticating(false);
            toast.success("Authentification TikTok réussie!");
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'TIKTOK_AUTH_ERROR') {
            toast.error(`Erreur d'authentification: ${event.data.error}`);
            setIsAuthenticating(false);
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error("Error starting TikTok auth:", error);
      toast.error("Erreur lors de l'initialisation de l'authentification");
      setIsAuthenticating(false);
    }
  };

  const saveConfiguration = async () => {
    if (!selectedProjet || !accessToken) {
      toast.error("Veuillez sélectionner un projet et vous authentifier avec TikTok");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(`${APIURL.ROOTV1}/tiktok-config`, {
        projet_id: selectedProjet,
        access_token: accessToken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Configuration TikTok enregistrée avec succès!");
        fetchConfigurations();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving TikTok configuration:", error);
      toast.error("Erreur lors de l'enregistrement de la configuration");
    }
  };

  const deleteConfiguration = async (configId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette configuration?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.delete(`${APIURL.ROOTV1}/tiktok-config/${configId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Configuration supprimée avec succès!");
        fetchConfigurations();
      }
    } catch (error) {
      console.error("Error deleting TikTok configuration:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setSelectedProjet("");
    setAccessToken(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Configurations List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Configurations TikTok</h3>
            <p className="mt-1 text-sm text-gray-600">Gérez vos configurations TikTok par projet</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#FF0050] text-white rounded-md hover:bg-[#E6004A] flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une configuration
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : configurations.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucune configuration TikTok</p>
              <p className="text-sm text-gray-400 mt-1">
                Créez votre première configuration pour commencer à publier sur TikTok
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {configurations.map((config) => (
                <div key={config.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Video className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{config.projet?.nom || 'Projet supprimé'}</p>
                      <p className="text-sm text-gray-500">
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
                      onClick={() => deleteConfiguration(config.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                      title="Supprimer"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-amber-800">Informations importantes</h4>
            <div className="mt-2 text-sm text-amber-700">
              <ul className="list-disc list-inside space-y-1">
                <li>TikTok a des restrictions strictes sur le contenu immobilier</li>
                <li>Assurez-vous que vos publications respectent les conditions d'utilisation</li>
                <li>Les vidéos sont plus performantes que les images sur TikTok</li>
                <li>Utilisez des descriptions engageantes et des hashtags pertinents</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Nouvelle configuration TikTok</h3>
              <p className="mt-1 text-sm text-gray-600">Configurez TikTok pour un projet spécifique</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">1. Sélectionner un projet</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Projet immobilier</label>
                  <select
                    value={selectedProjet}
                    onChange={(e) => setSelectedProjet(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">Sélectionner un projet</option>
                    {projets.length === 0 ? (
                      <option disabled>Aucun projet disponible</option>
                    ) : (
                      projets.map((projet) => (
                        <option key={projet.id} value={projet.id}>{projet.nom}</option>
                      ))
                    )}
                  </select>
                  {projets.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Aucun projet trouvé. Vérifiez que vous avez des projets créés.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">2. Authentification TikTok</h4>
                {!accessToken ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Connectez-vous à TikTok pour autoriser la publication de contenu.
                    </p>
                    <button
                      onClick={startTikTokAuth}
                      disabled={isAuthenticating}
                      className="flex items-center px-4 py-2 bg-[#FF0050] text-white rounded-md hover:bg-[#E6004A] disabled:opacity-50"
                    >
                      {isAuthenticating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4 mr-2" />
                          Se connecter à TikTok
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Connecté à TikTok</p>
                      <p className="text-sm text-green-600">Prêt à configurer la publication automatique</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={saveConfiguration}
                disabled={!selectedProjet || !accessToken}
                className="px-4 py-2 bg-[#FF0050] text-white rounded-md hover:bg-[#E6004A] disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}