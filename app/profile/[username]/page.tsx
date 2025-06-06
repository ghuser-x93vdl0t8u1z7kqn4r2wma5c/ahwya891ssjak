'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

type Profile = {
  username: string;
  account_type: 'freelancer' | 'creator' | 'business';
  profile_picture_url: string | null;
  
  // Freelancer fields
  hourly_rate?: string;
  main_skill?: string;
  skills?: string[];
  education?: string;
  experience?: string;
  portfolio?: string;
  
  // Creator fields
  niche?: string;
  social_medias?: string[];
  followers?: string;
  channel_links?: Record<string, string>;
  team_size?: string;
  
  // Business fields
  website?: string;
  company_info?: string;
  industry_type?: string;
  
  rating: number | null;
  created_at: string;
  updated_at?: string;
  display_name: string;
  bio: string;
};

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
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
            profile_picture_url, 
            hourly_rate,
            main_skill,
            skills,
            education,
            experience,
            portfolio,
            niche,
            social_medias,
            followers,
            channel_links,
            team_size,
            website,
            company_info,
            industry_type,
            rating,
            created_at,
            updated_at,
            display_name,
            bio
          `)
          .eq('username', username)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (!data) {
          throw new Error('Profile not found');
        }

        // Check if channel_links is a string and parse it
        if (data.channel_links && typeof data.channel_links === 'string') {
          try {
            data.channel_links = JSON.parse(data.channel_links);
          } catch (e) {
            console.error('Failed to parse channel_links JSON:', e);
            data.channel_links = null; // Set to null on parsing error
          }
        }

        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', {
          error: err,
          message: err.message,
          username: username
        });
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
                  <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-gray-900">{profile.display_name}</h1>
                    <h1 className="text-xl font-bold text-gray-900">@{profile.username}</h1>
                    <h1 className="text-md text-gray-900">{profile.bio}</h1>
                  </div>
                  {profile.main_skill && (
                    <span className="text-sm text-gray-500">({profile.main_skill})</span>
                  )}
                </div>
                <p className="text-gray-500">{profile.account_type}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.account_type === 'freelancer' && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Main Skill</h3>
                    <p className="mt-1 text-gray-900">{profile.main_skill || 'Not specified'}</p>
                  </div>

                  {profile.hourly_rate ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Hourly Rate</h3>
                      <p className="mt-1 text-gray-900">NPR {profile.hourly_rate}</p>
                    </div>
                  ) : null}

                  {profile.experience ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                      <p className="mt-1 text-gray-900">{profile.experience}</p>
                    </div>
                  ) : null}

                  {profile.education ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Education</h3>
                      <p className="mt-1 text-gray-900">{profile.education}</p>
                    </div>
                  ) : null}

                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {profile.skills.map(skill => (
                          <span 
                            key={skill}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {profile.portfolio ? (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Portfolio</h3>
                      <div className="mt-2">
                        <a 
                          href={profile.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple hover:text-purple-attention"
                        >
                          View Portfolio
                        </a>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {profile.account_type === 'creator' && (
                <>
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

                  {profile.social_medias && profile.social_medias.length > 0 && (() => {
                    console.log('Rendering social media section:', {
                      social_medias: profile.social_medias,
                      channel_links: profile.channel_links
                    });
                    return (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500">Social Media Platforms</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.social_medias.map(platform => {
                            // Try exact match first, then case-insensitive match
                            let channelLink = profile.channel_links?.[platform];
                            if (!channelLink && profile.channel_links) {
                              // Try to find a case-insensitive match
                              const platformKey = Object.keys(profile.channel_links).find(
                                key => key.toLowerCase() === platform.toLowerCase()
                              );
                              if (platformKey) {
                                channelLink = profile.channel_links[platformKey];
                              }
                            }
                            
                            console.log('Processing platform:', {
                              platform,
                              channelLink,
                              hasChannelLinks: !!profile.channel_links,
                              availableLinks: profile.channel_links
                            });

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
                    );
                  })()}
                </>
              )}

              {profile.account_type === 'business' && (
                <>
                  {profile.industry_type ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Industry Type</h3>
                      <p className="mt-1 text-gray-900">{profile.industry_type}</p>
                    </div>
                  ) : null}

                  {profile.team_size ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Team Size</h3>
                      <p className="mt-1 text-gray-900">{profile.team_size}</p>
                    </div>
                  ) : null}

                  {profile.website ? (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Website</h3>
                      <p className="mt-1">
                        <a 
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple hover:text-purple-attention"
                        >
                          {profile.website}
                        </a>
                      </p>
                    </div>
                  ) : null}

                  {profile.company_info ? (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Company Info</h3>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap">{profile.company_info}</p>
                    </div>
                  ) : null}
                </>
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