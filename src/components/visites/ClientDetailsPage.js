'use client';
import React from 'react';
import { ClientDetails } from '@/components/visites/ClientDetails';
import { VisitDetails } from '@/components/visites/VisitDeatils';



export function ClientDetailsPage() {
  return <div className=" space-y-2">
      <ClientDetails />
      <VisitDetails />
    </div>;
}