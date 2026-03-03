'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import {
  Box,
  SaveIcon,
  AlertCircleIcon,
  Loader,
  Trash2,
  Plus,
  CheckCircle,
  Settings,
  Globe,
  Edit,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function FacebookConfigTab() {
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const { user } = useAuth();
  const { projets } = useProjet();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [showWebhookForm, setShowWebhookForm] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [facebookConfig, setFacebookConfig] = useState({
    page_fcb_id: '',
    acces_token_page: '',
    acces_token_page_short_term: '',
    projet_id: '',
  });

  const [webhookConfig, setWebhookConfig] = useState({
    webhook_verify_token: '',
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    itemId: null,
    itemLabel: '',
  });

  // Fetch configurations and webhooks
  useEffect(() => {
    const fetchData = async () => {
      if (user && (user.role === 1 || user.role === 2)) {
        try {
          setLoading(true);
          const token = localStorage.getItem('accessToken');

          // Fetch configurations
          const configResponse = await axios.get(
            `${APIURL.ROOTV1}/facebook-configurations`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (configResponse.data?.configurations) {
            setConfigurations(configResponse.data.configurations);
          }

          // Fetch webhooks
          const webhookResponse = await axios.get(
            `${APIURL.ROOTV1}/facebook-webhooks`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (webhookResponse.data?.webhooks) {
            setWebhooks(webhookResponse.data.webhooks);
          }
        } catch (error) {
          console.error('Error fetching Facebook data:', error);
          toast.error('Erreur lors du chargement des configurations');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Get projects without existing configurations
  const getAvailableProjets = () => {
    const configuredProjetIds = configurations.map(
      (config) => config.projet_id
    );
    return projets.filter((projet) => !configuredProjetIds.includes(projet.id));
  };

  // Get webhook for configuration
  const getWebhookForConfig = (configId) => {
    return webhooks.find((webhook) => webhook.id === configId);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacebookConfig((prev) => ({ ...prev, [name]: value }));
  };

  // Save or Update Facebook configuration
  // Modifiez la fonction handleSaveFacebook pour éviter les toast multiples
  const handleSaveFacebook = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');

      if (
        !facebookConfig.page_fcb_id ||
        !facebookConfig.acces_token_page ||
        !facebookConfig.acces_token_page_short_term ||
        !facebookConfig.projet_id
      ) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }

      const dataToSave = {
        page_fcb_id: facebookConfig.page_fcb_id,
        acces_token_page: facebookConfig.acces_token_page,
        acces_token_page_short_term: facebookConfig.acces_token_page_short_term,
        projet_id: facebookConfig.projet_id,
      };

      if (editingConfig) {
        // Update existing configuration
        await axios.put(
          `${APIURL.ROOTV1}/facebook-configurations/${editingConfig.id}`,
          dataToSave,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Configuration Facebook mise à jour avec succès');
      } else {
        // Create new configuration
        await axios.post(
          `${APIURL.ROOTV1}/facebook-configurations`,
          dataToSave,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Configuration Facebook créée avec succès');
      }

      // Reset form and refresh data
      resetForm();
      await refreshData();
    } catch (error) {
      console.error('Error saving Facebook configuration:', error);

      // Utilisez un seul toast {"d'"}erreur
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erreur lors de l'enregistrement de la configuration";

      // Évitez les doublons en utilisant toast.error directement
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Refresh data without page reload
  const refreshData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      // Refresh configurations
      const configResponse = await axios.get(
        `${APIURL.ROOTV1}/facebook-configurations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (configResponse.data?.configurations) {
        setConfigurations(configResponse.data.configurations);
      }

      // Refresh webhooks
      const webhookResponse = await axios.get(
        `${APIURL.ROOTV1}/facebook-webhooks`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (webhookResponse.data?.webhooks) {
        setWebhooks(webhookResponse.data.webhooks);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFacebookConfig({
      page_fcb_id: '',
      acces_token_page: '',
      acces_token_page_short_term: '',
      projet_id: '',
    });
    setEditingConfig(null);
    setShowModal(false);
  };

  // Handle edit
  const handleEditFacebook = (config) => {
    setFacebookConfig({
      page_fcb_id: config.page_fcb_id || '',
      acces_token_page: config.acces_token_page || '',
      acces_token_page: config.acces_token_page || '',
      projet_id: config.projet_id || '',
    });
    setEditingConfig(config);
    setShowGuide(false);
    setShowModal(true);
  };

  // Handle new configuration
  const handleNewConfiguration = () => {
    resetForm();
    setShowGuide(true);
    setShowModal(true);
  };

  // Handle cancel
  const handleCancelEdit = () => {
    resetForm();
  };

  // Delete configuration
  const handleDeleteConfiguration = async (configId) => {
    const config = configurations.find((c) => c.id === configId);
    setDeleteModal({
      isOpen: true,
      type: 'configuration',
      itemId: configId,
      itemLabel: `Configuration Facebook pour ${
        config?.projet?.nom || 'Projet supprimé'
      }`,
    });
  };

  // Webhook functions
  // Modifiez aussi la fonction handleSaveWebhook
  const handleSaveWebhook = async (configId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');

      if (!webhookConfig.webhook_verify_token) {
        toast.error('Veuillez saisir un token de vérification');
        return;
      }

      const response = await axios.post(
        `${APIURL.ROOTV1}/facebook-configurations/${configId}/webhook`,
        webhookConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Vérifiez si la réponse contient un message de succès
      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Webhook configuré avec succès');
      }

      setWebhookConfig({ webhook_verify_token: '' });
      setShowWebhookForm(null);
      await refreshData();
    } catch (error) {
      console.error('Error saving webhook:', error);

      // Un seul toast {"d'"}erreur
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erreur lors de la configuration du webhook';

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWebhook = async (configId) => {
    const config = configurations.find((c) => c.id === configId);
    setDeleteModal({
      isOpen: true,
      type: 'webhook',
      itemId: configId,
      itemLabel: `Webhook pour ${config?.projet?.nom || 'Projet supprimé'}`,
    });
  };

  // Modifiez aussi handleToggleWebhook
  const handleToggleWebhook = async (configId, currentStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = !currentStatus;

      const response = await axios.put(
        `${APIURL.ROOTV1}/facebook-configurations/${configId}/webhook/toggle`,
        { webhook_enabled: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Vérifiez si la réponse contient un message
      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success(
          `Webhook ${newStatus ? 'activé' : 'désactivé'} avec succès`
        );
      }

      await refreshData();
    } catch (error) {
      console.error('Error toggling webhook:', error);

      // Un seul toast {"d'"}erreur
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erreur lors de la modification du webhook';

      toast.error(errorMessage);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirmed = async () => {
    const { type, itemId } = deleteModal;

    try {
      const token = localStorage.getItem('accessToken');

      if (type === 'configuration') {
        await axios.delete(
          `${APIURL.ROOTV1}/facebook-configurations/${itemId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Configuration supprimée avec succès');
      } else if (type === 'webhook') {
        await axios.delete(
          `${APIURL.ROOTV1}/facebook-configurations/${itemId}/webhook`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Webhook supprimé avec succès');
      }

      await refreshData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">
            Chargement des configurations Facebook...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Configuration Facebook
          </h2>
          <p className="text-gray-600">
            Gérez vos configurations Facebook par projet
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleNewConfiguration}
            disabled={getAvailableProjets().length === 0 && !editingConfig}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Nouvelle configuration
          </button>

          <button
            onClick={() => setShowWebhookGuide(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <HelpCircle className="h-4 w-4" />
            Guide Webhook
          </button>
        </div>
      </div>

      {/* Info if all projects have configurations */}
      {getAvailableProjets().length === 0 &&
        projets.length > 0 &&
        !editingConfig && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex items-start">
              <AlertCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-blue-800">
                  Tous vos projets ont déjà une configuration Facebook. Vous
                  pouvez modifier une configuration existante ou créer un
                  nouveau projet.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Existing Configurations List */}
      {configurations.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Configurations existantes
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {configurations.length} configuration(s) Facebook
            </p>
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
                            Configuré le{' '}
                            {new Date(config.created_at).toLocaleDateString(
                              'fr-FR'
                            )}
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
                          <h4 className="text-sm font-medium text-gray-700">
                            Configuration Webhook
                          </h4>
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
                              <span className="font-medium text-gray-700">
                                URL Webhook:
                              </span>
                              <p className="text-gray-600 mt-1 break-all">
                                {webhook.webhook_url}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Événements requis:
                              </span>
                              <p className="text-gray-600 mt-1">
                                feed, mention, messages
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                ⚠️ Configurer dans Facebook Developer Console
                              </p>
                            </div>
                          </div>

                          {/* Instructions 
                          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                            <h5 className="text-xs font-medium text-purple-800 mb-2 flex items-center">
                              <AlertCircleIcon className="h-3 w-3 mr-1" />
                              Configuration obligatoire dans Facebook Developer Console :
                            </h5>
                            <ol className="list-decimal pl-4 space-y-2 text-xs text-purple-700">
                              <li>Allez sur Facebook Developer Console (developers.facebook.com)</li>
                              <li>Sélectionnez votre application ou créez-en une nouvelle</li>
                              <li>Ajoutez le produit Webhooks</li>
                              <li>Sélectionnez Page dans la section Webhooks</li>
                              <li>
                                <strong>Configurez l'URL du callback :</strong>
                                <code className="block bg-white px-2 py-1 rounded text-purple-800 mt-1 font-mono">
                                  https://immogestion.live/api/webhookFcb_Insta
                                </code>
                              </li>
                              <li>Utilisez le même token de vérification</li>
                              <li>
                                <strong>Abonnez-vous aux permissions :</strong>
                                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                  <li><strong>messaging</strong> (tous les types de messages)</li>
                                  <li><strong>feed</strong></li>
                                  <li><strong>mention</strong></li>
                                  <li><strong>messages</strong></li>
                                  <li><strong>message_context</strong></li>
                                  <li><strong>videos</strong></li>
                                  <li><strong>description</strong></li>
                                  <li><strong>general_info</strong></li>
                                  <li><strong>attachments</strong></li>
                                </ul>
                              </li>
                              <li>Cliquez sur "S'abonner" pour activer</li>
                            </ol>
                          </div>*/}

                          {/* Toggle */}
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">
                                État du webhook:
                              </span>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-xs ${
                                    webhook.webhook_enabled
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {webhook.webhook_enabled
                                    ? 'Activé'
                                    : 'Désactivé'}
                                </span>
                                {/*<button
                                  onClick={() =>
                                    handleToggleWebhook(
                                      config.id,
                                      webhook.webhook_enabled
                                    )
                                  }
                                  className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                                    webhook.webhook_enabled
                                      ? 'bg-green-500'
                                      : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                                      webhook.webhook_enabled
                                        ? 'translate-x-4'
                                        : 'translate-x-0.5'
                                    }`}
                                  />
                                </button>*/}
                              </div>
                            </div>
                            {/* Version compacte */}
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <div className="flex items-start space-x-2">
                                <AlertCircleIcon className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-medium text-yellow-700 mb-1">
                                    ⚠️ Configuration Facebook Developer Console
                                    requise
                                  </p>
                                  {/*<p className="text-yellow-600 mb-2">
                                    Configurez {"d'"}abord les webhooks dans
                                    Facebook avant {"d'"}activer ici.
                                  </p>*/}
                                  <button
                                    onClick={() => setShowWebhookGuide(true)}
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline font-medium text-xs"
                                  >
                                    <HelpCircle className="h-3 w-3" />
                                    Voir le guide de configuration étape par
                                    étape
                                  </button>
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

                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-start space-x-2">
                              <AlertCircleIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">
                                  Configuration requise :
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                  <li>Allez sur Facebook Developer Console</li>
                                  <li>Ajoutez le produit Webhooks</li>
                                  <li>Sélectionnez Page</li>
                                  <li>
                                    URL du webhook :{' '}
                                    <code className="bg-white px-1 rounded">
                                      https://immogestion.live/api/webhookFcb_Insta
                                    </code>
                                  </li>
                                  <li>Utilisez le même token ci-dessous</li>
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
                                onChange={(e) =>
                                  setWebhookConfig({
                                    webhook_verify_token: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 text-sm border border-blue-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Saisissez un token de vérification unique"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveWebhook(config.id)}
                                disabled={
                                  saving || !webhookConfig.webhook_verify_token
                                }
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
                                  setWebhookConfig({
                                    webhook_verify_token: '',
                                  });
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
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune configuration Facebook
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre première configuration
          </p>
        </div>
      )}

      {/* Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={handleCancelEdit}
            />

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Settings className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingConfig
                          ? 'Modifier Configuration'
                          : 'Nouvelle Configuration Facebook'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {editingConfig
                          ? 'Mettez à jour les paramètres'
                          : 'Configurez une nouvelle intégration'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircleIcon className="h-5 w-5 text-blue-600" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Comment configurer {"l'intégration"} Facebook
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 space-y-1">
                        <p>
                          Vous avez besoin de trois informations principales:
                        </p>
                        <ol className="list-decimal pl-5 space-y-2 mt-2">
                          <li>
                            <strong>Projet à associer</strong>: Sélectionnez un
                            projet
                          </li>
                          <li>
                            <strong>ID de la Page Facebook</strong>: Identifiant
                            numérique
                          </li>
                          <li>
                            <strong>Token {"d'"}accès à la Page</strong>: Jeton
                            {"d'"}authentification
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guide Section */}
                {showGuide && (
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          Guide de configuration
                        </h3>
                        <button
                          onClick={() => setShowGuide(!showGuide)}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                        >
                          <HelpCircle className="h-4 w-4" />
                          {showGuide ? 'Masquer' : 'Afficher'}
                          {showGuide ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="space-y-3 text-sm">
                        <p className="text-gray-700">
                          <strong>1. Créer une Page Facebook Business :</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                          <li>Connectez-vous à Facebook</li>
                          <li>Cliquez sur Pages</li>
                          <li>Créez une nouvelle page</li>
                        </ul>

                        <p className="text-gray-700 mt-4">
                          <strong>2. Obtenir {"l'"}ID de la Page :</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                          <li>Allez sur votre page Facebook</li>
                          <li>Cliquez sur À propos ou Nom de la page </li>
                          <li>Cliquer sur Transparence de la Page</li>
                          <li>Faites défiler pour voir ID de la page</li>
                        </ul>

                        <p className="text-gray-700 mt-4">
                          <strong>
                            3. Générer le Token {"d'"}accès à court terme:
                          </strong>
                        </p>
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-800 mb-2">
                            🎯 Comment obtenir votre Token Facebook à court
                            terme :
                          </h4>

                          <div className="space-y-3">
                            {/* Étape 1 */}
                            <div className="flex items-start bg-white p-3 rounded-lg border">
                              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                1
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  Créez votre application Facebook
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  • Allez sur{' '}
                                  <strong>developers.facebook.com</strong>
                                  <br />• Cliquez sur{' '}
                                  <strong>Créer une application</strong>
                                  <br />• <strong>Nom</strong> : Donnez un nom à
                                  votre app
                                  <br />• <strong>Email</strong> : Votre email
                                  professionnel
                                  <br />• <strong>
                                    Cas d{"'"}utilisation
                                  </strong>{' '}
                                  :{' '}
                                  <span className="text-blue-600 font-bold">
                                    Tous → Autre
                                  </span>
                                  <br />• <strong>Type d{"'"}app</strong> :{' '}
                                  <span className="text-blue-600 font-bold">
                                    Entreprise
                                  </span>
                                   <br />• <strong>Passer Application en Mode</strong> :{' '}
                                  <span className="text-blue-600 font-bold">
                                    Live en donnant un URL de la Politique de confidentialité 
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Étape 2 */}
                            <div className="flex items-start bg-white p-3 rounded-lg border">
                              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                2
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  Générez et copiez le token
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  • Allez dans{' Outil '}
                                  <strong>Explorateur Api Graph</strong>
                                  <br />
                                  • Sélectionnez votre application
                                  <br />
                                  • Sélectionnez votre Page Facebook
                                  <br />
                                  • Générez un token avec ces permissions :
                                  <br />
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                                    pages_show_list
                                  </code>{' '}
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    pages_read_engagement
                                  </code>{' '}
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    pages_manage_posts
                                  </code>
                                   <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    pages_messaging
                                  </code>
                                   <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    pages_manage_metadata
                                  </code>

                                  <br />•{' '}
                                  <strong>Copiez le token généré</strong>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start">
                              <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                                ✓
                              </div>
                              <div>
                                <p className="text-sm text-green-800">
                                  <strong>Conseil :</strong> En choisissant Tous
                                  → Autre, vous avez accès à toutes les
                                  permissions nécessaires sans limitation. C
                                  {"'"}est l{"'"}option recommandée pour une
                                  intégration complète.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mt-4">
                          <strong>
                            4. Générer le Token d {"'"}accès à long terme:
                          </strong>
                        </p>
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-800 mb-2">
                            🔄 Comment prolonger votre token pour 60 jours :
                          </h4>

                          <div className="space-y-3">
                            {/* Étape 1 */}
                            <div className="flex items-start bg-white p-3 rounded-lg border">
                              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                1
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  Ouvrez l{"'"}outil de débogage de token
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  • Allez sur{' '}
                                  <strong>developers.facebook.com</strong>
                                  <br />• Cliquez sur <strong>
                                    Outils
                                  </strong>{' '}
                                  dans le menu supérieur
                                  <br />• Sélectionnez{' '}
                                  <strong>Debug Access Token</strong>
                                  <br />• Ou accédez directement à :{' '}
                                  <a
                                    href="https://developers.facebook.com/tools/debug/accesstoken/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    developers.facebook.com/tools/debug/accesstoken/
                                  </a>
                                </p>
                              </div>
                            </div>

                            {/* Étape 2 */}
                            <div className="flex items-start bg-white p-3 rounded-lg border">
                              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                2
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  Collez et déboguez votre token à court terme
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  • <strong>Collez</strong> votre token à court
                                  terme dans le champ de saisie
                                  <br />• Cliquez sur{' '}
                                  <strong className="text-green-600">
                                    Déboguer
                                  </strong>
                                  <br />• Attendez que les informations s{"'"}
                                  affichent
                                  <br />• Vérifiez que toutes les permissions
                                  sont présentes :
                                  <br />
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                                    pages_show_list ✓
                                  </code>{' '}
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    pages_read_engagement ✓
                                  </code>{' '}
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    pages_manage_posts ✓
                                  </code>
                                </p>
                              </div>
                            </div>

                            {/* Étape 3 */}
                            <div className="flex items-start bg-white p-3 rounded-lg border">
                              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                                3
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  Prolongez le token pour 60 jours
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  • Sur la page de débogage, cherchez{' '}
                                  <strong>Étendre {"l'"}accès</strong>
                                  <br />• Cliquez sur le bouton{' '}
                                  <strong className="text-blue-600">
                                    Étendre
                                  </strong>
                                  <br />• Confirmez {"l'"}action si demandé
                                  <br />• Votre token est maintenant valide pour{' '}
                                  <strong>60 jours</strong>
                                  <br />•{' '}
                                  <strong>Copiez ce nouveau token</strong> et
                                  collez-le dans le formulaire ci-dessus
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start">
                              <div className="bg-yellow-100 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                                ⚠️
                              </div>
                              <div>
                                <p className="text-sm text-yellow-800">
                                  <strong>Important :</strong> Ce token expire
                                  après 60 jours.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                              <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                                💡
                              </div>
                              <div>
                                <p className="text-sm text-blue-800">
                                  <strong>Astuce :</strong> Pour éviter les
                                  interruptions, créez un rappel dans votre
                                  calendier 55 jours après la génération du
                                  token.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-700 text-xs">
                            <strong>💡 Astuce :</strong> Assurez-vous que votre
                            token a les bonnes permissions.
                          </p>
                        </div>

                        <a
                          href="https://developers.facebook.com/docs/pages"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center hover:underline text-sm text-blue-600"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Documentation Facebook Pages API
                        </a>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Démonstration vidéo
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 mb-4">
                          Regardez cette vidéo pour voir comment obtenir votre
                          token :
                        </p>
                        <div className="relative w-full mx-auto">
                          <video
                            controls
                            className="w-full rounded-lg shadow-lg"
                            poster="/Demo/demo-thumbnail.jpg"
                          >
                            <source src="/Demo/Demo.mp4" type="video/mp4" />
                            Votre navigateur ne supporte pas la vidéo.
                          </video>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuration Form */}
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      {editingConfig
                        ? 'Paramètres de configuration'
                        : 'Configuration'}
                    </h3>
                    {editingConfig && (
                      <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                      >
                        <HelpCircle className="h-4 w-4" />
                        {showGuide ? 'Masquer le guide' : 'Afficher le guide'}
                      </button>
                    )}
                  </div>

                  <div className="max-w-2xl space-y-4">
                    {/* Projet Select */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Projet à associer{' '}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        name="projet_id"
                        value={facebookConfig.projet_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={!!editingConfig}
                      >
                        <option value="">Sélectionner un projet</option>
                        {editingConfig ? (
                          <option value={facebookConfig.projet_id}>
                            {projets.find(
                              (p) => p.id === facebookConfig.projet_id
                            )?.nom || 'Projet actuel'}
                          </option>
                        ) : (
                          getAvailableProjets().map((projet) => (
                            <option key={projet.id} value={projet.id}>
                              {projet.nom}
                            </option>
                          ))
                        )}
                      </select>
                      <p className="text-xs text-gray-500">
                        {editingConfig
                          ? 'Le projet ne peut pas être modifié'
                          : 'Sélectionnez un projet sans configuration Facebook'}
                      </p>
                    </div>

                    {/* Page ID */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        ID de la Page Facebook{' '}
                        <span className="text-red-500 ml-1">*</span>
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
                    </div>

                    {/* Token */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Token {"d'"}accès à la Page court terme
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <textarea
                        name="acces_token_page_short_term"
                        value={facebookConfig.acces_token_page_short_term}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Collez votre token d'accès ici"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Token {"d'"}accès à la Page long terme{' '}
                        <span className="text-red-500 ml-1">*</span>
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
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveFacebook}
                        disabled={
                          saving ||
                          !facebookConfig.page_fcb_id ||
                          !facebookConfig.acces_token_page ||
                          !facebookConfig.acces_token_page_short_term ||
                          !facebookConfig.projet_id
                        }
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
                            {editingConfig ? 'Mettre à jour' : 'Enregistrer'}
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

                {/* Content Types */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Types de contenu supportés
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">
                        ✅ Supporté
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Images (JPEG, PNG, GIF)</li>
                        <li>• Vidéos (MP4, MOV, AVI)</li>
                        <li>• Albums photos (jusqu u à 10 images)</li>
                        <li>• Posts avec liens</li>
                        <li>• Texte avec émojis et hashtags</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">
                        ⚠️ Limitations
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Vidéos limitées à 4GB maximum</li>
                        <li>• Images max : 8MB chacune</li>
                        <li>• Pas de programmation au-delà de 6 mois</li>
                        <li>• Contenu soumis aux règles communautaires</li>
                        <li>• Token expire périodiquement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Astuce :</span> Testez votre
                    configuration après {"l'enregistrement"}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Configuration Info */}

      {/* Info Section */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="flex">
          <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Chaque configuration Facebook est associée à un projet spécifique.
              Les webhooks permettent de recevoir des notifications en temps
              réel.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Guide Webhook */}
      {showWebhookGuide && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowWebhookGuide(false)}
            />

            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Settings className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Guide de Configuration Webhook Facebook
                      </h3>
                      <p className="text-sm text-gray-500">
                        Étapes détaillées pour configurer les webhooks dans
                        Facebook Developer Console
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWebhookGuide(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="space-y-6">
                  {/* Étapes */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Étapes à suivre :
                    </h4>
                    <ol className="list-decimal pl-5 space-y-3">
                      <li>
                        <strong>Accédez à Facebook Developer Console</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Rendez-vous sur{' '}
                          <a
                            href="https://developers.facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            developers.facebook.com
                          </a>{' '}
                          et connectez-vous
                        </p>
                      </li>
                      <li>
                        <strong>Sélectionnez ou créez une application</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Créez une nouvelle application ou utilisez une
                          existante
                        </p>
                      </li>
                      <li>
                        <strong>Ajoutez le produit Webhooks</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Dans le tableau de bord de votre application, ajoutez
                          le produit Webhooks
                        </p>
                      </li>
                      <li>
                        <strong>Sélectionnez Page</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Dans la section Webhooks, cliquez sur Configurer à
                          côté de Page
                        </p>
                      </li>
                      <li>
                        <strong>Configurez {"l'"}URL du callback :</strong>
                        <div className="mt-2">
                          <code className="block bg-gray-100 p-3 rounded-md text-sm font-mono">
                            https://immogestion.live/api/webhookFcb_Insta
                          </code>
                          <p className="text-xs text-gray-500 mt-1">
                            Copiez et collez cette URL exactement
                          </p>
                        </div>
                      </li>
                      <li>
                        <strong>Utilisez le token de vérification</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Utilisez le même token que vous avez saisi dans le
                          formulaire de configuration webhook
                        </p>
                      </li>

                      <h5 className="font-medium text-blue-900 mt-4 mb-2">
                        Permissions requises à sélectionner :
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded border">
                          <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />
                          <strong>messaging</strong>
                          <p className="text-blue-600">
                            Tous les types de messages
                          </p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />
                          <strong>feed</strong>
                          <p className="text-blue-600">
                            Publications sur la page
                          </p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />
                          <strong>mention</strong>
                          <p className="text-blue-600">Mentions de la page</p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />
                          <strong>messages</strong>
                          <p className="text-blue-600">Messages privés</p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />
                          <strong>message_context</strong>
                          <p className="text-blue-600">Contexte des messages</p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />
                          <strong>videos</strong>
                          <p className="text-blue-600">Vidéos dans messages</p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />
                          <strong>description</strong>
                          <p className="text-blue-600">
                            Descriptions de messages
                          </p>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <CheckCircle className="h-3 w-3 text-green-600 inline mr-1" />
                          <strong>general_info</strong>
                          <p className="text-blue-600">
                            Informations générales
                          </p>
                        </div>
                      </div>
                      <li>
                        <strong>Cliquez sur S{"'"}abonner</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Validez et testez la configuration
                        </p>
                      </li>
                    </ol>
                  </div>

                  {/* Permissions */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <div className="flex">
                      <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800">
                          Important :
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Ces étapes doivent être effectuées dans Facebook
                          Developer Console <strong>avant</strong> {"d'"}activer
                          les webhooks dans cette interface.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowWebhookGuide(false)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {"J'ai compris"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            type: null,
            itemId: null,
            itemLabel: '',
          })
        }
        entityName="FACEBOOK_CONFIG"
        itemLabel={deleteModal.itemLabel}
        entityId={deleteModal.itemId}
        onDeleted={handleDeleteConfirmed}
      />
    </div>
  );
}
