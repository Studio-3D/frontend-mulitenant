// Composant ReservationSteps à ajouter dans ReservationHeader
export default function ReservationSteps({
  reservation,
  hasCompromis,
  hasContrat,
}) {
  const { etat, statut, compromis_vente, contrat_vente } = reservation;
  // Utiliser hasCompromis pour forcer la mise à jour si fourni
  const effectiveCompromis =
    hasCompromis !== undefined ? hasCompromis : compromis_vente;
  const effectiveContrat =
    hasContrat !== undefined ? hasContrat : contrat_vente;
console.log('le compromis==>'+compromis_vente)
  // Déterminer les couleurs pour chaque étape
  const getStepColor = (step) => {
    // Si l'étape est inférieure à l'étape actuelle, elle doit être verte
    const currentStep = getCurrentStep();

    if (step < currentStep) {
      return 'bg-green-500'; // Étape précédente - Vert
    }

    if (step == currentStep) {
      // Pour l'étape actuelle, on détermine la couleur selon le statut

      if (step == 2) {
        if (statut == 2) return 'bg-red-500'; // Rejeté - Rouge
        if (etat > 1) return 'bg-purple-500'; // Désisté - Violet
        return 'bg-green-500'; // Réservé - Vert
      }
      if (step == 3 || step == 4) {
        return 'bg-green-500'; // Étape 3 et 4 vertes si actives
      }
    }

    return 'bg-gray-300'; // Étape future - Gris
  };

  // Déterminer l'étape actuelle
  const getCurrentStep = () => {
    // Étape 4: Contrat de vente signé
    if (etat == 1 && statut == 1 && effectiveCompromis && effectiveContrat) {
      return 4;
    }

    // Étape 3: Attestation de vente signée
    if (etat == 1 && statut == 1 && effectiveCompromis && !effectiveContrat) {
      return 3;
    }

    // Étape 2: Réservé/Rejeté/Désisté
    if ((etat == 1 && (statut == 1 || statut == 2)) || etat > 1) {
      return 2;
    }

    // Étape 1: En attente
    if (etat == 1 && statut == 3 && !effectiveCompromis && !effectiveContrat) {
      return 1;
    }

    return 1; // Par défaut, étape 1
  };

  // Déterminer la couleur des lignes de connexion
  const getLineColor = (step) => {
    const currentStep = getCurrentStep();
    // La ligne entre l'étape N et N+1 est verte si l'étape N+1 est atteinte ou dépassée

    return step <= currentStep ? 'bg-green-500' : 'bg-gray-300';
  };

  // Masquer les étapes 3 et 4 si désisté ou rejeté
  const shouldShowSteps3And4 = etat == 1 && statut == 1;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        {/* Étape 1 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full ${getStepColor(
              1
            )} flex items-center justify-center text-white text-sm`}
          >
            1
          </div>
          <span className="text-xs mt-1 text-center">En attente</span>
        </div>

        {/* Ligne de connexion 1-2 */}
        <div className={`flex-1 h-1 ${getLineColor(2)} mx-2`}></div>

        {/* Étape 2 */}
        <div className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full ${getStepColor(
              2
            )} flex items-center justify-center text-white text-sm`}
          >
            2
          </div>
          <span className="text-xs mt-1 text-center">
            {etat > 1 ? 'Désisté' : statut == 2 ? 'Rejeté' : 'Réservé'}
          </span>
        </div>

        {/* Ligne de connexion conditionnelle 2-3 */}
        {shouldShowSteps3And4 && (
          <>
            <div className={`flex-1 h-1 ${getLineColor(3)} mx-2`}></div>

            {/* Étape 3 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full ${getStepColor(
                  3
                )} flex items-center justify-center text-white text-sm`}
              >
                3
              </div>
              <span className="text-xs mt-1 text-center">
                Attestation de vente
              </span>
            </div>

            {/* Ligne de connexion conditionnelle 3-4 */}
            <div className={`flex-1 h-1 ${getLineColor(4)} mx-2`}></div>

            {/* Étape 4 */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full ${getStepColor(
                  4
                )} flex items-center justify-center text-white text-sm`}
              >
                4
              </div>
              <span className="text-xs mt-1 text-center">Contrat de vente</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
