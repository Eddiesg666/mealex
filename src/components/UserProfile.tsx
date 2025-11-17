import { useForm } from 'react-hook-form';
import { type Profile } from '../types/Profile.ts';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const currentYear = new Date().getFullYear();

// Zod schema for profile validation
const profileSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  major: z.string().min(1, 'Major is required'),
  year: z.union([
    z
      .string()
      .regex(/^\d{4}$/, 'Must be a 4-digit year')
      .refine(
        (val) => {
          const num = Number(val);
          return num >= currentYear && num <= 2100;
        },
        { message: `Graduation year must be between ${currentYear} and 2100` }
      ),
    z.literal('Graduate'),
  ]),
  bio: z
    .string()
    .min(1, 'Bio is required')
    .max(500, 'Bio must be less than 500 characters'),
  interests: z
    .array(z.string())
    .min(1, 'Add at least one interest')
    .max(5, 'Maximum 5 interests allowed'),
  mealPreference: z
    .array(z.string())
    .min(1, 'Add at least one meal preference')
    .max(5, 'Maximum 5 meal preferences allowed'),
  availability: z.array(z.string()).min(1, 'Add at least one availability'),
  linkedinUrl: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val === '') return true;
        return (
          val.includes('linkedin.com') ||
          val.startsWith('https://linkedin.com') ||
          val.startsWith('https://www.linkedin.com')
        );
      },
      { message: 'Please enter a valid LinkedIn URL' }
    ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: Profile;
  onCancel?: () => void;
  onSubmit: (data: Profile, isDirty: boolean) => Promise<void>;
  isFirstTime?: boolean;
}

const ProfileForm = ({
  profile,
  onCancel,
  onSubmit,
  isFirstTime = false,
}: ProfileFormProps) => {
  const [submitError, setSubmitError] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [availabilityInput, setAvailabilityInput] = useState<string>('');
  const [mealPreferenceInput, setMealPreferenceInput] = useState<string>('');
  const [isEditing, setIsEditing] = useState(isFirstTime);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    setValue,
  } = useForm<ProfileFormData>({
    defaultValues: profile
      ? {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          major: profile.major,
          year: String(profile.year),
          bio: profile.bio,
          interests: profile.interests || [],
          mealPreference: profile.mealPreference || [],
          availability: profile.availability || [],
          linkedinUrl: profile.linkedinUrl || '',
        }
      : undefined,
    mode: 'onChange',
    resolver: zodResolver(profileSchema),
  });

  const interests = watch('interests');
  const availability = watch('availability');
  const mealPreference = watch('mealPreference');

  const handleAddTag = () => {
    if (tagInput.trim() && !interests.includes(tagInput.trim())) {
      setValue('interests', [...interests, tagInput.trim()], {
        shouldDirty: true,
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'interests',
      interests.filter((tag) => tag !== tagToRemove),
      { shouldDirty: true }
    );
  };

  const handleAddAvailability = () => {
    if (
      availabilityInput.trim() &&
      !availability.includes(availabilityInput.trim())
    ) {
      setValue('availability', [...availability, availabilityInput.trim()], {
        shouldDirty: true,
      });
      setAvailabilityInput('');
    }
  };

  const handleRemoveAvailability = (availabilityToRemove: string) => {
    setValue(
      'availability',
      availability.filter((slot) => slot !== availabilityToRemove),
      { shouldDirty: true }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAvailabilityKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAvailability();
    }
  };

  const handleAddMealPreference = () => {
    if (
      mealPreferenceInput.trim() &&
      !mealPreference.includes(mealPreferenceInput.trim())
    ) {
      setValue('mealPreference', [...mealPreference, mealPreferenceInput.trim()], {
        shouldDirty: true,
      });
      setMealPreferenceInput('');
    }
  };

  const handleRemoveMealPreference = (preferenceToRemove: string) => {
    setValue(
      'mealPreference',
      mealPreference.filter((pref) => pref !== preferenceToRemove),
      { shouldDirty: true }
    );
  };

  const handleMealPreferenceKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMealPreference();
    }
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    console.log('Form submitted: ', data);
    try {
      if (onSubmit) {
        // ProfileFormData now matches Profile type completely
        await onSubmit(data as Profile, isDirty);
        // Switch back to display mode after successful save (unless it's first time)
        if (!isFirstTime) {
          setIsEditing(false);
        }
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save profile data'
      );
    }
  };

  return (
      <div className="flex-1 bg-white rounded-lg shadow-xl p-8">
        {!isEditing ? (
          // Static Profile Display
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Profile</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            </div>

            {/* Profile Display */}
            <div className="space-y-8">
              {/* Profile Photo and Name Section */}
              <div className="flex items-start gap-6">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt={`${profile.name}'s profile`}
                      className="h-24 w-24 rounded-full object-cover border-2 border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* Fallback avatar */
                    <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-300">
                      <span className="text-2xl font-bold text-slate-500">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name and Details */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-slate-900">{profile.name}</h1>
                  <p className="mt-2 text-slate-600">
                    {profile.major} • {profile.year}
                  </p>
                </div>
              </div>

              {/* Email Section */}
              <div className="pb-8 border-b border-slate-200">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">Contact</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-900">{profile.email}</span>
                  </div>

                  {/* LinkedIn URL */}
                  {profile.linkedinUrl && (
                    <div className="flex items-center gap-3">
                      <a
                        href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition font-medium"
                      >
                        View LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* About Section */}
              <div className="pb-8 border-b border-slate-200">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">About</h2>
                <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
              </div>

              {/* Interests Section */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="pb-8 border-b border-slate-200">
                  <h2 className="mb-3 text-sm font-semibold text-slate-700">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 border border-blue-200"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Meal Preference Section */}
              {profile.mealPreference && profile.mealPreference.length > 0 && (
                <div className="pb-8 border-b border-slate-200">
                  <h2 className="mb-3 text-sm font-semibold text-slate-700">
                    Meal Preference
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.mealPreference.map((preference) => (
                      <span
                        key={preference}
                        className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700 border border-purple-200"
                      >
                        {preference}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Section */}
              {profile.availability && profile.availability.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-slate-700">Availability</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.availability.map((slot) => (
                      <span
                        key={slot}
                        className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 border border-green-200"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Edit Form
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {isFirstTime ? 'Complete Your Profile' : 'Edit Your Profile'}
            </h2>
            {isFirstTime && (
              <p className="text-sm text-slate-600 mb-6">
                Tell us about yourself so other students can find you
              </p>
            )}

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              {/* Hidden ID field */}
              <input type="hidden" {...register('id')} />

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Full Name
                </span>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.name.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Email
                </span>
                <input
                  type="email"
                  {...register('email')}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 mt-1 shadow-sm text-gray-600 cursor-not-allowed"
                  placeholder="your.email@university.edu"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Email is pre-filled from your Google account
                </span>
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  LinkedIn Profile (Optional)
                </span>
                <input
                  type="url"
                  {...register('linkedinUrl')}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="https://www.linkedin.com/in/your-profile"
                />
                <span className="text-xs text-gray-500 mt-1 block">
                  Add your LinkedIn profile to help others connect with you
                  professionally
                </span>
                {errors.linkedinUrl && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.linkedinUrl.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Interests
                </span>
                <input
                  type="text"
                  {...register('major')}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="Computer Science"
                />
                {errors.major && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.major.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Graduation Year
                </span>
                <input
                  type="text"
                  {...register('year')}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder={`e.g. ${currentYear} (or "Graduate")`}
                />
                {errors.year && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.year.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Bio</span>
                <textarea
                  {...register('bio')}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 mt-1 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                {errors.bio && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.bio.message}
                  </span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Interests
                </span>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="Type an interest and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
                {errors.interests && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.interests.message}
                  </span>
                )}
                {interests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {interests.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Meal Preferences
                </span>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={mealPreferenceInput}
                    onChange={(e) => setMealPreferenceInput(e.target.value)}
                    onKeyPress={handleMealPreferenceKeyPress}
                    className="flex-1 rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="e.g. Vegetarian, Vegan, Halal, Kosher"
                  />
                  <button
                    type="button"
                    onClick={handleAddMealPreference}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
                  >
                    Add
                  </button>
                </div>
                {errors.mealPreference && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.mealPreference.message}
                  </span>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Add your dietary preferences or restrictions
                </div>
                {mealPreference.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mealPreference.map((preference) => (
                      <div
                        key={preference}
                        className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {preference}
                        <button
                          type="button"
                          onClick={() => handleRemoveMealPreference(preference)}
                          className="text-orange-600 hover:text-orange-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-gray-700">
                  Availability
                </span>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={availabilityInput}
                    onChange={(e) => setAvailabilityInput(e.target.value)}
                    onKeyPress={handleAvailabilityKeyPress}
                    className="flex-1 rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="e.g. Monday 9-11 AM, Weekdays after 3 PM"
                  />
                  <button
                    type="button"
                    onClick={handleAddAvailability}
                    className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition"
                  >
                    Add
                  </button>
                </div>
                {errors.availability && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.availability.message}
                  </span>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Add time slots when you're available to connect with others
                </div>
                {availability.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availability.map((slot) => (
                      <div
                        key={slot}
                        className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {slot}
                        <button
                          type="button"
                          onClick={() => handleRemoveAvailability(slot)}
                          className="text-green-600 hover:text-green-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </label>

              <div className="flex justify-left gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (onCancel && isFirstTime) {
                      onCancel();
                    }
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium cursor-pointer hover:bg-gray-200 transition"
                >
                  {isFirstTime ? 'Cancel' : 'Cancel Edit'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium cursor-pointer hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {isSubmitting
                    ? 'Saving...'
                    : isFirstTime
                      ? 'Create Profile'
                      : 'Save Changes'}
                </button>
              </div>
            </form>

            {submitError && (
              <div className="mt-4 text-red-600 font-medium">{submitError}</div>
            )}
          </div>
        )}
      </div>
  );
};

export default ProfileForm;
