import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import toast from 'react-hot-toast';
import { LLMService } from '@/services/llmService';
import Modal from '@/components/ui/Modal';
import {
  Sparkles,
  Copy,
  RefreshCw,
  Instagram,
  Facebook,
  Image,
  X,
  FileVideo,
  UploadCloud,
  AlertTriangle,
  Check,
} from 'lucide-react';

export default function BienDescriptionGenerator({
  bien,
  onDescriptionSaved,
  buttonText = 'Générer Description IA',
  initialMediaUrl,
  initialMediaType,
  isOpen = false,
  onClose,
}) {
  // Instagram warning state
  const [instagramWarning, setInstagramWarning] = useState('');
  const [showInstagramWarning, setShowInstagramWarning] = useState(false);
  // Track if user has attempted to share to Instagram
  const [instagramAttempted, setInstagramAttempted] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [description, setDescription] = useState(bien?.description || '');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSharingTikTok, setIsSharingTikTok] = useState(false);
  const [isSharingFacebook, setIsSharingFacebook] = useState(false);
  const [isSharingLinkedin, setIsSharingLinkedin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userFeedback, setUserFeedback] = useState('');
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  const [socialConfigurations, setSocialConfigurations] = useState({
    facebook: false,
    instagram: false,
    linkedin: false,
    tiktok: false,
  });
  const [configurationsLoading, setConfigurationsLoading] = useState(true);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Set initial media if provided
  useEffect(() => {
    if (initialMediaUrl && initialMediaType) {
      setUploadedMediaUrl(initialMediaUrl);
      setMediaType(initialMediaType);
      if (initialMediaUrl && !mediaPreview) {
        setMediaPreview(initialMediaUrl);
      }
    }
  }, [initialMediaUrl, initialMediaType, mediaPreview]);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setShowInstagramWarning(false);
    setInstagramWarning('');
    setInstagramAttempted(false);
    if (onClose) onClose();
  };

  const checkProjectConfigurations = async () => {
    if (!bien?.projet_id) {
      setConfigurationsLoading(false);
      return;
    }

    setConfigurationsLoading(true);
    const token = localStorage.getItem('accessToken');
    const configurations = {
      facebook: false,
      instagram: false,
      linkedin: false,
      tiktok: false,
    };

    try {
      try {
        const facebookResponse = await axios.get(
          `${APIURL.ROOTV1}/facebook-configurations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (facebookResponse.data?.configurations?.length > 0) {
          configurations.facebook = facebookResponse.data.configurations.some(
            (config) => config.projet_id === bien.projet_id
          );
        }
      } catch (error) {
        console.log('No Facebook configuration found for this project');
      }

      try {
        const instagramResponse = await axios.get(
          `${APIURL.ROOTV1}/instagram-configurations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (instagramResponse.data?.configurations?.length > 0) {
          configurations.instagram = instagramResponse.data.configurations.some(
            (config) => config.projet_id === bien.projet_id
          );
        }
      } catch (error) {
        console.log('No Instagram configuration found for this project');
      }

      try {
        const linkedinResponse = await axios.get(
          `${APIURL.LINKEDIN_CONFIG}/project/${bien.projet_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        configurations.linkedin = !!linkedinResponse.data.configuration;
      } catch (error) {
        console.log('No LinkedIn configuration found for this project');
      }

      try {
        const tiktokResponse = await axios.get(`${APIURL.TIKTOK_CONFIG}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (tiktokResponse.data?.configurations?.length > 0) {
          configurations.tiktok = tiktokResponse.data.configurations.some(
            (config) => config.projet_id === bien.projet_id
          );
        }
      } catch (error) {
        console.log('No TikTok configuration found for this project');
      }

      setSocialConfigurations(configurations);
    } catch (error) {
      console.error('Error checking social media configurations:', error);
    } finally {
      setConfigurationsLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && bien?.projet_id) {
      checkProjectConfigurations();
    }
  }, [isModalOpen, bien?.projet_id]);

  const generateDescription = async () => {
    if (!bien) {
      toast.error('Informations du bien manquantes');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    try {
      const generatedText = await LLMService.generatePropertyDescription(bien);
      setGeneratedDescription(generatedText);
      setHasGeneratedOnce(true);
      toast.success('Description générée avec succès!');
    } catch (error) {
      console.error('Failed to generate description:', error);
      setErrorMessage(
        error.message || 'Erreur lors de la génération de la description'
      );
      toast.error(
        error.message || 'Erreur lors de la génération de la description'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateWithFeedback = async () => {
    if (!bien || !userFeedback) {
      toast.error(
        'Veuillez fournir des instructions pour améliorer la description'
      );
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');

    try {
      const feedbackPrompt = `
Voici une description existante d'un bien immobilier:

"${generatedDescription}"

L'utilisateur souhaite modifier cette description avec les instructions suivantes:
"${userFeedback}"

Veuillez générer une nouvelle description qui intègre ces commentaires.`;

      const refinedText = await LLMService.generateRefinedDescription(
        feedbackPrompt
      );

      setGeneratedDescription(refinedText);
      setUserFeedback('');
      toast.success('Description mise à jour avec succès!');
    } catch (error) {
      console.error('Failed to regenerate description:', error);
      setErrorMessage(
        error.message || 'Erreur lors de la mise à jour de la description'
      );
      toast.error(
        error.message || 'Erreur lors de la mise à jour de la description'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const useGeneratedDescription = () => {
    setDescription(generatedDescription);
    toast.success('Description copiée');
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error(
        'Format non supporté. Veuillez sélectionner une image ou une vidéo.'
      );
      return;
    }

    const sizeLimit = 10 * 1024 * 1024;
    if (file.size > sizeLimit) {
      toast.error('Le fichier est trop volumineux. Limite: 10MB');
      return;
    }

    setSelectedMedia(file);
    setMediaType(isImage ? 'image' : 'video');

    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);

    uploadMediaToServer(file);
  };

  const uploadMediaToServer = async (file) => {
    if (!bien?.id || !file) {
      toast.error("Impossible d'uploader le fichier: informations manquantes");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('media', file);

      if (description) {
        formData.append('description_bien', description);
      }

      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${APIURL.BIENS}/${bien.id}/media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.url) {
        setUploadedMediaUrl(response.data.url);
        // Clear Instagram warning when media is uploaded
        setShowInstagramWarning(false);
        setInstagramWarning('');
        setInstagramAttempted(false);
        toast.success('Media téléchargé avec succès');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error(
        error.response?.data?.message ||
          'Erreur lors du téléchargement du média'
      );
      clearSelectedMedia();
    } finally {
      setIsUploading(false);
    }
  };

  const saveDescriptionToServer = async () => {
    if (!bien?.id || !description) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${APIURL.BIENS}/${bien.id}/description`,
        { description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (onDescriptionSaved) {
        onDescriptionSaved(description);
      }
    } catch (error) {
      console.error('Error saving description:', error);
    }
  };

  const clearSelectedMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    setUploadedMediaUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sanitizeDescriptionForSocialMedia = (description) => {
    let sanitized = description
      .replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        '[EMAIL REMOVED]'
      )
      .replace(
        /(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
        '[PHONE REMOVED]'
      );

    sanitized = sanitized.replace(
      /\b(enfants?|children|famille avec \d+ enfants?|kids)\b/gi,
      '[FAMILY INFO REMOVED]'
    );

    return sanitized;
  };

  // Share to Instagram - with media requirement check
  const shareToInstagram = () => {
    if (!description) {
      toast.error("Veuillez générer une description d'abord");
      return;
    }

    // Check if media is selected - Instagram REQUIRES media
    if (!uploadedMediaUrl && !selectedMedia) {
      setInstagramAttempted(true);
      setShowInstagramWarning(true);
      setInstagramWarning('⚠️ Instagram nécessite une image ou une vidéo. Veuillez sélectionner un média avant de partager.');
      toast.error('Instagram nécessite un média (image ou vidéo)');
      return;
    }

    // Clear any previous warnings
    setShowInstagramWarning(false);
    setInstagramWarning('');
    setInstagramAttempted(false);

    saveDescriptionToServer();

    setIsSharing(true);
    try {
      const propertyTitle = bien?.propriete_dite_bien || 'Propriété';
      const hashtags = '#immobilier #realestate #property #home #maison #vente';
      const sanitizedDescription = sanitizeDescriptionForSocialMedia(description);
      const postContent = `🏡 ${sanitizedDescription}\n\n${hashtags}`;

      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('reseaux_sociaux', '2');
      formData.append('description', postContent);
      formData.append('projet_id', bien.projet_id);

      // Media is required for Instagram
      if (uploadedMediaUrl) {
        formData.append('mode', 'existante');
        formData.append('img_existant_url', uploadedMediaUrl);
      } else if (selectedMedia) {
        formData.append('mode', 'parcourir');
        formData.append('mediaFile', selectedMedia);
      }

      const apiUrl = `${APIURL.ROOTV1}/postTo_Social_Network`;

      axios
        .post(apiUrl, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          if (response.data && response.data.success) {
            toast.success('Publication partagée sur Instagram avec succès!');
            setTimeout(() => {
              handleModalClose();
            }, 2000);
          } else {
            toast.error('Erreur lors de la publication sur Instagram.');
          }
        })
        .catch((error) => {
          console.error('Failed to post to Instagram API:', error);
          toast.error(
            error.response?.data?.message ||
              'Erreur lors de la publication sur Instagram.'
          );
        })
        .finally(() => {
          setIsSharing(false);
        });
    } catch (error) {
      console.error('Failed to share to Instagram:', error);
      toast.error('Erreur lors du partage sur Instagram');
      setIsSharing(false);
    }
  };

  // Share to Facebook - media is optional
  const shareToFacebook = () => {
    if (!description) {
      toast.error("Veuillez générer une description d'abord");
      return;
    }

    setIsSharingFacebook(true);

    try {
      const propertyTitle = bien?.propriete_dite_bien || 'Propriété';
      const propertyLocation =
        bien?.immeuble?.nom ||
        bien?.bloc?.nom ||
        bien?.tranche?.nom ||
        bien?.projet?.nom ||
        'Emplacement';
      const propertyPrice = bien?.prix
        ? bien.prix.toLocaleString() + ' DH'
        : 'Prix sur demande';

      const sanitizedDescription = sanitizeDescriptionForSocialMedia(description);
      const postContent = `🏡 ${propertyTitle}\n\n${sanitizedDescription}\n\n📍 ${propertyLocation}\n💰 ${propertyPrice}`;

      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('reseaux_sociaux', '3');
      formData.append('description', postContent);
      formData.append('projet_id', bien.projet_id);

      // Media is optional for Facebook
      if (uploadedMediaUrl) {
        formData.append('mode', 'existante');
        formData.append('img_existant_url', uploadedMediaUrl);
      } else if (selectedMedia) {
        formData.append('mode', 'parcourir');
        formData.append('mediaFile', selectedMedia);
      } else {
        // No media - text-only post
        formData.append('mode', 'sans_media');
        formData.append('media_type', 'text');
      }

      const apiUrl = `${APIURL.ROOTV1}/postTo_Social_Network`;

      axios
        .post(apiUrl, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          const isSuccess =
            (response.data && response.data.success === true) ||
            response.status === 200 ||
            (response.data && response.data.post_id) ||
            (response.data &&
              response.data.message &&
              response.data.message.includes('succès'));

          if (isSuccess) {
            toast.success('Publication partagée sur Facebook avec succès!');
            saveDescriptionToServer();
            setTimeout(() => {
              handleModalClose();
            }, 2000);
          } else {
            toast.error('Erreur lors de la publication sur Facebook.');
          }
        })
        .catch((error) => {
          console.error('Failed to post to Facebook API:', error);
          const errorMessage =
            error.response?.data?.message ||
            'Erreur lors de la publication sur Facebook.';
          toast.error(errorMessage);
        })
        .finally(() => {
          setIsSharingFacebook(false);
        });
    } catch (error) {
      console.error('Failed to share to Facebook:', error);
      toast.error('Erreur lors du partage sur Facebook');
      setIsSharingFacebook(false);
    }
  };

  // Share to TikTok - media is optional
  const shareToTikTok = async () => {
    if (!bien?.projet_id) {
      toast.error('ID du projet requis pour partager sur TikTok');
      return;
    }

    setIsSharingTikTok(true);
    setErrorMessage('');

    try {
      const sanitizedDescription = sanitizeDescriptionForSocialMedia(description);
      const token = localStorage.getItem('accessToken');

      const payload = {
        title: `${bien.nom || 'Bien immobilier'} - ${
          bien.type_bien?.nom || ''
        }`,
        description: sanitizedDescription,
        projet_id: bien.projet_id,
      };

      // Add media only if available
      if (uploadedMediaUrl) {
        payload.media_url = uploadedMediaUrl;
        payload.media_type = mediaType === 'image' ? 'PHOTO' : 'VIDEO';
      }

      const publishResponse = await axios.post(
        `${APIURL.TIKTOK_PUBLISH}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (publishResponse.data.success) {
        if (publishResponse.data.requires_auth) {
          toast.error(
            "TikTok n'est pas configuré pour ce projet. Veuillez contacter l'administrateur."
          );
          return;
        }

        toast.success('Contenu publié sur TikTok avec succès!');

        if (publishResponse.data.publish_id) {
          setTimeout(async () => {
            try {
              const statusResponse = await axios.post(
                `${APIURL.TIKTOK_STATUS}`,
                {
                  publish_id: publishResponse.data.publish_id,
                  projet_id: bien.projet_id,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (
                statusResponse.data.success &&
                statusResponse.data.status === 'PUBLISHED'
              ) {
                toast.success('Publication TikTok confirmée!');
              }
            } catch (error) {
              console.error('Error checking TikTok status:', error);
            }
          }, 5000);
        }
      } else {
        throw new Error(
          publishResponse.data.message || 'Échec de la publication sur TikTok'
        );
      }
    } catch (error) {
      console.error('TikTok share error:', error);

      if (
        error.response?.status === 400 &&
        error.response?.data?.requires_auth
      ) {
        toast.error(
          "TikTok n'est pas configuré pour ce projet. Veuillez contacter l'administrateur."
        );
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Erreur lors du partage sur TikTok';
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsSharingTikTok(false);
    }
  };

  // Share to LinkedIn - media is optional
  const shareToLinkedin = async () => {
    if (!bien?.projet_id) {
      toast.error('ID du projet requis pour partager sur LinkedIn');
      return;
    }

    setIsSharingLinkedin(true);
    setErrorMessage('');

    try {
      const sanitizedDescription = sanitizeDescriptionForSocialMedia(description);
      const token = localStorage.getItem('accessToken');

      const payload = {
        content: sanitizedDescription,
        visibility: 'PUBLIC',
        projet_id: bien.projet_id,
      };

      // Add media only if available
      if (uploadedMediaUrl) {
        payload.mediaUrl = uploadedMediaUrl;
      }

      const shareResponse = await axios.post(
        `${APIURL.LINKEDIN_SHARE}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (shareResponse.data.success) {
        const sharedTo =
          shareResponse.data.shared_to === 'company_page'
            ? `la page entreprise ${shareResponse.data.page_name}`
            : 'LinkedIn';
        toast.success(`Contenu partagé sur ${sharedTo} avec succès!`);
      } else {
        throw new Error(
          shareResponse.data.message || 'Échec du partage sur LinkedIn'
        );
      }
    } catch (error) {
      console.error('LinkedIn share error:', error);

      if (error.response?.status === 400) {
        toast.error(
          "LinkedIn n'est pas configuré pour ce projet. Veuillez contacter l'administrateur."
        );
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Erreur lors du partage sur LinkedIn';
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsSharingLinkedin(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast.success('Description copiée dans le presse-papier!');
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      toast.error('Échec de la copie. Veuillez réessayer.');
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:opacity-90 transition-opacity"
        >
          <Sparkles size={16} />
          {buttonText}
        </button>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Générer une description avec l'IA"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md !text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>

            {configurationsLoading ? (
              <div className="flex items-center gap-2 px-4 py-2 !text-gray-500">
                <span className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></span>
                Vérification des configurations...
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {/* Facebook Share Button */}
                {socialConfigurations.facebook && (
                  <button
                    onClick={shareToFacebook}
                    disabled={!description || isSharingFacebook || isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-md hover:bg-[#166FE5] disabled:opacity-50"
                  >
                    {isSharingFacebook ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                        Partage...
                      </>
                    ) : (
                      <>
                        <Facebook size={16} />
                        Facebook
                      </>
                    )}
                  </button>
                )}

                {/* Instagram Share Button - warning only shows after user clicks it without media */}
                {socialConfigurations.instagram && (
                  <div className="relative group">
                    <button
                      onClick={shareToInstagram}
                      disabled={!description || isSharing || isUploading}
                      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-all ${
                        instagramAttempted && !uploadedMediaUrl && !selectedMedia && description 
                          ? 'ring-2 ring-red-400 ring-offset-1' 
                          : ''
                      }`}
                      title={instagramAttempted && !uploadedMediaUrl && !selectedMedia ? "⚠️ Instagram nécessite un média" : "Partager sur Instagram"}
                    >
                      {isSharing ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                          Partage...
                        </>
                      ) : (
                        <>
                          <Instagram size={16} />
                          Instagram
                          {instagramAttempted && !uploadedMediaUrl && !selectedMedia && (
                            <span className="ml-1 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 animate-pulse">
                              !
                            </span>
                          )}
                        </>
                      )}
                    </button>
                    
                    {/* Red dot indicator - only shows after user attempted to share */}
                    {instagramAttempted && !uploadedMediaUrl && !selectedMedia && description && !isSharing && (
                      <div className="absolute -top-2 -right-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      </div>
                    )}
                    
                    {/* Tooltip on hover - only shows after user attempted to share */}
                    {instagramAttempted && !uploadedMediaUrl && !selectedMedia && description && (
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        ⚠️ Média requis pour Instagram
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                )}

                {/* LinkedIn Share Button */}
                {socialConfigurations.linkedin && (
                  <button
                    onClick={shareToLinkedin}
                    disabled={!description || isSharingLinkedin || isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-md hover:bg-[#004182] disabled:opacity-50"
                  >
                    {isSharingLinkedin ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                        Partage...
                      </>
                    ) : (
                      <>
                        <LinkedInIcon size={16} />
                        LinkedIn
                      </>
                    )}
                  </button>
                )}

                {/* TikTok Share Button */}
                {socialConfigurations.tiktok && (
                  <button
                    onClick={shareToTikTok}
                    disabled={!description || isSharingTikTok || isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-[#00f2ea] text-white rounded-md hover:opacity-90 disabled:opacity-50"
                  >
                    {isSharingTikTok ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                        Partage...
                      </>
                    ) : (
                      <>
                        <TikTokIcon size={16} />
                        TikTok
                      </>
                    )}
                  </button>
                )}

                {/* No configurations message */}
                {!configurationsLoading &&
                  !socialConfigurations.facebook &&
                  !socialConfigurations.instagram &&
                  !socialConfigurations.linkedin &&
                  !socialConfigurations.tiktok && (
                    <div className="flex items-center gap-2 px-4 py-2 !text-gray-500 bg-gray-100 rounded-md">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Aucun réseau social configuré pour ce projet
                    </div>
                  )}
              </div>
            )}
          </>
        }
      >
        <div className="space-y-6">
          {/* Configuration warnings */}
          {!configurationsLoading &&
            !socialConfigurations.facebook &&
            !socialConfigurations.instagram &&
            !socialConfigurations.linkedin &&
            !socialConfigurations.tiktok && (
              <div className="p-4 border border-orange-300 rounded-md bg-orange-50 !text-orange-800">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Aucune configuration trouvée</p>
                    <p className="text-sm mt-1">
                      Aucun réseau social n{"'"}est configuré pour ce projet.
                      Veuillez configurer au moins un réseau social dans la
                      section Configuration des réseaux sociaux pour pouvoir
                      partager ce contenu.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Configured platforms list */}
          {!configurationsLoading &&
            (socialConfigurations.facebook ||
              socialConfigurations.instagram ||
              socialConfigurations.linkedin ||
              socialConfigurations.tiktok) && (
              <div className="p-3 border border-green-300 rounded-md bg-green-50">
                <p className="text-sm !text-green-800">
                  <span className="font-medium">
                    Réseaux sociaux configurés pour ce projet:
                  </span>
                  <span className="ml-2">
                    {[
                      socialConfigurations.facebook && 'Facebook',
                      socialConfigurations.instagram && 'Instagram',
                      socialConfigurations.linkedin && 'LinkedIn',
                      socialConfigurations.tiktok && 'TikTok',
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </p>
              </div>
            )}

          {/* Instagram Warning Banner - shows only when user clicks Instagram without media */}
          {showInstagramWarning && (
            <div className="p-3 border border-red-300 rounded-md bg-red-50 !text-red-700 flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Média requis pour Instagram</p>
                <p className="text-sm mt-1">{instagramWarning}</p>
                <button 
                  onClick={() => {
                    setShowInstagramWarning(false);
                    setInstagramAttempted(false);
                  }}
                  className="text-sm mt-1 text-red-600 hover:text-red-800 underline"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {/* Generate Description Button */}
          <div className="flex justify-center">
            <button
              onClick={generateDescription}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Générer une description
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 border border-red-300 rounded-md bg-red-50 !text-red-700">
              <p className="font-medium">Erreur:</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Generated Description */}
          {generatedDescription && (
            <>
              <div className="p-4 border rounded-md bg-gray-50 relative">
                <h3 className="font-medium mb-2">Description générée:</h3>
                <p className="whitespace-pre-wrap !text-gray-700">
                  {generatedDescription}
                </p>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedDescription)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Copier dans le presse-papiers"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={useGeneratedDescription}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Utiliser cette description"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* User Feedback Section */}
              {hasGeneratedOnce && (
                <div className="space-y-2 border-t pt-4">
                  <label className="block text-sm font-medium !text-gray-700">
                    Instructions pour améliorer la description
                  </label>
                  <textarea
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    rows={3}
                    placeholder="Ex: Ajoutez plus de détails sur la vue, mettez l'accent sur la luminosité, mentionnez la proximité des commerces..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={regenerateWithFeedback}
                      disabled={isGenerating || !userFeedback}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
                    >
                      <RefreshCw size={16} />
                      Ajuster la description
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Final Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium !text-gray-700">
              Description finale
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Entrez ou modifiez la description du bien ici..."
            />
          </div>

          {/* Media Upload Section - warnings only show after user attempted Instagram */}
          <div className="space-y-2 border-t pt-4">
            <label className="flex justify-between items-center text-sm font-medium !text-gray-700">
              <span>
                Ajouter une image ou une vidéo 
                {socialConfigurations.instagram && instagramAttempted && !uploadedMediaUrl && !selectedMedia && (
                  <span className="font-normal text-red-500 ml-1">(requis pour Instagram)</span>
                )}
                {(!socialConfigurations.instagram || (!instagramAttempted || (uploadedMediaUrl || selectedMedia))) && (
                  <span className="font-normal text-gray-500 ml-1">(optionnel)</span>
                )}
              </span>
              {isUploading && (
                <span className="text-xs !text-blue-500 flex items-center">
                  <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-1"></span>
                  Téléchargement en cours...
                </span>
              )}
            </label>
            
            {/* Conditional info message - only shows after user attempted Instagram without media */}
            {socialConfigurations.instagram && instagramAttempted && !uploadedMediaUrl && !selectedMedia && (
              <div className="p-2 border border-red-200 rounded-md bg-red-50">
                <p className="text-xs !text-red-700 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                  ⚠️ Un média est <span className="font-bold mx-1">OBLIGATOIRE</span> pour Instagram
                </p>
              </div>
            )}
            
            {(!socialConfigurations.instagram || !instagramAttempted || (uploadedMediaUrl || selectedMedia)) && !uploadedMediaUrl && !selectedMedia && (
              <div className="p-2 border border-blue-200 rounded-md bg-blue-50">
                <p className="text-xs !text-blue-700">
                  💡 Vous pouvez partager uniquement la description ou ajouter une image/vidéo pour enrichir votre publication.
                </p>
              </div>
            )}

            {/* Helper text for Instagram requirement - only shows after user attempted Instagram */}
            {socialConfigurations.instagram && instagramAttempted && !uploadedMediaUrl && !selectedMedia && (
              <div className="flex items-center gap-2 text-xs !text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span>Instagram nécessite un média (image ou vidéo) pour publier. Veuillez ajouter un média ci-dessous.</span>
              </div>
            )}

            <div className="flex items-center justify-center w-full">
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                  socialConfigurations.instagram && instagramAttempted && !uploadedMediaUrl && !selectedMedia
                    ? 'border-red-400 hover:border-red-500'
                    : 'border-gray-300'
                }`}
                htmlFor="mediaUpload"
              >
                {!selectedMedia && !mediaPreview ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className={`w-8 h-8 mb-2 ${socialConfigurations.instagram && instagramAttempted && !uploadedMediaUrl && !selectedMedia ? '!text-red-500' : '!text-gray-500'}`} />
                    <p className="mb-2 text-sm !text-gray-500">
                      <span className="font-semibold">
                        Cliquez pour sélectionner
                      </span>{' '}
                      ou glissez une image/vidéo 
                      {socialConfigurations.instagram && instagramAttempted && !uploadedMediaUrl && !selectedMedia && (
                        <span className="ml-1 text-red-500 font-medium">(requis)</span>
                      )}
                      {(!socialConfigurations.instagram || !instagramAttempted || (uploadedMediaUrl || selectedMedia)) && (
                        <span className="ml-1 text-gray-400">(optionnel)</span>
                      )}
                    </p>
                    <p className="text-xs !text-gray-500">
                      JPG, PNG, GIF, MP4 ou MOV (max. 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {mediaType === 'image' ? (
                      <div className="relative">
                        <img
                          src={mediaPreview || initialMediaUrl}
                          alt="Aperçu"
                          className="max-h-28 max-w-full object-contain rounded-lg"
                        />
                        <span className="absolute bottom-0 right-0 bg-green-500 text-white text-xs rounded-full px-2 py-0.5">
                          Image
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <video
                          src={mediaPreview || initialMediaUrl}
                          className="max-h-28 max-w-full rounded-lg"
                          controls
                        />
                        <span className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                          Vidéo
                        </span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        clearSelectedMedia();
                      }}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Supprimer le média"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <input
                  id="mediaUpload"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleMediaSelect}
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </label>
            </div>

            {(selectedMedia || uploadedMediaUrl) && (
              <p className="text-sm !text-gray-500">
                {selectedMedia
                  ? `${selectedMedia.name} (${(
                      selectedMedia.size /
                      (1024 * 1024)
                    ).toFixed(2)} MB)`
                  : 'Média pré-sélectionné'}
                {uploadedMediaUrl && (
                  <span className="ml-2 !text-green-500">
                    ✓ Téléchargé sur le serveur
                  </span>
                )}
              </p>
            )}
            
            {/* Show a message when no media is selected - only show Instagram warning after user attempted */}
            {!selectedMedia && !uploadedMediaUrl && (
              <p className="text-xs !text-gray-400 italic">
                {socialConfigurations.instagram && instagramAttempted
                  ? '⚠️ Aucun média sélectionné - requis pour Instagram' 
                  : 'Aucun média sélectionné - vous pouvez partager uniquement la description'}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

// TikTok Icon Component
function TikTokIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.23 0 .47.03.7.08V9.4a6.17 6.17 0 00-1-.08 6.3 6.3 0 106.3 6.3c0-.23-.01-.46-.02-.7V9.49a8.32 8.32 0 004.13 1.09V7.14h-.01z" />
    </svg>
  );
}

// LinkedIn Icon Component
function LinkedInIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}
