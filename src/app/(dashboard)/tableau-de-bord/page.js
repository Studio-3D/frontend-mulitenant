'use client'
import React from 'react'
import { VentesChart } from '../../../components/TableauDeBord/VentesChart'
import { VisitesChart } from '../../../components/TableauDeBord/VisitesChart'
import { AppelsChart } from '../../../components/TableauDeBord/AppelsChart'
import { Desistement} from '../../../components/TableauDeBord/Desistement'
import { EncaissementChart } from '@/components/TableauDeBord/EncaissementChart'

const page = () => {
  return (
    <div className=''>
      {/* Main grid layout */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Left column (2/3 width on lg screens) */}
        <div className='lg:col-span-2 space-y-4'>
          {/* Ventes Chart */}
          <div className=''>
            <EncaissementChart/>
          </div>
          <div className=''>
              <VentesChart/>
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
          <div className='flex flex-col gap-6'>
            {/* Penalties */}
            <div className=' bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-[#2CAFFE] pl-3'>
              <h3 className=' lg:text-2xl font-semibold lg:pb-4'>Penalités</h3>
              <p className='text-lg lg:text-3xl lg:pb-4 font-bold'>$66 643,60 <span className='text-green-500 text-sm lg:text-base'>+3.5% ↑</span></p>
              <p className='text-xs lg:text-lg text-gray-400'>comparé à ($23540 l'année dernière)</p>
            </div>
            
            {/* Remboursement */}
            <div className=' bg-white rounded-lg shadow-md p-4 lg:p-6 border-l-4 border-[#2CFE7F] pl-3'>
              <h3 className=' lg:text-2xl font-semibold lg:pb-4'>Remboursement</h3>
              <p className='text-lg lg:text-3xl lg:pb-4 font-bold'>$7265 <span className='text-green-500 text-sm lg:text-base'>+3.5% ↑</span></p>
              <p className='text-xs lg:text-lg text-gray-400'>comparé à ($23540 l'année dernière)</p>
            </div>
          </div>
        </div>

          
          {/* Appels Chart */}
          <div className='flex justify-between lg:h-[100%] bg-white rounded-lg shadow-md p-4 '>
          <AppelsChart/>
          </div>
          {/* Desistement Chart */}
          <div className='flex justify-between lg:h-[100%] bg-white rounded-lg shadow-md p-4 '>
            <Desistement/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page