import React, { useState, useRef } from 'react';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export function VisitSlider(props) {
  const { activeVisit, onVisitSelect } = props;
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      sliderRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      
      <div className="flex items-center">
        <button 
          onClick={() => scroll('left')} 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
        >
          <ChevronLeftIcon className="h-6 w-6 !text-gray-500" />
        </button>
        
        <div 
          ref={sliderRef} 
          className="flex-1 overflow-x-auto hide-scrollbar py-4" 
          onMouseDown={handleMouseDown} 
          onMouseUp={handleMouseUp} 
          onMouseLeave={handleMouseUp} 
          onMouseMove={handleMouseMove} 
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="flex space-x-4 px-4">
            {visits.map(visit => (
              <button 
                key={visit.id} 
                onClick={() => !visit.isNew && onVisitSelect(visit.id)} 
                className="flex-shrink-0"
              >
                {visit.isNew ? (
                  <div className="flex flex-col items-center group">
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center bg-white group-hover:border-blue-400 transition-all duration-300 group-hover:scale-105">
                      <PlusIcon className="h-8 w-8 !text-blue-400" />
                    </div>
                    <span className="text-sm !text-blue-500 font-medium mt-2">
                      {visit.label}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center
                      transition-all duration-300 hover:scale-105
                      ${visit.id === activeVisit ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 !text-gray-600 hover:bg-gray-200'}
                    `}>
                      <span className="text-2xl font-bold">
                        {visit.label.replace('V', '')}
                      </span>
                    </div>
                    <span className={`
                      text-sm font-medium mt-2
                      ${visit.id === activeVisit ? 'text-blue-600' : 'text-gray-500'}
                    `}>
                      {visit.label}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => scroll('right')} 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors z-20"
        >
          <ChevronRightIcon className="h-6 w-6 !text-gray-500" />
        </button>
      </div>
    </div>
  );
}