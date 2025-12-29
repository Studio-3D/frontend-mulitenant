'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ReclamationClient from './ReclamationClientTable'

export default function Page() {
  const ACTION = { EDIT: 'edit', ADD: 'add' }
  const [child, setChild] = useState(null)

  const searchParams = useSearchParams()
  useEffect(() => {
    if (!searchParams) return

  }, [searchParams])

  // Fonction pour déterminer le composant enfant en fonction de l'action et de l'id
 
  return (
    <div>
      {child ? (
        child
      ) : (
        <>
          <div>
            <ReclamationClient />
          </div>
        </>
      )}
    </div>
  )
}
