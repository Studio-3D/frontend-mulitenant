'use client';

import { useEffect } from 'react';

// Ajoutez une prop maxWidth avec une valeur par défaut
export default function Modal({ children, isVisible, onClose, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.documentElement.style.height = '100%';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.height = '';
      document.documentElement.style.height = '';
    };
  }, [isVisible]);
  
  if (!isVisible) return null;

  const handleClose = (e) => {
    if (e.target.id === 'wrapper') {
      onClose();
    }
  };
    {/*// Pour différents besoins :
    <Modal maxWidth="max-w-lg">...</Modal>      // largeur moyenne
    <Modal maxWidth="max-w-xl">...</Modal>      // plus large
    <Modal maxWidth="max-w-2xl">...</Modal>     // encore plus large
    <Modal maxWidth="max-w-3xl">...</Modal>     // très large
    <Modal maxWidth="max-w-4xl">...</Modal>     // extra large
    <Modal maxWidth="max-w-5xl">...</Modal>     // maximum large
    <Modal maxWidth="max-w-6xl">...</Modal>     // ultra large
    <Modal maxWidth="max-w-7xl">...</Modal>     // super large
    <Modal maxWidth="max-w-full">...</Modal>    // pleine largeur*/}
  return (
    <div
      id="wrapper"
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm z-50 overflow-y-auto"
      style={{ margin: 0, padding: 0 }}
      onClick={handleClose}
    >
      <div className="min-h-full flex items-center justify-center p-4">
        {/* Utilisez la prop maxWidth dans la classe */}
        <div className={`bg-white rounded-lg shadow-lg w-full ${maxWidth}`}>
          {children}
        </div>
      </div>
    </div>
  );
}