export type Profile = {
  id: string;
  photoUrl: string;
  name: string;
  email: string;
  major: string;
  year: string;
  bio: string;
  interests: string[];
  availability: string[];
  mealPreference: string[];
  linkedinUrl?: string;
}