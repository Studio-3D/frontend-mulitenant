'use client';

import React, { useEffect, useState } from 'react';
import ReservaionTable from './ReservationTable';
import ReservationForm from './ReservationForm';


import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { isAdmin, isSuperAdmin, isCommercial } from '../../../../configs/enum';
import { useAuth } from '../../../../context/AuthContext';
import VenteNavbar from '@/components/VenteNavbar';

export default function Page(dataClient) {
  const ACTION = { EDIT: 'edit', ADD: 'add' };
  const [child, setChild] = useState(null);

  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();
 

  const searchParams = useSearchParams();
  useEffect(() => {
    if (!searchParams) return;

    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if ((action == ACTION.ADD && !isSuperAdmin(userRole) && !isAdmin(userRole)&& !isCommercial(userRole)) || (action == ACTION.EDIT && isNaN(parseInt(id)))) {
      router.push('/')

      return
    }
    let newChild = determineChildComponent(action, id);
    setChild(newChild);
  }, [searchParams,router]);



  // Fonction pour déterminer le composant enfant en fonction de l'action et de l'id
  const determineChildComponent = (action, id) => {
    if (action === ACTION.ADD) {
      return <ReservationForm />;
    } else if (!isNaN(parseInt(id)) && action === ACTION.EDIT) {
      return <ReservationForm id={id} />;
    } else {
      console.warn('Invalid action or missing id:', action, id); // Debugging

      return null;
    }
  };
  const clientId = dataClient?.dataClient?.id;
  return (
    <div>
      {child ? (
        child
      ) : (
        <>
          <div>
            {!clientId && (
              <>
                 <VenteNavbar /> 
              </>
            )}
            <ReservaionTable dataClient={dataClient}  />
          </div>
        </>
      )}
    </div>
  );
}
