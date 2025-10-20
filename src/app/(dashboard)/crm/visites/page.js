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

// Fix: Properly destructure the props
export default function Page({ dataProspect, dataClient }) {
  // Add proper destructuring
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
  }, [router, userRole]); // Added userRole to dependencies

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const id = searchParams.get('id');
    const action = searchParams.get('action');

    let newChild = determineChildComponent(action, id);
    setChild(newChild);
  }, [searchParams]);

  const determineChildComponent = (action, id) => {
    if (action === ACTION.ADD) {
      return <VisiteForm />;
    } else if (!isNaN(parseInt(id)) && action === ACTION.EDIT) {
      return <VisiteFormEdit id={id} />;
    } else {
      console.warn('Invalid action or missing id:', action, id);
      return null;
    }
  };

  // Debug: Check what you're actually receiving
  console.log('dataProspect in page:', dataProspect);
  console.log('dataClient in page:', dataClient);

  const clientId = dataClient?.id; // Fixed: removed extra nesting
  const prospectId = dataProspect?.id; // Fixed: removed extra nesting

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
            {/* Pass the props correctly */}
            <VisiteTable dataClient={dataClient} dataProspect={dataProspect} />
          </div>
        </>
      )}
    </div>
  );
}
