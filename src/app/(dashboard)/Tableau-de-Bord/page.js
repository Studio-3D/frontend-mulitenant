'use client'
import React from 'react'

const page = () => {
  return (
    <div className=' flex flex-col gap-4 md:flex-row'>
      {/* left */}
      <div className='bg-gray-200  w-full lg:w-2/3 '>Content Area</div>
      {/* right */}
      <div className='bg-green-200 w-full lg:w-1/3 '>Content Area</div>
      
    </div>
  )
}

export default page
