// import { useState } from 'react';
import { useFilterOptions } from "../hooks/useFilterOptions.ts";
import SearchBar from './SearchBar'
import CheckboxFilter from './CheckboxFilter'

interface FilterSidebarProps {
  setSelectedMajors: (majors: string[]) => any;
  setSelectedYears: (years: string[]) => any;
  selectedMajors: string[];
  selectedYears: string[];
  selectedTags: string[];
  setSelectedTags: (interests: string[]) => any;
}

const FilterSidebar = ({ setSelectedMajors, setSelectedYears, selectedMajors, selectedYears, selectedTags, setSelectedTags }: FilterSidebarProps) => {
  const { years, majors, isLoading } = useFilterOptions();

  if (isLoading) {
    return <aside className="w-70 bg-slate-50 border-r border-slate-200 p-5">Loading filters...</aside>;
  }

  return (
    <aside className="w-70 h-screen bg-slate-50 border-r border-slate-200 p-5">
      <SearchBar selectedTags={selectedTags} setSelectedTags={setSelectedTags} />

      <div className="mt-6">
        <CheckboxFilter
          years={years}
          majors={majors}
          selectedYears={selectedYears}
          selectedMajors={selectedMajors}
          setSelectedYears={setSelectedYears}
          setSelectedMajors={setSelectedMajors}
        />
      </div>
    </aside>
  );
};

export default FilterSidebar;