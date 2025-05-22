'use client'

import React, { useEffect, useState } from 'react'
import EncaissementTable from './EncaissementTable'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  

  return (
    <div>
     
        <>
          <div>
            <EncaissementTable  />
          </div>
        </>
      
    </div>
  )
}
