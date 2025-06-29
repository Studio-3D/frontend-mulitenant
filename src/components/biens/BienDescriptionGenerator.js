import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import toast from 'react-hot-toast';
import { LLMService } from "@/services/llmService";
import Modal from "@/components/ui/Modal";
import { Sparkles, Copy, RefreshCw, Instagram, Facebook, Image, X, FileVideo, UploadCloud } from "lucide-react";


// Modify the BienDescriptionGenerator to accept initialMediaUrl and initialMediaType props
export default function BienDescriptionGenerator({ 
  bien, 
  onDescriptionSaved, 
  buttonText = "Générer Description IA",
  initialMediaUrl,
  initialMediaType,
  isOpen = false,
  onClose
}) {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [description, setDescription] = useState(bien?.description || "");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSharingTikTok, setIsSharingTikTok] = useState(false);
  const [isSharingFacebook, setIsSharingFacebook] = useState(false);
  const [isSharingLinkedin, setIsSharingLinkedin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userFeedback, setUserFeedback] = useState("");
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  
  // Media states with additional server-related states
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
      // Create a preview for pre-selected media
      if (initialMediaUrl && !mediaPreview) {
        setMediaPreview(initialMediaUrl);
      }
    }
  }, [initialMediaUrl, initialMediaType, mediaPreview]);
  
  // Handle external modal open/close state
  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);
  
  // Update external state when modal closes
  const handleModalClose = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };
  
  // Generate initial property description
  const generateDescription = async () => {
    if (!bien) {
      toast.error("Informations du bien manquantes");
      return;
    }
    
    setIsGenerating(true);
    setErrorMessage("");
    
    try {
      // Use the built-in API key or the mock service
      const generatedText = process.env.NEXT_PUBLIC_OPENAI_API_KEY
        ? await LLMService.generatePropertyDescription(bien)
        : await LLMService.generateMockDescription(bien);
      
      setGeneratedDescription(generatedText);
      setHasGeneratedOnce(true);
      toast.success("Description générée avec succès!");
    } catch (error) {
      console.error("Failed to generate description:", error);
      setErrorMessage(error.message || "Erreur lors de la génération de la description");
      toast.error(error.message || "Erreur lors de la génération de la description");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate refined description with user feedback
  const regenerateWithFeedback = async () => {
    if (!bien || !userFeedback) {
      toast.error("Veuillez fournir des instructions pour améliorer la description");
      return;
    }
    
    setIsGenerating(true);
    setErrorMessage("");
    
    try {
      let refinedText;
      
      // Create feedback prompt
      const feedbackPrompt = `
Voici une description existante d'un bien immobilier:

"${generatedDescription}"

L'utilisateur souhaite modifier cette description avec les instructions suivantes:
"${userFeedback}"

Veuillez générer une nouvelle description qui intègre ces commentaires.`;

      if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        // Use OpenAI API if key is available
        refinedText = await LLMService.generateRefinedDescription(feedbackPrompt);
      } else {
        // Use improved mock service
        refinedText = await LLMService.generateMockRefinedDescription(generatedDescription, userFeedback);
      }
      
      setGeneratedDescription(refinedText);
      setUserFeedback("");
      toast.success("Description mise à jour avec succès!");
    } catch (error) {
      console.error("Failed to regenerate description:", error);
      setErrorMessage(error.message || "Erreur lors de la mise à jour de la description");
      toast.error(error.message || "Erreur lors de la mise à jour de la description");
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy generated text to description field
  const useGeneratedDescription = () => {
    setDescription(generatedDescription);
    toast.success("Description copiée");
  };

  // Handle media file selection
  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error("Format non supporté. Veuillez sélectionner une image ou une vidéo.");
      return;
    }

    // Check file size (10MB limit)
    const sizeLimit = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > sizeLimit) {
      toast.error("Le fichier est trop volumineux. Limite: 10MB");
      return;
    }

    setSelectedMedia(file);
    setMediaType(isImage ? 'image' : 'video');

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
    
    // Upload the file immediately
    uploadMediaToServer(file);
  };

  // Upload media to server
  const uploadMediaToServer = async (file) => {
    if (!bien?.id || !file) {
      toast.error("Impossible d'uploader le fichier: informations manquantes");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('media', file);
      
      // Add description if available
      if (description) {
        formData.append('description_bien', description);
      }
      
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${APIURL.BIENS}/${bien.id}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data && response.data.url) {
        setUploadedMediaUrl(response.data.url);
        toast.success("Media téléchargé avec succès");
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error(error.response?.data?.message || "Erreur lors du téléchargement du média");
      clearSelectedMedia();
    } finally {
      setIsUploading(false);
    }
  };

  // Save description to server
  const saveDescriptionToServer = async () => {
    if (!bien?.id || !description) {
      return;
    }
    
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `${APIURL.BIENS}/${bien.id}/description`,
        { description },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Notify parent component if needed
      if (onDescriptionSaved) {
        onDescriptionSaved(description);
      }
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };

  // Clear selected media
  const clearSelectedMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    setUploadedMediaUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format and sanitize a description for social media to remove sensitive information
  const sanitizeDescriptionForSocialMedia = (description) => {
    // Remove potential contact information (emails, phone numbers)
    let sanitized = description.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REMOVED]')
                              .replace(/(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[PHONE REMOVED]');
    
    // Remove any mentions of children or family demographics
    sanitized = sanitized.replace(/\b(enfants?|children|famille avec \d+ enfants?|kids)\b/gi, '[FAMILY INFO REMOVED]');
    
    return sanitized;
  };

  // Share to Instagram with media using Instagram_FacebookController
  const shareToInstagram = () => {
    if (!description) {
      toast.error("Veuillez générer une description d'abord");
      return;
    }
    
    saveDescriptionToServer();
    
    setIsSharing(true);
    try {
      const propertyTitle = bien?.propriete_dite_bien || "Propriété";
      const propertyLocation = bien?.immeuble?.nom || bien?.bloc?.nom || bien?.tranche?.nom || bien?.projet?.nom || "Emplacement";
      const propertyPrice = bien?.prix ? bien.prix.toLocaleString() + " DH" : "Prix sur demande";
      
      const hashtags = "#immobilier #realestate #property #home #maison #vente";
      
      const sanitizedDescription = sanitizeDescriptionForSocialMedia(description);
      const postContent = `🏡 ${propertyTitle}\n\n${sanitizedDescription}\n\n📍 ${propertyLocation}\n💰 ${propertyPrice}\n\n${hashtags}`;
      
      const token = localStorage.getItem("accessToken");
      
      const formData = new FormData();
      formData.append('reseaux_sociaux', '2');
      formData.append('description', postContent);
      
      if (uploadedMediaUrl) {
        formData.append('mode', 'existante');
        formData.append('img_existant_url', uploadedMediaUrl);
      } else if (selectedMedia) {
        formData.append('mode', 'parcourir');
        formData.append('mediaFile', selectedMedia);
      } else {
        formData.append('mode', 'null');
      }
      
      const apiUrl = `${APIURL.ROOTV1}/postTo_Social_Network`;
      
      axios.post(
        apiUrl, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      .then(response => {
        if (response.data && response.data.success) {
          toast.success("Publication partagée sur Instagram avec succès!");
        } else {
          toast.error("Erreur lors de la publication sur Instagram.");
        }
        
        // Close modal after delay
        setTimeout(() => {
          handleModalClose();
        }, 2000);
      }).catch(error => {
        console.error("Failed to post to Instagram API:", error);
        toast.error("Erreur lors de la publication sur Instagram.");
      }).finally(() => {
        setIsSharing(false);
      });
    } catch (error) {
      console.error("Failed to share to Instagram:", error);
      toast.error("Erreur lors du partage sur Instagram");
      setIsSharing(false);
    }
  };

  // Share to TikTok with OAuth flow and media using TikTok's official API
  const shareToTikTok = async () => {
    if (!bien?.projet_id) {
      toast.error("ID du projet requis pour partager sur TikTok");
      return;
    }

    if (!uploadedMediaUrl) {
      toast.error("Veuillez d'abord télécharger un média avant de partager sur TikTok");
      return;
    }

    setIsSharingTikTok(true);
    setErrorMessage("");

    try {
      const sanitizedDescription = sanitizeDescriptionForSocialMedia(description);
      const token = localStorage.getItem("accessToken");

      // Try to publish directly using saved configuration
      const publishResponse = await axios.post(`${APIURL.TIKTOK_PUBLISH}`, {
        title: `${bien.nom || 'Bien immobilier'} - ${bien.type_bien?.nom || ''}`,
        description: sanitizedDescription,
        media_url: uploadedMediaUrl,
        media_type: mediaType === 'image' ? 'PHOTO' : 'VIDEO',
        projet_id: bien.projet_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (publishResponse.data.success) {
        if (publishResponse.data.requires_auth) {
          // Configuration not found, need to authenticate
          toast.error("TikTok n'est pas configuré pour ce projet. Veuillez contacter l'administrateur.");
          return;
        }

        toast.success("Contenu publié sur TikTok avec succès!");
        
        // Check publish status if we have a publish_id
        if (publishResponse.data.publish_id) {
          setTimeout(async () => {
            try {
              const statusResponse = await axios.post(`${APIURL.TIKTOK_STATUS}`, {
                publish_id: publishResponse.data.publish_id,
                projet_id: bien.projet_id
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (statusResponse.data.success && statusResponse.data.status === 'PUBLISHED') {
                toast.success("Publication TikTok confirmée!");
              }
            } catch (error) {
              console.error("Error checking TikTok status:", error);
            }
          }, 5000); // Check after 5 seconds
        }
      } else {
        throw new Error(publishResponse.data.message || 'Échec de la publication sur TikTok');
      }

    } catch (error) {
      console.error("TikTok share error:", error);
      
      if (error.response?.status === 400 && error.response?.data?.requires_auth) {
        toast.error("TikTok n'est pas configuré pour ce projet. Veuillez contacter l'administrateur.");
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Erreur lors du partage sur TikTok";
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsSharingTikTok(false);
    }
  };
  
  // Share to Facebook with media using the Facebook_InstagramController
  const shareToFacebook = () => {
    if (!description) {
      toast.error("Veuillez générer une description d'abord");
      return;
    }
    
    setIsSharingFacebook(true);
    
    try {
      const propertyTitle = bien?.propriete_dite_bien || "Propriété";
      const propertyLocation = bien?.immeuble?.nom || bien?.bloc?.nom || bien?.tranche?.nom || bien?.projet?.nom || "Emplacement";
      const propertyPrice = bien?.prix ? bien.prix.toLocaleString() + " DH" : "Prix sur demande";
      
      const sanitizedDescription = sanitizeDescriptionForSocialMedia(description);
      const postContent = `🏡 ${propertyTitle}\n\n${sanitizedDescription}\n\n📍 ${propertyLocation}\n💰 ${propertyPrice}`;
      
      const token = localStorage.getItem("accessToken");
      
      const formData = new FormData();
      formData.append('reseaux_sociaux', '3');
      formData.append('description', postContent);
      
      if (uploadedMediaUrl) {
        formData.append('mode', 'existante');
        formData.append('img_existant_url', uploadedMediaUrl);
      } else if (selectedMedia) {
        formData.append('mode', 'parcourir');
        formData.append('mediaFile', selectedMedia);
      } else {
        formData.append('mode', 'null');
      }
      
      const apiUrl = `${APIURL.ROOTV1}/postTo_Social_Network`;
      
      axios.post(
        apiUrl,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      .then(response => {
        if (response.data && response.data.success) {
          toast.success("Publication partagée sur Facebook avec succès!");
          
          // Save description to server
          saveDescriptionToServer();
          
          // Close modal after delay
          setTimeout(() => {
            handleModalClose();
          }, 2000);
        } else {
          toast.error("Erreur lors de la publication sur Facebook.");
        }
      }).catch(error => {
        console.error("Failed to post to Facebook API:", error);
        const errorMessage = error.response?.data?.message || "Erreur lors de la publication sur Facebook.";
        toast.error(errorMessage);
      }).finally(() => {
        setIsSharingFacebook(false);
      });
    } catch (error) {
      console.error("Failed to share to Facebook:", error);
      toast.error("Erreur lors du partage sur Facebook");
      setIsSharingFacebook(false);
    }
  };

  // Share to LinkedIn with configuration check
  const shareToLinkedin = async () => {
    if (!bien?.projet_id) {
      toast.error("ID du projet requis pour partager sur LinkedIn");
      return;
    }

    setIsSharingLinkedin(true);
    setErrorMessage("");

    try {
      const sanitizedDescription = sanitizeDescriptionForSocialMedia(description);
      const token = localStorage.getItem("accessToken");

      // Try to share directly using saved configuration
      const shareResponse = await axios.post(`${APIURL.LINKEDIN_SHARE}`, {
        content: sanitizedDescription,
        visibility: 'PUBLIC',
        mediaUrl: uploadedMediaUrl,
        projet_id: bien.projet_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (shareResponse.data.success) {
        const sharedTo = shareResponse.data.shared_to === 'company_page' 
          ? `la page entreprise ${shareResponse.data.page_name}` 
          : 'LinkedIn';
        toast.success(`Contenu partagé sur ${sharedTo} avec succès!`);
      } else {
        throw new Error(shareResponse.data.message || 'Échec du partage sur LinkedIn');
      }

    } catch (error) {
      console.error("LinkedIn share error:", error);
      
      if (error.response?.status === 400) {
        toast.error("LinkedIn n'est pas configuré pour ce projet. Veuillez contacter l'administrateur.");
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Erreur lors du partage sur LinkedIn";
        setErrorMessage(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsSharingLinkedin(false);
    }
  };

  // Check if configurations exist for this project
  const checkProjectConfigurations = async () => {
    if (!bien?.projet_id) return;
    
    const token = localStorage.getItem("accessToken");
    
    try {
      // Check LinkedIn config
      const linkedinResponse = await axios.get(
        `${APIURL.LINKEDIN_CONFIG}/project/${bien.projet_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('LinkedIn config available:', !!linkedinResponse.data.configuration);
      
      // Check TikTok config
      const tiktokResponse = await axios.get(
        `${APIURL.TIKTOK_CONFIG}/project/${bien.projet_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('TikTok config available:', !!tiktokResponse.data.configuration);
    } catch (error) {
      console.log('Error checking configurations:', error);
    }
  };

  // Add event listener for LinkedIn OAuth callback
  useEffect(() => {
    const handleLinkedInCallback = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      
      switch(event.data.type) {
        case 'LINKEDIN_SHARE_SUCCESS':
          toast.success(`Publication partagée sur LinkedIn avec succès!`);
          setTimeout(() => setIsModalOpen(false), 2000);
          break;
          
        case 'LINKEDIN_SHARE_ERROR':
          toast.error(`Erreur lors du partage sur LinkedIn: ${event.data.error}`);
          break;
          
        case 'LINKEDIN_AUTH_ERROR':
          toast.error(`Erreur d'authentification LinkedIn: ${event.data.error}`);
          break;
      }
      
      setIsSharingLinkedin(false);
    };
    
    window.addEventListener('message', handleLinkedInCallback);
    return () => window.removeEventListener('message', handleLinkedInCallback);
  }, []);

  useEffect(() => {
    if (isModalOpen && bien?.projet_id) {
      checkProjectConfigurations();
    }
  }, [isModalOpen, bien?.projet_id]);

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
            <div className="flex gap-2">
              <button
                onClick={shareToFacebook}
                disabled={!description || isSharingFacebook}
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
              <button
                onClick={shareToInstagram}
                disabled={!description || isSharing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:opacity-90 disabled:opacity-50"
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
                  </>
                )}
              </button>
              <button
                onClick={shareToTikTok}
                disabled={!description || isSharingTikTok}
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
              <button
                onClick={shareToLinkedin}
                disabled={!description || isSharingLinkedin}
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
            </div>
          </>
        }
      >
        <div className="space-y-6">
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

          {errorMessage && (
            <div className="p-4 border border-red-300 rounded-md bg-red-50 !text-red-700">
              <p className="font-medium">Erreur:</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {generatedDescription && (
            <>
              <div className="p-4 border rounded-md bg-gray-50 relative">
                <h3 className="font-medium mb-2">Description générée:</h3>
                <p className="whitespace-pre-wrap !text-gray-700">{generatedDescription}</p>
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                </div>
              </div>

              {/* User feedback section - only appears after initial generation */}
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
          
          {/* Media upload section with upload indicator */}
          <div className="space-y-2 border-t pt-4">
            <label className="flex justify-between items-center text-sm font-medium !text-gray-700">
              <span>Ajouter une image ou une vidéo</span>
              {isUploading && (
                <span className="text-xs !text-blue-500 flex items-center">
                  <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-1"></span>
                  Téléchargement en cours...
                </span>
              )}
            </label>
            
            <div className="flex items-center justify-center w-full">
              <label 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                htmlFor="mediaUpload"
              >
                {!selectedMedia && !mediaPreview ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 !text-gray-500" />
                    <p className="mb-2 text-sm !text-gray-500">
                      <span className="font-semibold">Cliquez pour sélectionner</span> ou glissez une image/vidéo
                    </p>
                    <p className="text-xs !text-gray-500">JPG, PNG, GIF, MP4 ou MOV (max. 10MB)</p>
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
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
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
                {selectedMedia ? `${selectedMedia.name} (${(selectedMedia.size / (1024 * 1024)).toFixed(2)} MB)` : 'Média pré-sélectionné'}
                {uploadedMediaUrl && (
                  <span className="ml-2 !text-green-500">✓ Téléchargé sur le serveur</span>
                )}
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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.23 0 .47.03.7.08V9.4a6.17 6.17 0 00-1-.08 6.3 6.3 0 106.3 6.3c0-.23-.01-.46-.02-.7V9.49a8.32 8.32 0 004.13 1.09V7.14h-.01z" />
    </svg>
  );
}

// LinkedIn Icon Component
function LinkedInIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}
