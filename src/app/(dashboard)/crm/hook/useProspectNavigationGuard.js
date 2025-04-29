'use client';  // This ensures we're in the client-side context

import { useState, useEffect, useRef } from 'react';

const useProspectNavigationGuard = () => {
  const [showModal, setShowModal] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const allowNavigation = useRef(false);

  // Block page unload (tab close or refresh)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (localStorage.getItem('selectedProspect')) {
        e.preventDefault();
        e.returnValue = '';  // Default confirmation
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Handle manual navigation using window.location (for App Router)
  const handleManualNavigation = (url) => {
    const hasProspect = localStorage.getItem('selectedProspect');
    if (hasProspect) {
      setShowModal(true);
      setNextUrl(url);
      throw 'Navigation blocked temporarily'; // Temporarily block navigation
    }
  };

  // Listen for navigation events
  useEffect(() => {
    // Override the window.location logic to show the modal
    const handleHashChange = () => {
      handleManualNavigation(window.location.href);
    };

    // Listen for manual navigation (such as when a user clicks a link)
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Confirm navigation (clear or keep the prospect)
  const confirmNavigation = (clear) => {
    if (clear) {
      localStorage.removeItem('selectedProspect');
    }

    allowNavigation.current = true;

    if (nextUrl) {
      window.location.href = nextUrl;  // Resume navigation
    }
  };

  return { showModal, confirmNavigation, setShowModal };
};

export default useProspectNavigationGuard;
