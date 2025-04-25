'use client';

import React, { useEffect, useState } from 'react';
import VisiteTable from './VisiteTable';
import VisiteForm from './VisiteForm';

import VisiteFormEdit from './VisiteFormEdit';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { isAdmin, isSuperAdmin, isCommercial } from '../../../../configs/enum';
import { useAuth } from '../../../../context/AuthContext';
import CRMNavbar from '@/components/CRMNavbar';

export default function Page(dataProspect,dataClient) {
  const ACTION = { EDIT: 'edit', ADD: 'add' };
  const [child, setChild] = useState(null);

  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();
  useEffect(() => {
    if (
      !isAdmin(userRole) &&
      !isSuperAdmin(userRole) &&
      !isCommercial(userRole)
    ) {
      router.push('/');
    }
  }, [router]);

  const searchParams = useSearchParams();
  useEffect(() => {
    if (!searchParams) return;

    const id = searchParams.get('id');
    const action = searchParams.get('action');

    let newChild = determineChildComponent(action, id);
    setChild(newChild);
  }, [searchParams]);

  // Fonction pour déterminer le composant enfant en fonction de l'action et de l'id
  const determineChildComponent = (action, id) => {
    if (action === ACTION.ADD) {
      return <VisiteForm />;
    } else if (!isNaN(parseInt(id)) && action === ACTION.EDIT) {
      return <VisiteFormEdit id={id} />;
    } else {
      console.warn('Invalid action or missing id:', action, id); // Debugging

      return null;
    }
  };
  const clientId = dataClient?.dataClient?.id;
  const prospectId = dataProspect?.dataProspect?.id;
  return (
    <div>
      {child ? (
        child
      ) : (
        <>
          <div>
            {!clientId && !prospectId && (
              <>
                <CRMNavbar />
              </>
            )}
            <VisiteTable dataClient={dataClient} dataProspect={dataProspect} />
          </div>
        </>
      )}
    </div>
  );
}
