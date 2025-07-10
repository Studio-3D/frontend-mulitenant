import React from 'react';
import { ClipboardList, Ticket, UserIcon } from 'lucide-react';
import Link from 'next/link';

export function SideBar({
  code_reservation,
  bien,
  prix,
  sum_avances_valides,
  date_reservation,
  respo,
  desisteurs,
  reservationId,
  bien_id,
}) {
  const handleView_dossier = (resId) => {
    window.open(`/ventes/reservations/${resId}`, '_blank');
  };
  // Format desisteurs as an object with client details
  const renderDesisteurs = () => {
    if (!desisteurs || typeof desisteurs !== 'object') {
      return <div className="font-medium">Aucun client</div>;
    }

    return (
      <div className="space-y-2">
        {Object.keys(desisteurs).map((key) => (
          <div key={key} className="text-sm">
            <span className="font-semibold">
              Client {parseFloat(key) + 1}:{' '}
            </span>
            {desisteurs[key]?.client?.nom} {desisteurs[key]?.client?.prenom}{' '}
            {desisteurs[key]?.pourcentage}%
          </div>
        ))}
      </div>
    );
  };
  // Format price values
  const formatPrice = (value) => {
    if (typeof value == 'number') {
      return `${value.toLocaleString()} DH`;
    }
    return value || '0 DH';
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch {
      return 'N/A';
    }
  };
   function NomBienComplet(bien) {
    const noms = [];
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div className="col-span-3 grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm !text-gray-500">Code Réservation:</div>
              <div className="font-medium">
                {' '}
                <Link
                  href={'/ventes/reservations/' + reservationId}
                  target="_blank"
                >
                  <strong style={{ fontWeight: 600 }}>
                    {code_reservation}
                  </strong>
                </Link>
              </div>
            </div>
            <div>
              <div className="text-sm !text-gray-500">Bien:</div>
              <div className="font-medium">
                {' '}
                <Link href={'/Biens/' + bien_id} target="_blank">
                  <strong style={{ fontWeight: 600 }}>{NomBienComplet(bien)}</strong>
                </Link>
              </div>
            </div>
            <div>
              <div className="text-sm !text-gray-500">Prix:</div>
              <div className="font-medium text-indigo-600">
                {formatPrice(prix)}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm !text-gray-500">Avances:</div>
              <div className="font-medium !text-green-600">
                {formatPrice(sum_avances_valides)}
              </div>
            </div>
            <div>
              <div className="text-sm !text-gray-500">Date Réservation:</div>
              <div className="font-medium">{formatDate(date_reservation)}</div>
            </div>
            <div>
              <div className="text-sm !text-gray-500">Responsable:</div>
              <div className="font-medium">{respo}</div>
            </div>
          </div>
          <div>
            <div className="text-sm !text-gray-500">Client(s):</div>
            <div className="font-medium"> {renderDesisteurs()}</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center border-l pl-4">
          <div className="bg-gray-100 rounded-full p-4 mb-3">
            <ClipboardList size={32} className="text-gray-600" />
          </div>
          <button
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
            onClick={() => handleView_dossier(reservationId)}
          >
            Voir Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
