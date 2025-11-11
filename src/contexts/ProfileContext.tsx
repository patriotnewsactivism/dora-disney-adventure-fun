import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  age: number;
  avatar_url: string | null;
}

interface ProfileContextType {
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  profiles: Profile[];
  loadProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('age', { ascending: false });
    
    if (!error && data) {
      setProfiles(data);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  return (
    <ProfileContext.Provider value={{ currentProfile, setCurrentProfile, profiles, loadProfiles }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};
