'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ServiceForm from './ReclamationClientForm'
import ServiceTable from './ReclamationClientTable'

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
      return <ServiceForm />
    } else if (!isNaN(parseInt(id)) && action === ACTION.EDIT) {
      return <ServiceForm id={id} />
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
          <div>
            <ServiceTable />
          </div>
        </>
      )}
    </div>
  )
}
