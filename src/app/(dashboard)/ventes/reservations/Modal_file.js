'use client';
import { AlertCircle } from 'lucide-react';

export default function Modal_File({ onConfirm, onClose }) {
  // Delete user handler

  return (
    <div className="w-[500px] p-4">
      <AlertCircle className="text-[#FF4E4E] text-6xl mx-auto mt-2 mb-4" />
      <h2 className="text-xl font-semibold text-center">
        Confirmation des Fichiers
      </h2>
      <p className="text-center text-[#878484] mt-2">
        {'Fichier déja exist voulez vous le remplacer?'}
      </p>
      <div className="flex justify-center gap-4 mt-4 mb-4">
        <button
          className="font-medium px-4 py-2 rounded-lg bg-gray-200"
          onClick={onClose}
        >
          Non
        </button>
        <button
          className={`font-medium px-4 py-2 rounded-lg bg-[#FF4E4E] text-text`}
          onClick={onConfirm}
        >
          Oui
        </button>
      </div>
    </div>
  );
}
