'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

type Profile = {
  email: string;
  username: string;
  account_type: string;
  profile_picture_url: string | null;
  skills: string[] | null;
  main_skill: string | null;
  rating: number | null;
  created_at: string;
};

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('email, username, account_type, profile_picture_url, skills, main_skill, rating, created_at')
          .eq('username', username)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Profile not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-pulse">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative h-32 bg-purple-600">
            {/* Cover image area */}
          </div>
          
          <div className="px-6 py-6">
            <div className="flex items-center space-x-5">
              <div className="relative -mt-16">
                {profile.profile_picture_url ? (
                  <img 
                    src={profile.profile_picture_url} 
                    alt={profile.username}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-3xl">
                      {profile.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {profile.rating && (
                  <div className="absolute -right-2 -bottom-2 bg-white rounded-full p-1 shadow">
                    <div className="bg-yellow-400 rounded-full px-2 py-1 text-xs font-semibold text-white flex items-center">
                      <span className="mr-1">★</span>
                      {profile.rating.toFixed(1)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                  {profile.main_skill && (
                    <span className="text-sm text-gray-500">({profile.main_skill})</span>
                  )}
                </div>
                <p className="text-gray-500">{profile.account_type}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.main_skill && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {profile.main_skill} ★
                    </span>
                  )}
                  {profile.skills && profile.skills.length > 0 && 
                    profile.skills
                      .filter(skill => skill !== profile.main_skill)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          {skill}
                        </span>
                      ))
                  }
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {profile.account_type === 'freelancer' && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h2>
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  Portfolio section coming soon
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 