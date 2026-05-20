'use client';

import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
// Add this import at the top
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Building2 as BusinessIcon,
  User as PersonIcon,
  Home as HomeIcon,
} from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';
import {APIURL, RESOURCE_URL } from '../../../../../../configs/api';

import { useAuth } from '../../../../../../context/AuthContext';
import { useParams } from 'next/navigation';

import { MODE_PAIEMENT } from '../../../../../../configs/enum';
import Image from 'next/image';

const PrevisualiserRecu = () => {
  const [loading_btn, setLoading_btn] = useState(false);
  const { Id } = useParams();
  const { user, token } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const selectedProjet = JSON.parse(localStorage.getItem('selectedProjet'));

  const [formValues, setFormValues] = useState({
    user: JSON.parse(localStorage.getItem('authUser')),
    imageUrl: `${RESOURCE_URL.DOCS}${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/logos/${user?.societe?.logo}` || '',
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
    bien_numero: '',
    prix: 0,
    mode_financement: '',
    clients: [],
    type: '',
    banque: '',
    clientsList: [],
    raison_social: user?.societe?.raison_sociale_concatene || '',
    capital: user?.societe?.capital || 0,
    adresse: user?.societe?.adresse || '',
     tel: user?.societe?.tel || '',
      email: user?.societe?.email || '',
    id_fiscal: user?.societe?.id_fiscal || '',
    registre_commerce: user?.societe?.registre_commerce || '',
    adresse_projet: '',
    etage: 0,
    superficie_parking: 0,
    isParkingAvailable: false,
    prix_parking: 0,
    numero_recu: '',
    date_recu: new Date().toLocaleDateString('fr-FR'),
    role_nom: user?.name + ' ' + user?.prenom,
    role: user?.role === 1
      ? 'Super Admin'
      : user?.role === 2
        ? 'Admin'
        : user?.role === 3
          ? 'Commercial'
          : user?.role === 5
            ? 'Notaire'
            : user?.role === 6
              ? 'Responsable Livraison'
              : user?.role === 7
                ? 'Comptable'
                : user?.role === 8
                  ? 'Service Après-Vente'
                  : user?.role === 9
                    ? 'Responsable Commercial'
                    : user?.role === 10
                      ? 'Agent de saisie'
                      : 'Utilisateur',
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
        prix: reservation.prix || 0,
        mode_financement: reservation.mode_financement || "",
        adresse_projet: projet.adresse || "",
        etage: bien.niveau || 0,
        superficie_parking: bien.superficie_parking || 0,
        prix_parking: bien.prix_parking || 0,
        isParkingAvailable: !!bien.superficie_parking,
        numero_recu: avance.num_recu || "",
        clientsList: (reservation.aquereurs || []).map((aquerreur) => ({
          nom: aquerreur.client?.nom || "",
          prenom: aquerreur.client?.prenom || "",
          civilite: aquerreur.client?.civilite || "Mr",
          type_client: aquerreur.client?.type_client || "",
          telephone_num1: aquerreur.client?.telephone_num1 || "",
          situation_familliale: aquerreur.client?.situation_familliale || "",
          cin: aquerreur.client?.cin || "",
          adresse: aquerreur.client?.adresse || "",
        })),
      }));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const updateClients = async () => {
    try {
      await Promise.all(
        formValues.clientsList.map(async (clientData, index) => {
          const originalClient = formValues.reservationDetails?.aquereurs[index]?.client;
          if (originalClient) {
            let civiliteValue;
            switch (clientData.civilite) {
              case 'MR': case 'Mr': case 'mr': case '1': civiliteValue = 1; break;
              case 'MME': case 'Mme': case 'mme': case '2': civiliteValue = 2; break;
              case 'MLLE': case 'Mlle': case 'mlle': case '3': civiliteValue = 3; break;
              default: civiliteValue = 1;
            }
            const updatedClient = {
              nom: clientData.nom,
              prenom: clientData.prenom,
              civilite: civiliteValue,
              type_client: clientData.type_client,
              telephone_num1: clientData.telephone_num1,
              situation_familliale: clientData.situation_familliale,
              cin: clientData.cin,
            };
            await axios.put(`${APIURL.CLIENTS}/${originalClient.id}`, updatedClient, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
          }
        })
      );
      return true;
    } catch (error) {
      console.error('Error updating clients:', error);
      return false;
    }
  };

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

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Helper function to convert number to words (French)
  const numberToWords = (num) => {
    const units = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      if (n < 20) return units[n];
      if (n < 100) {
        let unit = n % 10;
        let ten = Math.floor(n / 10);
        if (ten === 7 || ten === 9) {
          if (unit === 1) return tens[ten - 1] + ' et onze';
          return tens[ten - 1] + '-' + units[unit + 10];
        }
        if (unit === 1 && ten !== 8) return tens[ten] + ' et un';
        if (unit === 0) return tens[ten];
        if (ten === 8) return tens[ten] + '-' + units[unit];
        return tens[ten] + '-' + units[unit];
      }
      let hundred = Math.floor(n / 100);
      let rest = n % 100;
      if (rest === 0) return units[hundred] + ' cents';
      return units[hundred] + ' cent ' + convertLessThanThousand(rest);
    };

    const convert = (n) => {
      if (n === 0) return 'zéro';
      let result = '';
      if (n >= 1000000) {
        let millions = Math.floor(n / 1000000);
        result += convertLessThanThousand(millions) + ' million' + (millions > 1 ? 's' : '') + ' ';
        n %= 1000000;
      }
      if (n >= 1000) {
        let thousands = Math.floor(n / 1000);
        if (thousands === 1) result += 'mille ';
        else result += convertLessThanThousand(thousands) + ' mille ';
        n %= 1000;
      }
      if (n > 0) {
        result += convertLessThanThousand(n);
      }
      return result.trim();
    };

    return convert(Math.floor(num));
  };

  if (loading) {
    return (
      <div className="mt-6 flex flex-col items-center">
        <LoadingSpin />
      </div>
    );
  }

  // Get client names string
  const getClientNames = () => {
    return formValues.clientsList.map((clientData, index) => {
      const civilite = clientData.civilite == '1' ? 'Mr' : clientData.civilite == '2' ? 'Mme' : 'Mlle';
      return `${civilite} ${clientData.nom} ${clientData.prenom}`;
    }).join(', ');
  };

  // Get payment mode label
 
// Add this function before the return statement
const handleDownloadPDF = async () => {
  try {
    setLoading_btn(true);
    
    // Prepare the data to send to backend
    const pdfData = {
      user: {
       // ...formValues.user,
        societe: {
          raison_sociale_concatene: user?.societe?.raison_sociale_concatene,
          id: user?.societe?.id,
          logo: user?.societe?.logo,
          raison_social: formValues.raison_social,
          capital: formValues.capital,
          adresse: formValues.adresse,
          tel: formValues.tel,
          email: formValues.email,
          registre_commerce: formValues.registre_commerce,
          id_fiscal: formValues.id_fiscal,
        }
      },
      num_recu: formValues.numero_recu || '0053',
      clients: formValues.clientsList,
      reservationDetails: {
        //...formValues.reservationDetails,
        code_reservation: formValues.reservationDetails?.code_reservation,
      },
      bien: {
        propriete_dite_bien: formValues.propriete_dite_bien,
        type: formValues.type,
        bien_numero: formValues.bien_numero,
        projet: formValues.projet,
        adresse_projet: formValues.adresse_projet,
        tranche: formValues.tranche,
        bloc: formValues.bloc,
        immeuble: formValues.immeuble,
        superficie_habitable: formValues.superficie_habitable,
        prix: formValues.prix,
        titre_foncier: formValues.titre_foncier,
        isParkingAvailable: formValues.isParkingAvailable,
        superficie_parking: formValues.superficie_parking,
        prix_parking: formValues.prix_parking,
      },
      mode_paiement: formValues.mode_paiement,
      banque: formValues.banque,
      numero_paiement: formValues.numero_paiement,
      montant: formValues.montant,
      date_recu: formValues.date_recu,
      role_nom: formValues.role_nom,
      role: formValues.role,
    };

    const response = await axios.post(
      `${apiUrl}/generate_recu_vente_pdf`,
      { data: pdfData },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    );

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `recu_${formValues.numero_recu || 'versement'}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('PDF généré avec succès');
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Erreur lors de la génération du PDF');
  } finally {
    setLoading_btn(false);
  }
};
  return (
    <div className="flex">
      {/* Section Formulaire (30%) */}
      <div className="w-1/3 border-r-8 border-pink-100 bg-amber-50 p-8">
        <div className="mb-4 flex min-h-[30px] bg-white">
          <button
            onClick={() => handleTabChange(0)}
            className={`flex flex-1 items-center justify-center px-2 py-1.5 text-xs ${selectedTab == 0
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
              }`}
          >
            <BusinessIcon className="mr-1 h-4 w-4" />
            Société
          </button>
          <button
            onClick={() => handleTabChange(1)}
            className={`flex flex-1 items-center justify-center px-2 py-1.5 text-xs ${selectedTab == 1
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
              }`}
          >
            <PersonIcon className="mr-1 h-4 w-4" />
            Client
          </button>
          <button
            onClick={() => handleTabChange(2)}
            className={`flex flex-1 items-center justify-center px-2 py-1.5 text-xs ${selectedTab == 2
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500'
              }`}
          >
            <HomeIcon className="mr-1 h-4 w-4" />
            Bien
          </button>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between p-2">
          {selectedTab == 0 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Raison sociale</label>
                <input type="text" name="raison_social" value={formValues.raison_social || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Adresse</label>
                <input type="text" name="adresse" value={formValues.adresse || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Capital</label>
                  <input type="number" name="capital" value={formValues.capital || 0} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Registre Commerce</label>
                  <input type="text" name="registre_commerce" value={formValues.registre_commerce || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Id Fiscal</label>
                <input type="text" name="id_fiscal" value={formValues.id_fiscal || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
              </div>
            </div>
          )}

          {selectedTab == 1 && (
            <div className="space-y-4">
              {formValues.clientsList.map((clientData, index) => (
                <Fragment key={index}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Nom</label>
                      <input type="text" value={clientData.nom || ''} onChange={(e) => handleChangeClientList(index, 'nom', e.target.value)} className="w-full rounded border border-gray-300 p-2 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Prénom</label>
                      <input type="text" value={clientData.prenom || ''} onChange={(e) => handleChangeClientList(index, 'prenom', e.target.value)} className="w-full rounded border border-gray-300 p-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">CIN</label>
                    <input type="text" value={clientData.cin || ''} onChange={(e) => handleChangeClientList(index, 'cin', e.target.value)} className="w-full rounded border border-gray-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Adresse</label>
                    <input type="text" value={clientData.adresse || ''} onChange={(e) => handleChangeClientList(index, 'adresse', e.target.value)} className="w-full rounded border border-gray-300 p-2 text-sm" />
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">Civilité:</span>
                    <label className="mr-3 flex items-center"><input type="radio" checked={clientData.civilite == '1'} onChange={() => handleChangeClientList(index, 'civilite', '1')} className="mr-1" />Mr</label>
                    <label className="mr-3 flex items-center"><input type="radio" checked={clientData.civilite == '2'} onChange={() => handleChangeClientList(index, 'civilite', '2')} className="mr-1" />Mme</label>
                    <label className="flex items-center"><input type="radio" checked={clientData.civilite == '3'} onChange={() => handleChangeClientList(index, 'civilite', '3')} className="mr-1" />Mlle</label>
                  </div>
                  {index < formValues.clientsList.length - 1 && <div className="my-4 border-t border-blue-500 pt-1 text-blue-500"></div>}
                </Fragment>
              ))}
            </div>
          )}

          {selectedTab == 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Propriété dite bien</label>
                <input type="text" name="propriete_dite_bien" value={formValues.propriete_dite_bien || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Type</label>
                  <input type="text" name="type" value={formValues.type || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Projet</label>
                  <input type="text" name="projet" value={formValues.projet || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Tranche</label>
                  <input type="text" name="tranche" value={formValues.tranche || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Bloc</label>
                  <input type="text" name="bloc" value={formValues.bloc || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Immeuble</label>
                  <input type="text" name="immeuble" value={formValues.immeuble || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Etage</label>
                  <input type="text" name="etage" value={formValues.etage} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Appartement N°</label>
                  <input type="text" name="bien_numero" value={formValues.bien_numero || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Titre foncier</label>
                  <input type="text" name="titre_foncier" value={formValues.titre_foncier || ""} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Superficie (m²)</label>
                <input type="number" name="superficie_habitable" value={formValues.superficie_habitable || 0} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Prix de vente convenu (DH)</label>
                <input type="number" name="prix" value={formValues.prix || 0} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Montant du versement (DH)</label>
                <input type="number" name="montant" value={formValues.montant || 0} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Mode de paiement</label>
                <select name="mode_paiement" value={formValues.mode_paiement} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm">
                  <option value="">Sélectionner</option>
                  {Object.values(MODE_PAIEMENT)?.map((mode) => (
                    <option key={mode.code} value={mode.code}>{mode.label}</option>
                  ))}
                </select>
              </div>
              {formValues.mode_paiement != 1 && formValues.mode_paiement != null && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Banque</label>
                    <input type="text" name="banque" value={formValues.banque} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">N° Chèque/Virement</label>
                    <input type="text" name="numero_paiement" value={formValues.numero_paiement} onChange={handleChange} className="w-full rounded border border-gray-300 p-2 text-sm" />
                  </div>
                </>
              )}
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

          <div className="mb-4 mt-4 rounded-md border-2 border-amber-400 bg-amber-50 p-3 text-center font-medium text-amber-800">
            <span className="font-bold">NOTE :</span> Ces changements seront appliqués sur le récépissé seulement.
          </div>
          <div className="mt-10">
            <button
              onClick={handleDownloadPDF}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-indigo-700 ${
                loading_btn ? 'opacity-50' : ''
              }`}
              title="Télécharger PDF"
              disabled={loading_btn}
            >
              {loading_btn ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin inline" />
                  Génération en cours...
                </>
              ) : (
                'Télécharger le PDF'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Section de prévisualisation - MODÈLE REÇU DE VERSEMENT (PARTIE DROITE) */}
      <div className="w-2/3 bg-white p-6">
        <div className="max-w-3xl mx-auto">

          {/* Première ligne: Logo à gauche seulement */}
          <div className="flex justify-start items-start mb-2">
            {user?.societe?.logo ? (
              <div className="relative w-24 h-24">
                <Image
                  src={`${RESOURCE_URL.DOCS}/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`}
                  alt={`Logo de ${user.societe.raison_sociale_concatene}`}
                  fill
                  className="object-contain"
                  sizes="96px"
                  unoptimized={process.env.NODE_ENV !== 'production'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-company-logo.png';
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded">
                <BusinessIcon className="h-12 w-12 text-gray-500" />
              </div>
            )}
          </div>

          {/* Deuxième ligne: REÇU et numéro au centre */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wide">REÇU</h1>
            <p className="text-xl font-semibold mt-1">N° {formValues.numero_recu || '0053'}</p>
          </div>


        <div className="border-t border-gray-400 my-4"></div>

        {/* LE SOUSSIGNÉ - Informations de la société */}
       <div className="mb-6">
        <h3 className="text-lg font-bold underline mb-2">LE SOUSSIGNÉ:</h3>
        <p className="mb-2">
          La société <strong>«{formValues.raison_social || ' '}»</strong>,
          à responsabilité limitée de droit Marocain, au capital social de{' '}
          <strong>{formValues.capital || 0}</strong> de dirhams, ayant son siège
          social à <strong>{formValues.adresse || ' '}</strong>, immatriculée au
          registre du commerce sous n°{' '}
          <strong>{formValues.registre_commerce || ' '}</strong> et dont le numéro
          de l{"'"}identifiant fiscal est le n°{' '}
          <strong>{formValues.id_fiscal || ' '}</strong>.
        </p>
        {/*<div className="ml-4">
          <p className="mt-2">
            <span className="font-medium">Je soussigné(e) :</span>{' '}
            <span className="inline-block">
              {formValues.role_nom || ' '}
            </span>
          </p>
          <p>
            <span className="font-medium">Qualité :</span>{' '}
            <span className="inline-block">
              {formValues.role || ' '}
            </span>
          </p>
        </div>*/}
      </div>

          {/* Déclare avoir reçu de */}
          <div className="mb-6">
            <h2 className="font-bold text-lg underline mb-2">Déclare avoir reçu de :</h2>
            <div className="ml-4 space-y-1">
              <p>
                <span className="font-medium">Nom du réservataire :</span>{' '}
                <span className="inline-block">
                  {getClientNames() || ' '}
                </span>
              </p>
              <p>
                <span className="font-medium">CIN :</span>{' '}
                <span className="inline-block">
                  {formValues.clientsList.map(c => c.cin).filter(Boolean).join(', ') || ' '}
                </span>
              </p>
              <p>
                <span className="font-medium">Adresse :</span>{' '}
                <span className="inline-block">
                  {formValues.clientsList.map(c => c.adresse).filter(Boolean).join(', ') || ' '}
                </span>
              </p>
            </div>
          </div>

          {/* La somme de */}
          <div className="mb-6">
            <h2 className="font-bold text-lg underline mb-2">La somme de :</h2>
            <div className="ml-4 space-y-1">
              <p>
                <span className="font-medium">Montant en chiffres :</span>{' '}
                <span className="inline-block">
                  {formatCurrency(formValues.montant)} MAD
                </span>
              </p>
              <p>
                <span className="font-medium">Montant en lettres :</span>{' '}
                <span className="inline-block">
                  {numberToWords(formValues.montant)} dirhams marocains
                </span>
              </p>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="mb-6">
            <h2 className="font-bold text-lg underline mb-2">Mode de paiement :</h2>
            <div className="ml-4 space-y-1">
              <p>
                <input type="checkbox" className="mr-2" checked={formValues.mode_paiement == 1} readOnly />
                <span className="font-medium">Espèces</span>
              </p>
              <p>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={[2, 3, 4].includes(parseInt(formValues.mode_paiement))}
                  readOnly
                />
                <span className="font-medium">
                  {formValues.mode_paiement == 2 && 'Chèque'}
                  {formValues.mode_paiement == 3 && 'Chèque de banque'}
                  {formValues.mode_paiement == 4 && 'Chèque certifié'}
                  {![2, 3, 4].includes(parseInt(formValues.mode_paiement)) && 'Chèque'}
                </span>
                {[2, 3, 4].includes(parseInt(formValues.mode_paiement)) && (
                  <>
                    <span className="ml-2">n° :</span>{' '}
                    <span className="inline-block">
                      {formValues.numero_paiement || ' '}
                    </span>
                    <span className="ml-2">Banque :</span>{' '}
                    <span className="inline-block">
                      {formValues.banque || ' '}
                    </span>
                  </>
                )}
              </p>
              <p>
                <input type="checkbox" className="mr-2" checked={formValues.mode_paiement == 5} readOnly />
                <span className="font-medium">Virement bancaire</span>
                {formValues.mode_paiement == 5 && (
                  <>
                    <span className="ml-2">(référence :</span>{' '}
                    <span className="inline-block">
                      {formValues.numero_paiement || ' '}
                    </span>
                    )
                  </>
                )}
              </p>
              <p>
                <input type="checkbox" className="mr-2" checked={formValues.mode_paiement == 6} readOnly />
                <span className="font-medium">Versement</span>
                {formValues.mode_paiement == 6 && (
                  <>
                    <span className="ml-2">n° :</span>{' '}
                    <span className="inline-block">
                      {formValues.numero_paiement || ' '}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          


          {/* Objet du paiement */}
          <div className="mb-6">
            <h2 className="font-bold text-lg underline mb-2">Objet du paiement :</h2>
            <div className="ml-4">
              <p className="mb-2">Acompte relatif à la réservation du bien suivant :</p>
              <div className="ml-4 space-y-1">
                <p><span className="font-medium">- Propriété dite bien :</span> {formValues.propriete_dite_bien || ' '}</p>
                <p><span className="font-medium">- {formValues.type || 'Appartement'} n° :</span> {formValues.bien_numero || ' '}</p>
                <p><span className="font-medium">- Résidence :</span> {formValues.projet || ' '}</p>
                <p><span className="font-medium">- Adresse du bien :</span> {formValues.adresse_projet || ' '}</p>
                  {formValues.tranche!='' && (
                <p><span className="font-medium">- Tranche :</span> {formValues.tranche || ' '}</p>
                 )}
                 {formValues.bloc!='' && (
                <p><span className="font-medium">- Bloc :</span> {formValues.bloc || ' '}</p>
                 )}
                {formValues.immeuble!='' && (
                <p><span className="font-medium">- Immeuble :</span> {formValues.immeuble || ' '}</p>
                )}
                <p><span className="font-medium">- Superficie :</span> {formValues.superficie_habitable || ' '} m²</p>
                <p><span className="font-medium">- Prix de vente convenu :</span> {formatCurrency(formValues.prix)} DH</p>
                <p><span className="font-medium">- Titre Foncier :</span> {formValues.titre_foncier || ' '}</p>
                {/* Parking information - added after Titre Foncier */}
                {formValues.isParkingAvailable && (
                  <>
                    <p><span className="font-medium">- Parking :</span> Oui</p>
                    <p><span className="font-medium">- Superficie parking :</span> {formValues.superficie_parking || ' '} m²</p>
                    <p><span className="font-medium">- Prix parking :</span> {formatCurrency(formValues.prix_parking)} DH</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Référence du contrat de réservation */}
          <div className="mb-6">
            <h2 className="font-bold text-lg underline mb-2">Référence du contrat de réservation :</h2>
            <div className="ml-4">
              <p>
                <span className="font-medium">N° :</span>{' '}
                <span className="inline-block">
                  {formValues.reservationDetails?.code_reservation || ' '}
                </span>
                <span className="ml-2 font-medium">en date du :</span>{' '}
                <span className="inline-block">
                  {formValues.date_recu || ' '}
                </span>
              </p>
            </div>
          </div>

          {/* Observation */}
          <div className="mb-6">
            <h2 className="font-bold text-lg underline mb-2">Observation :</h2>
            <div className="ml-4">
              <p className="italic">
                Ce montant sera imputé sur le prix de vente définitif conformément au contrat de réservation signé entre les parties.
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-8 flex justify-between items-end">
            <div>
              <p className="font-medium">Fait à : Casablanca, Le : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="text-right">
              <p className="font-bold underline mb-2">Signature du vendeur</p>
              <p className="font-bold text-lg mt-4">Société :{formValues.raison_social || ' '}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrevisualiserRecu;