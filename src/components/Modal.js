'use client';
import { IoMdClose } from 'react-icons/io';

export default function Modal({ children, isVisible, onClose }) {
  if (!isVisible) return null; // Return null if modal is not visible

  const handleClose = (e) => {
    if (e.target.id === 'wrapper') {
      onClose(); // Close modal when clicking outside of it
    }
  };

  return (
    <div
      id="wrapper"
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div className=" flex flex-col">
        <div className="bg-white  rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          {children} {/* Content passed to the modal */}
        </div>
      </div>
    </div>
  );
}
