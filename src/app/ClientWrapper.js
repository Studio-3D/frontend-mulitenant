"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";
import LoadingSpin from "../components/LoadingSpin";

// Define public routes (no authentication required)
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function ClientWrapper({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run when auth state is determined
    if (!loading) {
      // Check if current path is a public route
      const isPublicRoute = publicRoutes.some(route => 
        pathname.startsWith(route)
      );
      
      // If user is NOT logged in AND trying to access protected route
      if (!user && !isPublicRoute) {
        console.log('User not logged in, accessing protected route:', pathname);
        
        // Don't save redirect for login page itself
        if (pathname !== '/login' && !pathname.includes('/logout')) {
          if(pathname=='/'){
          localStorage.setItem('redirectAfterLogin', '/tableau-de-bord');
          }else{
                      localStorage.setItem('redirectAfterLogin', pathname);

          }
          console.log('Saved redirectAfterLogin:', pathname);
        }
        // Redirect to login
        router.push('/login');
      }
      
      // If user IS logged in AND trying to access login/register pages
      if (user && isPublicRoute) {
        console.log('User logged in, accessing public route');
        
        // Check for saved redirect URL first
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        
        if (redirectUrl) {
          console.log('Found redirect URL, redirecting to:', redirectUrl);
          // Don't remove here - let login or projet dialog remove it after use
          router.push(redirectUrl);
        } else {
          router.push('/tableau-de-bord');
        }
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
        <LoadingSpin />
      </>
    );
  }

  // If not authenticated and trying to access protected route, show loading
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (!user && !isPublicRoute) {
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
        <LoadingSpin />
      </>
    );
  }

  // Otherwise, render children with Toaster
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {children}
    </>
  );
}