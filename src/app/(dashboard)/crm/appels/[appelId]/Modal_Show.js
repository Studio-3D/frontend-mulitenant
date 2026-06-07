'use client';

import { format, parseISO } from 'date-fns';

import {
  getInteret_label,
  getOrientationLabel,
  getOrientationLabelFromAbbreviation,
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
  commentaire_rdv,
  description_autre
}) {
  const freins = [
    frein_tranches?.length > 0 && 'TRANCHE',
    description_autre != null && 'AUTRE',
    frein_etages?.length > 0 && 'ETAGE',
    frein_orientations?.length > 0 && 'ORIENTATION',
    frein_typologies?.length > 0 && 'TYPOLOGIE',
    frein_vues?.length > 0 && 'VUE',
    (frein_prix_min != null || frein_prix_max != null) && 'PRIX',
    (frein_superficie_min != null || frein_superficie_max != null) && 'SUPERFICIE',
    frein_avance && 'AVANCE',
  ]
    .filter(Boolean)
    .join(', ')
    .toLowerCase();

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('fr-FR');
  const formattedTime = dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  // Helper component for badge
  const Badge = ({ children, color = 'blue' }) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
        {children}
      </span>
    );
  };

  return (
    <div className="w-full max-w-[95%] sm:max-w-[550px] md:max-w-[700px] lg:max-w-[900px] h-auto bg-white rounded-2xl flex flex-col mx-auto overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[rgb(0,159,255)] to-[rgb(0,120,200)] text-white p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PhoneCallIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-lg sm:text-xl font-semibold">Détails de l{"'"}Appel</h1>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors duration-200"
            aria-label="Fermer"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold">{formattedTime}</div>
          <div className="text-blue-100 text-sm sm:text-base">{formattedDate}</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[70vh]">
        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <InfoCard
            icon={<PhoneCallIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />}
            label="Type Appel"
            value={type_appel}
          />
          <InfoCard
            icon={<UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />}
            label="Responsable"
            value={responsable}
          />
          <InfoCard
            icon={<MessageSquareIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />}
            label="Intérêt"
            value={getInteret_label(interet)}
          />
        </div>

        {/* Informations Section */}
        <div className="border-t border-gray-100 pt-4 sm:pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            Informations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 text-sm">
            
            {/* Intéressé (interet == 1) */}
            {interet == 1 && (
              <>
                {tranche && (
                  <InfoRow label="Tranche" value={tranche} />
                )}
                {bloc && (
                  <InfoRow label="Bloc" value={bloc} />
                )}
                {immeuble && (
                  <InfoRow label="Immeuble" value={immeuble} />
                )}
                {type_biens?.length > 0 && (
                  <InfoRow 
                    label="Types de Biens" 
                    value={type_biens.map((t, i) => (
                      <span key={t.id}>
                        {t.type_bien.type}{i < type_biens.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  />
                )}
                <InfoRow label="Etage" value={etage} />
                <InfoRow 
                  label="Orientation" 
                  value={getOrientationLabel(orientation)} 
                />
                <InfoRow 
                  label="Rendez-vous" 
                  value={rdv ? format(new Date(rdv), 'dd/MM/yyyy HH:mm') : '-'} 
                />
              </>
            )}

            {/* Réceptif ou Intéressé (interet == 2 ou 1) */}
            {(interet == 2 || interet == 1) && (
              <>
                <InfoRow label="Mode Relance" value={mode_relance || '-'} />
                <InfoRow 
                  label="Date Relance" 
                  value={date_relance && !isNaN(new Date(date_relance)) 
                    ? format(new Date(date_relance), 'dd/MM/yyyy') 
                    : '-'} 
                />
              </>
            )}

            {/* Perdu (interet == 3) */}
            {interet == 3 && (
              <>
                <div className="sm:col-span-2 lg:col-span-3">
                  <InfoRow 
                    label="Freins" 
                    value={<Badge color="orange">{freins || '-'}</Badge>} 
                  />
                </div>

                {frein_tranches?.length > 0 && (
                  <InfoRow 
                    label="Tranches" 
                    value={frein_tranches.map((fr, i) => (
                      <span key={fr.id}>
                        {fr.tranche?.nom?.toUpperCase()}
                        {i < frein_tranches.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  />
                )}

                {frein_etages?.length > 0 && (
                  <InfoRow 
                    label="Etages" 
                    value={frein_etages.map((fr, i) => (
                      <span key={fr.id}>
                        {fr.etage}
                        {i < frein_etages.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  />
                )}

                {frein_orientations?.length > 0 && (
                  <div className="sm:col-span-2">
                    <InfoRow 
                      label="Orientations" 
                      value={
                        <div className="flex flex-wrap gap-1">
                          {frein_orientations.map((fr, i) => (
                            <Badge key={fr.id} color="blue">
                              {getOrientationLabelFromAbbreviation(fr.orientation)}
                            </Badge>
                          ))}
                        </div>
                      } 
                    />
                  </div>
                )}

                {frein_typologies?.length > 0 && (
                  <InfoRow 
                    label="Typologies" 
                    value={frein_typologies.map((fr, i) => (
                      <span key={fr.typologie?.id}>
                        {fr.typologie?.typologie}
                        {i < frein_typologies.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  />
                )}

                {frein_vues?.length > 0 && (
                  <InfoRow 
                    label="Vues" 
                    value={frein_vues.map((fr, i) => (
                      <span key={fr.vue?.id}>
                        {fr.vue?.vue}
                        {i < frein_vues.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  />
                )}

                {frein_avance != null && (
                  <InfoRow label="Avance" value={`${frein_avance} DH`} />
                )}

                {frein_prix_min != null && (
                  <InfoRow label="Prix Min" value={`${frein_prix_min} DH`} />
                )}

                {frein_prix_max != null && (
                  <InfoRow label="Prix Max" value={`${frein_prix_max} DH`} />
                )}

                {frein_superficie_min != null && (
                  <InfoRow label="Superficie Min" value={`${frein_superficie_min} m²`} />
                )}

                {frein_superficie_max != null && (
                  <InfoRow label="Superficie Max" value={`${frein_superficie_max} m²`} />
                )}

                {description_autre && (
                  <InfoRow label="Description" value={description_autre} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Commentaires */}
        {commentaire && (
          <CommentSection title="Commentaire" content={commentaire} />
        )}
        {commentaire_rel && (
          <CommentSection title="Commentaire du Relance" content={commentaire_rel} />
        )}
        {commentaire_rdv && (
          <CommentSection title="Commentaire du Rendez-Vous" content={commentaire_rdv} />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full bg-white text-gray-700 py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm sm:text-base font-medium"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// Helper component for info rows
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
      <span className="text-gray-500 text-xs sm:text-sm font-medium min-w-[100px]">{label}:</span>
      <span className="text-gray-800 text-sm sm:text-base font-medium break-words">
        {value || '-'}
      </span>
    </div>
  );
}

// Helper component for info cards
function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-100">
      <div className="flex items-center space-x-2 mb-2">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          {icon}
        </div>
        <span className="text-xs sm:text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-sm sm:text-base font-semibold text-gray-900 break-words">
        {value || '-'}
      </div>
    </div>
  );
}

// Helper component for comment sections
function CommentSection({ title, content }) {
  return (
    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
        {title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </p>
    </div>
  );
}