"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { AlertCircleIcon, Loader, SaveIcon, TestTube } from "lucide-react";
import toast from "react-hot-toast";

export default function WebhookConfigTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [webhookConfig, setWebhookConfig] = useState({
    webhook_verify_token: "",
    webhook_enabled: false,
    webhook_subscriptions: [], // Ensure it's always an array
  });

  // Fetch existing webhook configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(APIURL.ROOTV1 + "/configurations_social_network", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.configurations) {
          setWebhookConfig({
            webhook_verify_token: response.data.configurations.webhook_verify_token || "",
            webhook_enabled: response.data.configurations.webhook_enabled || false,
            webhook_subscriptions: Array.isArray(response.data.configurations.webhook_subscriptions) 
              ? response.data.configurations.webhook_subscriptions 
              : [], // Ensure array
          });
        }
      } catch (error) {
        console.error("Error fetching webhook configurations:", error);
        toast.error("Erreur lors du chargement des configurations webhook");
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 1 || user.role === 2)) {
      fetchConfig();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWebhookConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save webhook configuration
  const handleSaveWebhook = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      if (!webhookConfig.webhook_verify_token) {
        toast.error("Veuillez remplir le token de vérification webhook");
        return;
      }

      const dataToSave = {
        webhook_verify_token: webhookConfig.webhook_verify_token,
        webhook_enabled: true, // Always enable webhooks after registration
        webhook_subscriptions: ['feed', 'comments', 'reactions', 'mentions'], // Always include all 4 subscriptions
      };

      await axios.post(
        APIURL.ROOTV1 + "/store_configurations_social_network",
        dataToSave,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success("Configuration webhook enregistrée avec succès");
    } catch (error) {
      console.error("Error saving webhook configurations:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement des configurations webhook");
    } finally {
      setSaving(false);
    }
  };

  // Test webhook configuration
  const testWebhookConfiguration = async () => {
    try {
      setTesting(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await axios.post(
        APIURL.ROOTV1 + "/test_webhook_verification",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("✅ Configuration webhook testée avec succès");
      } else {
        toast.error("❌ Test webhook échoué: " + response.data.message);
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast.error("❌ Erreur lors du test webhook: " + (error.response?.data?.message || error.message));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">Chargement des configurations webhook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircleIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Configuration des Webhooks Facebook/Instagram
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Les webhooks permettent de recevoir des notifications en temps réel lorsque des événements 
                se produisent sur vos pages Facebook et comptes Instagram (commentaires, mentions, messages, etc.).
              </p>
              <p className="mt-2">
                <strong>Prérequis:</strong> Vous devez d'abord configurer Facebook et/ou Instagram 
                avant de pouvoir activer les webhooks.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Configuration Webhook</h3>
        <div className="max-w-2xl space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Token de vérification webhook *
            </label>
            <input
              type="text"
              name="webhook_verify_token"
              value={webhookConfig.webhook_verify_token}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: my_secure_webhook_token_123"
              required
            />
            <p className="text-xs text-gray-500">
              Token de sécurité pour vérifier les webhooks (choisissez une chaîne sécurisée)
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              URL du webhook (lecture seule)
            </label>
            <input
              type="text"
              value="https://e86332116ba7.ngrok-free.app/api/webhookFcb_Insta"
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              Utilisez cette URL dans la configuration de votre application Facebook
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSaveWebhook}
              disabled={saving || !webhookConfig.webhook_verify_token}
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
                  Enregistrer la configuration webhook
                </>
              )}
            </button>

            <button
              onClick={testWebhookConfiguration}
              disabled={testing || !webhookConfig.webhook_verify_token}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4" />
                  Tester la configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Instructions de configuration</h3>
        <div className="space-y-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">1. Dans votre application Facebook Developer:</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Allez dans "Webhooks" dans le menu de gauche</li>
              <li>Cliquez sur "Ajouter un webhook"</li>
              <li>Collez l'URL du webhook ci-dessus</li>
              <li>Entrez le token de vérification que vous avez configuré</li>
              <li>Sélectionnez les événements auxquels vous voulez vous abonner</li>
              <li>Cliquez sur "Vérifier et enregistrer"</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important:</h4>
            <p className="text-yellow-700">
              Les webhooks ne fonctionneront que si vous avez configuré Facebook et/ou Instagram 
              avec succès. Assurez-vous d'avoir testé vos configurations avant d'activer les webhooks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
