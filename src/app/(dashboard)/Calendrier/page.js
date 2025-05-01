'use client';
import React from 'react'
import { ClientDetailsPage } from '../../../components/visites/ClientDetailsPage';

const page = () => {
  return (
    <div className="flex w-full bg-slate-50">
    {/* This is where your sidebar would be */}
    <div className="">
      {/* This is where your header would be */}
      <ClientDetailsPage />
    </div>
  </div>
  )
}

export default page
