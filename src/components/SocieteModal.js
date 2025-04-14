"use client";
import { useState } from 'react';
import { useSociete } from '../context/SocieteContext';
import SocieteSelector from './SocieteSelector';

export default function SocieteModal({ isOpen, onClose, returnPath }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sélection de société</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        <SocieteSelector 
          onSelect={() => onClose()} 
          returnPath={returnPath}
        />
      </div>
    </div>
  );
}
