"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { SaveIcon, AlertCircleIcon, Loader, Trash2, Plus, CheckCircle, MessageCircle, Globe, Edit, ChevronDown, ChevronUp, HelpCircle, X, Phone, Key, Lock, Building } from "lucide-react";
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

  // Configuration state (no Twilio mention)
  const [whatsappConfig, setWhatsappConfig] = useState({
    account_id: "",
    api_key: "",
    phone_number: "",
    projet_id: "",
  });

  const [webhookConfig, setWebhookConfig] = useState({
    webhook_verify_token: "",
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    itemId: null,
    itemLabel: ''
  });

  // Fetch existing WhatsApp configurations and webhooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const configResponse = await axios.get(`${APIURL.ROOTV1}/whatsapp-configurations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setConfigurations(configResponse.data.configurations || []);

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

    if (user && (user.role === 1 || user.role === 2|| user.role === 10)) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

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

      if (!whatsappConfig.account_id || !whatsappConfig.api_key || !whatsappConfig.phone_number || !whatsappConfig.projet_id) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        setSaving(false);
        return;
      }

      // Validate phone number format
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(whatsappConfig.phone_number)) {
        toast.error("Format de numéro invalide. Utilisez le format international (ex: +33123456789)");
        setSaving(false);
        return;
      }

      const dataToSave = {
        account_id: whatsappConfig.account_id,
        api_key: whatsappConfig.api_key,
        phone_number: whatsappConfig.phone_number,
        projet_id: whatsappConfig.projet_id,
      };

      if (editingConfig) {
        await axios.put(
          `${APIURL.ROOTV1}/whatsapp-configurations/${editingConfig.id}`,
          dataToSave,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Configuration WhatsApp mise à jour avec succès!");
      } else {
        await axios.post(
          `${APIURL.ROOTV1}/whatsapp-configurations`,
          dataToSave,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Configuration WhatsApp enregistrée avec succès!");
      }

      setWhatsappConfig({
        account_id: "",
        api_key: "",
        phone_number: "",
        projet_id: "",
      });
      setEditingConfig(null);
      setShowForm(false);

      window.location.reload();

    } catch (error) {
      console.error("Error saving WhatsApp configuration:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement de la configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleEditWhatsApp = (config) => {
    setWhatsappConfig({
      account_id: config.account_id || "",
      api_key: config.api_key || "",
      phone_number: config.phone_number || "",
      projet_id: config.projet_id,
    });
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setWhatsappConfig({
      account_id: "",
      api_key: "",
      phone_number: "",
      projet_id: "",
    });
    setEditingConfig(null);
    setShowForm(false);
  };

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

      toast.success("Webhook configuré avec succès");
      setWebhookConfig({ webhook_verify_token: "" });
      setShowWebhookForm(null);
      window.location.reload();

    } catch (error) {
      console.error("Error saving webhook:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la configuration du webhook");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWebhook = async (configId) => {
    const config = configurations.find(c => c.id === configId);
    setDeleteModal({
      isOpen: true,
      type: 'webhook',
      itemId: configId,
      itemLabel: `Webhook pour ${config?.projet_nom || 'Projet supprimé'}`
    });
  };

  const handleDeleteConfiguration = async (configId) => {
    setDeleteModal({
      isOpen: true,
      type: 'configuration',
      itemId: configId,
      itemLabel: 'Configuration'
    });
  };

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

  const handleToggleWebhook = async (configId, currentStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const newStatus = !currentStatus;

      await axios.put(
        `${APIURL.ROOTV1}/whatsapp-configurations/${configId}/webhook/toggle`,
        { webhook_enabled: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const statusText = newStatus ? 'activé' : 'désactivé';
      toast.success(`Webhook ${statusText} avec succès`);

      setWebhooks(prev => prev.map(webhook =>
        webhook.id === configId
          ? { ...webhook, webhook_enabled: newStatus }
          : webhook
      ));

    } catch (error) {
      console.error("Error toggling webhook:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de la modification du webhook");
      }
    }
  };

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

  if (!user || (user.role !== 1 && user.role !== 2&& user.role !== 10)) {
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
            <h3 className="text-lg font-medium text-gray-900">Configurations WhatsApp Business</h3>
            <p className="mt-1 text-sm text-gray-600">
              Gérez vos configurations WhatsApp Business par projet
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
                            WhatsApp: {config.phone_number || config.whatsapp_number}
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
                          onClick={() => handleDeleteConfiguration(config.id)}
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
                              <p className="text-gray-600 mt-1 break-all">{(process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://votre-domaine.com')) + '/api/webhook_whatsapp'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Token de vérification:</span>
                              <p className="text-gray-600 mt-1 font-mono">
                                {webhook.webhook_verify_token ? '••••••••••••' : 'Non configuré'}
                              </p>
                            </div>
                          </div>

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
                          </div>
                        </div>
                      )}

                      {showWebhookForm === config.id && (
                        <div className="bg-blue-50 p-4 rounded-md mt-3">
                          <h5 className="text-sm font-medium text-blue-900 mb-3">
                            Configurer le webhook pour {config.projet_nom}
                          </h5>
                          <div className="space-y-3">
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

      {/* Modal Configuration Form - Clean WhatsApp Business Style */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCancelEdit}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Modal Header - WhatsApp Brand Colors */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#25D366] to-[#128C7E]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {editingConfig ? 'Modifier la configuration' : 'Nouvelle configuration WhatsApp Business'}
                      </h3>
                      <p className="text-xs text-green-100 mt-0.5">
                        {editingConfig ? 'Mettez à jour vos identifiants' : 'Configurez votre instance WhatsApp Business'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="text-white hover:text-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 bg-gray-50">
                <div className="space-y-4">
                  {/* Project Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="inline h-3.5 w-3.5 mr-1" />
                      Projet à associer *
                    </label>
                    <select
                      name="projet_id"
                      value={whatsappConfig.projet_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
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

                  {/* Account ID - Masks Twilio Account SID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Key className="inline h-3.5 w-3.5 mr-1" />
                      ID du compte WhatsApp Business *
                    </label>
                    <input
                      type="text"
                      name="account_id"
                      value={whatsappConfig.account_id}
                      onChange={handleChange}
                      placeholder="WBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      L'identifiant unique de votre compte WhatsApp Business
                    </p>
                  </div>

                  {/* API Key - Masks Twilio Auth Token */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Lock className="inline h-3.5 w-3.5 mr-1" />
                      Clé API WhatsApp Business *
                    </label>
                    <input
                      type="password"
                      name="api_key"
                      value={whatsappConfig.api_key}
                      onChange={handleChange}
                      placeholder="Votre clé API WhatsApp Business"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      La clé d'authentification de votre application (gardez-la secrète!)
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="inline h-3.5 w-3.5 mr-1" />
                      Numéro WhatsApp Business *
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={whatsappConfig.phone_number}
                      onChange={handleChange}
                      placeholder="+33123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format international: +33 pour France, +1 pour USA, etc.
                    </p>
                  </div>

                  {/* Info Box - Generic WhatsApp Business Setup */}
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <HelpCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-green-800">
                        <p className="font-medium mb-1">Comment obtenir vos identifiants WhatsApp Business ?</p>
                        <ol className="list-decimal list-inside space-y-0.5">
                          <li>Accédez à votre <strong>Meta Business Suite</strong></li>
                          <li>Allez dans <strong>Paramètres → Comptes WhatsApp</strong></li>
                          <li>Copiez l'<strong>ID du compte</strong> et la <strong>Clé API</strong></li>
                          <li>Assurez-vous que votre numéro est vérifié</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveWhatsApp}
                  disabled={saving || !whatsappConfig.account_id || !whatsappConfig.api_key || !whatsappConfig.phone_number || !whatsappConfig.projet_id}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#25D366] rounded-lg hover:bg-[#20BA5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4 mr-2" />
                      {editingConfig ? 'Mettre à jour' : 'Enregistrer la configuration'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide - Generic WhatsApp Business */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-start">
            <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-900">Configuration WhatsApp Business API</h3>
              <div className="mt-3 text-sm text-green-800">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-900 mb-2">📋 Étape 1 : Créer une application Meta Business</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-xs">
                      <li>Allez sur <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900 font-medium">developers.facebook.com</a></li>
                      <li>Cliquez sur <strong>"Mes apps"</strong> puis <strong>"Créer une app"</strong></li>
                      <li>Sélectionnez <strong>"Business"</strong> comme type d'application</li>
                      <li>Remplissez le nom de l'app et votre email</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-900 mb-2">📱 Étape 2 : Configurer WhatsApp Business</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-xs">
                      <li>Ajoutez <strong>"WhatsApp Business Management"</strong> à votre application</li>
                      <li>Suivez les instructions pour configurer votre numéro</li>
                      <li>Acceptez les conditions d'utilisation</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-900 mb-2">🔑 Étape 3 : Récupérer vos identifiants</h4>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-xs">
                      <li>Dans <strong>WhatsApp → Prise en main</strong>, copiez l'ID du compte</li>
                      <li>Générez votre clé API dans <strong>Paramètres → Avancé</strong></li>
                      <li>⚠️ <strong>Important :</strong> Gardez ces informations secrètes !</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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