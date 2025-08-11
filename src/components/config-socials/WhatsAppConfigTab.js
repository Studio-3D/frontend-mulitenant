"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { SaveIcon, AlertCircleIcon, Loader, Trash2, Plus, CheckCircle, MessageCircle, Globe, Settings } from "lucide-react";
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
  
  const [whatsappConfig, setWhatsappConfig] = useState({
    instance_id: "",
    token: "",
    webhook_url: "",
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
        
        // For now, we'll simulate the API calls since the backend endpoints don't exist yet
        // TODO: Replace with actual API calls when backend endpoints are implemented
        
        // Simulated configurations - replace with actual API call
        // const configResponse = await axios.get(`${APIURL.ROOTV1}/whatsapp-configurations`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        
        // Simulated webhooks - replace with actual API call  
        // const webhookResponse = await axios.get(`${APIURL.ROOTV1}/whatsapp-webhooks`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });

        // For now, set empty arrays
        setConfigurations([]);
        setWebhooks([]);
        
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

  const handleWebhookChange = (e) => {
    const { name, value } = e.target;
    setWebhookConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save WhatsApp configuration
  const handleSaveWhatsApp = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      if (!whatsappConfig.instance_id || !whatsappConfig.token || !whatsappConfig.projet_id) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // TODO: Replace with actual API call when backend endpoint is implemented
      // await axios.post(
      //   `${APIURL.ROOTV1}/whatsapp-configurations`,
      //   whatsappConfig,
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );

      // For now, just show success message
      toast.success("Configuration WhatsApp enregistrée avec succès!");
      
      // Reset form
      setWhatsappConfig({
        instance_id: "",
        token: "",
        webhook_url: "",
        projet_id: "",
      });
      setShowForm(false);
      
      // TODO: Refresh configurations list when API is implemented
      // fetchData();
      
    } catch (error) {
      console.error("Error saving WhatsApp configuration:", error);
      toast.error("Erreur lors de l'enregistrement de la configuration");
    } finally {
      setSaving(false);
    }
  };

  // Save webhook configuration
  const handleSaveWebhook = async (configId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      if (!webhookConfig.webhook_verify_token) {
        toast.error("Veuillez remplir le token de vérification");
        return;
      }

      // TODO: Replace with actual API call when backend endpoint is implemented
      // await axios.post(
      //   `${APIURL.ROOTV1}/whatsapp-configurations/${configId}/webhook`,
      //   webhookConfig,
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );

      toast.success("Webhook WhatsApp configuré avec succès!");
      setWebhookConfig({ webhook_verify_token: "" });
      setShowWebhookForm(null);
      
      // TODO: Refresh webhooks list when API is implemented
      
    } catch (error) {
      console.error("Error saving WhatsApp webhook:", error);
      toast.error("Erreur lors de la configuration du webhook");
    } finally {
      setSaving(false);
    }
  };

  // Delete configuration
  const handleDeleteConfiguration = async (configId) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      // TODO: Replace with actual API call when backend endpoint is implemented
      // await axios.delete(`${APIURL.ROOTV1}/whatsapp-configurations/${configId}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      toast.success("Configuration WhatsApp supprimée avec succès!");
      
      // TODO: Refresh configurations list when API is implemented
      
    } catch (error) {
      console.error("Error deleting WhatsApp configuration:", error);
      toast.error("Erreur lors de la suppression de la configuration");
    }
  };

  // Delete webhook
  const handleDeleteWebhook = async (configId) => {
    try {
      const token = localStorage.getItem("accessToken");
      
      // TODO: Replace with actual API call when backend endpoint is implemented
      // await axios.delete(`${APIURL.ROOTV1}/whatsapp-configurations/${configId}/webhook`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      toast.success("Webhook WhatsApp supprimé avec succès!");
      
      // TODO: Refresh webhooks list when API is implemented
      
    } catch (error) {
      console.error("Error deleting WhatsApp webhook:", error);
      toast.error("Erreur lors de la suppression du webhook");
    }
  };

  // Get webhook for configuration
  const getWebhookForConfig = (configId) => {
    return webhooks.find(webhook => webhook.id === configId);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteModal.type === 'configuration') {
      handleDeleteConfiguration(deleteModal.itemId);
    } else if (deleteModal.type === 'webhook') {
      handleDeleteWebhook(deleteModal.itemId);
    }
    setDeleteModal({ isOpen: false, type: null, itemId: null, itemLabel: '' });
  };

  // Toggle webhook enable/disable
  const handleToggleWebhook = async (configId, currentStatus) => {
    try {
      const token = localStorage.getItem("accessToken");
      const newStatus = !currentStatus;
      
      // TODO: Replace with actual API call when backend endpoint is implemented
      // await axios.put(
      //   `${APIURL.ROOTV1}/whatsapp-configurations/${configId}/webhook/toggle`,
      //   { webhook_enabled: newStatus },
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   }
      // );
      
      const statusText = newStatus ? 'activé' : 'désactivé';
      toast.success(`Webhook ${statusText} avec succès`);
      
      // TODO: Update local state when API is implemented
      
    } catch (error) {
      console.error("Error toggling WhatsApp webhook:", error);
      toast.error("Erreur lors de la modification du webhook");
    }
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
                            {config.projet?.nom || 'Projet supprimé'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Instance ID: {config.instance_id}
                          </p>
                          <p className="text-xs text-gray-400">
                            Configuré le {new Date(config.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteModal({
                          isOpen: true,
                          type: 'configuration',
                          itemId: config.id,
                          itemLabel: config.projet?.nom || 'Configuration'
                        })}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-start">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Configuration WhatsApp avec UltraMsg</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">
                  Pour configurer WhatsApp, vous devez avoir un compte UltraMsg actif. Voici les étapes :
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Créez un compte sur <a href="https://ultramsg.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">UltraMsg.com</a></li>
                  <li>Créez une nouvelle instance WhatsApp</li>
                  <li>Récupérez votre Instance ID et Token depuis le tableau de bord</li>
                  <li>Configurez le webhook URL : <code className="bg-blue-100 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : 'https://votre-domaine.com'}/api/webhook_whtsp</code></li>
                </ol>
                <p className="mt-2 text-xs">
                  <strong>Note :</strong> Le webhook est déjà configuré dans le système pour recevoir les messages WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Nouvelle Configuration WhatsApp</h3>
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
                  {projets
                    .filter(projet => !configurations.some(config => config.projet_id === projet.id))
                    .map((projet) => (
                      <option key={projet.id} value={projet.id}>
                        {projet.nom}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Instance ID UltraMsg *
                </label>
                <input
                  type="text"
                  name="instance_id"
                  value={whatsappConfig.instance_id}
                  onChange={handleChange}
                  placeholder="Votre Instance ID UltraMsg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366]"
                  required
                />
                <p className="text-xs text-gray-500">
                  L'ID de votre instance UltraMsg (ex: instance12345)
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Token UltraMsg *
                </label>
                <input
                  type="password"
                  name="token"
                  value={whatsappConfig.token}
                  onChange={handleChange}
                  placeholder="Votre token UltraMsg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366]"
                  required
                />
                <p className="text-xs text-gray-500">
                  Le token d'authentification de votre instance UltraMsg
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  URL Webhook (optionnel)
                </label>
                <input
                  type="url"
                  name="webhook_url"
                  value={whatsappConfig.webhook_url}
                  onChange={handleChange}
                  placeholder="https://votre-domaine.com/api/webhook_whtsp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#25D366] focus:border-[#25D366]"
                />
                <p className="text-xs text-gray-500">
                  URL pour recevoir les webhooks WhatsApp (actuellement: /api/webhook_whtsp)
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveWhatsApp}
                  disabled={saving || !whatsappConfig.instance_id || !whatsappConfig.token || !whatsappConfig.projet_id}
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
        </div>
      )}

      {/* Webhook Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-start">
            <Globe className="h-5 w-5 text-gray-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">Informations Webhook</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p className="mb-2">
                  Le système est configuré pour recevoir les webhooks WhatsApp sur l'endpoint suivant :
                </p>
                <div className="bg-white border rounded p-3 font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">POST {typeof window !== 'undefined' ? window.location.origin : 'https://votre-domaine.com'}/api/webhook_whtsp</span>
                    <button
                      onClick={() => typeof window !== 'undefined' && navigator.clipboard.writeText(`${window.location.origin}/api/webhook_whtsp`)}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Copier
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Utilisez cette URL dans la configuration webhook de votre instance UltraMsg.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
