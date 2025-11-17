import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useDataQuery } from '../utilities/firebase';
import type { Profile } from '../types/Profile';

interface ProfilesContextType {
  profiles: Profile[] | null;
  isLoading: boolean;
  error: Error | undefined;
  getProfileById: (id: string) => Profile | undefined;
}

const ProfilesContext = createContext<ProfilesContextType | undefined>(undefined);

interface ProfilesProviderProps {
  children: ReactNode;
}

export function ProfilesProvider({ children }: ProfilesProviderProps) {
  const [profiles, isLoading, error] = useDataQuery('/profiles');

  // Convert profiles object to array and add getProfileById helper
  const profilesArray = profiles ? Object.entries(profiles as Record<string, Profile>).map(([id, profile]) => ({
    ...profile,
    id
  })) : null;

  const getProfileById = (id: string): Profile | undefined => {
    if (!profilesArray) return undefined;
    return profilesArray.find(profile => profile.id === id);
  };

  const value: ProfilesContextType = {
    profiles: profilesArray,
    isLoading,
    error,
    getProfileById
  };

  return (
    <ProfilesContext.Provider value={value}>
      {children}
    </ProfilesContext.Provider>
  );
}

export function useProfiles(): ProfilesContextType {
  const context = useContext(ProfilesContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within a ProfilesProvider');
  }
  return context;
}