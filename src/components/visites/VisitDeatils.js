'use client';

import React, { useState } from 'react';
import { VisitCard } from './VisitCard';
import { VisitTimeline } from './VisitTimeline';
import { CalendarIcon, UserIcon, TagIcon, AlertCircleIcon, MessageSquareIcon } from 'lucide-react';

export function VisitDetails() {
  const [activeVisit, setActiveVisit] = useState('v8');
  
  return (
    <div className="relative">
      {/* Glass-morphism background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-100/50 -top-250 -right-250 blur-3xl" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-100/50 -bottom-250 -left-250 blur-3xl" />
      </div>
      
      {/* Main content */}
      <div className="relative backdrop-blur-sm">
        {/* Header */}
        <div className="flex justify-between items-center pl-8 pr-8 pt-2 pb-2 border-b border-white/20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Détail Visite
          </h2>
          <div className="flex space-x-3">
            <button className="px-6 py-2.5 rounded-xl bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-white/20 text-[#2563eb] font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
              Historique Relance/RDV
            </button>
            <button className="px-6 py-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-900/90 backdrop-blur-sm text-white font-medium transition-all duration-300 hover:shadow-lg">
              Historique
            </button>
          </div>
        </div>
        
        {/* Split layout */}
        <div className="grid lg:grid-cols-12 gap-8 p-8">
          {/* Timeline section */}
          <div className="lg:col-span-4 space-y-6">
            <VisitTimeline activeVisit={activeVisit} onVisitSelect={setActiveVisit} />
          </div>
          
          {/* Details section */}
          <div className="lg:col-span-8">
            <VisitCard activeVisit={activeVisit}>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100">
                        {activeVisit.replace('v', '')}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          VISITE {activeVisit.toUpperCase()}
                        </h3>
                        <p className="text-gray-500">15/03/2025</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="p-2 rounded-xl hover:bg-blue-50 text-[#2563eb] transition-colors">
                        Modifier
                      </button>
                      <button className="p-2 rounded-xl hover:bg-red-50 text-[#dc2626] transition-colors">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
                
                <InfoCard icon={<UserIcon className="h-5 w-5" />} title="CC" value="ADMIN_P3" />
                <InfoCard icon={<AlertCircleIcon className="h-5 w-5" />} title="Freins" value="FINANCEMENT" />
                
                <div className="col-span-2">
                  <InfoCard 
                    icon={<MessageSquareIcon className="h-5 w-5" />} 
                    title="Commentaire" 
                    value="Demande de simulation bancaire" 
                  />
                </div>
                
                <InfoCard 
                  icon={<TagIcon className="h-5 w-5" />} 
                  title="Intérêt" 
                  value={
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Très intéressé
                    </span>
                  } 
                />
              </div>
            </VisitCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard(props) {
  const { icon, title, value } = props;
  
  return (
    <div className="group bg-white/60 cursor-pointer hover:border hover:border-blue-300 backdrop-blur-sm rounded-2xl p-6 border  transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-[#2563eb] group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h4 className="font-medium text-gray-600">{title}</h4>
      </div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
}