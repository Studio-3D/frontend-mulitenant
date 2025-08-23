'use client';

import { useState, useRef, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';

export default function DateRangePicker({
  label,
  startName,
  endName,
  startValue,
  endValue,
  placeholder = 'Select date range',
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
        <label className="font-medium !text-gray-700">
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
                ? 'cursor-default bg-gray-50 border-[#b7daf6]'
                : 'border-gray-300 hover:border-gray-500 focus:border-gray-500'
            }
            ${
              combinedError
                ? 'border-red-500 focus:border-red-500 hover:border-red-500'
                : ''
            }
          `}
        >
          {displayValue}
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 bg-white p-4 rounded-md shadow-lg border border-gray-200 w-full max-w-md">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={startValue || ''}
                  onChange={handleStartDateChange}
                  className="h-[38px] text-[15px] px-3 py-2 outline-none border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={endValue || ''}
                  onChange={handleEndDateChange}
                  className="h-[38px] text-[15px] px-3 py-2 outline-none border border-gray-300 rounded-md w-full"
                />
              </div>
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