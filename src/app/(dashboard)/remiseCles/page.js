'use client'

import React, { useEffect, useState } from 'react'
import RemiseCleTable from './RemiseCleTable'
import RemiseCleForm from './RemiseCleForm'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, isSuperAdmin,isCommercial } from '@/configs/enum';

export default function Page() {
  const ACTION = { EDIT: 'edit', ADD: 'add' }
  const [child, setChild] = useState(null)
 const {  user } = useAuth();
  const router = useRouter();
  const userRole = user?.role;
    
      useEffect(() => {
        if (
          user && 
          !isAdmin(userRole) &&
          !isSuperAdmin(userRole) &&
          !isCommercial(userRole)
        ) {
          router.push('/');
        }
      }, [user, userRole, router]);
  const searchParams = useSearchParams()
  useEffect(() => {
    if (!searchParams) return

    const id = searchParams.get('id')
    const action = searchParams.get('action')

    let newChild = determineChildComponent(action, id)
    setChild(newChild)
  }, [searchParams])

  // Fonction pour déterminer le composant enfant en fonction de l'action et de l'id
  const determineChildComponent = (action, id) => {
    if (action === ACTION.ADD) {
      return <RemiseCleForm />
    } else if (!isNaN(parseInt(id)) && action === ACTION.EDIT) {
      return <RemiseCleForm id={id} />
    } else {
      console.warn('Invalid action or missing id:', action, id) // Debugging

      return null
    }
  }

  return (
    <div>
      {child ? (
        child
      ) : (
        <>
          <div className='p-4 bg-white rounded-lg shadow-md'>
            <RemiseCleTable  searchParams={searchParams} />
          </div>
        </>
      )}
    </div>
  )
}
