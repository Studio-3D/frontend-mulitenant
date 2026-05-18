'use client';
import { useEffect, useState } from 'react';
import LoadingSpin from '@/components/LoadingSpin';
import { APIURL } from '@/configs/api';
import axios from 'axios';
import PrestataireTable from '../../../prestataires/PrestataireTable';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, isSuperAdmin,isSav, isAgentAdministratif } from '@/configs/enum';
const ViewService = ({ serviceId }) => {
  const [Details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
      const {  user } = useAuth();
          const router = useRouter();
          const userRole = user?.role;
            
              useEffect(() => {
                if (
                  user && 
                  !isAdmin(userRole) &&
                  !isSuperAdmin(userRole) &&
                  !isSav(userRole) &&
                  !isAgentAdministratif(userRole)
                ) {
                  router.push('/');
                }
              }, [user, userRole, router]);
  useEffect(() => {
    if (!serviceId) return;

    axios
      .get(`${APIURL.ServicesPrestataires}/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      .then((res) => {
        setDetails(res.data.ser);
      })
      .catch((err) => console.error('Erreur API', err))
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <div className=" space-y-2">
      <PrestataireTable service={Details} />
    </div>
  );
};

export default ViewService;
