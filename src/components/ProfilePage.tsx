import { useState, useEffect } from "react";
import { useProfiles } from "../contexts/ProfilesContext";
import { Copy, CheckCircle, ExternalLink } from "lucide-react";
import InvitationForm from "./InvitationForm";
import { useAuthState } from "../utilities/firebase";

interface ProfilePageProps {
  userID: string;
}

export default function ProfilePage({ userID }: ProfilePageProps) {
  const { isLoading, getProfileById } = useProfiles();
  const profile = getProfileById(userID);
  const { user } = useAuthState();
  const isOwnProfile = user && profile && user.uid === profile.id;
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  // Reset image error when profile changes
  useEffect(() => {
    setImageError(false);
  }, [userID]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Profile not found</p>
        </div>
      </div>
    );
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch (e) {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = profile.email;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
    }
  };

  return (
    <>
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
        
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-5 py-12">
        {/* Profile Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        
          {/* Profile Photo and Name Section */}
          <div className="mb-8 flex items-start gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {profile.photoUrl && !imageError ? (
                <img
                  src={profile.photoUrl}
                  alt={`${profile.name}'s profile`}
                  className="h-24 w-24 rounded-full object-cover border-2 border-slate-200"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.log('Image failed to load:', e);
                    console.log('Image src was:', profile.photoUrl);
                    setImageError(true);
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully!');
                  }}
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
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Contact</h2>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3">
                <span className="text-slate-900">{profile.email}</span>
                <div className="flex gap-2">
                  <button
                    onClick={copyEmail}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Email
                      </>
                    )}
                  </button>
                </div>
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
                    <ExternalLink className="h-4 w-4" />
                    View LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8 pb-8 border-b border-slate-200">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">About</h2>
            <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-8 pb-8 border-b border-slate-200">
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
            <div className="mb-8 pb-8 border-b border-slate-200">
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

          {/* Invitation Form */}
          {user && !isOwnProfile && (
            <InvitationForm receiverId={profile.id} />
          )}
        </div>
      </div>
    </div>
    </>
  );
}