import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ProfileForm from '../components/UserProfile.tsx';
import type { Profile } from '../types/Profile.ts';
import { useAuthState } from '../utilities/firebase';
import { useProfiles } from '../contexts/ProfilesContext';
import { getDatabase, ref, set } from 'firebase/database';
import { StrictMode } from 'react';
import TopBar from '../components/TopBar.tsx';

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user, isInitialLoading } = useAuthState();
  const { getProfileById } = useProfiles();

  if (isInitialLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("User not found.")
    navigate({ to: '/landing' });
    return null;
  }

  // Check if user already has a profile
  const existingProfile = getProfileById(user.uid);
  const isFirstTime = !existingProfile;

  const emptyProfile: Profile = {
    id: user.uid,
    photoUrl: user.photoURL || '',
    name: user.displayName || '',
    email: user.email || '',
    major: '',
    year: '',
    bio: '',
    interests: [],
    availability: [],
    mealPreference: [],
    linkedinUrl: '',
  };

  const handleCancel = () => {
    navigate({ to: '/' });
  };

  const handleSubmit = async (data: Profile) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      const database = getDatabase();
      const profileData = {
        id: user.uid,
        photoUrl: user.photoURL || '',
        name: data.name,
        email: data.email,
        major: data.major,
        year: data.year,
        bio: data.bio,
        interests: data.interests,
        mealPreference: data.mealPreference,
        availability: data.availability,
        linkedinUrl: data.linkedinUrl || '',
      };

      await set(ref(database, `/profiles/${user.uid}`), profileData);
      // console.log('Profile saved successfully');
      navigate({ to: '/' });
    } catch (err) {
      console.error('Failed to save profile:', err);
      throw err;
    }
  };

  return (
    <StrictMode>
      <TopBar/>
      <div 
        className="flex gap-8 w-full max-w-6xl mx-auto"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}>
        <ProfileForm
          profile={existingProfile || emptyProfile}
          onCancel={isFirstTime ? undefined : handleCancel}
          onSubmit={handleSubmit}
          isFirstTime={isFirstTime}
        />
      </div>
    </StrictMode>
  );
}