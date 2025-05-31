
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export const useAdmin = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && user.email === 'admin@vaishnavi.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user, profile]);

  return { isAdmin };
};
