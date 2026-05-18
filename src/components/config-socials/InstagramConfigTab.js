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
} from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function InstagramConfigTab() {
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);

  const { user } = useAuth();
  const { projets } = useProjet();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [showModal, setShowModal] = useState(false); // Modifié: Modal au lieu de showForm
  const [webhooks, setWebhooks] = useState([]);
  const [showWebhookForm, setShowWebhookForm] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [instagramConfig, setInstagramConfig] = useState({
    instagram_id: '',
    acces_token_user: '',
    acces_token_user_short_term: '',
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

  // Fonction pour recharger les données sans recharger la page
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      // Fetch configurations
      const configResponse = await axios.get(
        `${APIURL.ROOTV1}/instagram-configurations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (configResponse.data?.configurations) {
        setConfigurations(configResponse.data.configurations);
      }

      // Fetch webhooks
      const webhookResponse = await axios.get(
        `${APIURL.ROOTV1}/instagram-webhooks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (webhookResponse.data?.webhooks) {
        setWebhooks(webhookResponse.data.webhooks);
      }
    } catch (error) {
      console.error('Error fetching Instagram data:', error);
    }
  };

  // Fetch existing Instagram configurations and webhooks
  useEffect(() => {
    const loadData = async () => {
      if (user && (user.role === 1 || user.role === 2|| user.role === 10)) {
        try {
          setLoading(true);
          await fetchData();
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error('Erreur lors du chargement des configurations Instagram');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Get projects without existing configurations
  const getAvailableProjets = () => {
    const configuredProjetIds = configurations.map(
      (config) => config.projet_id
    );
    return projets.filter((projet) => !configuredProjetIds.includes(projet.id));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInstagramConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Ouvrir modal pour nouvelle configuration
  const handleNewConfiguration = () => {
    const availableProjects = getAvailableProjets();
    if (availableProjects.length === 0) {
      toast.error('Tous vos projets ont déjà une configuration Instagram');
      return;
    }

    setInstagramConfig({
      instagram_id: '',
      acces_token_user: '',
      acces_token_user_short_term: '',
      projet_id: '',
    });
    setEditingConfig(null);
    setShowModal(true);
    setShowGuide(true); // Montrer le guide par défaut pour nouvelle config
  };

  // Save or Update Instagram configuration
  const handleSaveInstagram = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');

      if (
        !instagramConfig.instagram_id ||
        !instagramConfig.acces_token_user ||
        !instagramConfig.acces_token_user_short_term ||
        !instagramConfig.projet_id
      ) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }

      const dataToSave = {
        instagram_id: instagramConfig.instagram_id,
        acces_token_user: instagramConfig.acces_token_user,
        acces_token_user_short_term:
          instagramConfig.acces_token_user_short_term,
        projet_id: instagramConfig.projet_id,
      };

      let response;
      if (editingConfig) {
        // Update existing configuration
        response = await axios.put(
          `${APIURL.ROOTV1}/instagram-configurations/${editingConfig.id}`,
          dataToSave,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new configuration
        response = await axios.post(
          `${APIURL.ROOTV1}/instagram-configurations`,
          dataToSave,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const successMessage = editingConfig
        ? 'Configuration Instagram mise à jour avec succès'
        : 'Configuration Instagram enregistrée avec succès';

      // Reset form
      setInstagramConfig({
        instagram_id: '',
        acces_token_user: '',
        acces_token_user_short_term: '',
        projet_id: '',
      });
      setEditingConfig(null);
      setShowModal(false);

      // Recharger les données
      await fetchData();

      toast.success(successMessage);
    } catch (error) {
      console.error('Error saving Instagram configuration:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Erreur lors de l'enregistrement de la configuration Instagram";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Edit Instagram configuration
  const handleEditInstagram = (config) => {
    setInstagramConfig({
      instagram_id: config.instagram_id,
      acces_token_user: config.acces_token_user,
      acces_token_user_short_term: config.acces_token_user_short_term,
      projet_id: config.projet_id,
    });
    setEditingConfig(config);
    setShowModal(true);
    setShowGuide(false); // Ne pas montrer le guide par défaut pour modification
  };

  // Cancel edit/close modal
  const handleCancelEdit = () => {
    setInstagramConfig({
      instagram_id: '',
      acces_token_user: '',
      acces_token_user_short_term: '',
      projet_id: '',
    });
    setEditingConfig(null);
    setShowModal(false);
    setShowGuide(false);
  };

  // Save webhook configuration
  const handleSaveWebhook = async (configId) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');

      if (!webhookConfig.webhook_verify_token) {
        toast.error('Veuillez saisir un token de vérification');
        return;
      }

      const response = await axios.post(
        `${APIURL.ROOTV1}/instagram-configurations/${configId}/webhook`,
        webhookConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Webhook Instagram configuré avec succès');
      }

      setWebhookConfig({ webhook_verify_token: '' });
      setShowWebhookForm(null);
      await fetchData();
    } catch (error) {
      console.error('Error saving webhook:', error);
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

  // Toggle webhook enable/disable
  const handleToggleWebhook = async (configId, currentStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const newStatus = !currentStatus;

      const response = await axios.put(
        `${APIURL.ROOTV1}/instagram-configurations/${configId}/webhook/toggle`,
        { webhook_enabled: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.message) {
        toast.success(response.data.message);
      } else {
        toast.success(
          `Webhook ${newStatus ? 'activé' : 'désactivé'} avec succès`
        );
      }

      await fetchData();
    } catch (error) {
      console.error('Error toggling webhook:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erreur lors de la modification du webhook';
      toast.error(errorMessage);
    }
  };

  // Delete Instagram configuration
  const handleDeleteConfiguration = async (configId) => {
    const config = configurations.find((c) => c.id === configId);
    setDeleteModal({
      isOpen: true,
      type: 'configuration',
      itemId: configId,
      itemLabel: `Configuration Instagram pour ${
        config?.projet?.nom || 'Projet supprimé'
      }`,
    });
  };

  // Delete webhook configuration
  const handleDeleteWebhook = async (configId) => {
    const config = configurations.find((c) => c.id === configId);
    setDeleteModal({
      isOpen: true,
      type: 'webhook',
      itemId: configId,
      itemLabel: `Webhook pour ${config?.projet?.nom || 'Projet supprimé'}`,
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirmed = async () => {
    const { type, itemId } = deleteModal;

    try {
      const token = localStorage.getItem('accessToken');

      if (type === 'configuration') {
        await axios.delete(
          `${APIURL.ROOTV1}/instagram-configurations/${itemId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Configuration supprimée avec succès');
      } else if (type === 'webhook') {
        await axios.delete(
          `${APIURL.ROOTV1}/instagram-configurations/${itemId}/webhook`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('Webhook supprimé avec succès');
      }

      await fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erreur lors de la suppression';
      toast.error(errorMessage);
    }
  };

  // Get webhook for configuration
  const getWebhookForConfig = (configId) => {
    return webhooks.find((webhook) => webhook.id === configId);
  };

  // Get available projects for edit mode (only the current project)
  const getAvailableProjetsForEdit = () => {
    if (editingConfig) {
      // En mode édition, montrer seulement le projet actuel
      const currentProjet = projets.find(
        (p) => p.id === editingConfig.projet_id
      );
      return currentProjet ? [currentProjet] : [];
    }
    return getAvailableProjets();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-pink-500 mb-2" />
          <p className="text-gray-600">
            Chargement des configurations Instagram...
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
            Configuration Instagram
          </h2>
          <p className="text-gray-600">
            Gérez vos configurations Instagram par projet
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleNewConfiguration}
            disabled={getAvailableProjets().length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-md hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Message si tous les projets ont des configurations */}
      {getAvailableProjets().length === 0 && projets.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <div className="flex items-start">
            <AlertCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-blue-800">
                Tous vos projets ont déjà une configuration Instagram. Vous
                pouvez modifier une configuration existante ou créer un nouveau
                projet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Configurations List with Webhook sections */}
      {configurations.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Configurations existantes
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {configurations.length} configuration(s) Instagram
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
                          onClick={() => handleEditInstagram(config)}
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
                              <span className="font-medium text-gray-700">
                                URL Webhook:
                              </span>
                              <p className="text-gray-600 mt-1 break-all">
                                {webhook.webhook_url}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">
                                Événement requis:
                              </span>
                              <p className="text-gray-600 mt-1">mention</p>
                              <p className="text-xs text-pink-600 mt-1">
                                ⚠️ Cet événement doit être configuré dans
                                Facebook Developer Console
                              </p>
                            </div>
                          </div>

                          {/* Add webhook toggle with warning */}
                          <div className="mt-3 pt-3 border-t border-pink-200">
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
                                {/* <button
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

                            {/* Warning message */}
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <div className="flex items-start space-x-2">
                                <AlertCircleIcon className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-medium text-yellow-700 mb-1">
                                    ⚠️ Configuration Facebook Developer Console
                                    requise
                                  </p>
                                  {/* <p className="text-yellow-600 mb-2">
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
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-md mt-3">
                          <h5 className="text-sm font-medium text-pink-900 mb-3">
                            Configurer le webhook pour {config.projet?.nom}
                          </h5>

                          {/* Important instructions */}
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-start space-x-2">
                              <AlertCircleIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">
                                  Configuration Facebook Developer Console
                                  requise :
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-xs">
                                  <li>
                                    URL du webhook :{' '}
                                    <code className="bg-white px-1 rounded">
                                      https://immogestion.live/api/webhookFcb_Insta
                                    </code>
                                  </li>
                                  <li>
                                    Token de vérification : Utilisez le token
                                    que vous saisissez ci-dessous
                                  </li>
                                  <li>
                                    Événement à sélectionner :{' '}
                                    <strong>mention</strong> uniquement
                                  </li>
                                  <li>
                                    Testez la vérification du webhook avant
                                    {"d'activer"}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-pink-700 mb-1">
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
                                className="w-full px-2 py-1 text-sm border border-pink-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-500"
                                placeholder="Saisissez un token de vérification unique"
                              />
                              <p className="text-xs text-pink-600 mt-1">
                                Ce token sera utilisé par Instagram pour
                                vérifier {"l'authenticité"} du webhook
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveWebhook(config.id)}
                                disabled={
                                  saving || !webhookConfig.webhook_verify_token
                                }
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
          <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-pink-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune configuration Instagram
          </h3>
          <p className="text-gray-600 mb-4">
            Commencez par créer votre première configuration
          </p>
        </div>
      )}

      {/* MODAL pour Configuration Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCancelEdit}
            />

            {/* Modal Container */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    {editingConfig
                      ? 'Modifier Configuration Instagram'
                      : 'Nouvelle Configuration Instagram'}
                  </h3>
                  <button
                    onClick={handleCancelEdit}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body avec scrolling */}
              <div className="max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  {/* Important info */}
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
                            <strong>Important :</strong> Votre compte Instagram
                            doit être un compte professionnel (business) et être
                            connecté à une page Facebook pour utiliser
                            l&apos;API Instagram.
                          </p>
                          <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>
                              Compte Instagram converti en compte professionnel
                            </li>
                            <li>Page Facebook associée au compte Instagram</li>
                            <li>Application Facebook développeur configurée</li>
                            <li>
                              Permissions Instagram Basic Display et Content
                              Publishing
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Setup Guide - Show for new configurations or when explicitly requested */}
                  {(!editingConfig || showGuide) && (
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium">
                          Guide de configuration
                        </h3>
                        <div className="space-y-3 text-sm">
                          <p className="text-gray-700">
                            <strong>
                              1. Convertir en compte professionnel :
                            </strong>
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            <li>
                              Ouvrez l&apos;app Instagram et allez dans votre
                              profil
                            </li>
                            <li>
                              Appuyez sur le menu (3 lignes) puis
                              &quot;Paramètres&quot;
                            </li>
                            <li>
                              Sélectionnez &quot;Compte&quot; puis &quot;Passer
                              à un compte professionnel&quot;
                            </li>
                            <li>Choisissez une catégorie d&apos;entreprise</li>
                            <li>
                              Connectez votre page Facebook correspondante
                            </li>
                          </ul>

                          {/*<p className="text-gray-700 mt-4">
                            <strong>2. Obtenir l&apos;ID Instagram :</strong>
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            <li>Utilisez l&apos;API Facebook Graph Explorer</li>
                            <li>
                              Requête :{' '}
                              <code className="bg-gray-200 px-1 rounded">
                                /me/accounts
                              </code>
                            </li>
                            <li>
                              Dans la réponse, trouvez votre page Facebook
                            </li>
                            <li>
                              Utilisez l&apos;ID de la page pour obtenir
                              l&apos;Instagram ID
                            </li>
                            <li>
                              Requête :{' '}
                              <code className="bg-gray-200 px-1 rounded">
                                /{`{page-id}`}?fields=instagram_business_account
                              </code>
                            </li>
                          </ul>*/}

                          <p className="text-gray-700 mt-4">
                            <strong>2. Générer le token d&apos;accès court terme :</strong>
                          </p>
                          <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            <li>
                              Créez une app Facebook Developers
                              <div>
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
                                </p>
                              </div>
                            </li>
                            <li>
                              Ajoutez le produit &quot;Instagram Basic
                              Display&quot;
                            </li>
                            <li>Configurez les permissions requises</li>
                            <li>
                              Générez un token d&apos;accès court Terme
                              <div>
                                Ajoutez votre compte Instagram Business puis
                                copiez ID du compte ci-dessous (nom du compte).{' '}
                                <br />
                                <div>
                                 
                                  <p className="text-sm text-gray-600 mt-1">
                                    • Allez dans{' Outil '}
                                    <strong>Explorateur Api Graph</strong>
                                    <br />
                                    • Sélectionnez votre application
                                    <br />
                                    • Sélectionnez Token user
                                    <br />
                                    • Générez un token avec ces permissions :
                                    <br />
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                                      instagram_basic
                                    </code>{' '}
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      instagram_manage_events
                                    </code>{' '}
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      instagram_manage_comments /
                                      instagram_content_publish
                                    </code>
                                    <br />•{' '}
                                    <strong>Copiez le token généré </strong>
                                  </p>
                                </div>
                              </div>
                            </li>
                          
                            
                          </ul>
                              <p className="text-gray-700 mt-4">
                          <strong>
                            3. Générer le Token d {"'"}accès à long terme:
                          </strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
<li>
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
                            </li>
                          </ul>

                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-blue-700 text-xs">
                              <strong>💡 Astuce :</strong> L&apos;API Instagram
                              utilise la même infrastructure que Facebook. Votre
                              token Facebook peut souvent être utilisé pour
                              Instagram si les permissions sont correctes.
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
                        <h3 className="text-lg font-medium">
                          Démonstration vidéo
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700 mb-4">
                            Regardez cette vidéo pour voir étape par étape
                            comment obtenir votre token d{"'"}accès Instagram :
                          </p>
                          <div className="relative w-full mx-auto">
                            <video
                              controls
                              className="w-full rounded-lg shadow-lg"
                              poster="/Demo/demo-thumbnail.jpg"
                            >
                              <source src="/Demo/Demo.mp4" type="video/mp4" />
                              Votre navigateur ne prend pas en charge la lecture
                              de vidéos HTML5.
                            </video>
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            <p>
                              💡 Astuce : Vous pouvez mettre la vidéo en plein
                              écran pour une meilleure visibilité
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Configuration Form */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">
                        {editingConfig
                          ? 'Modifier Configuration Instagram'
                          : 'Nouvelle Configuration Instagram'}
                      </h3>

                      {/* Show guide toggle button when editing */}
                      {editingConfig && (
                        <button
                          onClick={() => setShowGuide(!showGuide)}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <HelpCircle className="h-4 w-4" />
                          {showGuide ? 'Masquer le guide' : 'Afficher le guide'}
                          {showGuide ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="max-w-2xl space-y-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Projet à associer{' '}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          name="projet_id"
                          value={instagramConfig.projet_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          required
                          disabled={editingConfig} // Désactivé en mode édition
                        >
                          <option value="">Sélectionner un projet</option>
                          {getAvailableProjetsForEdit().map((projet) => (
                            <option key={projet.id} value={projet.id}>
                              {projet.nom}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500">
                          {editingConfig
                            ? 'Le projet ne peut pas être modifié pour une configuration existante'
                            : 'Sélectionnez un projet sans configuration Instagram'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          ID du compte Instagram Business{' '}
                          <span className="text-red-500 ml-1">*</span>
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
                          L&apos;identifiant numérique de votre compte Instagram
                          Business (obligatoire)
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Token d&apos;accès utilisateur court terme
                          <span className="text-red-500 ml-1">*</span>
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
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Token d&apos;accès utilisateur long terme
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          name="acces_token_user_short_term"
                          value={instagramConfig.acces_token_user_short_term}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                          placeholder="Collez votre token d'accès Instagram ici"
                          required
                        />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={handleSaveInstagram}
                          disabled={
                            saving ||
                            !instagramConfig.instagram_id ||
                            !instagramConfig.acces_token_user ||
                            !instagramConfig.acces_token_user_short_term ||
                            !instagramConfig.projet_id
                          }
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
                              {editingConfig
                                ? 'Mettre à jour'
                                : 'Enregistrer la configuration'}
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
                    <h3 className="text-lg font-medium mb-4">
                      Types de contenu supportés
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">
                          ✅ Supporté
                        </h4>
                        <ul className="text-sm !text-green-700 space-y-1">
                          <li>• Images (JPEG, PNG)</li>
                          <li>• Vidéos (MP4, MOV)</li>
                          <li>• Reels courtes (&lt; 60s)</li>
                          <li>• Stories (temporaires)</li>
                          <li>• Légendes avec hashtags</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          ⚠️ Limitations
                        </h4>
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
                    <h3 className="text-lg font-medium mb-4">
                      Vérification de la configuration
                    </h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            Une fois la configuration sauvegardée, testez votre
                            intégration en publiant une image simple depuis
                            l&apos;interface de partage. Les erreurs communes
                            incluent :
                          </p>
                          <ul className="list-disc pl-5 mt-2 text-sm !text-blue-600">
                            <li>Token expiré ou permissions insuffisantes</li>
                            <li>
                              Compte Instagram non converti en compte
                              professionnel
                            </li>
                            <li>
                              Page Facebook non connectée au compte Instagram
                            </li>
                            <li>Format d&apos;image non supporté</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add webhook configuration section */}
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">
                      Configuration des Webhooks Instagram
                    </h3>
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Settings className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <h4 className="font-medium text-pink-900 mb-2">
                            Événement webhook supporté
                          </h4>
                          <div className="space-y-2 text-pink-800">
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <strong>mention</strong> - Notifications quand
                                votre compte est mentionné
                                <p className="text-xs text-pink-600">
                                  Recevez des notifications quand votre compte
                                  Instagram est tagué ou mentionné
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800">
                              <strong>Important :</strong> Vous devez configurer
                              cet événement dans Facebook Developer Console
                              avant de pouvoir activer les webhooks dans cette
                              interface.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
              Chaque configuration Instagram est associée à un projet
              spécifique. Les webhooks permettent de recevoir des notifications
              en temps réel des commentaires et mentions sur vos comptes
              Instagram.
            </p>
          </div>
        </div>
      </div>

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
                        Guide de Configuration Webhook Instagram
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
                    <ol className="list-decimal pl-5 space-y-4">
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
                          et connectez-vous avec votre compte Facebook.
                        </p>
                      </li>

                      <li>
                        <strong>Sélectionnez ou créez une application</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Créez une nouvelle application ou utilisez une
                          application existante.
                        </p>
                      </li>

                      <li>
                        <strong>Ajoutez le produit Instagram</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Dans le tableau de bord de votre application, cliquez
                          sur Ajouter un produit et sélectionnez Instagram .
                        </p>
                      </li>

                      <li>
                        <strong>Configurez l{"'"}API Instagram</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Dans la section Instagram, allez dans Configuration de
                          l{"'"}API avec la connexion professionnelle Instagram.
                        </p>
                      </li>

                      <li>
                        <strong>Configurez les webhooks</strong>
                        <p className="text-sm text-gray-600 mt-1">
                         Dans le tableau de bord de votre application, ajoutez le produit Webhooks<br/>
                         cliquez sur Configurer Instagram<br/>
                       </p>
                      </li>

                      <li>
                        <strong>Configurez l{"'"}URL du callback :</strong>
                        <div className="mt-2">
                          <code className="block bg-gray-100 p-3 rounded-md text-sm font-mono break-all">
                            https://immogestion.live/api/webhookFcb_Insta
                          </code>
                          <p className="text-xs text-gray-500 mt-1">
                            Copiez et collez cette URL exactement dans le champ
                            URL du callback.
                          </p>
                        </div>
                      </li>

                      <li>
                        <strong>Saisissez le token de vérification</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Utilisez le même token que vous avez saisi dans le
                          formulaire de configuration webhook.
                        </p>
                      </li>

                      <li>
                        <strong>Sélectionnez les champs et abonnez-vous</strong>
                        <p className="text-sm text-gray-600 mt-1">
                         Sélectionnez comments,mentions,message_reactions,messages cliquez
                          sur S{"'"}abonner.
                        </p>
                      </li>

                      <li>
                        <strong>Cliquez sur S{"'"}abonner</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          Validez et testez la configuration pour vérifier qu
                          {"'"}elle fonctionne.
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
                          Developer Console
                          <strong> avant </strong> d{"'"}activer les webhooks
                          dans cette interface.
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Sans cette configuration préalable, les webhooks ne
                          fonctionneront pas.
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    J{"'"}ai compris
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
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
        entityName="INSTAGRAM_CONFIG"
        itemLabel={deleteModal.itemLabel}
        entityId={deleteModal.itemId}
        onDeleted={handleDeleteConfirmed}
      />
    </div>
  );
}
