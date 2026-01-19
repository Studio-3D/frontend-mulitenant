'use client';

import React, { useState } from 'react';
import { X, Download, Maximize2 } from "lucide-react";

const PieceJointeViewer = ({ Details, getFileUrl, url }) => {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const files = url
    ? [url]
    : Details?.piece_jointe && Array.isArray(Details.piece_jointe)
      ? Details.piece_jointe.map(pj => getFileUrl ? getFileUrl(pj.fichier || pj) : pj)
      : [];

  const handleOpen = (fileUrl) => {
    setSelectedImage(fileUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <>
      <div className="my-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Maximize2 className="w-5 h-5" />
          Pièces jointes ({files.length})
        </h3>
        
        <div className="flex flex-wrap gap-4">
          {files.map((fileUrl, i) => (
            <div
              key={i}
              className="group relative cursor-pointer"
              onClick={() => handleOpen(fileUrl)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
              <img
                src={fileUrl}
                alt={`Pièce jointe ${i + 1}`}
                className="w-24 h-24 object-cover rounded-lg shadow-sm border border-gray-200 transition-all duration-300 group-hover:shadow-lg group-hover:border-blue-300 group-hover:scale-[1.02]"
              />
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Pièce {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal amélioré */}
      {open && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            open ? 'bg-black/90' : 'bg-black/0'
          }`}
          onClick={handleClose}
        >
          <div 
            className={`relative max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform ${
              open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête modal */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-5 h-5" />
                <span className="font-medium">Aperçu de la pièce jointe</span>
              </div>
              <div className="flex gap-2">
                <a
                  href={selectedImage}
                  download
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </a>
                <button
                  onClick={handleClose}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="pt-16 pb-4 px-4 h-full flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Aperçu"
                className="max-w-full max-h-[calc(90vh-80px)] object-contain rounded-lg"
              />
            </div>

            {/* Pied de modal */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-white p-3 text-center text-sm">
              <p>Cliquez en dehors de l{"'"}image ou sur la croix pour fermer</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PieceJointeViewer;