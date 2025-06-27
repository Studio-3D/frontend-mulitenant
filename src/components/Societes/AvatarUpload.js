import React, { useRef, useState } from 'react';
import { UserIcon, UploadCloudIcon } from 'lucide-react';

export function AvatarUpload({ currentLogo, onFileChange }) {
  const [previewUrl, setPreviewUrl] = useState(currentLogo || null);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      onFileChange(file); // Appel du parent pour stocker le fichier sélectionné
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 relative group">
        <div
          className="w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center overflow-hidden border-2 border-blue-100 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-200"
          onClick={handleImageClick}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={64} className="text-blue-300 transition-transform duration-300 group-hover:scale-110" />
          )}
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-white/95 rounded-lg p-2 shadow-sm">
              <UploadCloudIcon className="w-6 h-6 !text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={handleImageClick}
        className="bg-white !text-blue-500 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-50 transition-colors duration-200 flex items-center gap-2"
      >
        <UploadCloudIcon className="w-4 h-4" />
        Télécharger Logo
      </button>
    </div>
  );
}
