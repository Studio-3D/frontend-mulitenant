import React from 'react';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export function VisitTabs() {
  const visits = [
    {
      id: 'new',
      label: 'Nouvelle visite',
      isNew: true
    },
    {
      id: 'v10',
      label: 'V10',
      active: false
    },
    {
      id: 'v9',
      label: 'V9',
      active: false
    },
    {
      id: 'v8',
      label: 'V8',
      active: true
    },
    {
      id: 'v7',
      label: 'V7',
      active: false
    },
    {
      id: 'v6',
      label: 'V6',
      active: false
    }
  ];

  return (
    <div className="relative">
      <div className="flex items-center">
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 flex-grow">
          {visits.map(visit => (
            <div 
              key={visit.id} 
              className={`
                min-w-[120px] h-[100px] flex items-center justify-center rounded-lg border
                ${visit.isNew 
                  ? 'border-dashed border-blue-300 text-blue-500' 
                  : visit.active 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white border-gray-200 text-gray-700'
                }
              `}
            >
              {visit.isNew ? (
                <div className="flex flex-col items-center">
                  <PlusIcon className="h-5 w-5 mb-1" />
                  <span className="text-sm">{visit.label}</span>
                </div>
              ) : (
                <span className="text-xl font-bold">{visit.label}</span>
              )}
            </div>
          ))}
        </div>
        
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
      
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}