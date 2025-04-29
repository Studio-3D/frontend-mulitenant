'use client'
import React from 'react';
import { UserIcon, PhoneIcon, InfoIcon, AlertCircleIcon } from 'lucide-react';




export function ClientDetails() {
  return <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl text-white p-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-3 rounded-lg">
              <UserIcon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">p_fadwa n_fadwaaa</h2>
              <p className="text-blue-200">CIN: mc123456</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-6 w-6 text-blue-200" />
            <div>
              <p className="text-sm text-blue-200">Contact</p>
              <p className="font-medium">0641622329</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <InfoIcon className="h-6 w-6 text-blue-200" />
            <div>
              <p className="text-sm text-blue-200">Source</p>
              <p className="font-medium">Panneaux 4*3</p>
            </div>
          </div>
          <div className="flex items-center mt-2 bg-white/10 px-3 py-1.5 rounded-lg">
            <AlertCircleIcon className="h-4 w-4 text-red-300 mr-2" />
            <p className="text-sm">N'accepte pas d'être contacté</p>
          </div>
        </div>
      </div>
      <div className="flex space-x-4 mt-2">
        <button className="bg-white text-[#2563eb] px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
          Voir Prospect
        </button>
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-400 transition-colors">
          Modifier
        </button>
      </div>
    </div>;
}