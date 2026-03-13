'use client';
import React, { useEffect, useState } from 'react';
import { ClientDetails } from '@/components/visites/ClientDetails';
import { VisitDetails } from '@/components/visites/VisitDeatils';
import axios from 'axios';
import { APIURL } from '../../configs/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpin from '@/components/LoadingSpin';
import { useProjet } from '@/context/ProjetContext';
import { useRouter } from 'next/navigation';
import { isAdmin, isCommercial, isSuperAdmin } from '../user-utils';
import { isRespoCommercial } from '@/configs/enum';
import { useSociete } from '@/context/SocieteContext';

export function ClientDetailsPage(visiteId) {
  const [loading, setLoading] = useState(true);
  const [visites_all, setvisites_all] = useState([]);
  const [visites_all_show, setvisites_all_show] = useState([]);
  const [last_related_id, setLast_Related_id] = useState(0);
  const { selectedProjet } = useProjet();
  const { token ,user} = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const router = useRouter();

   const userRole = user?.role;
    useEffect(() => {
      if (
        !isAdmin(userRole) &&
        !isSuperAdmin(userRole) &&
        !isCommercial(userRole)&&
        !isRespoCommercial(userRole)
      
      ) {
        router.push('/');
      }
    }, [router]);
  // Simple cache et comparaison for return back en cas de changer projet
       const { selectedSociete } = useSociete();
        const [oldProjetId, setOldProjetId] = useState(null);
        const [oldSocieteId, setOldSocieteId] = useState(null);
      useEffect(() => {
    if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
      if (oldProjetId||oldSocieteId) {
        // Projet ou société a changé
        router.push('/crm?tab=visites');
      }
      setOldSocieteId(selectedSociete?.id)
      setOldProjetId(selectedProjet?.id);
    }
  }, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);
  const fetch_visite = async () => {
    if (Number(visiteId.visiteId)) {
      setLoading(true);

      axios
        .get(`${APIURL.VISITES}/${Number(visiteId.visiteId)}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setvisites_all(response.data.visites);
          setvisites_all_show(response.data.visites_show);

          // Set the last_related_id from the first item in visites_all_show
          if (response.data.visites_show.length > 0) {
            setLast_Related_id(response.data.visites_show[0].related_show_id);
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching visite details:', error);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetch_visite();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem('visite_fetch_show') == 1) {
        fetch_visite();
        localStorage.removeItem('visite_fetch_show');
      }
    }, 1000);

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
      {/* Use the first item from visites_all array for prospect data */}
      <ClientDetails Prospect={visites_all[0]?.prospect} />
      <VisitDetails
        visites_all_show={visites_all_show}
        visites_all={visites_all}
        origin_id={visiteId.visiteId}
        last_related_id={last_related_id}
      />
    </div>
  );
}
