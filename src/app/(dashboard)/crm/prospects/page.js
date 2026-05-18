'use client';

import React, { useEffect, useState } from 'react';
import ProspectTable from './ProspectTable';
import ProspectForm from './ProspectForm';
import { useSearchParams } from 'next/navigation';
import { isAdmin, isSuperAdmin, isCommercial, isRespoCommercial, isAgentAdministratif } from '../../../../configs/enum';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Page() {
  const ACTION = { EDIT: 'edit', ADD: 'add' };
  const [child, setChild] = useState(null);

  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (
      user && // Add null check for user
      !isAdmin(userRole) &&
      !isSuperAdmin(userRole) &&
      !isCommercial(userRole)&&
      !isRespoCommercial(userRole)&&
      !isAgentAdministratif(userRole)
    ) {
      router.push('/');
    }
  }, [user, userRole, router]);

  useEffect(() => {
    if (!searchParams) return;

    const id = searchParams.get('id');
    const action = searchParams.get('action');
    const view = searchParams.get('view'); // Get the view parameter

    let newChild = determineChildComponent(action, id, view);
    setChild(newChild);
  }, [searchParams]);

  // Function to determine child component based on action, id, and view
  const determineChildComponent = (action, id, view) => {
    if (action === ACTION.ADD) {
      return <ProspectForm />;
    } else if (!isNaN(parseInt(id)) && action === ACTION.EDIT) {
      return <ProspectForm id={id} />;
    } else {
      return null;
    }
  };

  // Determine if we should show only assigned prospects
  const showOnlyAssigned = searchParams?.get('view') === 'assigned';

  // Don't render anything if user is null (during logout process)
  if (!user) {
    return null;
  }

  return (
    <div>
      {child ? (
        child
      ) : (
        <>
          <div>
            <ProspectTable
              view={showOnlyAssigned ? 'assigned' : 'all'}
              searchParams={searchParams}
            />
          </div>
        </>
      )}
    </div>
  );
}
