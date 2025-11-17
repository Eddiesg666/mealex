import ProfileGrid from './components/ProfileGrid.tsx';
import FilterSidebar from './components/FilterSidebar.tsx';
import TopBar from './components/TopBar.tsx';
import { useState } from 'react';
import { useProfiles } from './contexts/ProfilesContext';

export default function App() {
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { profiles, isLoading, error } = useProfiles();

  if (error) return <h1>Error loading user data: {`${error}`}</h1>;
  if (isLoading) return <h1>Loading user data...</h1>;
  if (!profiles) return <h1>No user data found</h1>;

  return (
    <div 
      className="min-h-screen bg-slate-50"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Topbar */}
      <TopBar/>

      <div className="flex flex-col md:flex-row">
        <FilterSidebar
          selectedMajors={selectedMajors}
          setSelectedMajors={setSelectedMajors}
          selectedYears={selectedYears}
          setSelectedYears={setSelectedYears}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />

        <main className="flex-1">
          {/* Main container */}
          <div className="mx-auto max-w-6xl px-5 py-7">
            {/* Intro section */}
            <section className="mb-8 w-100 rounded-2xl bg-white border-r border-slate-200 p-5">
              <h2 className="m-0 text-2xl font-semibold">Browse profiles</h2>
              <p className="mt-1 text-slate-600">
                Find peers by major, year, and interests.
              </p>
            </section>

            {/* Cards grid */}
            <ProfileGrid
              selectedMajors={selectedMajors}
              selectedYears={selectedYears}
              selectedTags={selectedTags}
              profiles={profiles}
            />

            {/* Footer */}
            <footer className="mt-16 text-xs text-slate-600">
              {/* <p>
                Static mock – no functionality. Cards are intended to become
                reusable React components later.
              </p> */}
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}