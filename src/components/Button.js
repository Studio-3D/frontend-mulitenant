import React from 'react';

const Button = ({ type, onClick, disabled, loading, children, className }) => {
  const baseStyle =
    'text-white font-medium rounded-lg px-6 py-2 flex items-center justify-center transition-all';

  const disabledStyle = disabled || loading ? 'cursor-not-allowed' : '';

  const buttonStyle = type === 'submit'
  ? `${loading || disabled ? 'bg-green-500' : 'bg-[#2D8548]'} ${baseStyle} ${disabledStyle}`
  : type === 'edit'
  ? `bg-[#0002dc80] ${baseStyle}`  // Color for edit button (you can adjust the color as needed)
  : `bg-gray-400 ${baseStyle}`; // Default color for other types (non-submit/edit)
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${buttonStyle} ${className}`}
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
