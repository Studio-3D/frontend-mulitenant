'use client';

import { format, parseISO } from 'date-fns';

import {
  getInteret_label,
  getOrientationLabel,
  getFullOrientation,
} from '../../../../../../src/configs/enum';
import {
  PhoneCallIcon,
  UserIcon,
  BuildingIcon,
  CalendarIcon,
  CompassIcon,
  ClockIcon,
  MessageSquareIcon,
  XIcon,
} from 'lucide-react';
export default function Modal_Show({
  onClose,
  date,
  type_appel,
  responsable,
  interet,
  tranche,
  bloc,
  immeuble,
  type_biens,
  etage,
  orientation,
  rdv,
  mode_relance,
  date_relance,
  frein_tranches,
  frein_etages,
  frein_orientations,
  frein_typologies,
  frein_vues,
  frein_prix_min,
  frein_prix_max,
  frein_superficie_min,
  frein_superficie_max,
  frein_avance,
  commentaire,
  commentaire_rel,
  commentaire_rdv
}) {
  const freins = [
    frein_tranches.length > 0 && 'TRANCHE',
    frein_etages.length > 0 && 'ETAGE',
    frein_orientations.length > 0 && 'ORIENTATION',
    frein_typologies.length > 0 && 'TYPOLOGIE',
    frein_vues.length > 0 && 'VUE',
    (frein_prix_min != null || frein_prix_max != null) && 'PRIX',
    (frein_superficie_min != null || frein_superficie_max != null) &&
      'SUPERFICIE',
    frein_avance && 'AVANCE',
  ]
    .filter(Boolean)
    .join(', ')
    .toLowerCase();
  const dateObj = new Date(date);

  // Format date: DD/MM/YYYY
  const formattedDate = dateObj.toLocaleDateString('fr-FR'); // or use manual formatting

  // Format time: HH:mm
  const formattedTime = dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="w-full max-w-[90%] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[800px] h-auto bg-white flex flex-col mx-auto">
      <div className="bg-[rgb(0,159,255)] text-white p-6 ">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PhoneCallIcon className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Détails de {"l'Appel"}</h1>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-blue-500 p-2 rounded-full transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{formattedTime}</div>
          <div className="text-blue-100">{formattedDate}</div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard
            icon={<PhoneCallIcon className="h-5 w-5 text-blue-500" />}
            label="Type Appel"
            value={type_appel}
          />
          <InfoCard
            icon={<UserIcon className="h-5 w-5 text-blue-500" />}
            label="Responsable"
            value={responsable}
          />
          <InfoCard
            icon={<MessageSquareIcon className="h-5 w-5 text-blue-500" />}
            label="L'Intérêt"
            value={getInteret_label(interet)}
          />
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Informations
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {interet == 1 && (
              <>
                {tranche != null && (
                  <div>
                    <span className="text-gray-500">Tranche:</span>
                    <span className="ml-2 font-medium">{tranche}</span>
                  </div>
                )}

                {bloc != null && (
                  <div>
                    <span className="text-gray-500">Bloc:</span>
                    <span className="ml-2 font-medium">{bloc}</span>
                  </div>
                )}
                {immeuble != null && (
                  <div>
                    <span className="text-gray-500">Immeuble:</span>
                    <span className="ml-2 font-medium">{immeuble}</span>
                  </div>
                )}

                {type_biens.length > 0 && (
                  <div>
                    <span className="text-gray-500">Types de Biens:</span>
                    <span className="ml-2 font-medium">
                      {type_biens?.map((t, i) => (
                        <b key={t.id}>
                          {t.type_bien.type}{' '}
                          {i + 1 == type_biens.length ? '' : ','}
                        </b>
                      ))}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-gray-500">Etage:</span>
                  <span className="ml-2 font-medium">{etage}</span>
                </div>
                <div>
                  <span className="text-gray-500">Orientation:</span>
                  <span className="ml-2 font-medium">
                    {getOrientationLabel(orientation)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Rendez Vous:</span>
                  <span className="ml-2 font-medium">
                    {rdv
                      ? format(new Date(rdv), 'dd/MM/yyyy HH:mm') // Corrected format for time
                      : ''}
                  </span>
                </div>
              </>
            )}
            {(interet == 2 || interet == 1) && (
              <>
                <div>
                  <span className="text-gray-500">Mode Relance:</span>
                  <span className="ml-2 font-medium">{mode_relance}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date Relance:</span>
                  <span className="ml-2 font-medium">
                    {date_relance && !isNaN(new Date(date_relance))
                      ? format(new Date(date_relance), 'dd/MM/yyyy ') // Corrected format for time
                      : ''}
                  </span>
                </div>
              </>
            )}
            {interet == 3 && (
              <>
                <div className="cols-1">
                  <span className="text-gray-500">Freins:</span>
                  <span className="ml-2 font-medium">{freins}</span>
                </div>

                <div></div>

                {frein_tranches.length > 0 && (
                  <div>
                    <span className="text-gray-500">Tranches:</span>
                    <span className="ml-2 font-medium">
                      {frein_tranches?.map((fr_tranche, i) => (
                        <span
                          key={`${fr_tranche.id}-${i}`}
                          className="inline whitespace-nowrap tracking-tight"
                        >
                          {i > 0 && (
                            <span className="text-inherit inline">, </span>
                          )}
                          {fr_tranche.tranche.nom.toUpperCase()}
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {frein_etages.length > 0 && (
                  <div>
                    <span className="text-gray-500">Etages:</span>
                    <span className="ml-2 font-medium">
                      {frein_etages?.map((fr_etage, i) => (
                        <span
                          key={`${fr_etage.id}-${i}`}
                          className="inline whitespace-nowrap tracking-tight"
                        >
                          {i > 0 && <span className="inline">, </span>}
                          {fr_etage.etage}
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {frein_orientations.length > 0 && (
                  <div>
                    <span className="text-gray-500">Orientations:</span>
                    <span className="ml-2 font-medium">
                      {frein_orientations?.map((fr_orientation, i) => (
                        <span
                          key={`${fr_orientation.id}-${i}`}
                          className="inline"
                        >
                          {i !== 0 && (
                            <span className="inline ml-1 text-gray-500">,</span>
                          )}
                          <span className="inline whitespace-nowrap tracking-tight">
                            {getFullOrientation(fr_orientation.orientation)}
                          </span>
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {frein_typologies.length > 0 && (
                  <div>
                    <span className="text-gray-500">Typologies:</span>
                    <span className="ml-2 font-medium">
                      {frein_typologies?.map((fr_typologie, j) => (
                        <span
                          key={`${fr_typologie.id}-${j}`}
                          className="inline"
                        >
                          {j !== 0 && <span className="inline">, </span>}
                          <span className="inline whitespace-nowrap tracking-tight">
                            {fr_typologie.typologie.typologie}
                          </span>
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {frein_vues.length > 0 && (
                  <div>
                    <span className="text-gray-500">Vues:</span>
                    <span className="ml-2 font-medium">
                      {frein_vues?.map((fr_vue, i) => (
                        <span key={`${fr_vue.vue.id}-${i}`} className="inline">
                          {i > 0 && <span className="inline">, </span>}
                          <span className="inline whitespace-nowrap tracking-tight">
                            {fr_vue.vue.vue}
                          </span>
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {frein_avance != null && (
                  <div>
                    <span className="text-gray-500">Avance:</span>
                    <span className="ml-2 font-medium">{frein_avance}</span>
                  </div>
                )}

                {frein_prix_min != null && (
                  <div>
                    <span className="text-gray-500">Prix Min:</span>
                    <span className="ml-2 font-medium">
                      {frein_prix_min} DH
                    </span>
                  </div>
                )}

                {frein_prix_max != null && (
                  <div>
                    <span className="text-gray-500">Prix Max:</span>
                    <span className="ml-2 font-medium">
                      {frein_prix_max} DH
                    </span>
                  </div>
                )}

                {frein_superficie_min != null && (
                  <div>
                    <span className="text-gray-500">Superficie Min:</span>
                    <span className="ml-2 font-medium">
                      {frein_superficie_min} DH
                    </span>
                  </div>
                )}

                {frein_superficie_max != null && (
                  <div>
                    <span className="text-gray-500">Superficie Max:</span>
                    <span className="ml-2 font-medium">
                      {frein_superficie_max} DH
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Commentaire
          </h3>
          <p className="text-sm text-gray-700">{commentaire}</p>
        </div>
        {commentaire_rel != null && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Commentaire du Relance
            </h3>
            <p className="text-sm text-gray-700">{commentaire_rel}</p>
          </div>
        )}
        {commentaire_rdv != null && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Commentaire du Rendez-Vous
            </h3>
            <p className="text-sm text-gray-700">{commentaire_rdv}</p>
          </div>
        )}
      </div>
      <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full bg-white text-gray-600 py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-center space-x-3 mb-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}
