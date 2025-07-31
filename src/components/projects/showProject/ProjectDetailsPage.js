'use client';
import React, { useState } from 'react';
import { LeftCard } from './LeftCard';
import { RightCard } from './RightCard';

export const ProjectDetailsPage = () => {
  // Mock data for the project
  const projectData = {
    id: 1,
    name: 'Résidence Les Jardins',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=200&auto=format&fit=crop',
    backgroundImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
    description: 'Complexe résidentiel moderne situé au cœur de la ville avec accès à toutes les commodités. Ce projet comprend des appartements de luxe et des espaces verts.',
    commercials: ['Sophie Martin', 'Thomas Dubois'],
    admins: ['Jean Dupont', 'Marie Leclerc'],
    counts: {
      bien: 24,
      tranche: 3,
      immeuble: 5,
      blocs: 2,
    },
  };

  // Mock data for tabs
  const tabsData = {
    bien: {
      count: 24,
      statuses: [
        {
          name: 'Disponible',
          count: 10,
          color: 'bg-green-500',
        },
        {
          name: 'Pré-réservé',
          count: 5,
          color: 'bg-yellow-500',
        },
        {
          name: 'Réservé',
          count: 3,
          color: 'bg-blue-500',
        },
        {
          name: 'Bloqué',
          count: 2,
          color: 'bg-red-500',
        },
        {
          name: 'Vendu',
          count: 3,
          color: 'bg-purple-500',
        },
        {
          name: 'En cours de proposition',
          count: 1,
          color: 'bg-orange-500',
        },
      ],
      items: [
        {
          id: 1,
          name: 'Appartement A1',
          type: 'T3',
          surface: '65m²',
          price: '250,000€',
          status: 'Disponible',
        },
        {
          id: 2,
          name: 'Appartement A2',
          type: 'T2',
          surface: '45m²',
          price: '180,000€',
          status: 'Pré-réservé',
        },
        {
          id: 3,
          name: 'Appartement A3',
          type: 'T4',
          surface: '85m²',
          price: '320,000€',
          status: 'Vendu',
        },
        {
          id: 4,
          name: 'Appartement A4',
          type: 'T3',
          surface: '68m²',
          price: '265,000€',
          status: 'Disponible',
        },
      ],
    },
    tranche: {
      count: 3,
      items: [
        {
          id: 1,
          name: 'Appartement A1',
          type: 'T3',
          surface: '65m²',
          price: '250,000€',
          status: 'Disponible',
        },
        {
          id: 2,
          name: 'Appartement A2',
          type: 'T2',
          surface: '45m²',
          price: '180,000€',
          status: 'Pré-réservé',
        },
        {
          id: 3,
          name: 'Appartement A3',
          type: 'T4',
          surface: '85m²',
          price: '320,000€',
          status: 'Vendu',
        },
        {
          id: 4,
          name: 'Appartement A4',
          type: 'T3',
          surface: '68m²',
          price: '265,000€',
          status: 'Disponible',
        },
      ],
    },
    immeuble: {
      count: 5,
      items: [],
    },
    blocs: {
      count: 2,
      items: [],
    },
  };

  const [activeTab, setActiveTab] = useState('bien');

  return (
    <div className="w-full ">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <div className="w-full lg:w-1/3">
          <LeftCard project={projectData} />
        </div>
        <div className="w-full lg:w-2/3">
          <RightCard
            tabsData={tabsData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
};