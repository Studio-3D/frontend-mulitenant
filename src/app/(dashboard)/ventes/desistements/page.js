'use client';

import { useEffect, useState ,useCallback} from 'react';
import axios from 'axios';
import {
  UserRoundMinus,
  UserRoundX,
  UsersRoundIcon,
  UserRoundCog,
  Repeat,
} from 'lucide-react';
import Changement_bien_list from '../desistements/List/Changement_bien_list';
import Desistement_dd_list from '../desistements/List/Desistement_dd_list';
import Desistement_dp_proche_list from '../desistements/List/Desistement_dp_proche_list';
import Desistement_dp_co_list from '../desistements/List/Desistement_dp_co_list';
import Desistement_dp_partiel_list from '../desistements/List/Desistement_dp_partiel_list';
import { APIURL } from '../../../../configs/api';
import VenteNavbar from '@/components/VenteNavbar';
import { useAuth } from '../../../../context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
const ViewDes = () => {
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem('tab_dst_active') != null
      ? localStorage.getItem('tab_dst_active')
      : 'dd'
  );
  const [nb_dd, setNb_dd] = useState(0);
  const [nb_dp_proche, setNb_dp_proche] = useState(0);
  const [nb_dp_partiel, setNb_dp_partiel] = useState(0);
  const [nb_dp_co, setNb_dp_co] = useState(0);
  const [nb_change_bien, setNb_change_bien] = useState(0);

  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const { selectedProjet } = useProjet();

const fetchData = useCallback(async () => {
    if (
      localStorage.getItem('etat_dst') == 5 ||
      localStorage.getItem('etat_dst') == 0
    ) {
      try {
        if (selectedProjet) {
          axios
            .get(
              `${APIURL.ROOTV1}/get_notif_dst_att_validation_par_type/${selectedProjet?.id}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )
            .then((response) => {
              setNb_dd(response.data.nb_dd);
              setNb_dp_proche(response.data.nb_dp_proche);
              setNb_dp_partiel(response.data.nb_dp_partiel);
              setNb_dp_co(response.data.nb_dp_co);
              setNb_change_bien(response.data.nb_change);
            })
            .catch((error) => {
              console.error('Error fetching data:', error);
            });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    localStorage.setItem('tab_dst_active', 'dd');
}, [selectedProjet, accessToken]); // Add dependencies here too


  useEffect(() => {
    fetchData();
  }, [selectedProjet]); // Add selectedProjet as dependency

  const handleChange = (value) => {
    console.log('value is ' + value);
    setActiveTab(value);
  };

  const tabs = [
    {
      id: 'dd',
      label: 'Définitif',
      icon: <UserRoundMinus className="w-5 h-5" />,
      count:
        localStorage.getItem('etat_dst') == 5 ||
        localStorage.getItem('etat_dst') == 0
          ? nb_dd
          : null,
      component: <Desistement_dd_list />,
    },
    {
      id: 'dp_proche',
      label: "Au Profit d' un Proche",
      icon: <UserRoundX className="w-5 h-5" />,
      count:
        localStorage.getItem('etat_dst') == 5 ||
        localStorage.getItem('etat_dst') == 0
          ? nb_dp_proche
          : null,
      component: <Desistement_dp_proche_list />,
    },
    {
      id: 'dp_co',
      label: "Au Profit d'un Co Réservataire",
      icon: <UsersRoundIcon className="w-5 h-5" />,
      count:
        localStorage.getItem('etat_dst') == 5 ||
        localStorage.getItem('etat_dst') == 0
          ? nb_dp_co
          : null,
      component: <Desistement_dp_co_list />,
    },
    {
      id: 'dp_partiel',
      label: 'Partiel',
      icon: <UserRoundCog className="w-5 h-5" />,
      count:
        localStorage.getItem('etat_dst') == 5 ||
        localStorage.getItem('etat_dst') == 0
          ? nb_dp_partiel
          : null,
      component: <Desistement_dp_partiel_list />,
    },
    {
      id: 'change_bien',
      label: 'Changement du bien',
      icon: <Repeat className="w-5 h-5" />,
      count:
        localStorage.getItem('etat_dst') == 5 ||
        localStorage.getItem('etat_dst') == 0
          ? nb_change_bien
          : null,
      component: <Changement_bien_list />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <VenteNavbar />
      <div className="">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              <div className="flex space-x-1 px-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleChange(tab.id)}
                    className={`p-3 text-sm font-medium rounded-t-lg flex items-center gap-2  transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`rounded-lg bg-white ${
                  activeTab == tab.id ? 'block' : 'hidden'
                }`}
              >
                <div className="overflow-hidden  rounded-lg shadow-sm">
                  {tab.component}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDes;
