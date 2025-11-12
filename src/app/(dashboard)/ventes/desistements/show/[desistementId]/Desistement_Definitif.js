import React, { useState, useEffect } from 'react';
import {
  User,
  Home,
  Box,
  DollarSign,
  HandCoins,
  Wallet,
  FileText,
  Calendar,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Percent,
  FileSignature,
  ArrowRightLeft,
  Receipt,
  Ban,
} from 'lucide-react';
import { APIURL } from '../../../../../../configs/api';
import axios from 'axios';
import { data_by_projet_and_params } from '../../../../../../../src/configs/api-utils';
import format from 'date-fns/format';
import { getMotifLabel } from '@/configs/enum';
import { motion, AnimatePresence } from 'framer-motion';

export function Desistement_Definitif({
  formData,
  accessToken,
  selectedProjet_id,
  type_remb_get,
  sum_avances_valides,
  reservationId,
  code_reservation,
  user,
}) {
  const FileUrl = process.env.NEXT_PUBLIC_IMG_URL;

  const [loading_dos, setLoading_dos] = useState();
  const [dossiers, setDossiers] = useState([]);
  const [dossierInfos, setDossierInfos] = useState({});
  const [loadingInfos, setLoadingInfos] = useState({});
  const [type_remb, set_type_remb] = useState(type_remb_get || null);
  const [inputListRemb, set_inputList_remb] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if (formData) {
      set_type_remb(type_remb_get);

      const list =
        formData?.remboursement?.length > 0
          ? formData.remboursement.map((item) => ({
              date_decaissement: item?.date_decaissement,
              date_accuse: item?.date_accuse,
              banque: item?.banque?.nom,
              statut: item?.statut,
              cheque_client_signe: item?.cheque_client_signe,
              cl_id: item?.aquereur?.client_id,
              aq_id: item?.aquereur_id,
              nom: item?.aquereur?.client.nom,
              pourcentage: item.aquereur?.pourcentage,
              prenom: item?.aquereur?.client.prenom,
              date_rembourse: item.date_rembourse,
              mode_rembourse: item.mode_rembourse_client,
              type_remb: item.mode_rembourse,
              montant_transferer: item.montant_transfert,
              reste_a_rembourse: item.montant_a_rembourser,
              num_paiement: item.num_paiement,
              cheque_recu: item.cheque,
              pour_le_compte: item.pour_le_compte,
              fichier_autorisation: item.fichier_autorisation,
              montant_a_rembourser: item.montant_a_rembourser,
              dossier_id: item.dossier_id_transfert,
              type_remb_transfere:
                item.mode_rembourse === 'transfert_rem_direct'
                  ? 'immediat'
                  : item.mode_rembourse === 'transfert_rem_apres_vente'
                  ? 'apres_vente'
                  : '',
            }))
          : [];

      set_inputList_remb(list);

      list.forEach((item, index) => {
        if (item.dossier_id) {
          get_info_dossier_id(item.dossier_id, index);
        }
      });
    }
  }, [formData]);

  const fetchDossierData = async () => {
    try {
      setLoading_dos(true);
      await data_by_projet_and_params(
        'getDossiers',
        setDossiers,
        setLoading_dos,
        'reservations',
        selectedProjet_id,
        reservationId
      );
    } catch (error) {
      console.error('Error fetching dossiers:', error);
    } finally {
      setLoading_dos(false);
    }
  };

  useEffect(() => {
    fetchDossierData();
  }, []);

  const get_info_dossier_id = async (dos_id, index) => {
    try {
      if (dos_id) {
        setLoadingInfos((prev) => ({ ...prev, [index]: true }));

        const response = await axios.get(
          `${APIURL.ROOTV1}/reservations/${dos_id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const { reservation, sum_avances_valides } = response.data;

        const newDossierInfo = {
          clients: reservation.aquereurs,
          bien: reservation.bien.propriete_dite_bien,
          type: reservation.bien.type_bien.type,
          prix: reservation.prix,
          sum_avances: sum_avances_valides,
          reste: reservation.prix - sum_avances_valides,
        };
        setDossierInfos((prev) => ({
          ...prev,
          [index]: newDossierInfo,
        }));
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
    } finally {
      setLoadingInfos((prev) => ({ ...prev, [index]: false }));
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'direct':
        return 'Direct';
      case 'apres_vente':
        return 'Après Vente';
      case 'transfert':
        return 'Transfert';
      case 'transfert_remb':
      case 'transfert_rem_direct':
      case 'transfert_rem_apres_vente':
        return 'Transfert et Remboursement';
      default:
        return mode;
    }
  };

  const getPourLeCompteLabel = (value) => {
    switch (value) {
      case 'lui_meme':
        return 'Lui-même';
      case 'autre':
        return 'Autre';
      default:
        return value;
    }
  };

  const PaymentMethodIcon = ({ method }) => {
    switch (method) {
      case 'cheque':
        return <CreditCard className="w-4 h-4 mr-2 text-blue-500" />;
      case 'virement':
        return <Banknote className="w-4 h-4 mr-2 text-green-500" />;
      default:
        return <Banknote className="w-4 h-4 mr-2 text-gray-500" />;
    }
  };

  const ModeBadge = ({ mode }) => {
    let bgColor, textColor, icon;

    switch (mode) {
      case 'direct':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        icon = <DollarSign className="w-4 h-4 mr-1" />;
        break;
      case 'apres_vente':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        icon = <Calendar className="w-4 h-4 mr-1" />;
        break;
      case 'transfert':
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        icon = <ArrowRightLeft className="w-4 h-4 mr-1" />;
        break;
      case 'transfert_remb':
      case 'transfert_rem_direct':
      case 'transfert_rem_apres_vente':
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-800';
        icon = <Receipt className="w-4 h-4 mr-1" />;
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <FileText className="w-4 h-4 mr-1" />;
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
      >
        {icon}
        {getModeLabel(mode)}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 ">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header Section */}
        <div className="mb-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <Clipboard className="w-8 h-8 mr-3 text-indigo-500" />
              Détails
            </h2>
            {sum_avances_valides > 0 && (
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-md">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="font-semibold">
                    Montant total: {sum_avances_valides.toFixed(2)} DH
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Motif Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <FileText className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  Motif du désistement
                </h3>
                <p className="text-gray-800 text-xl font-medium">
                  {getMotifLabel(formData.motif)}
                </p>
              </div>
            </div>
          </div>

          {/* Type Remboursement */}
          {sum_avances_valides > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-1 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <HandCoins className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Type de remboursement
                    </h3>
                    <p className="text-gray-800">
                      {type_remb === 'direct'
                        ? 'Remboursement immédiat'
                        : 'Remboursement après vente'}
                    </p>
                  </div>
                </div>
                <ModeBadge mode={type_remb} />
              </div>
            </div>
          )}
        </div>

        {/* Remboursement Sections 
        {type_remb == 'direct'  && (*/}
        <div className="space-y-6">
          {inputListRemb?.map((item, index) => {
            const itemKey = item.aq_id
              ? `${item.aq_id}-${index}`
              : `item-${index}`;
            const currentMode = item.type_remb;
            const showTransferSection =
              currentMode == 'transfert' ||
              currentMode == 'transfert_remb' ||
              currentMode == 'transfert_rem_direct' ||
              currentMode == 'transfert_rem_apres_vente';

            const showDirectFields =
              currentMode == 'direct' ||
              (currentMode == 'apres_vente' && item.statut > 0) ||
              ((currentMode == 'transfert_remb' ||
                currentMode == 'transfert_rem_direct' ||
                currentMode == 'transfert_rem_apres_vente') &&
                item.type_remb_transfere == 'immediat' &&
                parseFloat(item.reste_a_rembourse || 0) > 0);

            return (
              <motion.div
                key={`${itemKey}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all"
              >
                {/* Client Header - Changed to div with onClick */}
                <div
                  className="bg-indigo-100 px-6 py-4 border-b border-indigo-200 cursor-pointer"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                        <User className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {item.nom} {item.prenom}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Percent className="w-4 h-4 mr-1" />
                          <span>{item.pourcentage}% de participation</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {currentMode !== 'transfert' && (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mr-4">
                          À rembourser:{' '}
                          {parseFloat(item.reste_a_rembourse || 0).toFixed(2)}{' '}
                          DH
                        </span>
                      )}
                      <ModeBadge mode={currentMode} />
                      <div className="ml-4 text-gray-500">
                        {expandedSections[index] ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {showDirectFields && (
                  <AnimatePresence>
                    {expandedSections[index] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-6"
                      >
                        {/* Transfer Section */}
                        {showTransferSection && (
                          <div className="mb-8">
                            <div className="flex items-center mb-4">
                              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <ArrowRightLeft className="w-5 h-5 text-purple-500" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-800">
                                Détails du transfert
                              </h4>
                            </div>

                            {loadingInfos[index] ? (
                              <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                              </div>
                            ) : dossierInfos[index] ? (
                              <>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                                  <h5 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                                    <Home className="w-5 h-5 mr-2 text-blue-500" />
                                    Dossier transféré :{' '}
                                    {dossiers.find(
                                      (d) => d.id === item.dossier_id
                                    )?.code_reservation || ''}
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm text-gray-500 mb-1">
                                        Clients
                                      </label>
                                      <div className="font-medium text-gray-800 space-y-1">
                                        {dossierInfos[index].clients.map(
                                          (client, i) => (
                                            <div
                                              key={i}
                                              className="flex items-center"
                                            >
                                              <User className="w-4 h-4 mr-2 text-gray-500" />
                                              {client.client.nom}{' '}
                                              {client.client.prenom} (
                                              {client.pourcentage}%)
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-500 mb-1">
                                        Bien
                                      </label>
                                      <p className="font-medium text-gray-800 flex items-center">
                                        <Home className="w-4 h-4 mr-2 text-gray-500" />
                                        {dossierInfos[index].bien}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-500 mb-1">
                                        Type
                                      </label>
                                      <p className="font-medium text-gray-800 flex items-center">
                                        <Box className="w-4 h-4 mr-2 text-gray-500" />
                                        {dossierInfos[index].type}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-500 mb-1">
                                        Prix
                                      </label>
                                      <p className="font-medium text-gray-800 flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                                        {dossierInfos[
                                          index
                                        ].prix?.toLocaleString()}{' '}
                                        DH
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-500 mb-1">
                                        Avances
                                      </label>
                                      <p className="font-medium text-gray-800 flex items-center">
                                        <HandCoins className="w-4 h-4 mr-2 text-gray-500" />
                                        {dossierInfos[
                                          index
                                        ].sum_avances?.toLocaleString()}{' '}
                                        DH
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-sm text-gray-500 mb-1">
                                        Reste
                                      </label>
                                      <p className="font-medium text-red-600 flex items-center">
                                        <Wallet className="w-4 h-4 mr-2 text-red-500" />
                                        {dossierInfos[
                                          index
                                        ].reste?.toLocaleString()}{' '}
                                        DH
                                      </p>
                                    </div>
                                    {currentMode == 'transfert' && (
                                      <div>
                                        <label className="block text-sm text-gray-500 mb-1">
                                          Montant transféré
                                        </label>
                                        <p className="font-medium text-red-600 flex items-center">
                                          <Wallet className="w-4 h-4 mr-2 text-red-500" />
                                          {item.montant_transferer
                                            ? `${parseFloat(
                                                item.montant_transferer
                                              ).toFixed(2)} DH`
                                            : ''}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {(currentMode == 'transfert_remb' ||
                                  currentMode == 'transfert_rem_direct' ||
                                  currentMode == 'transfert_rem_apres_vente') &&
                                  item.dossier_id && (
                                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mb-6">
                                      <h5 className="text-md font-semibold text-indigo-800 mb-4 flex items-center">
                                        <Receipt className="w-5 h-5 mr-2" />
                                        Détails financiers du transfert
                                      </h5>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                          <label className="block text-sm text-gray-500 mb-1">
                                            Montant transféré
                                          </label>
                                          <p className="text-xl font-bold text-indigo-700">
                                            {item.montant_transferer
                                              ? `${parseFloat(
                                                  item.montant_transferer
                                                ).toFixed(2)} DH`
                                              : ''}
                                          </p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                          <label className="block text-sm text-gray-500 mb-1">
                                            Reste à rembourser
                                          </label>
                                          <p className="text-xl font-bold text-red-500">
                                            {item.reste_a_rembourse
                                              ? `${parseFloat(
                                                  item.reste_a_rembourse
                                                ).toFixed(2)} DH`
                                              : ''}
                                          </p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                          <label className="block text-sm text-gray-500 mb-1">
                                            Type remboursement
                                          </label>
                                          <p className="text-lg font-semibold text-gray-800">
                                            {item.type_remb_transfere ===
                                            'immediat' ? (
                                              <span className="flex items-center">
                                                <DollarSign className="w-5 h-5 mr-1 text-green-500" />
                                                Immédiat
                                              </span>
                                            ) : (
                                              <span className="flex items-center">
                                                <Calendar className="w-5 h-5 mr-1 text-blue-500" />
                                                Après Vente
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </>
                            ) : null}
                          </div>
                        )}

                        {/* Remboursement Direct Section */}
                        {showDirectFields && (
                          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <div className="flex items-center mb-4">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <DollarSign className="w-5 h-5 text-blue-500" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-800">
                                Détails du remboursement
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm text-gray-500 mb-1 flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                  Date remboursement
                                </label>
                                <p className="font-medium text-gray-800">
                                  {item.date_rembourse
                                    ? format(
                                        new Date(item.date_rembourse),
                                        'dd/MM/yyyy',
                                        {
                                          timeZone: 'UTC',
                                        }
                                      )
                                    : ''}
                                </p>
                              </div>

                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <label className="block text-sm text-gray-500 mb-1">
                                  Méthode de paiement
                                </label>
                                <p className="font-medium text-gray-800 flex items-center">
                                  <PaymentMethodIcon
                                    method={item.mode_rembourse}
                                  />
                                  {item.mode_rembourse === 'cheque'
                                    ? 'Chèque'
                                    : item.mode_rembourse === 'virement'
                                    ? 'Virement'
                                    : ''}
                                </p>
                              </div>

                              {item.mode_rembourse && (
                                <>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <label className="block text-sm text-gray-500 mb-1">
                                      N° Paiement
                                    </label>
                                    <p className="font-medium text-gray-800">
                                      {item.num_paiement || ''}
                                    </p>
                                  </div>

                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <label className="block text-sm text-gray-500 mb-1">
                                      Chèque/Reçu
                                    </label>
                                    <p className="font-medium text-gray-800">
                                      {item.cheque_recu ? (
                                        <a
                                          href={`${FileUrl}/docs/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remboursements/cheques_reçus/${code_reservation}/${item.cheque_recu}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-indigo-500 hover:text-indigo-800 flex items-center transition-colors"
                                        >
                                          <FileText className="w-4 h-4 mr-2" />
                                          <span className="border-b border-dashed border-indigo-300 hover:border-indigo-500">
                                            Voir le document
                                          </span>
                                        </a>
                                      ) : (
                                        ''
                                      )}
                                    </p>
                                  </div>

                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <label className="block text-sm text-gray-500 mb-1">
                                      Pour le compte
                                    </label>
                                    <p className="font-medium text-gray-800">
                                      {getPourLeCompteLabel(
                                        item.pour_le_compte
                                      )}
                                    </p>
                                  </div>

                                  {item.pour_le_compte == 'autre' && (
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                      <label className="block text-sm text-gray-500 mb-1">
                                        Autorisation
                                      </label>
                                      <p className="font-medium text-gray-800">
                                        {item.fichier_autorisation ? (
                                          <a
                                            href={`${FileUrl}/docs/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remboursements/fichier_autorisations/${code_reservation}/${item.fichier_autorisation}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-500 hover:text-indigo-800 flex items-center transition-colors"
                                          >
                                            <FileSignature className="w-4 h-4 mr-2" />
                                            <span className="border-b border-dashed border-indigo-300 hover:border-indigo-500">
                                              Voir autorisation
                                            </span>
                                          </a>
                                        ) : (
                                          ''
                                        )}
                                      </p>
                                    </div>
                                  )}

                                  {item.cheque_client_signe != null && (
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                      <label className="block text-sm text-gray-500 mb-1">
                                        Chèque Client Signé
                                      </label>
                                      <p className="font-medium text-gray-800">
                                        {item.cheque_client_signe ? (
                                          <a
                                            href={`${FileUrl}/docs/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remboursements/cheques_reçus/${code_reservation}/${item.cheque_client_signe}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-500 hover:text-indigo-800 flex items-center transition-colors"
                                          >
                                            <FileText className="w-4 h-4 mr-2" />
                                            <span className="border-b border-dashed border-indigo-300 hover:border-indigo-500">
                                              Voir le document
                                            </span>
                                          </a>
                                        ) : (
                                          ''
                                        )}
                                      </p>
                                    </div>
                                  )}
                                  {item.date_decaissement != null && (
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                      <label className="block text-sm text-gray-500 mb-1 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                        Date Décaissement
                                      </label>
                                      <p className="font-medium text-gray-800">
                                        {item.date_decaissement
                                          ? format(
                                              new Date(item.date_decaissement),
                                              'dd/MM/yyyy',
                                              {
                                                timeZone: 'UTC',
                                              }
                                            )
                                          : ''}
                                      </p>
                                    </div>
                                  )}
                                  {item.banque != null && (
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                      <label className="block text-sm text-gray-500 mb-1 flex items-center">
                                        <Ban className="w-4 h-4 mr-2 text-blue-500" />
                                        Banque
                                      </label>
                                      <p className="font-medium text-gray-800">
                                        {item.banque}
                                      </p>
                                    </div>
                                  )}
                                  {item.date_accuse != null && (
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                      <label className="block text-sm text-gray-500 mb-1 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                        Date Accusé
                                      </label>
                                      <p className="font-medium text-gray-800">
                                        {item.date_accuse
                                          ? format(
                                              new Date(item.date_accuse),
                                              'dd/MM/yyyy',
                                              {
                                                timeZone: 'UTC',
                                              }
                                            )
                                          : ''}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}
        </div>
        {/*)*/}
      </motion.div>
    </div>
  );
}
