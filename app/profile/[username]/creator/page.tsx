'use client';
/* eslint-disable */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/app/lib/supabase';

type Profile = {
  username: string;
  account_type: 'creator';
  profile_picture_url: string | null;
  // Creator fields only
  niche?: string;
  social_medias?: string[];
  followers?: string;
  channel_links?: Record<string, string>;
  team_size?: string;
  hourly_rate?: string;
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
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  // Creator-specific editing states
  const [editingNiche, setEditingNiche] = useState(false);
  const [newNiche, setNewNiche] = useState('');
  const [savingNiche, setSavingNiche] = useState(false);
  const [editingSocials, setEditingSocials] = useState(false);
  const [newSocials, setNewSocials] = useState<string[]>([]);
  const [socialInput, setSocialInput] = useState('');
  const [showSocialSuggestions, setShowSocialSuggestions] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);
  const [editingFollowers, setEditingFollowers] = useState(false);
  const [newFollowers, setNewFollowers] = useState('');
  const [savingFollowers, setSavingFollowers] = useState(false);
  const [editingTeamSize, setEditingTeamSize] = useState(false);
  const [newTeamSize, setNewTeamSize] = useState('');
  const [savingTeamSize, setSavingTeamSize] = useState(false);
  const [editingRate, setEditingRate] = useState(false);
  const [newHourlyRate, setNewHourlyRate] = useState('');
  const [savingHourlyRate, setSavingHourlyRate] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Social media platforms for suggestions
  const predefinedSocials = [
    'YouTube', 'Instagram', 'TikTok', 'Twitter', 'Facebook', 'LinkedIn', 'Twitch', 'Snapchat', 'Pinterest', 'Reddit', 'Other'
  ];

  useEffect(() => {
    // Fetch current logged in username for edit rights
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user?.id) {
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', data.user.id)
          .single();
        setCurrentUsername(userData?.username || null);
      }
    });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) throw new Error('Username is required');
        const { data, error } = await supabase
          .from('users')
          .select(`
            username,
            account_type,
            profile_picture_url,
            niche,
            social_medias,
            hourly_rate,
            followers,
            channel_links,
            team_size,
            rating,
            created_at,
            updated_at,
            display_name,
            bio
          `)
          .eq('username', username)
          .eq('account_type', 'creator')
          .single();
        if (error) throw error;
        if (!data) throw new Error('Profile not found');
        // Parse socials if needed
        setProfile(data);
        setNewNiche(data.niche || '');
        setNewSocials(data.social_medias || []);
        setNewFollowers(data.followers || '');
        setNewTeamSize(data.team_size || '');
        setNewHourlyRate(data.hourly_rate || '');
        setNewBio(data.bio || '');
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600">The profile you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white flex items-center px-6 py-4">
        <div className="flex items-center">
          {/* Profile Picture Upload */}
          <div
            className="h-14 w-14 rounded-full overflow-hidden border border-gray-300 mr-4 flex items-center justify-center cursor-pointer relative group"
            onClick={() => {
              if (currentUsername === profile.username && !uploadingPfp) {
                document.getElementById('pfp-upload-input')?.click();
              }
            }}
            title={currentUsername === profile.username ? 'Change profile picture' : undefined}
          >
            {profile?.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.username}
                width={56}
                height={56}
                className="h-full w-full object-cover"
                style={{ borderRadius: '9999px', objectFit: 'cover' }}
              />
            ) : (
              <div className="h-full w-full bg-black flex items-center justify-center">
                <a href="https://www.vecteezy.com/png/19879186-user-icon-on-transparent-background"></a>
              </div>
            )}
            {currentUsername === profile.username && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            )}
            <input
              id="pfp-upload-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              disabled={uploadingPfp}
              onChange={async (e) => {
                setUploadError(null);
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith('image/')) {
                  setUploadError('Only image files are allowed.');
                  return;
                }
                setUploadingPfp(true);
                try {
                  // Generate unique filename
                  const ext = file.name.split('.').pop();
                  const filePath = `pfp/${profile.username}_${Date.now()}.${ext}`;
                  const { data, error } = await supabase.storage
                    .from('profilebucket')
                    .upload(filePath, file, { upsert: true });
                  if (error) throw error;
                  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profilebucket/${filePath}`;
                  await supabase.from('users').update({ profile_picture_url: url }).eq('username', profile.username);
                  setProfile({ ...profile, profile_picture_url: url });
                } catch (err: any) {
                  setUploadError(err.message || 'Upload failed');
                } finally {
                  setUploadingPfp(false);
                }
              }}
            />
          </div>
          <div>
            <div className="font-bold text-xl text-heading">{profile.display_name}</div>
            <div className="text-xs text-gray-600">@{profile.username}</div>
            {uploadError && (
              <div className="text-xs text-red-500 mt-1">{uploadError}</div>
            )}
          </div>
        </div>
        <div className="ml-auto">
          <button className="p-2 rounded-full bg-purple text-white hover:bg-purple-attention">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>
      {/* Main Layout */}
      <div className="flex max-w-6xl mx-auto mt-2">
        {/* Sidebar */}
        <aside className="w-1/4 min-w-[250px] border-r border-gray-200 bg-green-light pt-6 px-6 pb-8 flex flex-col gap-8">
          {/* Avatar, Name, Username are in header */}
          <div>
            <div className="font-bold text-2xl text-heading mb-2 flex justify-between items-center gap-2">Niche
              {currentUsername === profile.username && (
                <button onClick={() => { setEditingNiche(true); setNewNiche(profile.niche || ''); }} className="px-2 text-white rounded text-xs" title="Edit Niche">
                  <Image src="/edit.svg" alt="Edit" width={15} height={15} />
                </button>
              )}
            </div>
            {editingNiche ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  className="border px-2 py-1 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px]"
                  value={newNiche}
                  onChange={e => setNewNiche(e.target.value)}
                  disabled={savingNiche}
                />
                <button
                  onClick={async () => {
                    setSavingNiche(true);
                    await supabase.from('users').update({ niche: newNiche }).eq('username', profile.username);
                    setEditingNiche(false);
                    setSavingNiche(false);
                    const { data, error } = await supabase
                      .from('users')
                      .select('*')
                      .eq('username', profile.username)
                      .eq('account_type', 'creator')
                      .single();
                    if (!error && data) setProfile(data);
                  }}
                  className="px-2 py-1 bg-purple text-white rounded hover:bg-purple-attention text-xs"
                  disabled={savingNiche}
                >Save</button>
                <button
                  onClick={() => setEditingNiche(false)}
                  className="px-2 py-1 bg-purple-attention text-purple rounded hover:bg-purple text-xs"
                  disabled={savingNiche}
                >Cancel</button>
              </div>
            ) : (
              <div className="text-gray-600 mb-2">{profile.niche || 'No niche set'}</div>
            )}
          </div>
          {/* Hourly Rate (right-aligned) */}
          <div className="grid grid-cols-2 gap-x-2 items-center mb-4">
            <span className="text-sm text-gray-500 font-medium">Hourly Rate</span>
            {editingRate ? (
              <div className="flex justify-end items-center gap-2">
                <input
                  type="text"
                  className="border px-2 py-1 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[80px]"
                  value={newHourlyRate}
                  onChange={e => setNewHourlyRate(e.target.value)}
                  disabled={savingHourlyRate}
                  placeholder="$ per hour"
                />
                <button
                  onClick={async () => {
                    setSavingHourlyRate(true);
                    await supabase.from('users').update({ hourly_rate: newHourlyRate }).eq('username', profile.username);
                    setEditingRate(false);
                    setSavingHourlyRate(false);
                    const { data, error } = await supabase
                      .from('users')
                      .select('*')
                      .eq('username', profile.username)
                      .eq('account_type', 'creator')
                      .single();
                    if (!error && data) setProfile(data);
                  }}
                  className="px-2 py-1 bg-purple text-white rounded text-xs"
                  disabled={savingHourlyRate}
                >Save</button>
                <button
                  onClick={() => setEditingRate(false)}
                  className="px-2 py-1 bg-gray-200 text-purple rounded text-xs"
                  disabled={savingHourlyRate}
                >Cancel</button>
              </div>
            ) : (
              <div className="flex justify-end items-center gap-2">
                <span className="text-lg font-semibold text-purple">
                  {profile.hourly_rate ? `$${profile.hourly_rate}/hr` : <span className="text-gray-400 text-base">Not set</span>}
                </span>
                {currentUsername === profile.username && (
                  <button onClick={() => { setEditingRate(true); setNewHourlyRate(profile.hourly_rate || ''); }} className="ml-1 p-1 rounded hover:bg-purple-attention" title="Edit Hourly Rate">
                    <Image src="/edit.svg" alt="Edit" width={15} height={15} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-2xl text-heading mb-2 flex justify-between items-center gap-2">Social Medias
              {currentUsername === profile.username && (
                <button onClick={() => { setEditingSocials(true); setNewSocials(profile.social_medias || []); }} className="px-2 text-white rounded text-xs" title="Edit Socials">
                  <Image src="/edit.svg" alt="Edit" width={15} height={15} />
                </button>
              )}
            </div>
            {editingSocials ? (
              <div className="flex flex-wrap items-start gap-2 mb-2">
                {newSocials.map((platform) => (
                  <span key={platform} className="flex items-center bg-green-light text-green-dark text-xs px-2 py-1 rounded-full">
                    {platform}
                    <button
                      className="ml-1 text-xs text-red-500 hover:text-red-700"
                      title="Remove Platform"
                      onClick={() => setNewSocials(newSocials.filter((s) => s !== platform))}
                      disabled={savingSocials}
                      type="button"
                    >×</button>
                  </span>
                ))}
                <div className="relative">
                  <input
                    type="text"
                    className="bg-gray-input text-base rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple"
                    placeholder="Add platform"
                    value={socialInput || ''}
                    onChange={e => {
                      setSocialInput(e.target.value);
                      setShowSocialSuggestions(true);
                    }}
                    onFocus={() => setShowSocialSuggestions(true)}
                    disabled={savingSocials}
                  />
                  {showSocialSuggestions && socialInput && (
                    <div className="absolute z-10 bg-white border border-gray-200 rounded shadow-md mt-1 w-full max-h-32 overflow-y-auto">
                      {predefinedSocials.filter(s => s.toLowerCase().includes(socialInput.toLowerCase()) && !newSocials.includes(s)).map(s => (
                        <div key={s} className="px-2 py-1 hover:bg-purple-attention cursor-pointer" onClick={() => {
                          setNewSocials([...newSocials, s]);
                          setSocialInput('');
                          setShowSocialSuggestions(false);
                        }}>{s}</div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={async () => {
                    setSavingSocials(true);
                    await supabase.from('users').update({ social_medias: newSocials }).eq('username', profile.username);
                    setEditingSocials(false);
                    setSavingSocials(false);
                    const { data, error } = await supabase
                      .from('users')
                      .select('*')
                      .eq('username', profile.username)
                      .eq('account_type', 'creator')
                      .single();
                    if (!error && data) setProfile(data);
                  }}
                  className="px-2 py-1 bg-purple text-white rounded hover:bg-purple-attention text-xs"
                  disabled={savingSocials}
                >Save</button>
                <button
                  onClick={() => setEditingSocials(false)}
                  className="px-2 py-1 bg-purple-attention text-purple rounded hover:bg-purple text-xs"
                  disabled={savingSocials}
                >Cancel</button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.social_medias && profile.social_medias.length > 0 ? (
                  profile.social_medias.map((platform: string) => (
                    <span key={platform} className="bg-green-light text-green-dark text-xs px-2 py-1 rounded-full">{platform}</span>
                  ))
                ) : (
                  <span className="text-gray-600">No social medias set</span>
                )}
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-2xl text-heading mb-2 flex justify-between items-center gap-2">Followers
              {currentUsername === profile.username && (
                <button onClick={() => { setEditingFollowers(true); setNewFollowers(profile.followers || ''); }} className="px-2 text-white rounded text-xs" title="Edit Followers">
                  <Image src="/edit.svg" alt="Edit" width={15} height={15} />
                </button>
              )}
            </div>
            {editingFollowers ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  className="border px-2 py-1 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[120px]"
                  value={newFollowers}
                  onChange={e => setNewFollowers(e.target.value)}
                  disabled={savingFollowers}
                />
                <button
                  onClick={async () => {
                    setSavingFollowers(true);
                    await supabase.from('users').update({ followers: newFollowers }).eq('username', profile.username);
                    setEditingFollowers(false);
                    setSavingFollowers(false);
                    const { data, error } = await supabase
                      .from('users')
                      .select('*')
                      .eq('username', profile.username)
                      .eq('account_type', 'creator')
                      .single();
                    if (!error && data) setProfile(data);
                  }}
                  className="px-2 py-1 bg-purple text-white rounded hover:bg-purple-attention text-xs"
                  disabled={savingFollowers}
                >Save</button>
                <button
                  onClick={() => setEditingFollowers(false)}
                  className="px-2 py-1 bg-purple-attention text-purple rounded hover:bg-purple text-xs"
                  disabled={savingFollowers}
                >Cancel</button>
              </div>
            ) : (
              <div className="text-gray-600 mb-2">{profile.followers || 'No followers set'}</div>
            )}
          </div>
          {/* Team Size (right-aligned) */}
          <div className="grid grid-cols-2 gap-x-2 items-center mb-4">
            <span className="text-sm text-gray-500 font-medium">Team Size</span>
            {editingTeamSize ? (
              <div className="flex justify-end items-center gap-2">
                <input
                  type="text"
                  className="border px-2 py-1 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[60px]"
                  value={newTeamSize}
                  onChange={e => setNewTeamSize(e.target.value)}
                  disabled={savingTeamSize}
                />
                <button
                  onClick={async () => {
                    setSavingTeamSize(true);
                    await supabase.from('users').update({ team_size: newTeamSize }).eq('username', profile.username);
                    setEditingTeamSize(false);
                    setSavingTeamSize(false);
                    const { data, error } = await supabase
                      .from('users')
                      .select('*')
                      .eq('username', profile.username)
                      .eq('account_type', 'creator')
                      .single();
                    if (!error && data) setProfile(data);
                  }}
                  className="px-2 py-1 bg-purple text-white rounded text-xs"
                  disabled={savingTeamSize}
                >Save</button>
                <button
                  onClick={() => setEditingTeamSize(false)}
                  className="px-2 py-1 bg-gray-200 text-purple rounded text-xs"
                  disabled={savingTeamSize}
                >Cancel</button>
              </div>
            ) : (
              <div className="flex justify-end items-center gap-2">
                <span className="text-lg font-semibold text-purple">
                  {profile.team_size || <span className="text-gray-400 text-base">Not set</span>}
                </span>
                {currentUsername === profile.username && (
                  <button onClick={() => { setEditingTeamSize(true); setNewTeamSize(profile.team_size || ''); }} className="ml-1 p-1 rounded hover:bg-purple-attention" title="Edit Team Size">
                    <Image src="/edit.svg" alt="Edit" width={15} height={15} />
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-6">
            <div className="font-bold text-2xl text-heading mb-2 flex justify-between items-center gap-2">Bio
              {currentUsername === profile.username && (
                <button onClick={() => { setEditingBio(true); setNewBio(profile.bio || ''); }} className="px-2 text-white rounded text-xs" title="Edit Bio">
                  <Image src="/edit.svg" alt="Edit" width={15} height={15} />
                </button>
              )}
            </div>
            {editingBio ? (
              <div className="flex items-center gap-2 mb-2">
                <textarea
                  className="border px-2 py-1 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[200px]"
                  value={newBio}
                  onChange={e => setNewBio(e.target.value)}
                  disabled={savingBio}
                  rows={3}
                />
                <button
                  onClick={async () => {
                    setSavingBio(true);
                    await supabase.from('users').update({ bio: newBio }).eq('username', profile.username);
                    setEditingBio(false);
                    setSavingBio(false);
                    const { data, error } = await supabase
                      .from('users')
                      .select('*')
                      .eq('username', profile.username)
                      .eq('account_type', 'creator')
                      .single();
                    if (!error && data) setProfile(data);
                  }}
                  className="px-2 py-1 bg-purple text-white rounded hover:bg-purple-attention text-xs"
                  disabled={savingBio}
                >Save</button>
                <button
                  onClick={() => setEditingBio(false)}
                  className="px-2 py-1 bg-purple-attention text-purple rounded hover:bg-purple text-xs"
                  disabled={savingBio}
                >Cancel</button>
              </div>
            ) : (
              <div className="text-gray-600 mb-2 whitespace-pre-line">{profile.bio || 'No bio set'}</div>
            )}
          </div>
          {/* Add more creator-specific main content here if needed */}
        </main>
      </div>
    </div>
  );
}