import React, { useEffect, useState, useRef } from 'react';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  isAfter,
  isBefore,
  parseISO,
  isEqual
} from 'date-fns';
import { CalendarIcon, ChevronDownIcon, XIcon, CheckIcon } from 'lucide-react';

export const DateFilter = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);
  const dropdownRef = useRef(null);
  const today = new Date();

  const presets = [
    {
      id: 'today',
      label: "Aujourd'hui",
      getRange: () => [startOfDay(today), endOfDay(today)],
    },
    {
      id: 'week',
      label: 'Cette semaine',
      getRange: () => [
        startOfWeek(today, { weekStartsOn: 1 }),
        endOfWeek(today, { weekStartsOn: 1 }),
      ],
    },
    {
      id: 'month',
      label: 'Ce mois',
      getRange: () => [startOfMonth(today), endOfMonth(today)],
    },
    {
      id: 'year',
      label: 'Cette année',
      getRange: () => [startOfYear(today), endOfYear(today)],
    },
    {
      id: 'last7days',
      label: '7 derniers jours',
      getRange: () => [subDays(today, 6), today],
    },
    {
      id: 'last30days',
      label: '30 derniers jours',
      getRange: () => [subDays(today, 29), today],
    },
  ];

  // Detect which preset matches the current date range
  useEffect(() => {
    // Check if current range matches any preset
    for (const preset of presets) {
      const [presetStart, presetEnd] = preset.getRange();
      if (
        isEqual(startDate, presetStart) && 
        isEqual(endDate, presetEnd)
      ) {
        setActivePreset(preset.id);
        return;
      }
    }
    
    // If no preset matches, it's a custom range
    setActivePreset('custom');
    setCustomStart(startDate);
    setCustomEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handlePresetClick = (preset) => {
    const [start, end] = preset.getRange();
    onChange(start, end);
    setIsOpen(false);
  };

  const handleCustomDateChange = () => {
    if (isAfter(customStart, customEnd)) {
      return; // Prevent invalid date ranges
    }
    onChange(customStart, customEnd);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (activePreset === 'custom') {
      return `${format(startDate, 'd MMM')} - ${format(endDate, 'd MMM yyyy')}`;
    }
    const preset = presets.find((p) => p.id === activePreset);
    return preset ? preset.label : 'Sélectionner une période';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <CalendarIcon size={16} className="mr-2 text-gray-500" />
        <span>{getDisplayText()}</span>
        <ChevronDownIcon size={16} className="ml-2 text-gray-500" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-20 animate-fadeIn">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-700">Période</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={16} />
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${activePreset === preset.id ? 'bg-blue-50 text-blue-500' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {preset.label}
                  {activePreset === preset.id && <CheckIcon size={16} />}
                </button>
              ))}
              <div
                className={`w-full px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${activePreset === 'custom' ? 'bg-blue-50 text-blue-500' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActivePreset('custom')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Période personnalisée</span>
                  {activePreset === 'custom' && <CheckIcon size={16} />}
                </div>
                <div className="flex space-x-2 mt-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Début
                    </label>
                    <input
                      type="date"
                      value={format(customStart, 'yyyy-MM-dd')}
                      onChange={(e) => setCustomStart(parseISO(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Fin
                    </label>
                    <input
                      type="date"
                      value={format(customEnd, 'yyyy-MM-dd')}
                      onChange={(e) => setCustomEnd(parseISO(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
            {activePreset === 'custom' && (
              <button
                onClick={handleCustomDateChange}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Appliquer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};