import React from 'react';

export const DetailTab = ({ reservationData }) => {
  // Add null checks and default values
  if (!reservationData) {
    return <div className="bg-white rounded-lg shadow-md p-6">Loading reservation data...</div>;
  }

  // Destructure the nested reservation object
  const { reservation } = reservationData;
  const lastUpdated = reservation?.updated_at 
    ? new Date(reservation.updated_at).toLocaleDateString('fr-FR') 
    : 'N/A';


  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Détail de la réservation
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* General Information Section */}
          <div>
            <h3 className="text-md font-medium text-gray-500">
              Informations générales
            </h3>
            <div className="mt-2 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Code</p>
                  <p className="font-medium">{reservation?.code_reservation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{lastUpdated}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className="font-medium">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Actif
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Agent</p>
                  <p className="font-medium">Marie Dupont</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Information Section */}
          <div>
            <h3 className="text-md font-medium text-gray-500">Propriété</h3>
            <div className="mt-2 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">Appartement</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Surface</p>
                  <p className="font-medium">85 m²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pièces</p>
                  <p className="font-medium">3</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Étage</p>
                  <p className="font-medium">2ème</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Financial Information Section */}
          <div>
            <h3 className="text-md font-medium text-gray-500">
              Informations financières
            </h3>
            <div className="mt-2 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Prix de vente</p>
                  <p className="font-medium">320 000 €</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dépôt de garantie</p>
                  <p className="font-medium">32 000 €</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avances versées</p>
                  <p className="font-medium">16 000 €</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reste à payer</p>
                  <p className="font-medium">304 000 €</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <h3 className="text-md font-medium text-gray-500">Notes</h3>
            <div className="mt-2 bg-gray-50 rounded-lg p-4 h-36 overflow-y-auto">
              <p className="text-md text-gray-700">
                Le client souhaite finaliser l'achat avant la fin du mois.
                Prévoir une visite supplémentaire pour vérifier les travaux
                effectués. Contact préféré par email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};