import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

/**
 * ProtectedRoute: Redirects unauthenticated users to /login.
 * Uses Clerk's useAuth hook instead of Firebase.
 */
export default function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for Clerk to finish loading auth state
  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
