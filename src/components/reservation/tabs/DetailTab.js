import React from 'react';
import LoadingSpin from '@/components/LoadingSpin';
import Link from 'next/link';
import { isAdmin, isSuperAdmin, getModeFinanceLabel } from '@/configs/enum';
import { useAuth } from '@/context/AuthContext';
import { Edit } from 'lucide-react';
import Button from '@/components/Button'; // Import the component

export const DetailTab = ({ reservationData, sum_avances_valides }) => {
  const { user } = useAuth();

  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }
  // Add null checks and default values
  if (!reservationData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {' '}
        <LoadingSpin />
      </div>
    );
  }
  const handleDesiste = (res_id) => {
    //aucun desistement
    window.open(`/ventes/desistements/ajouter_desistement/${res_id}`)
  };
  const handleEdit = (reservationId) => {
    window.localStorage.setItem('step_res_edit', 0);
    const editUrl = `${window.location.origin}/ventes/reservations/?id=${reservationId}&action=edit`;

    // Ouvrez la nouvelle URL dans un nouvel onglet
    window.open(editUrl, '_blank');
  };

  const handleEdit_Prix = (reservationId) => {
    window.localStorage.setItem('step_res_edit', 2);

    const editUrl = `${window.location.origin}/ventes/reservations/?id=${reservationId}&action=edit`;

    // Ouvrez la nouvelle URL dans un nouvel onglet
    window.open(editUrl, '_blank');
  };
  // Destructure the nested reservation object
  const { reservation } = reservationData;
  return (
    <div className="space-y-6">
      <div className='flex justify-end space-x-4'>
        {reservation?.etat == 1 && reservation?.contrat_vente == null && (
          <div className="flex justify-end">
            <Button type="submit" onClick={() => handleEdit(reservation.id)}>
              Modifier
            </Button>
          </div>
        )}
        {reservation?.statut == 1 &&
          reservation?.etat == 1 &&
          reservation?.desistement_att_validation_rejete == null && (
            <div className="flex justify-end">
              <Button type="edit" onClick={() => handleDesiste(reservation.id)}>
                Désister
              </Button>
            </div>
          )}
      </div>
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
                  <p className="font-medium">
                    {reservation?.code_reservation || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Réservation</p>
                  <p className="font-medium">
                    {new Date(reservation.created_at).toLocaleDateString(
                      'fr-FR'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <p className="font-medium">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reservation.statut == 1
                          ? 'bg-green-100 text-green-800' // Validé
                          : reservation.statut == 2
                          ? 'bg-red-100 text-red-800' // Refusé
                          : reservation.statut == 3
                          ? 'bg-yellow-100 text-yellow-800' // En Attente
                          : reservation.statut == 4
                          ? 'bg-gray-100 text-gray-800' // Annulé
                          : 'bg-blue-100 text-blue-800' // Default case
                      }`}
                    >
                      {reservation.statut == 1 && 'Validé'}
                      {reservation.statut == 2 && 'Refusé'}
                      {reservation.statut == 3 && 'En Attente'}
                      {reservation.statut == 4 && 'Annulé'}
                    </span>
                  </p>
                </div>
                {reservation.statut == 1 && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Date Validation</p>
                      <p className="font-medium">
                        {reservation.last_statut != null &&
                          reservation.last_statut.statut == 1 &&
                          (reservation.last_statut.date_validation
                            ? new Date(
                                reservation.last_statut.date_validation
                              ).toLocaleDateString('fr-FR')
                            : '')}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Responsable Validation
                      </p>
                      <p className="font-medium">
                        {' '}
                        {isSuperAdmin(user.role) || isAdmin(user.role) ? (
                          <>
                            {reservation.user && (
                              <>
                                <Link
                                  target="_blank"
                                  href={
                                    '/Utilisateurs/afficher-utilisateur/' +
                                    reservation.user.id
                                  }
                                  style={{
                                    textDecoration: 'none',
                                  }}
                                >
                                  <strong>
                                    {reservation.user.name}{' '}
                                    {reservation.user.prenom}
                                  </strong>
                                </Link>
                                <br />
                              </>
                            )}
                          </>
                        ) : (
                          reservation.user.name + ' ' + reservation.user.prenom
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Property Information Section */}
          <div>
            <h3 className="text-md font-medium text-gray-500">Propriété</h3>
            <div className="mt-2 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bien</p>
                  <p className="font-medium">
                    <Link
                      target="_blank"
                      href={'/Biens/' + reservation?.bien_id}
                      style={{
                        textDecoration: 'none',
                      }}
                    >
                      {NomBienComplet(reservation.bien)}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Projet</p>
                  <p className="font-medium">{reservation?.projet?.nom}</p>
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
                  <p className="text-sm text-gray-500">Prix Unitaire</p>
                  <p className="font-medium">
                    {' '}
                    {reservation?.bien.prix_unitaire.toLocaleString() + ' DH'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prix Remisé</p>
                  <p className="font-medium">
                    {' '}
                    {reservation?.prix_remise.toLocaleString() + ' DH'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500"> Remise Forfaitaire </p>
                  <p className="font-medium">
                    {' '}
                    {reservation?.prix_forfetaire.toLocaleString() + ' DH'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prix</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-blue-500">
                      {reservation?.prix?.toLocaleString() + ' DH'}
                    </p>
                    {reservation?.etat == 1 &&
                      reservation?.contrat_vente == null && (
                        <button
                          onClick={() => handleEdit_Prix(reservation.id)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant Encaissé</p>
                  <p className="font-medium text-green-500">
                    {' '}
                    {sum_avances_valides.toLocaleString() + ' DH'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Montant Encaissé %</p>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 flex-1">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.round(
                            (sum_avances_valides / reservation?.prix) * 100
                          )}%`,
                          transition: 'width 0.3s ease-in-out',
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {`${Math.round(
                        (sum_avances_valides / reservation?.prix) * 100
                      )}%`}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reste</p>
                  <p className="font-medium text-red-500">
                    {' '}
                    {(
                      reservation?.prix - sum_avances_valides
                    ).toLocaleString() + ' DH'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Mode Paiement Reliquat
                  </p>
                  <p className="font-medium">
                    {getModeFinanceLabel(reservation?.mode_financement)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {reservation.commentaire != null && (
            <div>
              <h3 className="text-md font-medium text-gray-500">commentaire</h3>
              <div className="mt-2 bg-gray-50 rounded-lg p-4 h-36 overflow-y-auto">
                <p className="text-md text-gray-700">
                  {reservation.commentaire}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
