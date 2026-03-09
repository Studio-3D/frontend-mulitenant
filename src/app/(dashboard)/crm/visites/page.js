'use client';

import React, { useEffect, useState } from 'react';
import VisiteTable from './VisiteTable';
import VisiteForm from './VisiteForm';
import VisiteFormEdit from './VisiteFormEdit';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { isAdmin, isSuperAdmin, isCommercial, isRespoCommercial } from '../../../../configs/enum';
import { useAuth } from '../../../../context/AuthContext';

export default function VisitePage({ dataProspect, dataClient }) {
  const ACTION = { EDIT: 'edit', ADD: 'add' };
  const [child, setChild] = useState(null);

  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();

  useEffect(() => {
    if (
      user && 
      !isAdmin(userRole) &&
      !isSuperAdmin(userRole) &&
      !isCommercial(userRole)&&
      !isRespoCommercial(userRole)
    ) {
      router.push('/');
    }
  }, [user, userRole, router]);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const id = searchParams.get('id');
    const action = searchParams.get('action');

    console.log('VisitePage - URL params:', { id, action }); // Debug log

    let newChild = determineChildComponent(action, id);
    setChild(newChild);
  }, [searchParams]);

  const determineChildComponent = (action, id) => {
    // If there's an action, show the appropriate form
    if (action === ACTION.ADD) {
      return <VisiteForm />;
    } else if (id && action === ACTION.EDIT) {
      return <VisiteFormEdit id={id} />;
    } else {
      // IMPORTANT: When no action/id, return null to show the table
      // This is the case when accessing via tabs
      return null;
    }
  };

  // Debug logs
  console.log('VisitePage - dataProspect:', dataProspect);
  console.log('VisitePage - dataClient:', dataClient);
  console.log('VisitePage - child state:', child);

  if (!user) {
    return null;
  }

  return (
    <div>
      {child ? (
        child
      ) : (
        <div>
          {/* Show table when no forms are active */}
          <VisiteTable dataClient={dataClient} dataProspect={dataProspect}  searchParams={searchParams}/>
        </div>
      )}
    </div>
  );
}