'use client';

import React, { useEffect, useState } from 'react';
import PartenaireTable from './PartenaireTable';
import PartenaireForm from './PartenaireForm';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, isCommercial, isSuperAdmin } from '@/configs/enum';

export default function Page() {
  const ACTION = { EDIT: 'edit', ADD: 'add' };
  const [child, setChild] = useState(null);
  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();
  useEffect(() => {
    if (
      !isAdmin(userRole) &&
      !isSuperAdmin(userRole) 
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
      return <PartenaireForm />;
    } else if (!isNaN(parseInt(id)) && action === ACTION.EDIT) {
      return <PartenaireForm id={id} />;
    } else {
      console.warn('Invalid action or missing id:', action, id); // Debugging

      return null;
    }
  };

  return (
    <div>
      {child ? (
        child
      ) : (
        <>
          <div>
            <PartenaireTable />
          </div>
        </>
      )}
    </div>
  );
}
