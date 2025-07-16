"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { Box, SaveIcon, AlertCircleIcon, Loader, Trash2, Plus, CheckCircle, Settings, Globe } from "lucide-react";
import toast from "react-hot-toast";

export default function InstagramConfigTab() {
  const { user } = useAuth();
  const { projets } = useProjet();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [showWebhookForm, setShowWebhookForm] = useState(null);
  const [instagramConfig, setInstagramConfig] = useState({
    instagram_id: "",
    acces_token_user: "",
    projet_id: "",
  });
  const [webhookConfig, setWebhookConfig] = useState({
    webhook_verify_token: "",
  });

  // Fetch existing Instagram configurations and webhooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        
        // Fetch configurations
        const configResponse = await axios.get(`${APIURL.ROOTV1}/instagram-configurations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (configResponse.data && configResponse.data.configurations) {
          setConfigurations(configResponse.data.configurations);
        }

        // Fetch webhooks
        const webhookResponse = await axios.get(`${APIURL.ROOTV1}/instagram-webhooks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (webhookResponse.data && webhookResponse.data.webhooks) {
          setWebhooks(webhookResponse.data.webhooks);
        }
      } catch (error) {
        console.error("Error fetching Instagram data:", error);
        toast.error("Erreur lors du chargement des configurations Instagram");
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 1 || user.role === 2)) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInstagramConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save Instagram configuration
  const handleSaveInstagram = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      if (!instagramConfig.instagram_id || !instagramConfig.acces_token_user || !instagramConfig.projet_id) {
        toast.error("Veuillez remplir tous les champs");
        return;
      }

      const dataToSave = {
        instagram_id: instagramConfig.instagram_id,
        acces_token_user: instagramConfig.acces_token_user,
        projet_id: instagramConfig.projet_id,
      };

      await axios.post(
        `${APIURL.ROOTV1}/instagram-configurations`,
        dataToSave,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Verify configuration after saving
      await verifyInstagramConfiguration();
      
      // Subscribe Instagram account to webhook after successful configuration
      await subscribeInstagramToWebhook(instagramConfig.instagram_id, instagramConfig.acces_token_user);
      
      toast.success("Configuration Instagram enregistrée avec succès");
      
      // Reset form and refresh configurations
      setInstagramConfig({
        instagram_id: "",
        acces_token_user: "",
        projet_id: "",
      });
      setShowForm(false);
      
      // Refresh configurations list
      window.location.reload();
      
    } catch (error) {
      console.error("Error saving Instagram configuration:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement de la configuration Instagram");
    } finally {
      setSaving(false);
    }
  };

  // Subscribe Instagram account to webhook
  const subscribeInstagramToWebhook = async (instagramId, accessToken) => {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${instagramId}/subscribed_apps`,
        {
          subscribed_fields: ["comments", "mentions"]
        },
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data.success) {
        console.log("Instagram account successfully subscribed to webhook");
        toast.success("Compte Instagram abonné aux webhooks avec succès");
      } else {
        console.warn("Instagram subscription response:", response.data);
        toast.warning("Abonnement webhook Instagram partiellement configuré");
      }
    } catch (error) {
      console.error("Error subscribing Instagram to webhook:", error);
      toast.error("Erreur lors de l'abonnement aux webhooks Instagram");
    }
  };

  // Delete Instagram configuration
  const handleDeleteConfiguration = async (configId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette configuration?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.ROOTV1}/instagram-configurations/${configId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Configuration supprimée avec succès");
      
      // Refresh configurations list
      setConfigurations(prev => prev.filter(config => config.id !== configId));
      
    } catch (error) {
      console.error("Error deleting Instagram configuration:", error);
      toast.error("Erreur lors de la suppression de la configuration");
    }
  };

  // Verify Instagram configuration
  const verifyInstagramConfiguration = async () => {
    if (instagramConfig.instagram_id && instagramConfig.acces_token_user) {
      try {
        const instaResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${instagramConfig.instagram_id}?access_token=${instagramConfig.acces_token_user}`
        );
        if (instaResponse.data && instaResponse.data.id) {
          toast.success("✅ Configuration Instagram vérifiée");
        }
      } catch (error) {
        console.error("Instagram verification failed:", error);
        toast.error("❌ Erreur de configuration Instagram: Token invalide ou compte inaccessible");
      }
    }
  };

  // Save webhook configuration
  const handleSaveWebhook = async (configId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      if (!webhookConfig.webhook_verify_token) {
        toast.error("Veuillez saisir un token de vérification");
        return;
      }

      await axios.post(
        `${APIURL.ROOTV1}/instagram-configurations/${configId}/webhook`,
        webhookConfig,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Find the configuration to get Instagram details for subscription
      const config = configurations.find(c => c.id === configId);
      if (config) {
        // Subscribe Instagram account to webhook after successful webhook configuration
        await subscribeInstagramToWebhook(config.instagram_id, config.acces_token_user);
      }
      
      toast.success("Webhook Instagram configuré avec succès");
      
      // Reset form and refresh data
      setWebhookConfig({ webhook_verify_token: "" });
      setShowWebhookForm(null);
      
      // Refresh webhooks list
      window.location.reload();
      
    } catch (error) {
      console.error("Error saving webhook:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la configuration du webhook");
    } finally {
      setSaving(false);
    }
  };

  // Delete webhook configuration
  const handleDeleteWebhook = async (configId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce webhook?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.ROOTV1}/instagram-configurations/${configId}/webhook`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Webhook supprimé avec succès");
      
      // Refresh webhooks list
      window.location.reload();
      
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Erreur lors de la suppression du webhook");
    }
  };

  // Get webhook for configuration
  const getWebhookForConfig = (configId) => {
    return webhooks.find(webhook => webhook.id === configId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">Chargement des configurations Instagram...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuration Instagram</h2>
          <p className="text-gray-600">Gérez vos configurations Instagram par projet</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-md hover:from-pink-600 hover:to-purple-600"
        >
          <Plus className="h-4 w-4" />
          Nouvelle configuration
        </button>
      </div>

      {/* Existing Configurations List with Webhook sections */}
      {configurations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Configurations existantes</h3>
            <p className="mt-1 text-sm text-gray-600">Vos configurations Instagram par projet</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {configurations.map((config) => {
                const webhook = getWebhookForConfig(config.id);
                return (
                  <div key={config.id} className="border rounded-lg p-6">
                    {/* Configuration Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {config.projet?.nom || 'Projet supprimé'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Instagram ID: {config.instagram_id}
                          </p>
                          <p className="text-xs text-gray-400">
                            Configuré le {new Date(config.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actif
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

                    {/* Webhook Section */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <h4 className="text-sm font-medium text-gray-700">Configuration Webhook</h4>
                        </div>
                        {webhook ? (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              <Settings className="h-3 w-3 mr-1" />
                              Configuré
                            </span>
                            <button
                              onClick={() => handleDeleteWebhook(config.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                              title="Supprimer webhook"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowWebhookForm(config.id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100"
                          >
                            <Plus className="h-3 w-3" />
                            Configurer
                          </button>
                        )}
                      </div>

                      {webhook && (
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-md">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">URL Webhook:</span>
                              <p className="text-gray-600 mt-1 break-all">{webhook.webhook_url}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Événements:</span>
                              <p className="text-gray-600 mt-1">
                                {webhook.webhook_subscriptions?.join(', ') || 'Aucun'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {showWebhookForm === config.id && (
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-md mt-3">
                          <h5 className="text-sm font-medium text-pink-900 mb-3">
                            Configurer le webhook pour {config.projet?.nom}
                          </h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-pink-700 mb-1">
                                Token de vérification *
                              </label>
                              <input
                                type="text"
                                value={webhookConfig.webhook_verify_token}
                                onChange={(e) => setWebhookConfig({ webhook_verify_token: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-pink-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-500"
                                placeholder="Saisissez un token de vérification unique"
                              />
                              <p className="text-xs text-pink-600 mt-1">
                                Ce token sera utilisé par Instagram pour vérifier l'authenticité du webhook
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveWebhook(config.id)}
                                disabled={saving || !webhookConfig.webhook_verify_token}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded hover:from-pink-600 hover:to-purple-600 disabled:opacity-50"
                              >
                                {saving ? (
                                  <Loader className="h-3 w-3 animate-spin" />
                                ) : (
                                  <SaveIcon className="h-3 w-3" />
                                )}
                                Sauvegarder
                              </button>
                              <button
                                onClick={() => {
                                  setShowWebhookForm(null);
                                  setWebhookConfig({ webhook_verify_token: "" });
                                }}
                                className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-500 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircleIcon className="h-5 w-5 text-pink-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-pink-800">
                  Prérequis pour l&apos;intégration Instagram
                </h3>
                <div className="mt-2 text-sm text-pink-700">
                  <p>
                    <strong>Important :</strong> Votre compte Instagram doit être un compte professionnel (business) 
                    et être connecté à une page Facebook pour utiliser l&apos;API Instagram.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Compte Instagram converti en compte professionnel</li>
                    <li>Page Facebook associée au compte Instagram</li>
                    <li>Application Facebook développeur configurée</li>
                    <li>Permissions Instagram Basic Display et Content Publishing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium">Guide de configuration</h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-700">
                  <strong>1. Convertir en compte professionnel :</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Ouvrez l&apos;app Instagram et allez dans votre profil</li>
                  <li>Appuyez sur le menu (3 lignes) puis &quot;Paramètres&quot;</li>
                  <li>Sélectionnez &quot;Compte&quot; puis &quot;Passer à un compte professionnel&quot;</li>
                  <li>Choisissez une catégorie d&apos;entreprise</li>
                  <li>Connectez votre page Facebook correspondante</li>
                </ul>

                <p className="text-gray-700 mt-4">
                  <strong>2. Obtenir l&apos;ID Instagram :</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Utilisez l&apos;API Facebook Graph Explorer</li>
                  <li>Requête : <code className="bg-gray-200 px-1 rounded">/me/accounts</code></li>
                  <li>Dans la réponse, trouvez votre page Facebook</li>
                  <li>Utilisez l&apos;ID de la page pour obtenir l&apos;Instagram ID</li>
                  <li>Requête : <code className="bg-gray-200 px-1 rounded">/{`{page-id}`}?fields=instagram_business_account</code></li>
                </ul>

                <p className="text-gray-700 mt-4">
                  <strong>3. Générer le token d&apos;accès :</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Créez une app Facebook Developers</li>
                  <li>Ajoutez le produit &quot;Instagram Basic Display&quot;</li>
                  <li>Configurez les permissions requises</li>
                  <li>Générez un token d&apos;accès longue durée</li>
                  <li>Testez avec l&apos;API Graph Explorer</li>
                </ul>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 text-xs">
                    <strong>💡 Astuce :</strong> L&apos;API Instagram utilise la même infrastructure que Facebook. 
                    Votre token Facebook peut souvent être utilisé pour Instagram si les permissions sont correctes.
                  </p>
                </div>

                <p className="text-blue-600 mt-3">
                  <a
                    href="https://developers.facebook.com/docs/instagram-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:underline"
                  >
                    <Box className="h-4 w-4 mr-1" />
                    Documentation Instagram API
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Démonstration vidéo</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-4">
                  Regardez cette vidéo pour voir étape par étape comment obtenir votre token d'accès Instagram :
                </p>
                <div className="relative w-full mx-auto">
                  <video 
                    controls 
                    className="w-full rounded-lg shadow-lg"
                    poster="/Demo/demo-thumbnail.jpg"
                  >
                    <source src="/Demo/Demo.mp4" type="video/mp4" />
                    Votre navigateur ne prend pas en charge la lecture de vidéos HTML5.
                  </video>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <p>💡 Astuce : Vous pouvez mettre la vidéo en plein écran pour une meilleure visibilité</p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Nouvelle Configuration Instagram</h3>
            <div className="max-w-2xl space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Projet à associer *
                </label>
                <select
                  name="projet_id"
                  value={instagramConfig.projet_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
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
                  Sélectionnez le projet immobilier à associer à ce compte Instagram
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  ID du compte Instagram Business *
                </label>
                <input
                  type="text"
                  name="instagram_id"
                  value={instagramConfig.instagram_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Ex: 17841454841928506"
                  required
                />
                <p className="text-xs text-gray-500">
                  L&apos;identifiant numérique de votre compte Instagram Business (obligatoire)
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Token d&apos;accès utilisateur *
                </label>
                <textarea
                  name="acces_token_user"
                  value={instagramConfig.acces_token_user}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Collez votre token d'accès Instagram ici"
                  required
                />
                <p className="text-xs text-gray-500">
                  Token d&apos;accès longue durée avec permissions Instagram (obligatoire)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveInstagram}
                  disabled={saving || !instagramConfig.instagram_id || !instagramConfig.acces_token_user || !instagramConfig.projet_id}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-md hover:from-pink-600 hover:to-purple-600 disabled:opacity-50"
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
                  <li>• Images (JPEG, PNG)</li>
                  <li>• Vidéos (MP4, MOV)</li>
                  <li>• Reels courtes (&lt; 60s)</li>
                  <li>• Stories (temporaires)</li>
                  <li>• Légendes avec hashtags</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Limitations</h4>
                <ul className="text-sm !text-yellow-700 space-y-1">
                  <li>• Pas de publications multi-photos</li>
                  <li>• Vidéos limitées à 60 secondes</li>
                  <li>• Pas de programmation de Stories</li>
                  <li>• Taille max : 8MB pour images</li>
                  <li>• Format requis : 1080x1080 recommandé</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Vérification de la configuration</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Une fois la configuration sauvegardée, testez votre intégration en publiant 
                    une image simple depuis l&apos;interface de partage. Les erreurs communes incluent :
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-sm !text-blue-600">
                    <li>Token expiré ou permissions insuffisantes</li>
                    <li>Compte Instagram non converti en compte professionnel</li>
                    <li>Page Facebook non connectée au compte Instagram</li>
                    <li>Format d&apos;image non supporté</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm !text-yellow-700">
              Chaque configuration Instagram est associée à un projet spécifique. 
              Les webhooks permettent de recevoir des notifications en temps réel des commentaires et mentions sur vos comptes Instagram.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
