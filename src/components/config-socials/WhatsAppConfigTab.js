"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { SaveIcon, AlertCircleIcon, Loader, Trash2, Plus, CheckCircle, MessageCircle, Globe, Edit, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

export default function WhatsAppConfigTab() {
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

  const [whatsappConfig, setWhatsappConfig] = useState({
    phone_number_id: "",
    access_token: "",
    app_id: "",
    app_secret: "",
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

  // Fetch existing WhatsApp configurations and webhooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        // Fetch WhatsApp configurations
        const configResponse = await axios.get(`${APIURL.ROOTV1}/whatsapp-configurations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setConfigurations(configResponse.data.configurations || []);

        // Fetch webhooks
        const webhookResponse = await axios.get(`${APIURL.ROOTV1}/whatsapp-webhooks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (webhookResponse.data && webhookResponse.data.webhooks) {
          setWebhooks(webhookResponse.data.webhooks);
        }

      } catch (error) {
        console.error("Error fetching WhatsApp data:", error);
        toast.error("Erreur lors du chargement des configurations WhatsApp");
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
    setWhatsappConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save or Update WhatsApp configuration
  const handleSaveWhatsApp = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");

      if (!whatsappConfig.phone_number_id || !whatsappConfig.access_token || !whatsappConfig.projet_id) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        setSaving(false);
        return;
      }

      const dataToSave = {
        phone_number_id: whatsappConfig.phone_number_id,
        access_token: whatsappConfig.access_token,
        app_id: whatsappConfig.app_id,
        app_secret: whatsappConfig.app_secret,
        projet_id: whatsappConfig.projet_id,
      };

      if (editingConfig) {
        // Update existing configuration
        await axios.put(
          `${APIURL.ROOTV1}/whatsapp-configurations/${editingConfig.id}`,
          dataToSave,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Configuration WhatsApp mise à jour avec succès!");
      } else {
        // Create new configuration
        await axios.post(
          `${APIURL.ROOTV1}/whatsapp-configurations`,
          dataToSave,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Configuration WhatsApp enregistrée avec succès!");
      }

      // Reset form
      setWhatsappConfig({
        phone_number_id: "",
        access_token: "",
        app_id: "",
        app_secret: "",
        projet_id: "",
      });
      setEditingConfig(null);
      setShowForm(false);

      // Refresh configurations list
      window.location.reload();

    } catch (error) {
      console.error("Error saving WhatsApp configuration:", error);
      toast.error("Erreur lors de l'enregistrement de la configuration");
    } finally {
      setSaving(false);
    }
  };

  // Edit WhatsApp configuration
  const handleEditWhatsApp = (config) => {
    setWhatsappConfig({
      phone_number_id: config.phone_number_id,
      access_token: config.access_token,
      app_id: config.app_id || "",
      app_secret: config.app_secret || "",
      projet_id: config.projet_id,
    });
    setEditingConfig(config);
    setShowForm(true);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setWhatsappConfig({
      phone_number_id: "",
      access_token: "",
      app_id: "",
      app_secret: "",
      projet_id: "",
    });
    setEditingConfig(null);
    setShowForm(false);
  };

  // Save webhook configuration - webhook starts disabled by default
  const handleSaveWebhook = async (configId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");

      if (!webhookConfig.webhook_verify_token) {
        toast.error("Veuillez saisir un token de vérification");
        setSaving(false);
        return;
      }

      await axios.post(
        `${APIURL.ROOTV1}/whatsapp-configurations/${configId}/webhook`,
        webhookConfig,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Webhook WhatsApp configuré avec succès");

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
      itemLabel: `Webhook pour ${config?.projet_nom || 'Projet supprimé'}`
    });
  };

  // Delete configuration
  const handleDeleteConfiguration = async (configId) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(`${APIURL.ROOTV1}/whatsapp-configurations/${configId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Configuration WhatsApp supprimée avec succès!");
      window.location.reload();

    } catch (error) {
      console.error("Error deleting WhatsApp configuration:", error);
      toast.error("Erreur lors de la suppression de la configuration");
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    const { type, itemId } = deleteModal;
    try {
      const token = localStorage.getItem("accessToken");

      if (type === 'configuration') {
        await axios.delete(`${APIURL.ROOTV1}/whatsapp-configurations/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Configuration supprimée avec succès");
      } else if (type === 'webhook') {
        await axios.delete(`${APIURL.ROOTV1}/whatsapp-configurations/${itemId}/webhook`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Webhook supprimé avec succès");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Erreur lors de la suppression");
    }
    setDeleteModal({ isOpen: false, type: null, itemId: null, itemLabel: '' });
  };

  // Toggle webhook enable/disable - let backend handle WhatsApp subscription
  const handleToggleWebhook = async (configId, currentStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const newStatus = !currentStatus;

      // Send request to backend to toggle webhook and handle WhatsApp subscription
      await axios.put(
        `${APIURL.ROOTV1}/whatsapp-configurations/${configId}/webhook/toggle`,
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
      <div className="flex items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Chargement des configurations WhatsApp...</span>
      </div>
    );
  }

  if (!user || (user.role !== 1 && user.role !== 2)) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertCircleIcon className="h-8 w-8 text-red-500 mr-2" />
        <span className="text-red-600">Accès non autorisé. Seuls les administrateurs peuvent gérer les configurations WhatsApp.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Configurations WhatsApp</h3>
            <p className="mt-1 text-sm text-gray-600">
              Gérez vos configurations WhatsApp UltraMsg par projet
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#20BA5A] flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une configuration
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {configurations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune configuration WhatsApp trouvée</p>
                <p className="text-sm text-gray-400 mt-1">
                  Ajoutez votre première configuration pour commencer
                </p>
              </div>
            ) : (
              configurations.map((config) => {
                const webhook = getWebhookForConfig(config.id);
                return (
                  <div key={config.id} className="border rounded-lg p-6">
                    {/* Configuration Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {config.projet_nom || 'Projet supprimé'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Phone Number ID: {config.phone_number_id}
                          </p>
                          <p className="text-xs text-gray-400">
                            Configuré le {new Date(config.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditWhatsApp(config)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            type: 'configuration',
                            itemId: config.id,
                            itemLabel: config.projet_nom || 'Configuration'
                          })}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
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
                              <CheckCircle className="h-3 w-3 mr-1" />
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
                              <p className="text-gray-600 mt-1 break-all">{(process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://votre-domaine.com')) + '/api/webhook_whatsapp_business'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Token de vérification:</span>
                              <p className="text-gray-600 mt-1 font-mono">
                                {webhook.webhook_verify_token ? '••••••••••••' : 'Non configuré'}
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

                            {!webhook.webhook_enabled && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs flex items-start space-x-2">
                                <AlertCircleIcon className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-yellow-700">
                                  <p className="font-medium">Avant d'activer le webhook :</p>
                                  <ol className="list-decimal pl-3 mt-1 space-y-0.5">
                                    <li>Configurez votre webhook dans <strong>Facebook Developer Console</strong></li>
                                    <li>Abonnez-vous aux événements : <strong>messages</strong></li>
                                    <li>Vérifiez que votre webhook répond correctement</li>
                                  </ol>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {showWebhookForm === config.id && (
                        <div className="bg-blue-50 p-4 rounded-md mt-3">
                          <h5 className="text-sm font-medium text-blue-900 mb-3">
                            Configurer le webhook pour {config.projet_nom}
                          </h5>

                          <div className="space-y-3">
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                              <div className="flex items-start space-x-2">
                                <AlertCircleIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-yellow-800 text-xs">
                                  <p className="font-medium mb-1">Configuration Facebook Developer Console requise :</p>
                                  <ul className="list-disc pl-4 space-y-1 text-xs">
                                    <li>URL du webhook : <code className="bg-white px-1 rounded">{(process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://votre-domaine.com'))}/api/webhook_whatsapp_business</code></li>
                                    <li>Token de vérification : Utilisez le token que vous saisissez ci-dessous</li>
                                    <li>Événements à sélectionner : <strong>messages</strong> uniquement</li>
                                    <li>Testez la vérification du webhook avant d'activer</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-blue-900 mb-1">
                                Token de vérification
                              </label>
                              <input
                                type="text"
                                value={webhookConfig.webhook_verify_token}
                                onChange={(e) => setWebhookConfig({ webhook_verify_token: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Saisissez un token de vérification unique"
                              />
                              <p className="text-xs text-blue-600 mt-1">
                                Ce token sera utilisé par Facebook pour vérifier l'authenticité du webhook
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveWebhook(config.id)}
                                disabled={saving || !webhookConfig.webhook_verify_token}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                {saving ? <Loader className="h-3 w-3 animate-spin" /> : <SaveIcon className="h-3 w-3" />}
                                Enregistrer
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
              })
            )}
          </div>
        </div>
      </div>

      {/* Information Section - Setup Guide */}
      {(!editingConfig || showGuide) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-start">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Configuration WhatsApp Business API</h3>
              <div className="mt-2 text-sm text-blue-700">

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">📋 Étape 1 : Créer une application Facebook</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-xs">
                      <li>Allez sur <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800 font-medium">developers.facebook.com</a></li>
                      <li>Cliquez sur <strong>"Mes apps"</strong> puis <strong>"Créer une app"</strong></li>
                      <li>Sélectionnez <strong>"Business"</strong> comme type d'application</li>
                      <li>Remplissez le nom de l'app (ex: "Mon CRM WhatsApp") et votre email</li>
                      <li>Cliquez sur <strong>"Créer l'app"</strong></li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">📱 Étape 2 : Ajouter WhatsApp Business</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-xs">
                      <li>Dans le tableau de bord de votre app, cliquez sur <strong>"+ Ajouter un produit"</strong></li>
                      <li>Trouvez <strong>"WhatsApp Business Management"</strong> et cliquez sur <strong>"Configurer"</strong></li>
                      <li>Acceptez les conditions d'utilisation</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">🔑 Étape 3 : Récupérer les identifiants</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-xs">
                      <li>Allez dans <strong>WhatsApp → Prise en main</strong></li>
                      <li>Copiez le <strong>"Phone Number ID"</strong> (commence par 1...)</li>
                      <li>Copiez le <strong>"Access Token"</strong> (commence par EAA...)</li>
                      <li>Saisissez ces informations dans le formulaire ci-dessous</li>
                      <li>⚠️ <strong>Important :</strong> Gardez ces informations secrètes !</li>
                    </ol>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Configuration Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {editingConfig ? 'Modifier Configuration WhatsApp' : 'Nouvelle Configuration WhatsApp'}
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
            <p className="mt-1 text-sm text-gray-600">
              Configurez votre instance UltraMsg pour un projet
            </p>
          </div>

          <div className="p-6">
            <div className="max-w-2xl space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Projet à associer *
                </label>
                <select
                  name="projet_id"
                  value={whatsappConfig.projet_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366]"
                  required
                >
                  <option value="">Sélectionner un projet</option>
                  {projets.map((projet) => (
                      <option key={projet.id} value={projet.id}>
                        {projet.nom}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number ID *
                </label>
                <input
                  type="text"
                  name="phone_number_id"
                  value={whatsappConfig.phone_number_id}
                  onChange={handleChange}
                  placeholder="Votre Phone Number ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366]"
                  required
                />
                <p className="text-xs text-gray-500">
                  L'ID du numéro de téléphone WhatsApp Business (ex: 123456789012345)
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Access Token *
                </label>
                <input
                  type="password"
                  name="access_token"
                  value={whatsappConfig.access_token}
                  onChange={handleChange}
                  placeholder="Votre Access Token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366]"
                  required
                />
                <p className="text-xs text-gray-500">
                  Le token d'accès de votre application Facebook
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  App ID <span className="text-gray-400">(optionnel)</span>
                </label>
                <input
                  type="text"
                  name="app_id"
                  value={whatsappConfig.app_id}
                  onChange={handleChange}
                  placeholder="Votre App ID Facebook (optionnel)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366]"
                />
                <p className="text-xs text-gray-500">
                  Optionnel - requis uniquement pour des fonctionnalités avancées
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  App Secret <span className="text-gray-400">(optionnel)</span>
                </label>
                <input
                  type="password"
                  name="app_secret"
                  value={whatsappConfig.app_secret}
                  onChange={handleChange}
                  placeholder="Votre App Secret Facebook (optionnel)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366]"
                />
                <p className="text-xs text-gray-500">
                  Optionnel - requis uniquement pour des fonctionnalités avancées
                </p>
              </div>





              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveWhatsApp}
                  disabled={saving || !whatsappConfig.phone_number_id || !whatsappConfig.access_token || !whatsappConfig.projet_id}
                  className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#20BA5A] disabled:opacity-50"
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
        </div>
      )}



      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: null, itemId: null, itemLabel: '' })}
        onConfirm={handleDeleteConfirm}
        title={`Supprimer ${deleteModal.type === 'configuration' ? 'la configuration' : 'le webhook'}`}
        message={`Êtes-vous sûr de vouloir supprimer ${deleteModal.type === 'configuration' ? 'la configuration' : 'le webhook'} "${deleteModal.itemLabel}" ? Cette action est irréversible.`}
      />
    </div>
  );
}
