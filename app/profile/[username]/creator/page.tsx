'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

type CreatorProfile = {
  username: string;
  account_type: 'creator';
  display_name?: string;
  bio?: string;
  profile_picture_url: string | null;
  niche?: string;
  social_medias?: string[];
  followers?: string;
  channel_links?: Record<string, string>;
  team_size?: string;
  rating: number | null;
  created_at: string;
  updated_at?: string;
};

export default function CreatorProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) {
          throw new Error('Username is required');
        }

        const { data, error } = await supabase
          .from('users')
          .select(`
            username,
            account_type,
            display_name,
            bio,
            profile_picture_url,
            niche,
            social_medias,
            followers,
            channel_links,
            team_size,
            rating,
            created_at,
            updated_at
          `)
          .eq('username', username)
          .eq('account_type', 'creator')
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          throw new Error('Profile not found');
        }

        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Profile not found');
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
            <p className="text-gray-600">The creator profile you're looking for doesn't exist.</p>
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
                  <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                  {profile.niche && (
                    <span className="text-sm text-gray-500">({profile.niche})</span>
                  )}
                </div>
                <p className="text-gray-500">Creator</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.niche ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Niche</h3>
                  <p className="mt-1 text-gray-900">{profile.niche}</p>
                </div>
              ) : null}

              {profile.team_size ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Team Size</h3>
                  <p className="mt-1 text-gray-900">{profile.team_size}</p>
                </div>
              ) : null}

              {profile.followers ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Followers</h3>
                  <p className="mt-1 text-gray-900">{profile.followers}</p>
                </div>
              ) : null}

              {profile.social_medias && profile.social_medias.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Social Media Platforms</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.social_medias.map(platform => {
                      const channelLink = profile.channel_links ? profile.channel_links[platform] : null;
                      return channelLink ? (
                        <a 
                          key={platform}
                          href={channelLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                        >
                          {platform}
                        </a>
                      ) : (
                        <span 
                          key={platform}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                        >
                          {platform}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>

              {profile.rating ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                  <p className="mt-1">
                    <span className="flex items-center text-gray-900">
                      <span className="text-yellow-400 mr-1">★</span>
                      {profile.rating.toFixed(1)}
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 