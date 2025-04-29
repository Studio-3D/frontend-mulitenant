import React from 'react';
import { PlusIcon } from 'lucide-react';

export function VisitTimeline(props) {
  const { activeVisit, onVisitSelect } = props;

  const visits = [
    {
      id: 'new',
      label: 'Nouvelle visite',
      isNew: true
    },
    {
      id: 'v10',
      label: 'V10'
    },
    {
      id: 'v9',
      label: 'V9'
    },
    {
      id: 'v8',
      label: 'V8'
    },
    {
      id: 'v7',
      label: 'V7'
    },
    {
      id: 'v6',
      label: 'V6'
    }
  ];

  return (
    <div className="relative">
      {/* Line connector */}
      <div className="absolute left-8 top-[60px] bottom-8 w-0.5 bg-gradient-to-b from-blue-200 to-transparent" />
      
      {/* Visits */}
      <div className="space-y-6">
        {visits.map(visit => (
          <button 
            key={visit.id} 
            onClick={() => !visit.isNew && onVisitSelect(visit.id)} 
            className="w-full group"
          >
            <div className="relative flex items-center">
              {/* Timeline dot */}
              {visit.isNew ? (
                <div className="relative z-10 w-16 h-16 rounded-2xl border-2 border-dashed border-blue-300 bg-white flex items-center justify-center group-hover:border-blue-400 transition-all duration-300 group-hover:scale-105">
                  <PlusIcon className="h-8 w-8 text-blue-400" />
                </div>
              ) : (
                <div className={`
                  relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center
                  transition-all duration-300 group-hover:scale-105
                  ${visit.id === activeVisit 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white/80 backdrop-blur-sm border border-white/20 text-gray-600 group-hover:bg-white'
                  }
                `}>
                  <span className="text-2xl font-bold">
                    {visit.label.replace('V', '')}
                  </span>
                </div>
              )}
              
              {/* Visit info */}
              <div className="ml-6">
                <span className={`
                  font-medium transition-colors duration-300
                  ${visit.id === activeVisit ? 'text-[#2563eb]' : 'text-gray-600'}
                `}>
                  {visit.label}
                </span>
                {!visit.isNew && <p className="text-sm text-gray-500 mt-0.5">15/03/2025</p>}
              </div>
              
              {/* Active indicator */}
              {visit.id === activeVisit && (
                <div className="absolute -inset-x-4 -inset-y-3 border-2 border-blue-100 rounded-2xl bg-blue-50/30" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}