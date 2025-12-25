'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpin from '@/components/LoadingSpin';
import { ClientDetails } from '@/components/visites/ClientDetails';
import { APIURL } from '@/configs/api';
import { useAuth } from '../../../../../../context/AuthContext';
import axios from 'axios';
import { useParams } from 'next/navigation';
import VisiteForm from '../../VisiteForm';

export default function Nouvel_Visite_Page() {
  const router = useRouter();
  //Id Origin
  const { Id } = useParams();

  const [first_visite, setFirst_visite] = useState(null);
  const { token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    axios
      .get(`${APIURL.ROOTV1}/edit_visite/${Id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setFirst_visite(response.data.visite);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);

        console.error('Error fetching projet details:', error);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      // console.log('cron visite fetch shoow',localStorage.getItem('visite_fetch_show'))
      if (localStorage.getItem('visite_fetch_show') == 1) {
        fetchData();
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
      <ClientDetails Prospect={first_visite?.prospect} />
      <VisiteForm origin={Id} prospect_id={first_visite?.prospect?.id} client_reservations={first_visite?.prospect?.client?.reservations} />
    </div>
  );
}
