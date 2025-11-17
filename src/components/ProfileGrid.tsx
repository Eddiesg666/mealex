import ProfileCard from './ProfileCard.tsx';
import { type Profile } from '../types/Profile.ts';
import { useAuthState } from '../utilities/firebase';

interface ProfileGridProps {
  selectedMajors: string[];
  selectedYears: string[];
  selectedTags: string[];
  profiles: Profile[];
}

const ProfileGrid = ({ selectedMajors, selectedYears, selectedTags, profiles }: ProfileGridProps) => {
  const { user } = useAuthState();
  
  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {profiles
        .filter(profile => selectedMajors.length === 0 || selectedMajors.includes(profile.major))
        .filter(profile => selectedYears.length === 0 || selectedYears.includes(profile.year))
        .filter(profile => {
          if (!selectedTags || selectedTags.length === 0) return true;
          if (!profile.interests) return false;
          // match if profile has at least one of the selected interests (case-insensitive)
          const profileTagsLower = profile.interests.map(t => t.toLowerCase());
          return selectedTags.some(tag => profileTagsLower.includes(tag.toLowerCase()));
        })
        .filter(profile => !user || user.uid !== profile.id)
        .map(profile => (
        <article
          key={profile.id}
          className="flex gap-3 rounded-xl bg-white p-4 shadow-sm transition duration-150 hover:-translate-y-1.5 hover:shadow-md"
        >
          <ProfileCard profile={profile}/>
        </article>
      ))}
    </section>
  )
}

export default ProfileGrid;