
'use client';

import { useState, useRef, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';

export default function DateRangePicker({
  label,
  startName,
  endName,
  startValue,
  endValue,
  placeholder = 'Selectionne les dates ',
  onChange,
  error,
  backendErrors,
  readOnly,
  disabled,
  required,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const combinedError = error || backendErrors;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    onChange?.(startName, value);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    onChange?.(endName, value);
  };

  const displayValue = startValue && endValue
    ? `${formatDate(startValue)} - ${formatDate(endValue)}`
    : placeholder;

  return (
    <div className="flex flex-col w-full" ref={containerRef}>
      {label && (
        <label className="font-medium !text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !readOnly && !disabled && setIsOpen(!isOpen)}
          disabled={readOnly || disabled}
          className={`h-[38px] text-[15px] px-4 py-2 outline-none border rounded-md w-full text-left
            ${
              readOnly || disabled
                ? 'cursor-default bg-gray-50 border-[#b7daf6] text-gray-500'
                : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 cursor-pointer bg-white'
            }
            ${
              combinedError
                ? 'border-red-500 focus:border-red-500 hover:border-red-500'
                : ''
            }
            ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}
          `}
        >
          <span className={!startValue && !endValue ? 'text-gray-400' : ''}>
            {displayValue}
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 bg-white p-4 rounded-md shadow-lg border border-gray-200 w-full min-w-[280px] sm:max-w-md">
            {/* Responsive layout - stacks vertically on small screens */}
            <div className="flex flex-col xs:flex-row gap-3">
              <div className="w-full xs:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">de</label>
                <input
                  type="date"
                  value={startValue || ''}
                  onChange={handleStartDateChange}
                  max={endValue || undefined}
                  className="h-[38px] text-[15px] px-3 py-2 outline-none border border-gray-300 rounded-md w-full hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="w-full xs:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">a</label>
                <input
                  type="date"
                  value={endValue || ''}
                  onChange={handleEndDateChange}
                  min={startValue || undefined}
                  className="h-[38px] text-[15px] px-3 py-2 outline-none border border-gray-300 rounded-md w-full hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onChange?.(startName, '');
                  onChange?.(endName, '');
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                Vider
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>
      {combinedError && (
        <p className="text-red-500 text-sm mt-1">{combinedError}</p>
      )}
    </div>
  );
}