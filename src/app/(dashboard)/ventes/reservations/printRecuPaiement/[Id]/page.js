'use client';

import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Document from './recu';

import {
  Building2 as BusinessIcon,
  User as PersonIcon,
  Home as HomeIcon,
  Upload,
  //Landmark as AccountBalanceIcon,
} from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';
import { APIURL, RESOURCE_URL } from '../../../../../../configs/api';
import { useAuth } from '../../../../../../context/AuthContext';
import { useParams } from 'next/navigation';
import Image from 'next/image';

import { MODE_PAIEMENT } from '../../../../../../configs/enum';
const PrevisualiserRecu = () => {
  const { Id } = useParams();

  const { user, token } = useAuth();

  const [selectedTab, setSelectedTab] = useState(0);
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState(true);

  const selectedProjet = JSON.parse(localStorage.getItem('selectedProjet'));

  const [formValues, setFormValues] = useState({
    user: JSON.parse(localStorage.getItem('authUser')),
    imageUrl:
      `${RESOURCE_URL.DOCS}${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}` ||
      '',
    mode_paiement: '',
    banque_id: null,
    numero_paiement: '',
    montant: 0,
    echeance: '',
    reservationDetails: null,
    superficie_habitable: 0,
    titre_foncier: '',
    tranche: '',
    bloc: '',

    immeuble: '',
    type_id: null,
    projet: '',
    propriete_dite_bien: '',
    prix: '',
    bien_numero: '', // Add this missing field
    prix: 0, // Change from string to number
    mode_financement: '',
    clients: [],
    type: '',
    banque: '',
    clientsList: [],
    raison_social: user.societe.raison_sociale_concatene || '',
    capital: user.societe.capital || 0,
    adresse: user.societe.adresse || '',
    id_fiscal: user.societe.id_fiscal || '',
    registre_commerce: user.societe.registre_commerce || '',
    adresse_projet: '',
    etage: 0,
    superficie_parking: 0,
    isParkingAvailable: false,
    prix_parking: 0,
  });

 const fetchData_avance = async () => {
  setLoading(true);
  try {
    const response = await axios.get(`${APIURL.PAIEMENTS}/${Id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const avance = response.data.avance;
    const reservation = avance.reservation || {};
    const bien = reservation.bien || {};
    const projet = bien.projet || {};
    
    setFormValues(prev => ({
      ...prev,
      user: JSON.parse(localStorage.getItem("authUser")) || {},
      mode_paiement: avance.mode_paiement || "",
      banque_id: avance.banque_id || "",
      banque: avance.banque?.nom || "",
      numero_paiement: avance.numero_paiement || "",
      montant: avance.montant || 0,
      echeance: avance.echeance || "",
      reservationDetails: reservation,
      superficie_habitable: bien.superficie_habitable || 0,
      titre_foncier: bien.titre_foncier || "",
      tranche: bien.tranche?.nom || "",
      bloc: bien.bloc?.nom || "",
      immeuble: bien.immeuble?.nom || "",
      type_id: bien.type_id || "",
      type: bien.type_bien?.type || "",
      projet: projet.nom || "",
      propriete_dite_bien: bien.propriete_dite_bien || "",
      bien_numero: bien.numero || "",
      prix: bien.prix || 0,
      mode_financement: reservation.mode_financement || "",
      adresse_projet: projet.adresse || "",
      etage: projet.niveau || 0,
      superficie_parking: bien.superficie_parking || 0,
      prix_parking: bien.prix_parking || 0,
      isParkingAvailable: !!bien.superficie_parking,
      clientsList: (reservation.aquereurs || []).map((aquerreur) => ({
        nom: aquerreur.client?.nom || "",
        prenom: aquerreur.client?.prenom || "",
        civilite: aquerreur.client?.civilite || "Mr",
        type_client: aquerreur.client?.type_client || "",
        telephone_num1: aquerreur.client?.telephone_num1 || "",
        situation_familliale: aquerreur.client?.situation_familliale || "",
        cin: aquerreur.client?.cin || "",
      })),
    }));
    setLoading(false);
  } catch (error) {
    console.error("Error fetching data:", error);
    setLoading(false);
  }
};
  // Add this function to update clients
  const updateClients = async () => {
    try {
      // Update each client in the list
      await Promise.all(
        formValues.clientsList.map(async (clientData, index) => {
          // Find the original client ID from the reservation data
          const originalClient =
            formValues.reservationDetails.aquereurs[index]?.client;

          if (originalClient) {
              // Convert civilite string to number
          let civiliteValue;
          switch (clientData.civilite) {
            case 'MR':
            case 'Mr':
            case 'mr':
            case '1':
              civiliteValue = 1;
              break;
            case 'MME':
            case 'Mme':
            case 'mme':
            case '2':
              civiliteValue = 2;
              break;
            case 'MLLE':
            case 'Mlle':
            case 'mlle':
            case '3':
              civiliteValue = 3;
              break;
            default:
              civiliteValue = 1; // Default to Mr
          }
            const updatedClient = {
              nom: clientData.nom,
              prenom: clientData.prenom,
              civilite: civiliteValue,
              type_client: clientData.type_client,
              telephone_num1: clientData.telephone_num1,
              situation_familliale: clientData.situation_familliale,
              civilite: clientData.civilite,
              cin: clientData.cin,
            };

            await axios.put(
              `${APIURL.CLIENTS}/${originalClient.id}`,
              updatedClient,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
          }
        })
      );

      return true;
    } catch (error) {
      console.error('Error updating clients:', error);
      return false;
    }
  };

  // Modify the PDF download button to:
  <button
    className="mr-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
    onClick={async (e) => {
      e.preventDefault();
      const success = await updateClients();
      if (success) {
        // Trigger PDF download after successful update
        const link = document.createElement('a');
        link.href = URL.createObjectURL(await pdfDocument.toBlob());
        link.download = 'recu.pdf';
        link.click();
      } else {
        alert('Failed to update client data');
      }
    }}
  >
    Enregistrer
  </button>;

  useEffect(() => {
    if (Id) {
      fetchData_avance();
    }
  }, [Id]);

  const handleTabChange = (newValue) => {
    setSelectedTab(newValue);
  };

  const handleCheckboxChange = (event) => {
    const { checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      isParkingAvailable: checked,
      superficie_parking: checked ? prev.superficie_parking : '',
    }));
  };

  const handleChangeClientList = (index, field, value) => {
    setFormValues((prevValues) => {
      const updatedClientsList = [...prevValues.clientsList];
      updatedClientsList[index] = {
        ...updatedClientsList[index],
        [field]: value,
      };
      return {
        ...prevValues,
        clientsList: updatedClientsList,
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  if (loading) {
    return (
      <div className="mt-6 flex flex-col items-center">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Section Formulaire (30%) */}
      <div className="w-1/3 border-r-8 border-pink-100 bg-amber-50 p-8">
        <div className="mb-4 flex min-h-[30px] bg-white">
          <button
            onClick={() => handleTabChange(0)}
            className={`flex flex-1 items-center justify-center px-2 py-1.5 text-xs ${
              selectedTab == 0
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
            }`}
          >
            <BusinessIcon className="mr-1 h-4 w-4" />
            Société
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex flex-1 items-center justify-center px-2 py-1.5 text-xs ${
              selectedTab == 1
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
            }`}
          >
            <PersonIcon className="mr-1 h-4 w-4" />
            Client
          </button>
          <button
            onClick={() => handleTabChange(2)}
            className={`flex flex-1 items-center justify-center px-2 py-1.5 text-xs ${
              selectedTab == 2
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
            }`}
          >
            <HomeIcon className="mr-1 h-4 w-4" />
            Bien
          </button>
          {/*<button
            onClick={() => handleTabChange(3)}
            className={`flex flex-1 items-center justify-center px-2 py-1.5 text-xs ${
              selectedTab == 3
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
            }`}
          >
            <AccountBalanceIcon className="mr-1 h-4 w-4" />
            Paiement
          </button>*/}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between p-2">
          {selectedTab == 0 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Raison sociale
                </label>
                <input
                  type="text"
                  name="raison_social"
                  value={formValues.raison_social||""}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formValues.adresse||""}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Capital
                  </label>
                  <input
                    type="number"
                    name="capital"
                    value={formValues.capital||0}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Registre Commerce
                  </label>
                  <input
                    type="number"
                    name="registre_commerce"
                    value={formValues.registre_commerce||""}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Id Fiscal
                </label>
                <input
                  type="number"
                  name="id_fiscal"
                  value={formValues.id_fiscal||""}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
          )}

          {selectedTab == 1 && (
            <div className="space-y-4">
              {formValues.clientsList.map((clientData, index) => (
                <Fragment key={index}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={clientData.nom || ''}
                        onChange={(e) =>
                          handleChangeClientList(index, 'nom', e.target.value)
                        }
                        className="w-full rounded border border-gray-300 p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={clientData.prenom || ''}
                        onChange={(e) =>
                          handleChangeClientList(
                            index,
                            'prenom',
                            e.target.value
                          )
                        }
                        className="w-full rounded border border-gray-300 p-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">Civilité:</span>
                    <label className="mr-3 flex items-center">
                      <input
                        type="radio"
                        checked={clientData.civilite == '1'}
                        onChange={() =>
                          handleChangeClientList(index, 'civilite', '1')
                        }
                        className="mr-1"
                      />
                      Mr
                    </label>
                    <label className="mr-3 flex items-center">
                      <input
                        type="radio"
                        checked={clientData.civilite == '2'}
                        onChange={() =>
                          handleChangeClientList(index, 'civilite', '2')
                        }
                        className="mr-1"
                      />
                      Mme
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={clientData.civilite == 'Mlle'}
                        onChange={() =>
                          handleChangeClientList(index, 'civilite', 'Mlle')
                        }
                        className="mr-1"
                      />
                      Mlle
                    </label>
                  </div>
                  {index < formValues.clientsList.length - 1 && (
                    <div className="my-4 border-t border-blue-500 pt-1 text-blue-500"></div>
                  )}
                </Fragment>
              ))}
            </div>
          )}

          {selectedTab == 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Propriete dite bien
                  </label>
                  <input
                    type="text"
                    name="propriete_dite_bien"
                    value={formValues.propriete_dite_bien||""}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Type</label>
                  <input
                    type="text"
                    name="type"
                    value={formValues.type||""}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Projet
                  </label>
                  <input
                    type="text"
                    name="projet"
                    value={formValues.projet||""}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                {selectedProjet?.nbre_tranches != 0 && (
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Tranche
                    </label>
                    <input
                      type="text"
                      name="tranche"
                      value={formValues.tranche||""}
                      onChange={handleChange}
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                    />
                  </div>
                )}
              </div>

              {selectedProjet?.nbre_blocs !== 0 && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Bloc</label>
                  <input
                    type="text"
                    name="bloc"
                    value={formValues.bloc||""}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              )}

              {selectedProjet?.nbre_immeubles !== 0 && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Immeuble
                  </label>
                  <input
                    type="text"
                    name="immeuble"
                    value={formValues.immeuble||""}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Titre foncier
                  </label>
                  <input
                    type="number"
                    name="titre_foncier"
                    value={formValues.titre_foncier||""}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Prix</label>
                  <input
                    type="number"
                    name="prix"
                    value={formValues.prix||0}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Etage
                  </label>
                  <input
                    type="number"
                    name="etage"
                    value={formValues.etage}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Numero
                  </label>
                  <input
                    type="number"
                    name="numero"
                    value={formValues.numero||""}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Superficie habitable
                </label>
                <input
                  type="number"
                  name="superficie_habitable"
                  value={formValues.superficie_habitable||0}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formValues.isParkingAvailable}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">
                  Parking disponible
                </label>
              </div>

              {formValues.isParkingAvailable && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Superficie parking
                    </label>
                    <input
                      type="number"
                      name="superficie_parking"
                      value={formValues.superficie_parking||0}
                      onChange={handleChange}
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Prix Parking
                    </label>
                    <input
                      type="number"
                      name="prix_parking"
                      value={formValues.prix_parking||0}
                      onChange={handleChange}
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/*selectedTab == 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Montant
                  </label>
                  <NumberFormatBase
                    value={formValues.montant}
                    onValueChange={(values) => {
                      setFormValues((prev) => ({
                        ...prev,
                        montant: parseFloat(values.value),
                      }));
                    }}
                    thousandSeparator=" "
                    decimalSeparator=","
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Mode Financement
                  </label>
                  <select
                    name="mode_financement"
                    value={formValues.mode_financement}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  >
                    {Object.values(MODE_FINANCE)?.map((mode) => (
                      <option key={mode.code} value={mode.code}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Mode Paiement:
                </label>
                <select
                  name="mode_paiement"
                  value={formValues.mode_paiement}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 p-2 text-sm"
                >
                  {Object.values(MODE_PAIEMENT)?.map((mode) => (
                    <option key={mode.code} value={mode.code}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>

              {formValues.mode_paiement != 1 &&
                formValues.mode_paiement != null && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Banque
                      </label>
                      <input
                        type="text"
                        name="banque"
                        value={formValues.banque}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        N° de paiement:
                      </label>
                      <input
                        type="number"
                        name="numero_paiement"
                        value={formValues.numero_paiement}
                        onChange={handleChange}
                        className="w-full rounded border border-gray-300 p-2 text-sm"
                      />
                    </div>
                  </div>
                )}

              {formValues.mode_paiement != null &&
                formValues.mode_paiement != 1 &&
                formValues.mode_paiement != '6' &&
                formValues.mode_paiement != '5' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Echéance:
                    </label>
                    <input
                      type="date"
                      name="echeance"
                      value={formValues.echeance}
                      onChange={handleChange}
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                    />
                  </div>
                )}
            </div>
          )*/}
          {/* Add this NOTE BIEN section */}

          <div className="mb-4 mt-4 rounded-md border-2 border-amber-400 bg-amber-50 p-3 text-center font-medium text-amber-800">
            <span className="font-bold mt-10">NOTE :</span> Ces changements
            seront appliqués sur la quittance seulement.
          </div>
          <div className="mt-10">
            <PDFDownloadLink
              document={<Document data={[formValues]} />}
              fileName="recu.pdf"
              onClick={async () => {
                await updateClients();
              }}
            >
              {({ loading }) => (
                <button
                  className={`px-3 py-1 text-sm rounded ${
                    loading
                      ? 'bg-gray-200 text-gray-500 cursor-wait'
                      : 'bg-blue-500 text-white hover:bg-indigo-600'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Génération...' : 'Télécharger PDF'}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* Section de prévisualisation stylisée */}
      <div className="w-2/3 bg-white p-4">
        <div className="p-4">
          {/* Logo et Titre */}

          <div className="flex items-center gap-4 mb-4">
            {user.societe.logo ? (
              <div className="relative h-24 w-24">
                <Image
                  src={`${RESOURCE_URL.DOCS}/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`}
                  alt={`Logo de ${user.societe.raison_sociale_concatene}`}
                  fill
                  className="object-contain"
                  sizes="96px"
                  unoptimized={process.env.NODE_ENV !== 'production'} // Disable optimization in development
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-company-logo.png';
                  }}
                />
              </div>
            ) : (
              <div className="h-24 w-24 flex items-center justify-center bg-gray-200 rounded">
                <BusinessIcon className="h-12 w-12 text-gray-500" />
              </div>
            )}
            <h2 className="text-xl font-bold text-green-600">
              {formValues.raison_social}
            </h2>
          </div>

          <div className="my-2 border-t border-gray-300"></div>

          {/* Titre de la quittance */}
          <h2 className="text-center text-xl font-bold underline">QUITTANCE</h2>

          {/* Corps de la quittance */}
          <div className="pl-2">
            {/* Soussigné */}
            <h3 className="text-lg font-bold underline">LE SOUSSIGNÉ:</h3>

            {/* La Société */}
            <p className="mb-4">
              LA SOCIETE <strong>«{formValues.raison_social}»</strong>, société
              à responsabilité limitée de droit Marocain, au capital social de{' '}
              <strong>{formValues.capital}</strong> de dirhams, ayant son siège
              social à <strong>{formValues.adresse}</strong>, immatriculée au
              registre du commerce sous n°{' '}
              <strong>{formValues.registre_commerce}</strong> et dont le numéro
              de {'l'}identifiant fiscal est le n°{' '}
              <strong>{formValues.id_fiscal}</strong>.
            </p>

            {/* Information sur le paiement */}
            <p className="mb-4">
              Lequel reconnaît avoir reçu de&nbsp;
              {formValues.clientsList.map((clientData, index) => {
                const isLast = index == formValues.clientsList.length - 1;
                const separator = isLast
                  ? ''
                  : index == formValues.clientsList.length - 2
                  ? ' et '
                  : ', ';

                return (
                  <Fragment key={index}>
                    <strong>
                      {clientData.civilite == '1'
                        ? 'Mr'
                        : clientData.civilite == '2'
                        ? 'Mme'
                        : 'Mlle'}{' '}
                      {clientData.nom} {clientData.prenom}
                    </strong>
                    {separator}
                  </Fragment>
                );
              })}
              &nbsp; la somme de&nbsp;
              <strong>
                {formValues.montant.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
              &nbsp;
              {formValues.mode_paiement != 1 ? (
                <>
                  au moyen {'d'}un&nbsp;
                  <strong>
                    {MODE_PAIEMENT[formValues.mode_paiement]?.label}
                  </strong>
                  &nbsp;émis sur&nbsp;
                  <strong>«{formValues.banque}»</strong>&nbsp;portant N°&nbsp;
                  <strong>{formValues.numero_paiement}</strong>.
                </>
              ) : (
                <>
                  en&nbsp;
                  <strong>
                    {MODE_PAIEMENT[formValues.mode_paiement]?.label}
                  </strong>
                  .
                </>
              )}
            </p>

            {/* Propriété et prix d'acquisition */}
            <p className="mb-4">
              Représentant partie du prix {"d'"}acquisition de la propriété sise{' '}
              <strong>
                {selectedProjet?.nbre_tranches != 0 &&
                  `à la tranche  «${formValues.tranche}», `}
              </strong>
              <strong>
                {selectedProjet?.nbre_blocs != 0 &&
                  `au bloc  «${formValues.bloc}», `}
              </strong>
              <strong>
                {selectedProjet?.nbre_immeubles != 0 &&
                  `à l'immeuble  «${formValues.immeuble}», `}
              </strong>
              <strong>
                {formValues.etage != 0
                  ? `à l'étage ${formValues.etage} `
                  : ' au RDC '}
              </strong>
              numéro <strong>{formValues.bien_numero}</strong> situé à{' '}
              <strong>{formValues.adresse_projet}</strong> , consistant à{' '}
              <strong>{formValues.type}</strong> à usage {"d'"}habitation {"d'"}
              une superficie approximative de{' '}
              <strong>{formValues.superficie_habitable}</strong> m²
              {formValues.isParkingAvailable && (
                <>
                  ,avec un parking de superficie{' '}
                  <strong>{formValues.superficie_parking} m²</strong> de
                  prix&nbsp;
                  <strong>
                    {formValues.prix_parking.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    DH
                  </strong>
                </>
              )}
              , le bien faisant partie {"d'"}un ensemble immobilier actuellement
              en cours {"d'"}achèvement, faisant {"l'"}objet {"d'"}un titre
              foncier mère Numéro <strong>{formValues.titre_foncier}</strong>,
              et donne en conséquence quittance définitive et entière pour la
              dite somme.
            </p>

            {/* Montant de la quittance */}
            <h3 className="mb-4 text-lg font-bold underline">
              DONT QUITTANCE POUR LA SOMME DE{' '}
              <span className="ml-2.5">
                <strong>
                  {formValues.montant.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </span>
              &nbsp; DH
            </h3>

            {/* Mention du prix de la propriété */}
            <p className="mb-4 font-bold">
              Etant précisé que le prix de la propriété objet de la présente
              quittance est de
              <span className="ml-2.5">
                <strong>
                  {formValues.prix.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </span>
              &nbsp;
              <span className="font-bold">DH</span>.
            </p>

            {/* Ajustement de prix en fonction de la superficie */}
            <p className="mb-4 font-semibold">
              Etant entendu que {"s'il"} existerait une différence de métrage
              entre la superficie définitive telle {"qu'"}établie par le titre
              foncier et la superficie définie ci-dessus, le prix de vente sera
              ajusté en conséquence en plus ou en moins sur la base du prix de
              vente au mètre carré.
            </p>

            {/* Signature */}
            <h3 className="text-right text-lg font-bold underline">
              {formValues.raison_social}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrevisualiserRecu;
