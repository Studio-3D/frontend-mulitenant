"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import toast from 'react-hot-toast';

export default function LinkedInCallback() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      
      if (error) {
        window.opener.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error }, window.location.origin);
        window.close();
        return;
      }
      
      if (!code || !state) {
        return; // Wait for query params to be available
      }
      
      // Verify state to prevent CSRF attacks
      const storedState = localStorage.getItem('linkedin_state');
      if (state !== storedState) {
        window.opener.postMessage({ 
          type: 'LINKEDIN_AUTH_ERROR', 
          error: 'Security validation failed' 
        }, window.location.origin);
        window.close();
        return;
      }
      
      try {
        // Exchange code for access token
        const token = localStorage.getItem("accessToken");
        const response = await axios.post(`${APIURL.ROOTV1}/linkedin/access-token`, 
          { code, state },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const { access_token, profile } = response.data;
        
        // Now share the post with the access token
        const shareContent = localStorage.getItem('linkedin_share_content');
        const mediaUrl = localStorage.getItem('linkedin_share_media_url');
        
        await axios.post(`${APIURL.ROOTV1}/linkedin/share`, 
          { 
            accessToken: access_token, 
            content: shareContent,
            visibility: 'PUBLIC',
            mediaUrl: mediaUrl
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Notify the opener about successful share
        window.opener.postMessage({ 
          type: 'LINKEDIN_SHARE_SUCCESS',
          profileName: `${profile?.localizedFirstName || ''} ${profile?.localizedLastName || ''}`
        }, window.location.origin);
      } catch (error) {
        window.opener.postMessage({ 
          type: 'LINKEDIN_SHARE_ERROR', 
          error: error.response?.data?.message || error.message 
        }, window.location.origin);
      } finally {
        // Clean up stored values
        localStorage.removeItem('linkedin_state');
        localStorage.removeItem('linkedin_share_content');
        localStorage.removeItem('linkedin_share_media_url');
        
        // Close this window
        setTimeout(() => window.close(), 1000);
      }
    };
    
    handleCallback();
  }, [searchParams]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-xl font-bold mb-4">Traitement de l'authentification LinkedIn...</h1>
        <p className="text-gray-600 mb-4">Cette fenêtre se fermera automatiquement.</p>
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}
