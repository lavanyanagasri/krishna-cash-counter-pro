import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

type Profile = {
  first_name: string;
  last_name: string;
  business_name: string;
  phone: string;
  address: string;
  avatar_url?: string;
};

type ProfileUpdate = Partial<Profile>;

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Load profile from localStorage or set default
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        // Set default profile for admin
        const defaultProfile: Profile = {
          first_name: 'Admin',
          last_name: 'User',
          business_name: 'Vaishnavi Jumbo Zerox',
          phone: '',
          address: '',
        };
        setProfile(defaultProfile);
        localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
      }
    } else {
      setProfile(null);
    }
  }, [user]);

  const updateProfile = (updates: ProfileUpdate) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const updatedProfile = { ...profile, ...updates } as Profile;
      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
    isUpdatingProfile: isLoading,
  };
};
