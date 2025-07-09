"use client";

import { useEffect, useState } from "react";
import Tabs from "@/components/ui/Tabs";
import { TikTokConfigTab } from "@/components/config-socials/TikTokConfigTab";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { APIURL } from "@/configs/api";
import { Box, SaveIcon, AlertCircleIcon, Loader, Facebook, Instagram, Linkedin, Video } from "lucide-react";
import toast from "react-hot-toast";
import LinkedInConfigTab from "@/components/config-socials/LinkedInConfigTab";

export default function ConfigurationSocialsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("facebook");
  const [socialConfig, setSocialConfig] = useState({
    page_fcb_id: "",
    acces_token_page: "",
    instagram_id: "",
    acces_token_user: "",
    linkedin_client_id: "",
    linkedin_client_secret: "",
    tiktok_client_key: "",
    tiktok_client_secret: "",
    tiktok_redirect_uri: "",
  });

  // Individual saving states for each platform
  const [savingStates, setSavingStates] = useState({
    facebook: false,
    instagram: false,
  });

  // Fetch existing configurations
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(APIURL.ROOTV1 + "/configurations_social_network", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.configurations) {
          setSocialConfig({
            page_fcb_id: response.data.configurations.page_fcb_id || "",
            acces_token_page: response.data.configurations.acces_token_page || "",
            instagram_id: response.data.configurations.instagram_id || "",
            acces_token_user: response.data.configurations.acces_token_user || "",
            linkedin_client_id: response.data.configurations.linkedin_client_id || "",
            linkedin_client_secret: response.data.configurations.linkedin_client_secret || "",
            tiktok_client_key: response.data.configurations.tiktok_client_key || "",
            tiktok_client_secret: response.data.configurations.tiktok_client_secret || "",
            tiktok_redirect_uri: response.data.configurations.tiktok_redirect_uri || "",
          });
        }
      } catch (error) {
        console.error("Error fetching social configurations:", error);
        toast.error("Erreur lors du chargement des configurations");
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
    const { name, value } = e.target;
    setSocialConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save configuration for specific platform
  const handleSavePlatform = async (platform) => {
    try {
      setSavingStates(prev => ({ ...prev, [platform]: true }));
      const token = localStorage.getItem("accessToken");
      
      // Prepare data based on platform
      let dataToSave = {};
      if (platform === 'facebook') {
        dataToSave = {
          page_fcb_id: socialConfig.page_fcb_id,
          acces_token_page: socialConfig.acces_token_page,
        };
      } else if (platform === 'instagram') {
        dataToSave = {
          instagram_id: socialConfig.instagram_id,
          acces_token_user: socialConfig.acces_token_user,
        };
      }

      await axios.post(
        APIURL.ROOTV1 + "/store_configurations_social_network",
        dataToSave,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Automatically verify configurations after saving
      await verifyConfigurations(platform);
      
      toast.success(`Configuration ${platform} enregistrée avec succès`);
    } catch (error) {
      console.error(`Error saving ${platform} configurations:`, error);
      toast.error(`Erreur lors de l'enregistrement des configurations ${platform}`);
    } finally {
      setSavingStates(prev => ({ ...prev, [platform]: false }));
    }
  };

  // Verify social media configurations for specific platform
  const verifyConfigurations = async (platform) => {
    const token = localStorage.getItem("accessToken");
    
    if (platform === 'facebook') {
      // Verify Facebook configuration
      if (socialConfig.page_fcb_id && socialConfig.acces_token_page) {
        try {
          const fbResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${socialConfig.page_fcb_id}?access_token=${socialConfig.acces_token_page}`
          );
          if (fbResponse.data && fbResponse.data.id) {
            toast.success("✅ Configuration Facebook vérifiée");
          }
        } catch (error) {
          console.error("Facebook verification failed:", error);
          toast.error("❌ Erreur de configuration Facebook: Token invalide ou page inaccessible");
        }
      }
    } else if (platform === 'instagram') {
      // Verify Instagram configuration
      if (socialConfig.instagram_id && socialConfig.acces_token_user) {
        try {
          const instaResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${socialConfig.instagram_id}?access_token=${socialConfig.acces_token_user}`
          );
          if (instaResponse.data && instaResponse.data.id) {
            toast.success("✅ Configuration Instagram vérifiée");
          }
        } catch (error) {
          console.error("Instagram verification failed:", error);
          toast.error("❌ Erreur de configuration Instagram: Token invalide ou compte inaccessible");
        }
      }
    }
  };

  // Check if user has proper permissions
  if (user && user.role !== 1 && user.role !== 2) {
    return (
      <div className="p-8 text-center">
        <AlertCircleIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Accès restreint</h2>
        <p className="text-gray-600">
          Vous n&apos;avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  // Show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-2" />
          <p className="text-gray-600">Chargement des configurations...</p>
        </div>
      </div>
    );
  }

  // Configure tabs for our existing Tabs component
  const tabsConfig = [
    { 
      id: "facebook", 
      label: "Facebook", 
      icon: <Facebook className="h-4 w-4 text-[#1877F2]" />
    },
    { 
      id: "instagram", 
      label: "Instagram", 
      icon: <Instagram className="h-4 w-4 text-[#E1306C]" />
    },
    { 
      id: "linkedin", 
      label: "LinkedIn", 
      icon: <Linkedin className="h-4 w-4 text-[#0A66C2]" />
    },
    { 
      id: "tiktok", 
      label: "TikTok", 
      icon: <Video className="h-4 w-4 text-[#FF0050]" />
    }
  ];

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Render content for the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "facebook":
        return (
          <div className="space-y-6 p-6">
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
                      Pour intégrer Facebook à votre projet, vous avez besoin de deux informations principales:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2 mt-2">
                      <li>
                        <strong>ID de la Page Facebook</strong>: Identifiant numérique unique de votre page
                        Facebook.
                      </li>
                      <li>
                        <strong>Token d&apos;accès à la Page</strong>: Jeton d&apos;authentification qui permet de
                        publier du contenu.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium">Comment obtenir ces informations</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-700">
                    <strong>1. Trouver l&apos;ID de votre Page:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Connectez-vous à Facebook et accédez à votre page</li>
                    <li>Cliquez sur &quot;Paramètres&quot; puis &quot;Informations sur la page&quot;</li>
                    <li>L&apos;ID de la page devrait être listé dans les informations générales</li>
                    <li>Si non visible, cliquez sur &quot;À propos&quot; et cherchez à la fin de l&apos;URL de la page</li>
                  </ul>

                  <p className="text-gray-700 mt-4">
                    <strong>2. Obtenir un Token d&apos;accès:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Accédez au <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="!text-blue-600 hover:underline">Facebook for Developers</a></li>
                    <li>Créez ou sélectionnez une application</li>
                    <li>Allez dans &quot;Outils&quot; puis &quot;Explorateur de l&apos;API Graph&quot;</li>
                    <li>Sélectionnez votre page dans le menu déroulant</li>
                    <li>Demandez les permissions: pages_read_engagement, pages_manage_posts</li>
                    <li>Cliquez sur &quot;Générer un token d&apos;accès&quot;</li>
                    <li>Convertissez-le en token longue durée en utilisant l&apos;outil de débogage de token</li>
                  </ul>

                  <p className="text-blue-600 mt-3">
                    <a
                      href="https://developers.facebook.com/docs/pages/access-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:underline"
                    >
                      <Box className="h-4 w-4 mr-1" />
                      Documentation officielle Facebook
                    </a>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Démonstration vidéo</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-4">
                    Regardez cette vidéo pour voir étape par étape comment obtenir votre token d'accès Facebook :
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
              <h3 className="text-lg font-medium mb-4">Configuration Facebook</h3>
              <div className="max-w-2xl space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    ID de la Page Facebook
                  </label>
                  <input
                    type="text"
                    name="page_fcb_id"
                    value={socialConfig.page_fcb_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 123456789012345"
                  />
                  <p className="text-xs text-gray-500">
                    L&apos;identifiant numérique de votre page Facebook (visible dans les paramètres de la page)
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Token d&apos;accès à la Page
                  </label>
                  <textarea
                    name="acces_token_page"
                    value={socialConfig.acces_token_page}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Collez votre token d'accès ici"
                  />
                  <p className="text-xs text-gray-500">
                    Token longue durée obtenu via le Gestionnaire de Pages Facebook
                  </p>
                </div>

                <button
                  onClick={() => handleSavePlatform('facebook')}
                  disabled={savingStates.facebook}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingStates.facebook ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4" />
                      Enregistrer la configuration Facebook
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Association and Warning sections remain the same */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Association avec les projets</h3>
              <p className="text-sm text-gray-700 mb-4">
                Une fois la configuration Facebook enregistrée, vous pourrez associer cette page Facebook 
                à des projets spécifiques dans les paramètres de chaque projet immobilier.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm !text-yellow-700">
                      Assurez-vous que votre token d&apos;accès dispose des permissions 
                      nécessaires pour publier du contenu sur la page. Les publications 
                      échoueront si les autorisations sont insuffisantes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "instagram":
        return (
          <div className="space-y-6 p-6">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-500 p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircleIcon className="h-5 w-5 text-pink-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-pink-800">
                    Prérequis pour l&apos;intégration Instagram
                  </h3>
                  <div className="mt-2 text-sm text-pink-700 space-y-1">
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
              <h3 className="text-lg font-medium mb-4">Configuration Instagram</h3>
              <div className="max-w-2xl space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    ID du compte Instagram Business
                  </label>
                  <input
                    type="text"
                    name="instagram_id"
                    value={socialConfig.instagram_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 17841454841928506"
                  />
                  <p className="text-xs text-gray-500">
                    L&apos;identifiant numérique de votre compte Instagram Business (obtenu via l&apos;API Facebook)
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Token d&apos;accès utilisateur
                  </label>
                  <textarea
                    name="acces_token_user"
                    value={socialConfig.acces_token_user}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Collez votre token d'accès Instagram ici"
                  />
                  <p className="text-xs text-gray-500">
                    Token d&apos;accès longue durée avec permissions Instagram
                  </p>
                </div>

                <button
                  onClick={() => handleSavePlatform('instagram')}
                  disabled={savingStates.instagram}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-md hover:from-pink-600 hover:to-purple-600 disabled:opacity-50"
                >
                  {savingStates.instagram ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="h-4 w-4" />
                      Enregistrer la configuration Instagram
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Types de contenu section remains the same */}
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
        );
      
      case "linkedin":
        return <LinkedInConfigTab />;
      
      case "tiktok":
        return <TikTokConfigTab />;
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuration des réseaux sociaux</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Using the existing Tabs component */}
        <Tabs 
          tabs={tabsConfig}
          defaultTab="facebook"
          onTabChange={handleTabChange}
        />
        
        {/* Render the content for the active tab */}
        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
