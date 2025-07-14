import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { APIURL } from "@/configs/api";
import toast from "react-hot-toast";
import { Image, FileVideo, X, Share2, Upload, UploadCloud } from "lucide-react";
import BienDescriptionGenerator from "./BienDescriptionGenerator";

export default function BienMedia({ bienId }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [bien, setBien] = useState(null);
  
  // States for upload functionality
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMedia, setUploadMedia] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadMediaType, setUploadMediaType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        
        // Fetch media
        const mediaResponse = await axios.get(`${APIURL.BIENS}/${bienId}/media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMedia(mediaResponse.data.media || []);

        // Fetch bien details to get projet_id
        const bienResponse = await axios.get(`${APIURL.BIENS}/${bienId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBien(bienResponse.data.bien);
        
      } catch (error) {
        console.error("Error fetching media or bien details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [bienId]);

  const openMediaModal = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setModalOpen(true);
  };

  const closeMediaModal = () => {
    setModalOpen(false);
    setSelectedMedia(null);
  };

  // Open share modal with the current media
  const openShareModal = () => {
    if (selectedMedia && bien && bien.projet_id) {
      setIsShareModalOpen(true);
    } else {
      toast.error("Impossible d'ouvrir le modal de partage. Données manquantes.");
    }
  };

  // Handle description save
  const handleDescriptionSaved = (description) => {
    if (bien) {
      setBien({
        ...bien,
        description: description
      });
    }
  };
  
  // New functions for media upload
  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };
  
  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    clearUploadMedia();
  };
  
  const clearUploadMedia = () => {
    if (uploadPreview) {
      URL.revokeObjectURL(uploadPreview);
    }
    setUploadMedia(null);
    setUploadPreview(null);
    setUploadMediaType(null);
    setUploadTitle("");
    setUploadDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
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
    
    setUploadMedia(file);
    setUploadMediaType(isImage ? 'image' : 'video');
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
  };
  
  const handleMediaUpload = async () => {
    if (!uploadMedia) {
      toast.error("Veuillez sélectionner un fichier à télécharger");
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('media', uploadMedia);
      
      if (uploadTitle) {
        formData.append('title', uploadTitle);
      }
      
      if (uploadDescription) {
        formData.append('description', uploadDescription);
      }
      
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${APIURL.BIENS}/${bienId}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data) {
        toast.success("Media téléchargé avec succès");
        closeUploadModal();
        
        // Refresh the media list
        const updatedMediaResponse = await axios.get(`${APIURL.BIENS}/${bienId}/media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (updatedMediaResponse.data && updatedMediaResponse.data.media) {
          setMedia(updatedMediaResponse.data.media);
        }
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error(error.response?.data?.message || "Erreur lors du téléchargement du média");
    } finally {
      setIsUploading(false);
    }
  };

  // Render the media preview modal
  const renderMediaModal = () => {
    if (!selectedMedia) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium !text-gray-800">
              {selectedMedia.title || "Aperçu du média"}
            </h3>
            <button 
              onClick={closeMediaModal}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 !text-gray-700" />
            </button>
          </div>
          
          <div className="p-6 flex flex-col items-center">
            {selectedMedia.file_type === "image" ? (
              <img 
                src={selectedMedia.url} 
                alt={selectedMedia.title || "Image du bien"}
                className="max-h-[70vh] max-w-full object-contain" 
              />
            ) : (
              <video 
                src={selectedMedia.url} 
                controls 
                className="max-h-[70vh] max-w-full"
              >
                Votre navigateur ne prend pas en charge la lecture de vidéos.
              </video>
            )}
            
            {selectedMedia.description && (
              <p className="mt-4 text-gray-600 max-w-2xl text-center">{selectedMedia.description}</p>
            )}
          </div>
          
          <div className="p-4 bg-gray-50 flex justify-end">
            <button 
              onClick={openShareModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render upload modal
  const renderUploadModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="relative max-w-lg w-full bg-white rounded-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium !text-gray-800">
              Télécharger média
            </h3>
            <button 
              onClick={closeUploadModal}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 !text-gray-700" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Media selection area */}
            <div>
              <label className="block text-sm font-medium !text-gray-700 mb-2">
                Sélectionner une image ou une vidéo
              </label>
              
              <div className="flex items-center justify-center w-full">
                <label 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  htmlFor="mediaUpload"
                >
                  {!uploadMedia ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 !text-gray-500" />
                      <p className="mb-2 text-sm !text-gray-500">
                        <span className="font-semibold">Cliquez pour sélectionner</span> ou glissez une image/vidéo
                      </p>
                      <p className="text-xs !text-gray-500">JPG, PNG, GIF, MP4 ou MOV (max. 10MB)</p>
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {uploadMediaType === 'image' ? (
                        <div className="relative">
                          <img 
                            src={uploadPreview} 
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
                            src={uploadPreview}
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
                          clearUploadMedia();
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
              
              {uploadMedia && (
                <p className="text-sm !text-gray-500 mt-2">
                  {uploadMedia.name} ({(uploadMedia.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            {/* Optional metadata */}
            <div>
              <label className="block text-sm font-medium !text-gray-700 mb-2">
                Titre (optionnel)
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Donnez un titre à ce média..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium !text-gray-700 mb-2">
                Description (optionnelle)
              </label>
              <textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ajoutez une description..."
              />
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={closeUploadModal}
              className="px-4 py-2 border border-gray-300 rounded-md !text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={handleMediaUpload}
              disabled={!uploadMedia || isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Téléchargement...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Télécharger
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render empty state
  if (!media.length) {
    return (
      <div className="space-y-4">
        {/* Upload Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" />
            Télécharger média
          </button>
        </div>
      
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="mb-4 flex justify-center">
            <Image className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium !text-gray-700">Aucun média disponible</h3>
          <p className="mt-2 !text-gray-500">
            Aucune image ou vidéo n'a été téléchargée pour ce bien.
          </p>
        </div>
        
        {isUploadModalOpen && renderUploadModal()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Upload className="w-4 h-4" />
          Télécharger média
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <div 
            key={item.id} 
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => openMediaModal(item)}
          >
            <div className="relative h-40">
              {item.file_type === "image" ? (
                <img 
                  src={item.url} 
                  alt={item.title || "Image du bien"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                  <video 
                    src={item.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <FileVideo className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}
              
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.file_type === 'image' 
                    ? 'bg-green-100 !text-green-800' 
                    : 'bg-blue-100 !text-blue-800'
                }`}>
                  {item.file_type === 'image' ? 'Image' : 'Vidéo'}
                </span>
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity"></div>
            </div>
            
            <div className="p-3 border-t">
              <h4 className="font-medium text-sm truncate !text-gray-800">
                {item.title || (item.file_type === 'image' ? 'Image' : 'Vidéo')}
              </h4>
              <p className="text-xs !text-gray-500 mt-1 truncate">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {modalOpen && renderMediaModal()}
      
      {/* Share Modal - Uses BienDescriptionGenerator */}
      {isShareModalOpen && bien && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsShareModalOpen(false)}
          ></div>
          
          <div 
            className="z-10"
            onClick={e => e.stopPropagation()}
          >
            <BienDescriptionGenerator 
              bien={bien}
              onDescriptionSaved={handleDescriptionSaved}
              initialMediaUrl={selectedMedia?.url}
              initialMediaType={selectedMedia?.file_type}
              isOpen={true}
              onClose={() => setIsShareModalOpen(false)}
            />
          </div>
        </div>
      )}
      
      {isUploadModalOpen && renderUploadModal()}
    </div>
  );
}
