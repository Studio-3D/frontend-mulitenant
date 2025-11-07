// components/VenteTabContent.jsx
'use client'
import React from 'react';
import ReservationsTable from '../../app/(dashboard)/ventes/reservations/ReservationTable';
import ClientsTable from '../../app/(dashboard)/ventes/clients/ClientTable';
import Desistement from '../../app/(dashboard)/ventes/desistements/page';
import Penalites from '../../app/(dashboard)/ventes/desistements/penalites/page';
import Echeances from '../../app/(dashboard)/ventes/echeances/page'

// rembourssement import 
import ApresVentes from '../../app/(dashboard)/ventes/remboursements/apres_ventes/page'
import AttAccuseCheque from '../../app/(dashboard)/ventes/remboursements/att_accuse_cheque/page'
import AttDecaissement from '../../app/(dashboard)/ventes/remboursements/att_decaissement/page'
import Accuses from '../../app/(dashboard)/ventes/remboursements/accuses/page'
import DossiersTransferes from '../../app/(dashboard)/ventes/remboursements/dossiers_transferes/page'
import AccusesChequeTraite from '../../app/(dashboard)/ventes/remboursements/accuses_cheque_traite/page'

// Validation subtabs
import DesistementsValidation from '../../app/(dashboard)/ventes/desistements/attente_encours/page'
import PenalitesValidation from '../../app/(dashboard)/ventes/desistements/penalites/attente_encours/page'
import ReservationsValidation from '../../app/(dashboard)/ventes/validations/reservations/page'
import AvancesValidation from '../../app/(dashboard)/ventes/validations/avances/page'
// Rejet subtabs
import DesistementsRejet from '../../app/(dashboard)/ventes/desistements/rejets/page'
import PenalitesRejet from '../../app/(dashboard)/ventes/desistements/penalites/rejets/page'
import ReservationsRejet from '../../app/(dashboard)/ventes/rejets/reservations/page'
import AvancesRejet from '../../app/(dashboard)/ventes/rejets/avances/page'


export function VenteTabContent({ id }) {
  const tabComponents = {
    // Simple tabs
    'reservations': <ReservationsTable />,
    'clients': <ClientsTable />,
    'desistements': <Desistement />,
    'penalites': <Penalites />,
    'echeances': <Echeances />,

    // Validation subtabs
    'desistements-attente-encours': <DesistementsValidation />,
    'penalites-validation': <PenalitesValidation />,
    'reservations-validation': <ReservationsValidation />,
    'avances-validation': <AvancesValidation />,

    // Rejet subtabs
    'desistements-rejet': <DesistementsRejet />,
    'penalites-rejet': <PenalitesRejet />,
    'reservations-rejet': <ReservationsRejet />,
    'avances-rejet': <AvancesRejet />,

    // // Remboursements subtabs
    'apres-ventes': <ApresVentes />,
    'att-accuse-cheque': <AttAccuseCheque />,
    'att-decaissement': <AttDecaissement />,
    'accuses': <Accuses />,
    'dossiers-transferes': <DossiersTransferes />,
    'accuses-cheque-traite':<AccusesChequeTraite/>
  };

  return tabComponents[id] || <div>Tab {id} not found</div>;
}