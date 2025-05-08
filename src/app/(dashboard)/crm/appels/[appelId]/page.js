'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { APIURL, ENDPOINTS } from '../../../../../configs/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Button from '@/components/Button';
import JournalTable from './JournalTable';
import BreadCrumb from '../../../navigation/BreadCrumb';
import LoadingSpin from '@/components/LoadingSpin';

const AppelDetails = () => {
  const { token } = useAuth();
  const router = useRouter();
  const { appelId } = useParams();
  const accessToken = token || localStorage.getItem('accessToken');

  const [loading, setLoading] = useState(false);
  const [appelDetails, setAppelDetails] = useState({});
  const [activeTab, setActiveTab] = useState('journaux');

  const handleViewProspect = (prosId) => {
    window.open(`/crm/prospects/${prosId}`, '_blank');
  };

  const tabs = [
    { id: 'journaux', label: 'Journal des Appels', icon: '📜' },
  ];

  useEffect(() => {
    if (appelId) {
      setLoading(true);
      axios
        .get(`${APIURL.APPELS}/${appelId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          setAppelDetails(response.data.appel || {});
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [appelId, accessToken]);

  const handleTabClick = (tabId) => setActiveTab(tabId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  // Safely extract prospect
  const prospect = appelDetails?.prospect || {};

  return (
    <>
      <div className="flex items-center justify-start mb-2">
        <BreadCrumb baseUrl={ENDPOINTS.APPELS} step="Détail Appel" />
      </div>
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Prospect summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="text-center p-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-[#009FFF]">
                    {prospect.nom
                      ? prospect.nom.charAt(0).toUpperCase()
                      : 'P'}
                  </span>
                </div>
                <h1 className="text-xl font-semibold">
                  {`${prospect.nom || ''} ${prospect.prenom || ''}`.trim()}
                </h1>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mt-2">
                  {`Cin: ${prospect.cin || ''}`}
                </div>
              </div>

              <div className="p-6">
                <h6 className="font-semibold text-lg text-[#666CFF] mb-2">
                  Informations générales
                </h6>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Notifié:</span>
                    <span className="font-medium">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        prospect.notifie === 1
                          ? 'bg-[rgba(38,198,249,0.12)] text-[#26C6F9]'
                          : 'bg-[rgba(255,77,73,0.12)] text-[#FF4D49]'
                      }`}>
                        {prospect.notifie === 1 ? 'Oui' : 'Non'}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{prospect.email || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Téléphone 1:</span>
                    <span className="font-medium">{prospect.telephone || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Téléphone 2:</span>
                    <span className="font-medium">{prospect.telephone_num2 || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Origin:</span>
                    <span className="font-medium">{prospect.origin || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span className="font-medium">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        prospect.partenaire_id != null
                          ? 'bg-[rgba(102,108,255,0.12)] text-[#666CFF]'
                          : 'bg-[rgba(114,225,40,0.12)] text-[#72E128]'
                      }`}>
                        {prospect.partenaire_id != null
                          ? `Partenaire(${prospect.partenaire?.description || ''})`
                          : prospect.source?.source || ''}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 p-6">
                <Button
                  type="edit"
                  onClick={() => handleViewProspect(prospect.id)}
                >
                  Voir Prospect
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Tabs & content */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-6 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-b-2 border-[#009FFF] text-[#009FFF]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => handleTabClick(tab.id)}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {activeTab === 'journaux' && (
                  <div className="min-h-[400px]">
                    <JournalTable id={appelDetails.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppelDetails;
