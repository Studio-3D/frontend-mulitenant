"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { Box, SaveIcon, AlertCircleIcon, Loader, Trash2, Plus, CheckCircle, Settings, Globe, Edit, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export default function FacebookConfigTab() {
  const { user } = useAuth();
  const { projets } = useProjet();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showWebhookForm, setShowWebhookForm] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  const [facebookConfig, setFacebookConfig] = useState({
    page_fcb_id: "",
    acces_token_page: "",
    projet_id: "",
  });

  const [webhookConfig, setWebhookConfig] = useState({
    webhook_verify_token: "",
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'configuration' or 'webhook'
    itemId: null,
    itemLabel: ''
  });

  // Fetch existing Facebook configurations and webhooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        
        // Fetch configurations
        const configResponse = await axios.get(`${APIURL.ROOTV1}/facebook-configurations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (configResponse.data && configResponse.data.configurations) {
          setConfigurations(configResponse.data.configurations);
        }

        // Fetch webhooks
        const webhookResponse = await axios.get(`${APIURL.ROOTV1}/facebook-webhooks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (webhookResponse.data && webhookResponse.data.webhooks) {
          setWebhooks(webhookResponse.data.webhooks);
        }
      } catch (error) {
        console.error("Error fetching Facebook data:", error);
        toast.error("Erreur lors du chargement des configurations Facebook");
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
    setFacebookConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save or Update Facebook configuration
  const handleSaveFacebook = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");

      if (!facebookConfig.page_fcb_id || !facebookConfig.acces_token_page || !facebookConfig.projet_id) {
        toast.error("Veuillez remplir tous les champs");
        return;
      }

      const dataToSave = {
        page_fcb_id: facebookConfig.page_fcb_id,
        acces_token_page: facebookConfig.acces_token_page,
        projet_id: facebookConfig.projet_id,
      };

      if (editingConfig) {
        // Update existing configuration
        await axios.put(
          `${APIURL.ROOTV1}/facebook-configurations/${editingConfig.id}`,
          dataToSave,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Configuration Facebook mise à jour avec succès");
      } else {
        // Create new configuration
        await axios.post(
          `${APIURL.ROOTV1}/facebook-configurations`,
          dataToSave,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Verify configuration after saving
        await verifyFacebookConfiguration();
        toast.success("Configuration Facebook enregistrée avec succès");
      }

      // Reset form and refresh configurations
      setFacebookConfig({
        page_fcb_id: "",
        acces_token_page: "",
        projet_id: "",
      });
      setEditingConfig(null);
      setShowForm(false);

      // Refresh configurations list
      window.location.reload();

    } catch (error) {
      console.error("Error saving Facebook configuration:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement de la configuration Facebook");
    } finally {
      setSaving(false);
    }
  };

  // Edit Facebook configuration
  const handleEditFacebook = (config) => {
    setFacebookConfig({
      page_fcb_id: config.page_fcb_id,
      acces_token_page: config.acces_token_page,
      projet_id: config.projet_id,
    });
    setEditingConfig(config);
    setShowForm(true);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setFacebookConfig({
      page_fcb_id: "",
      acces_token_page: "",
      projet_id: "",
    });
    setEditingConfig(null);
    setShowForm(false);
  };

  // Delete Facebook configuration
  const handleDeleteConfiguration = async (configId) => {
    const config = configurations.find(c => c.id === configId);
    setDeleteModal({
      isOpen: true,
      type: 'configuration',
      itemId: configId,
      itemLabel: `Configuration Facebook pour ${config?.projet?.nom || 'Projet supprimé'}`
    });
  };

  // Verify Facebook configuration
  const verifyFacebookConfiguration = async () => {
    if (facebookConfig.page_fcb_id && facebookConfig.acces_token_page) {
      try {
        const fbResponse = await axios.get(
          `https://graph.facebook.com/v18.0/${facebookConfig.page_fcb_id}?access_token=${facebookConfig.acces_token_page}`
        );
        if (fbResponse.data && fbResponse.data.id) {
          toast.success("✅ Configuration Facebook vérifiée");
        }
      } catch (error) {
        console.error("Facebook verification failed:", error);
        toast.error("❌ Erreur de configuration Facebook: Token invalide ou page inaccessible");
      }
    }
  };

  // Save webhook configuration - webhook starts disabled by default
  const handleSaveWebhook = async (configId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      if (!webhookConfig.webhook_verify_token) {
        toast.error("Veuillez saisir un token de vérification");
        return;
      }

      await axios.post(
        `${APIURL.ROOTV1}/facebook-configurations/${configId}/webhook`,
        webhookConfig,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success("Webhook Facebook configuré avec succès");
      
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
    const config = configurations.find(c => c.id === configId);
    const webhook = getWebhookForConfig(configId);
    setDeleteModal({
      isOpen: true,
      type: 'webhook',
      itemId: configId,
      itemLabel: `Webhook pour ${config?.projet?.nom || 'Projet supprimé'}`
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirmed = async () => {
    const { type, itemId } = deleteModal;
    
    try {
      const token = localStorage.getItem("accessToken");
      
      if (type === 'configuration') {
        await axios.delete(`${APIURL.ROOTV1}/facebook-configurations/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Configuration supprimée avec succès");
      } else if (type === 'webhook') {
        await axios.delete(`${APIURL.ROOTV1}/facebook-configurations/${itemId}/webhook`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Webhook supprimé avec succès");
      }
      
      // Refresh data
      window.location.reload();
      
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  // Toggle webhook enable/disable - let backend handle Facebook subscription
  const handleToggleWebhook = async (configId, currentStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const newStatus = !currentStatus;
      
      // Send request to backend to toggle webhook and handle Facebook subscription
      await axios.put(
        `${APIURL.ROOTV1}/facebook-configurations/${configId}/webhook/toggle`,
        { webhook_enabled: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const statusText = newStatus ? 'activé' : 'désactivé';
      toast.success(`Webhook ${statusText} avec succès`);
      
      // Update local state
      setWebhooks(prev => prev.map(webhook => 
        webhook.id === configId 
          ? { ...webhook, webhook_enabled: newStatus }
          : webhook
      ));
      
    } catch (error) {
      console.error("Error toggling webhook:", error);
      
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de la modification du webhook");
      }
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
          <p className="text-gray-600">Chargement des configurations Facebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configuration Facebook</h2>
          <p className="text-gray-600">Gérez vos configurations Facebook par projet</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
            <p className="mt-1 text-sm text-gray-600">Vos configurations Facebook par projet</p>
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
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {config.projet?.nom || 'Projet supprimé'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Page ID: {config.page_fcb_id}
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
                          onClick={() => handleEditFacebook(config)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
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
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                          >
                            <Plus className="h-3 w-3" />
                            Configurer
                          </button>
                        )}
                      </div>

                      {webhook && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium text-gray-700">URL Webhook:</span>
                              <p className="text-gray-600 mt-1 break-all">{webhook.webhook_url}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Événements requis:</span>
                              <p className="text-gray-600 mt-1">
                                feed, mention, messages
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                ⚠️ Ces événements doivent être configurés dans Facebook Developer Console
                              </p>
                            </div>
                          </div>
                          
                          {/* Add webhook toggle with warning */}
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">
                                État du webhook:
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs ${webhook.webhook_enabled ? 'text-green-600' : 'text-red-600'}`}>
                                  {webhook.webhook_enabled ? 'Activé' : 'Désactivé'}
                                </span>
                                <button
                                  onClick={() => handleToggleWebhook(config.id, webhook.webhook_enabled)}
                                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                                    webhook.webhook_enabled ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                      webhook.webhook_enabled ? 'translate-x-4' : 'translate-x-0.5'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                            
                            {/* Warning message */}
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <div className="flex items-start space-x-1">
                                <AlertCircleIcon className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-yellow-700">
                                  <p className="font-medium">Avant {"d'"}activer le webhook :</p>
                                  <ol className="list-decimal pl-3 mt-1 space-y-0.5">
                                    <li>Configurez votre webhook dans <strong>Facebook Developer Console</strong></li>
                                    <li>Abonnez-vous aux événements : <strong>feed</strong> et <strong>mention</strong></li>
                                    <li>Vérifiez que votre webhook répond correctement</li>
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {showWebhookForm === config.id && (
                        <div className="bg-blue-50 p-4 rounded-md mt-3">
                          <h5 className="text-sm font-medium text-blue-900 mb-3">
                            Configurer le webhook pour {config.projet?.nom}
                          </h5>
                          
                          {/* Important instructions */}
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-start space-x-2">
                              <AlertCircleIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Configuration Facebook Developer Console requise :</p>
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                  <li>URL du webhook : <code className="bg-white px-1 rounded">https://immogestion.alemsafi.live/api/webhookFcb_Insta</code></li>
                                  <li>Token de vérification : Utilisez le token que vous saisissez ci-dessous</li>
                                  <li>Événements à sélectionner : <strong>feed</strong> et <strong>mention</strong> uniquement</li>
                                  <li>Testez la vérification du webhook avant {"d'"}activer</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-blue-700 mb-1">
                                Token de vérification *
                              </label>
                              <input
                                type="text"
                                value={webhookConfig.webhook_verify_token}
                                onChange={(e) => setWebhookConfig({ webhook_verify_token: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Saisissez un token de vérification unique"
                              />
                              <p className="text-xs text-blue-600 mt-1">
                                Ce token sera utilisé par Facebook pour vérifier {"l'"}authenticité du webhook
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveWebhook(config.id)}
                                disabled={saving || !webhookConfig.webhook_verify_token}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Comment configurer l&apos;intégration Facebook
                </h3>
                <div className="mt-2 text-sm text-blue-700 space-y-1">
                  <p>
                    Pour intégrer Facebook à votre projet, vous avez besoin de trois informations principales:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 mt-2">
                    <li><strong>Projet à associer</strong>: Sélectionnez le projet immobilier</li>
                    <li><strong>ID de la Page Facebook</strong>: Identifiant numérique unique de votre page Facebook</li>
                    <li><strong>Token d&apos;accès à la Page</strong>: Jeton d&apos;authentification qui permet de publier du contenu</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Guide - Show for new configurations or when explicitly requested */}
          {(!editingConfig || showGuide) && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium">Guide de configuration Facebook</h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-700">
                  <strong>1. Créer une Page Facebook Business :</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Connectez-vous à Facebook et cliquez sur &quot;Pages&quot;</li>
                  <li>Cliquez sur &quot;Créer une nouvelle page&quot;</li>
                  <li>Choisissez &quot;Entreprise ou marque&quot;</li>
                  <li>Remplissez les informations de votre entreprise</li>
                  <li>Ajoutez une photo de profil et de couverture</li>
                </ul>

                <p className="text-gray-700 mt-4">
                  <strong>2. Obtenir l&apos;ID de la Page :</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Allez sur votre page Facebook</li>
                  <li>Cliquez sur &quot;À propos&quot; dans le menu de gauche</li>
                  <li>Faites défiler vers le bas pour voir &quot;ID de la page&quot;</li>
                  <li>Ou utilisez l&apos;URL: facebook.com/[nom-de-page]/about</li>
                  <li>L&apos;ID apparaît dans la section &quot;Plus d&apos;infos&quot;</li>
                </ul>

                <p className="text-gray-700 mt-4">
                  <strong>3. Générer le Token d&apos;accès :</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Allez sur Facebook Developers (developers.facebook.com)</li>
                  <li>Créez une nouvelle application</li>
                  <li>Ajoutez le produit &quot;Pages Management API&quot;</li>
                  <li>Utilisez l&apos;Explorateur d&apos;API Graph</li>
                  <li>Générez un token d&apos;accès à la page longue durée</li>
                </ul>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 text-xs">
                    <strong>💡 Astuce :</strong> Assurez-vous que votre token a les permissions 
                    &quot;pages_show_list&quot;, &quot;pages_read_engagement&quot; et &quot;pages_manage_posts&quot;.
                  </p>
                </div>

                <p className="text-blue-600 mt-3">
                  <a
                    href="https://developers.facebook.com/docs/pages"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:underline"
                  >
                    <Box className="h-4 w-4 mr-1" />
                    Documentation Facebook Pages API
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Démonstration vidéo</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-4">
                  Regardez cette vidéo pour voir étape par étape comment obtenir votre token {"d'"}accès Facebook :
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
          )}

          {/* Configuration Form */}
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {editingConfig ? 'Modifier Configuration Facebook' : 'Nouvelle Configuration Facebook'}
              </h3>

              {/* Show guide toggle button when editing */}
              {editingConfig && (
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  {showGuide ? 'Masquer le guide' : 'Afficher le guide'}
                  {showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </div>
            <div className="max-w-2xl space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Projet à associer *
                </label>
                <select
                  name="projet_id"
                  value={facebookConfig.projet_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner un projet</option>
                  {projets.map((projet) => (
                    <option key={projet.id} value={projet.id}>
                      {projet.nom}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Sélectionnez le projet immobilier à associer à cette page Facebook. Un même projet peut être utilisé par plusieurs configurations.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  ID de la Page Facebook *
                </label>
                <input
                  type="text"
                  name="page_fcb_id"
                  value={facebookConfig.page_fcb_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 123456789012345"
                  required
                />
                <p className="text-xs text-gray-500">
                  L&apos;identifiant numérique de votre page Facebook (obligatoire)
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Token d&apos;accès à la Page *
                </label>
                <textarea
                  name="acces_token_page"
                  value={facebookConfig.acces_token_page}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Collez votre token d'accès ici"
                  required
                />
                <p className="text-xs text-gray-500">
                  Token longue durée obtenu via le Gestionnaire de Pages Facebook (obligatoire)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveFacebook}
                  disabled={saving || !facebookConfig.page_fcb_id || !facebookConfig.acces_token_page || !facebookConfig.projet_id}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4" />
                      {editingConfig ? 'Mettre à jour' : 'Enregistrer la configuration'}
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancelEdit}
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
                  <li>• Vidéos (MP4, MOV, AVI)</li>
                  <li>• Albums photos (jusqu&apos;à 10 images)</li>
                  <li>• Posts avec liens</li>
                  <li>• Texte avec émojis et hashtags</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Limitations</h4>
                <ul className="text-sm !text-yellow-700 space-y-1">
                  <li>• Vidéos limitées à 4GB maximum</li>
                  <li>• Images max : 8MB chacune</li>
                  <li>• Pas de programmation au-delà de 6 mois</li>
                  <li>• Contenu soumis aux règles communautaires</li>
                  <li>• Token expire périodiquement</li>
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
                    <li>Page Facebook non accessible par l&apos;application</li>
                    <li>ID de page incorrect ou inexistant</li>
                    <li>Restrictions sur le contenu immobilier</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add webhook configuration section */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Configuration des Webhooks Facebook</h3>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Settings className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-2">Événements webhook supportés</h4>
              <div className="space-y-2 text-blue-800">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>feed</strong> - Notifications pour les nouveaux posts sur votre page
                    <p className="text-xs text-blue-600">Recevez des notifications quand quelq{"u'"}un publie sur votre page</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>mention</strong> - Notifications quand votre page est mentionnée
                    <p className="text-xs text-blue-600">Recevez des notifications quand votre page est taguée ou mentionnée</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Important :</strong> Vous devez configurer ces événements dans Facebook Developer Console 
                  avant de pouvoir activer les webhooks dans cette interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm !text-yellow-700">
              Chaque configuration Facebook est associée à un projet spécifique. 
              Les webhooks permettent de recevoir des notifications en temps réel des interactions sur vos pages Facebook.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null, itemId: null, itemLabel: '' })}
        entityName="FACEBOOK_CONFIG"
        itemLabel={deleteModal.itemLabel}
        entityId={deleteModal.itemId}
        onDeleted={handleDeleteConfirmed}
      />
    </div>
  );
}
