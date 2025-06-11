import React from 'react';

export default function VisitesCard({ visites = [], sumVisites = 0 }) {
  const labels = [
    'Réceptif',
    'Pré Réservation',
    'Pré Réservation Perdu',
    'Pré Réservation Vendu',
    'Vente Direct',
    'Vente',
    'Vente Perdu',
    'Perdu'
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div className="text-lg font-semibold">Visites</div>
        <div className="text-xl font-bold !text-blue-600">{sumVisites}</div>
      </div>
      
      <div className="px-6 pt-4 pb-2">
        <div className="space-y-3">
          {labels.map((label, index) => (
            <div key={index} className="flex justify-between py-3 border-t">
              <div className="text-gray-600">{label}</div>
              <div className="font-semibold">{visites[index] || 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
