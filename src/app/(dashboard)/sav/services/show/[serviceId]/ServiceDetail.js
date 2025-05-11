'use client';

import React from 'react';
import {
 
  InfoIcon,
 
} from 'lucide-react';
import { ENDPOINTS } from '@/configs/api';
import { useRouter } from 'next/navigation';


const ServiceDetail = ({ Details }) => {

  const router = useRouter();
  

  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl text-white p-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
            
          <div className="flex items-center space-x-3">
            <InfoIcon className="h-6 w-6 text-[whitesmoke]" />
            <div>
              <>
                <p className="text-sm text-[whitesmoke]">Service:</p>
                <p className="font-medium">{Details?.nom}</p>
              </>
                
            </div>
          </div>          
        </div>

        <div className="flex justify-end mt-6">
          <div className="flex space-x-4">
            <button
              className="bg-white text-[#2563eb] px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => router.back()}            
            >
              Retour
            </button>
            <button
              className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg hover:bg-[#1e3a8a] transition-colors"
                onClick={() => { router.push(`${ENDPOINTS.ServicesPrestataires}?id=${Details?.id}&action=edit`);
              }}
        
            >
              Modifier
            </button>
          </div>
        </div>
      </div>

      
    </>
  );
}

export default ServiceDetail;

