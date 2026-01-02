'use client'

import React, { useEffect, useState } from 'react'
import RemiseCleTable from './RemiseCleTable'
import RemiseCleForm from './RemiseCleForm'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const ACTION = { EDIT: 'edit', ADD: 'add' }
  const [child, setChild] = useState(null)

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
