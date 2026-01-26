import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/api/userApi';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Use sessionStorage for reliable cache persistence
const PROFILE_CACHE_KEY = 'sapien_profile_complete';
const CACHE_DURATION = 60000; // 60 seconds

// Synchronous function to check cache - called during render
const getProfileCacheSync = (): boolean | null => {
  try {
    const cached = sessionStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;

    const { hasCompletedProfile, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp < CACHE_DURATION) {
      return hasCompletedProfile;
    }

    sessionStorage.removeItem(PROFILE_CACHE_KEY);
    return null;
  } catch {
    return null;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();

  // CRITICAL: Check cache synchronously DURING render, not in effect
  const cachedProfileStatus = getProfileCacheSync();

  const [profileLoading, setProfileLoading] = useState(() => {
    // If cache says profile is complete, skip loading
    return cachedProfileStatus !== true;
  });
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(() => {
    // Initialize from cache
    return cachedProfileStatus;
  });

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!isAuthenticated) {
        setProfileLoading(false);
        return;
      }

      // If cache already says true, no need to fetch
      const cached = getProfileCacheSync();
      if (cached === true) {
        console.log('[ProtectedRoute] Cache says profile complete, skipping fetch');
        setHasCompletedProfile(true);
        setProfileLoading(false);
        return;
      }

      // If on registration page, assume incomplete without fetching
      if (location.pathname === '/registration') {
        setProfileLoading(false);
        setHasCompletedProfile(false);
        return;
      }

      try {
        console.log('[ProtectedRoute] Fetching user profile...');
        const response = await getUserProfile();
        const user = response?.user;
        const isProfileComplete = !!(user?.name && user.name.trim());

        console.log('[ProtectedRoute] Profile complete:', isProfileComplete);
        setHasCompletedProfile(isProfileComplete);
        setProfileCache(isProfileComplete);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setHasCompletedProfile(false);
      } finally {
        setProfileLoading(false);
      }
    };

    checkUserProfile();
  }, [isAuthenticated, location.pathname]);

  // Show loading while checking auth or profile
  if (authLoading || profileLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // CRITICAL: Check cache synchronously here too, to catch updates during navigation
  const currentCacheStatus = getProfileCacheSync();
  const effectiveProfileStatus = currentCacheStatus ?? hasCompletedProfile;

  console.log('[ProtectedRoute] Render check - cache:', currentCacheStatus, 'state:', hasCompletedProfile, 'effective:', effectiveProfileStatus);

  // Redirect to registration if profile is incomplete
  // But allow access to registration page itself
  if (effectiveProfileStatus === false && location.pathname !== '/registration') {
    console.log('[ProtectedRoute] Redirecting to registration');
    return <Navigate to="/registration" replace />;
  }

  return <>{children}</>;
};

// Export function to manually set cache
export const setProfileCache = (hasCompletedProfile: boolean) => {
  console.log('[setProfileCache] Setting cache to:', hasCompletedProfile);
  try {
    sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
      hasCompletedProfile,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Failed to set profile cache:', e);
  }
};

// Export function to invalidate cache
export const invalidateProfileCache = () => {
  console.log('[invalidateProfileCache] Clearing cache');
  sessionStorage.removeItem(PROFILE_CACHE_KEY);
};

export default ProtectedRoute;
