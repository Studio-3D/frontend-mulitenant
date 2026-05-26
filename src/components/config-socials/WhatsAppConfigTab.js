"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { SaveIcon, AlertCircleIcon, Loader, Trash2, Plus, CheckCircle, MessageCircle, Globe, Edit, ChevronDown, ChevronUp, HelpCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import SelectInput from "../SelectInput";
import { Eye, EyeOff } from "lucide-react";

export default function WhatsAppConfigTab() {
  const [showAccessToken, setShowAccessToken] = useState(false);

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [whatsappConfig, setWhatsappConfig] = useState({
    phone_number_id: "",
    access_token: "",
    account_sid: "",
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

    if (user && (user.role === 1 || user.role === 2 || user.role === 10)) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Refresh data without page reload
  const refreshData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Refresh configurations
      const configResponse = await axios.get(`${APIURL.ROOTV1}/whatsapp-configurations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (configResponse.data?.configurations) {
        setConfigurations(configResponse.data.configurations);
      }
      
      // Refresh webhooks
      const webhookResponse = await axios.get(`${APIURL.ROOTV1}/whatsapp-webhooks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (webhookResponse.data?.webhooks) {
        setWebhooks(webhookResponse.data.webhooks);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setWhatsappConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add this validation function before the handleSaveWhatsApp function
const validatePhoneNumberId = (phoneNumberId) => {
  if (!phoneNumberId) return false;
  // Check if it starts with 212 and has at least 9 digits after (total 12 digits)
  const phoneRegex = /^212\d{9}$/;
  return phoneRegex.test(phoneNumberId);
};
  // Save or Update WhatsApp configuration
  const handleSaveWhatsApp = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");

      if (!whatsappConfig.phone_number_id || !whatsappConfig.access_token || !whatsappConfig.projet_id || !whatsappConfig.account_sid) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Add phone number validation
    if (!validatePhoneNumberId(whatsappConfig.phone_number_id)) {
      toast.error("Le numéro de téléphone doit commencer par 212 et contenir exactement 12 chiffres (ex: 212612345678)");
      return;
    }
      const dataToSave = {
        phone_number_id: whatsappConfig.phone_number_id,
        access_token: whatsappConfig.access_token,
        account_sid: whatsappConfig.account_sid,
        projet_id: whatsappConfig.projet_id,
      };

      if (editingConfig) {
        await axios.put(
          `${APIURL.ROOTV1}/whatsapp-configurations/${editingConfig.id}`,
          dataToSave,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Configuration WhatsApp mise à jour avec succès!");
      } else {
        await axios.post(
          `${APIURL.ROOTV1}/whatsapp-configurations`,
          dataToSave,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Configuration WhatsApp enregistrée avec succès!");
      }

      setWhatsappConfig({
        phone_number_id: "",
        access_token: "",
        account_sid: "",
        projet_id: "",
      });
      setEditingConfig(null);
      setIsModalOpen(false);
      
      await refreshData();

    } catch (error) {
      console.error("Error saving WhatsApp configuration:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement de la configuration");
    } finally {
      setSaving(false);
    }
  };

  const [phoneNumberError, setPhoneNumberError] = useState("");
// Add validation on input change
const handlePhoneNumberChange = (e) => {
  const value = e.target.value;
  
  // Optional: Auto-add 212 prefix if user starts typing without it
  let formattedValue = value;
  if (value && !value.startsWith('212')) {
    // You can either show error or auto-add prefix
    // Option 1: Show error
    setPhoneNumberError("Le numéro doit commencer par 212");
    formattedValue = value;
  } else if (value && value.startsWith('212')) {
    setPhoneNumberError("");
    // Option 2: Auto-format to remove any non-digit characters
    formattedValue = value.replace(/\D/g, '');
  } else {
    setPhoneNumberError("");
  }
  
  setWhatsappConfig(prev => ({
    ...prev,
    phone_number_id: formattedValue
  }));
};

  // Edit WhatsApp configuration
  const handleEditWhatsApp = (config) => {
    setWhatsappConfig({
      phone_number_id: config.phone_number_id,
      access_token: config.access_token,
      account_sid: config.account_sid || "",
      projet_id: config.projet_id,
    });
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setWhatsappConfig({
      phone_number_id: "",
      access_token: "",
      account_sid: "",
      projet_id: "",
    });
    setEditingConfig(null);
    setIsModalOpen(false);
    setShowForm(false);
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
        `${APIURL.ROOTV1}/whatsapp-configurations/${configId}/webhook`,
        webhookConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Webhook WhatsApp configuré avec succès");

      setWebhookConfig({ webhook_verify_token: "" });
      setShowWebhookForm(null);
      
      await refreshData();

    } catch (error) {
      console.error("Error saving webhook:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la configuration du webhook");
    } finally {
      setSaving(false);
    }
  };

  // Delete webhook configuration
  const handleDeleteWebhook = (configId) => {
    const config = configurations.find(c => c.id === configId);
    setDeleteModal({
      isOpen: true,
      type: 'webhook',
      itemId: configId,
      itemLabel: `Webhook pour ${config?.projet_nom || 'Projet supprimé'}`
    });
  };

  // Delete webhook function
  const deleteWebhook = async (configId) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(`${APIURL.ROOTV1}/whatsapp-configurations/${configId}/webhook`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Webhook supprimé avec succès");
      
      await refreshData();

    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Erreur lors de la suppression du webhook");
      throw error;
    }
  };

  // Delete configuration
  const handleDeleteConfiguration = async (configId) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete(`${APIURL.ROOTV1}/whatsapp-configurations/${configId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Configuration WhatsApp supprimée avec succès!");
      
      await refreshData();

    } catch (error) {
      console.error("Error deleting WhatsApp configuration:", error);
      toast.error("Erreur lors de la suppression de la configuration");
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    const { type, itemId } = deleteModal;
    try {
      if (type === 'configuration') {
        await handleDeleteConfiguration(itemId);
      } else if (type === 'webhook') {
        await deleteWebhook(itemId);
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
    setDeleteModal({ isOpen: false, type: null, itemId: null, itemLabel: '' });
  };

  // Toggle webhook enable/disable
  const handleToggleWebhook = async (configId, currentStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const newStatus = !currentStatus;

      await axios.put(
        `${APIURL.ROOTV1}/whatsapp-configurations/${configId}/webhook/toggle`,
        { webhook_enabled: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const statusText = newStatus ? 'activé' : 'désactivé';
      toast.success(`Webhook ${statusText} avec succès`);
      
      await refreshData();

    } catch (error) {
      console.error("Error toggling webhook:", error);

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

  if (!user || (user.role !== 1 && user.role !== 2 && user.role !== 10)) {
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
            onClick={() => {
              setEditingConfig(null);
              setWhatsappConfig({
                phone_number_id: "",
                access_token: "",
                account_sid: "",
                projet_id: "",
              });
              setIsModalOpen(true);
            }}
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

                    {/* Webhook Section 
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
                    </div>*/}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL - Configuration WhatsApp */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsModalOpen(false)}></div>

            {/* Modal Content */}
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 pt-5 pb-4 bg-white">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingConfig ? 'Modifier la configuration WhatsApp' : 'Nouvelle configuration WhatsApp'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {/* SelectInput pour le projet */}
                {/* SelectInput pour le projet */}
                <SelectInput
                  placeholder="Sélectionner un projet"
                  label="Projet à associer"
                  name="projet_id"
                  value={whatsappConfig.projet_id}
                  required={true}
                  options={
                    editingConfig
                      ? projets.map((projet) => ({
                          value: projet.id,
                          label: projet.nom,
                        }))
                      : projets
                          .filter((projet) => {
                            // Vérifier si le projet n'a pas déjà une configuration
                            const hasConfig = configurations.some(
                              (config) => config.projet_id === projet.id
                            );
                            return !hasConfig;
                          })
                          .map((projet) => ({
                            value: projet.id,
                            label: projet.nom,
                          }))
                  }
                  onChange={(value) => {
                    setWhatsappConfig(prev => ({
                      ...prev,
                      projet_id: value
                    }));
                  }}
                />

                {/* Message si tous les projets sont configurés */}
                {!editingConfig && projets.filter(projet => 
                  !configurations.some(config => config.projet_id === projet.id)
                ).length === 0 && projets.length > 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    <AlertCircleIcon className="h-3 w-3 inline mr-1" />
                    Tous les projets ont déjà une configuration WhatsApp. Vous pouvez modifier les configurations existantes.
                  </div>
                )}

                  {/* Phone Number ID */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone_number_id"
                    value={whatsappConfig.phone_number_id}
                    onChange={handlePhoneNumberChange}
                    placeholder="212612345678"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366] ${
                      phoneNumberError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {phoneNumberError ? (
                    <p className="text-xs text-red-500">
                      {phoneNumberError}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Le numéro doit commencer par <strong className="text-gray-700">212</strong> et contenir exactement 12 chiffres (ex: 212612345678)
                    </p>
                  )}
                </div>

                  {/* Account SID */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Account SID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="account_sid"
                      value={whatsappConfig.account_sid}
                      onChange={(e) => setWhatsappConfig(prev => ({
                        ...prev,
                        account_sid: e.target.value
                      }))}
                      placeholder="Votre Account SID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366]"
                    />
                  </div>

                  {/* Access Token */}
                  {/* Access Token */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Access Token <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showAccessToken ? "text" : "password"}
                    name="access_token"
                    value={whatsappConfig.access_token}
                    onChange={(e) => setWhatsappConfig(prev => ({
                      ...prev,
                      access_token: e.target.value
                    }))}
                    placeholder="Votre Access Token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showAccessToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSaveWhatsApp}
                  disabled={saving || !whatsappConfig.phone_number_id || !whatsappConfig.access_token || !whatsappConfig.projet_id || !whatsappConfig.account_sid}
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-[#25D366] border border-transparent rounded-md shadow-sm hover:bg-[#20BA5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    editingConfig ? 'Mettre à jour' : 'Enregistrer'
                  )}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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