'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { APIURL, ENDPOINTS } from '../../../../../configs/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Button from '@/components/Button'; // adjust the path as needed
import HistoriquesTable from './HistoriquesTable';
import BreadCrumb from '../../../navigation/BreadCrumb';
import LoadingSpin from '@/components/LoadingSpin';
import VisiteTable from '../../visites/VisiteTable';
const ProspectDetails = () => {
  const { token } = useAuth();
  const router = useRouter();
  const { prospectId } = useParams(); // Use useParams() to access dynamic params
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState(false);
  const [prospectDetails, setProspectDetails] = useState([]);

  const [activeTab, setActiveTab] = useState('historiques'); // Default to 'historiques' if tab is not present

  const handleEdit = (id) => {
    router.push(`${ENDPOINTS.PROSPECTS}?id=${id}&action=edit`);
  };

  const tabs = [
    { id: 'historiques', label: 'Historiques', icon: '📜' },
    { id: 'visites', label: 'Visites', icon: '📅' },
  ];

  useEffect(() => {
    if (prospectId) {
      setLoading(true);
      axios
        .get(`${APIURL.PROSPECTS}/${prospectId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setProspectDetails(response.data.prospect);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [prospectId, accessToken]);
  const handleTabClick = (tab) => {
    // Set the active tab state
    setActiveTab(tab);
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpin /> {/* Use your loading spinner here */}
        </div>
      ) : (
        <>
          <div
            className="flex items-center justify-start"
            style={{ marginBottom: '8px' }}
          >
            <BreadCrumb
              baseUrl={ENDPOINTS.PROSPECTS}
              step={`Détail prospect`}
            />
          </div>
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Project Summary Card - Left Side */}
              <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="text-center p-6 border-b border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-[#009FFF]">
                        {prospectDetails.nom
                          ? prospectDetails.nom.charAt(0).toUpperCase()
                          : 'P'}
                      </span>
                    </div>
                    <h1 className="text-xl font-semibold">
                      {(prospectDetails?.nom || '') +
                        ' ' +
                        (prospectDetails?.prenom || '')}
                    </h1>
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mt-2">
                      {`Cin: ${prospectDetails?.cin || ''}`}
                    </div>
                  </div>

                  <div className="p-6">
                    <h6
                      className=" font-semibold leading-[1.2] text-lg"
                      style={{ color: '#666CFF', marginBottom: '10px' }}
                    >
                      Informations générales
                    </h6>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Notifié:</span>
                        <span className="font-medium">
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              prospectDetails?.notifie === 1
                                ? 'bg-[rgba(38,198,249,0.12)] text-[#26C6F9]'
                                : 'bg-[rgba(255,77,73,0.12)]  text-[#FF4D49]'
                            } `}
                          >
                            {prospectDetails?.notifie === 1 ? 'Oui' : 'Non'}
                          </span>
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">
                          {prospectDetails?.email}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone 1:</span>
                        <span className="font-medium">
                          {prospectDetails?.telephone}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone 2:</span>
                        <span className="font-medium">
                          {prospectDetails?.telephone_num2 === 'null'
                            ? ''
                            : prospectDetails?.telephone_num2 || ''}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Origin:</span>
                        <span className="font-medium">
                          {prospectDetails?.origin}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Source:</span>
                        <span className="font-medium">
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              prospectDetails?.partenaire_id !== null
                                ? 'bg-[rgba(102,108,255,0.12)] text-[#666CFF]'
                                : 'bg-[rgba(114,225,40,0.12)] text-[#72E128]'
                            } `}
                          >
                            {prospectDetails?.partenaire_id !== null
                              ? `Partenaire(${prospectDetails?.partenaire?.description})`
                              : prospectDetails?.source?.source}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 items-center mt-6 mb-6">
                    <Button
                      type="edit"
                      onClick={() => handleEdit(prospectDetails?.id)}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
              </div>

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
                              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => handleTabClick(tab.id)}
                        >
                          {tab.icon}
                          {tab.label}
                          {/* Optional additional spans for some tabs */}
                          {tab.id === 'historiques' && (
                            <span className="ml-1 text-xs"></span>
                          )}
                          {tab.id === 'visites' && (
                            <span className="ml-1 text-xs"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {activeTab === 'historiques' && (
                      <div className="min-h-[400px]">
                        <div className="min-h-[400px]">
                          <HistoriquesTable id={prospectDetails.id} />
                        </div>
                      </div>
                    )}

                    {activeTab === 'visites' && (
                      <div className="min-h-[400px]">
                     <VisiteTable dataProspect={prospectDetails} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProspectDetails;
