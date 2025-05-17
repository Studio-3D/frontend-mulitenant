import React from 'react';
import { Calendar } from 'lucide-react';

export default function MeetingCard({ meetings = [] }) {
  // Array of colors for the chips
  const colors = [
    'bg-green-100 text-green-800',
    'bg-red-100 text-red-800',
    'bg-yellow-100 text-yellow-800',
    'bg-blue-100 text-blue-800',
    'bg-indigo-100 text-indigo-800',
    'bg-purple-100 text-purple-800'
  ];
  
  // Array of avatar images
  const avatars = [
    '/images/avatars/7.png', 
    '/images/avatars/8.png', 
    '/images/avatars/2.png', 
    '/images/avatars/3.png', 
    '/images/avatars/5.png', 
    '/images/avatars/4.png'
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="px-6 py-4 border-b">
        <div className="text-lg font-semibold">Calendrier des Réunions</div>
      </div>
      
      <div className="px-6 py-4">
        <div className="space-y-6">
          {meetings.map((item, index) => (
            <div key={index} className="flex items-start">
              <div className="mr-3 flex-shrink-0">
                <img 
                  src={avatars[index % avatars.length]} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-md"
                />
              </div>
              
              <div className="flex-1">
                <div className="font-medium mb-1">
                  {item.visite.prospect.nom} {item.visite.prospect.prenom}
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{item.date_relance || item.rdv}</span>
                </div>
              </div>
              
              <div className={`${colors[index % colors.length]} text-xs px-2 py-1 rounded-full`}>
                {item.date_relance ? 'Relance' : 'RDV'}
              </div>
            </div>
          ))}
          
          {meetings.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Aucune réunion prévue
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
