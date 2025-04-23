'use client'
import React from 'react'
import { EncaissementChart } from '../../../components/TableauDeBord/EncaissementChart'
import { VisitesChart } from '../../../components/TableauDeBord/VisitesChart'

const page = () => {
  return (
    <div className=''>
      {/* Main grid layout */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Left column (2/3 width on lg screens) */}
        <div className='lg:col-span-2 space-y-4'>
          {/* Encaissement Chart */}
          <div className=''>
              <EncaissementChart/>
          </div>
          
          {/* Visites Chart */}
          <div className=''>
              <VisitesChart/>
          </div>
        </div>

        {/* Right column (1/3 width on lg screens) */}
        <div className='bg-white rounded-lg shadow p-4'>
          <div className='h-full'>
            {/* Content Area - adjust height as needed */}
            <div className='flex flex-col h-full'>
              <h2 className='text-xl font-semibold mb-4'>Summary</h2>
              <div className='flex-1 grid gap-4'>
                {/* Example summary cards - customize as needed */}
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h3 className='font-medium'>Total Encaissements</h3>
                  <p className='text-2xl font-bold'>€24,560</p>
                </div>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <h3 className='font-medium'>Total Visits</h3>
                  <p className='text-2xl font-bold'>12,430</p>
                </div>
                <div className='bg-purple-50 p-4 rounded-lg'>
                  <h3 className='font-medium'>Conversion Rate</h3>
                  <p className='text-2xl font-bold'>3.2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page