
import React from 'react';

const Button = ({ type = 'button', onClick, disabled, loading, children, className = '' }) => {
  const baseStyle = `text-white font-medium rounded-lg px-6 py-2 flex items-center justify-center transition-all duration-200`;

  const isDisabled = disabled || loading;

  let buttonStyle = '';

  switch (type) {
    case 'submit':
      buttonStyle = isDisabled
        ? 'bg-green-500'
        : 'bg-[#2D8548] hover:bg-green-600';
      break;
    case 'valider': // New type for validation
      buttonStyle = 'bg-green-500 hover:bg-green-600';
      break;
    case 'rejeter': // New type for rejection
      buttonStyle = 'bg-red-500 hover:bg-red-600';
      break;
    case 'desister': // New type for desistement (orange)
      buttonStyle = 'bg-gray-500 hover:bg-gray-600';
      break;
    case 'edit':
      buttonStyle = 'bg-orange-500 hover:bg-orange-600';
      break;
    case 'traite_relance':
      buttonStyle = 'bg-[#3b82f6] hover:bg-[#2563eb]';
      break;
    case 'traite_rdv':
      buttonStyle = 'bg-[rgb(61,158,206)] hover:bg-[rgb(50,140,185)]';
      break;
    case 'delete':
      buttonStyle = 'bg-red-500 hover:bg-red-600';
      break;
    default: // for "annuler" or unknown types
      buttonStyle = 'bg-gray-400 hover:bg-gray-500 text-white';
      break;
  }

  if (isDisabled) {
    buttonStyle += ' opacity-70 cursor-not-allowed';
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyle} ${buttonStyle} ${className}`}
    >
      {loading ? (
        <svg
          role="status"
          className="w-5 h-5 text-white animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 101"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset="75"
            className="animate-dash"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;