'use client';
import React from 'react';

export function VisitCard(props) {
  const { children } = props;
  
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300" />
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300" />
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl shadow-blue-100/20">
        {children}
      </div>
    </div>
  );
}