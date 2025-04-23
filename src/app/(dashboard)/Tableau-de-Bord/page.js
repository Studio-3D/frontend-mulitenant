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
        <div className='flex flex-col gap-6 '>
          {/* Stats Section */}
          <div className=''>
            <div className='flex flex-col gap-4 '>
              {/* Penalties */}
              <div className='lg:h-[180px] bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 pl-3'>
                <h3 className='text-sm font-medium text-gray-500'>Penalités</h3>
                <p className='text-lg font-bold'>$6643 <span className='text-green-500 text-sm'>+3.5% ↑</span></p>
                <p className='text-xs text-gray-400'>comparé à ($23540 l'année dernière)</p>
              </div>
              
              {/* Remboursement */}
              <div className='lg:h-[180px] bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 pl-3'>
                <h3 className='text-sm font-medium text-gray-500'>Remboursement</h3>
                <p className='text-lg font-bold'>$7265 <span className='text-green-500 text-sm'>+3.5% ↑</span></p>
                <p className='text-xs text-gray-400'>comparé à ($23540 l'année dernière)</p>
              </div>
            </div>
          </div>

          {/* Appels Section */}
          <div className='lg:h-[100%] bg-white rounded-lg shadow-md p-4 '>
            <h3 className='font-medium mb-3'>Appels</h3>
            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Appels entrants</span>
                <span className='font-bold'>50%</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Appels sortants</span>
                <span className='font-bold'>30%</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm'>Appels manqués</span>
                <span className='font-bold'>20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page