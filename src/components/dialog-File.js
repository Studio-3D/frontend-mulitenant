'use client';

import React from 'react';
import { X } from 'lucide-react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, confirmText = 'Oui', cancelText = 'Non' }) {
  if (!open) return null;

  const handleWrapperClick = (e) => {
    if (e.target.id === 'wrapper') {
      onClose();
    }
  };

  return (
    <div
      id="wrapper"
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleWrapperClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        {/* Titre */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>

        {/* Boutons de confirmation */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-100"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
