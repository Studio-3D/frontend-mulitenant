'use client';
import React, { useEffect, useState } from 'react';
import { ClientDetails } from '@/components/visites/ClientDetails';
import { VisitDetails } from '@/components/visites/VisitDeatils';
import axios from 'axios';
import { APIURL, ENDPOINTS } from '../../configs/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpin from '@/components/LoadingSpin';

export function ClientDetailsPage(visiteId) {
  const [loading, setLoading] = useState(true); // Add a loading state
  const [visites_all, setvisites_all] = useState([]);
  const [visites_all_show, setvisites_all_show] = useState([]);
  const [visite, setvisite] = useState(null);
  const [value, setValue] = useState('');
  const [last_related_id, setLast_Related_id] = useState(0);

  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');

  const fetch_visite = async () => {
    if (Number(visiteId.visiteId)) {
      setLoading(true); // Data is loaded, set loading to false

      axios
        .get(`${APIURL.VISITES}/${Number(visiteId.visiteId)}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setvisites_all(response.data.visites);
          setvisites_all_show(response.data.visites_show);
          setvisite(response.data.visite);

          for (
            var i = 0;
            i <= Number(response.data.visites_show.length) - 1;
            i++
          ) {
            if (i == 0) {
              setLast_Related_id(response.data.visites_show[0].related_show_id);
              if (localStorage.getItem('v_id_org') != visiteId) {
                setValue(response.data.visites_show[0].related_show_id);
              } else {
                //get item de quel cadre va s'afficher on cas d'ajouter n visite et le modal de garder annulder frein s'affiche==> va vous rediriger verd le cadre v perdu
                setValue(`${localStorage.getItem('v_id_cadre')}`);
              }
            }
          }
          setLoading(false); // Data is loaded, set loading to false
        })
        .catch((error) => {
          console.error('Error fetching visite details:', error);
          setLoading(false); // Data is loaded, set loading to false
        });
    }
  };

  useEffect(() => {
    localStorage.setItem('v_id_cadre', null);
    localStorage.setItem('v_id_org', null);
    fetch_visite();
  }, []);

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
     // console.log('cron visite fetch shoow',localStorage.getItem('visite_fetch_show'))
      if (localStorage.getItem('visite_fetch_show') == 1) {
        fetch_visite();
        localStorage.removeItem('visite_fetch_show');
      }
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }
  return (
    <div className=" space-y-2">
      <ClientDetails Prospect={visite?.prospect} />
      <VisitDetails
        visites_all_show={visites_all_show}
        visites_all={visites_all}
        origin_id={visiteId.visiteId}
        last_related_id={last_related_id}
      />
    </div>
  );
}
