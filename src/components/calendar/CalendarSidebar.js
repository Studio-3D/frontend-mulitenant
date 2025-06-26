import React from 'react';
import { CircleIcon } from 'lucide-react';
import { SIDEBAR_FILTERS, FILTER_COLORS } from './calendar-constants';

export const CalendarSidebar = ({ onFilterChange, activeFilter }) => {
  return (
    <div className="w-full md:w-64 bg-white border-r p-4">
      <h2 className="text-lg font-medium mb-4">Filtres</h2>
      <div className="space-y-3">
        {SIDEBAR_FILTERS.map((item) => {
          const color = FILTER_COLORS[item.id];
          return (
            <div
              key={item.id}
              className={`flex items-center p-2 rounded-md ${
                activeFilter === item.id 
                  ? 'bg-gray-100' 
                  : 'hover:bg-gray-50'
              } cursor-pointer`}
              onClick={() => onFilterChange(item.id)}
            >
              <span className="mr-2">
                <CircleIcon 
                  size={16} 
                  style={{ 
                    color: color,
                    fill: color 
                  }} 
                />
              </span>
              <span className="font-medium">{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, text, active = false, onClick }) => {
  return (
    <div
      className={`flex items-center p-2 rounded-md ${
        active ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
      } cursor-pointer transition-colors`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      <span>{text}</span>
    </div>
  );
};