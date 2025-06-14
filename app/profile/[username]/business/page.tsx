'use client';
/* eslint-disable */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { Home, HomeIcon } from 'lucide-react';

type BusinessProfile = {
  username: string;
  account_type: 'business';
  profile_picture_url: string | null;
  industry_type?: string;
  team_size?: string;
  website?: string;
  company_info?: string;
  rating: number | null;
  created_at: string;
  updated_at?: string;
  display_name?: string; // Added display_name as optional
};

export default function BusinessProfilePage() {
  // Extract username from route params
  const { username } = useParams();

  // Main profile states
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing states
  const [editingIndustry, setEditingIndustry] = useState(false);
  const [newIndustry, setNewIndustry] = useState('');
  const [savingIndustry, setSavingIndustry] = useState(false);
  const [editingTeamSize, setEditingTeamSize] = useState(false);
  const [newTeamSize, setNewTeamSize] = useState('');
  const [savingTeamSize, setSavingTeamSize] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(false);
  const [newWebsite, setNewWebsite] = useState('');
  const [savingWebsite, setSavingWebsite] = useState(false);
  const [editingCompanyInfo, setEditingCompanyInfo] = useState(false);
  const [newCompanyInfo, setNewCompanyInfo] = useState('');
  const [savingCompanyInfo, setSavingCompanyInfo] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  // Profile picture upload state
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

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
        if (!username) {
          throw new Error('Username is required');
        }

        const { data, error } = await supabase
          .from('users')
          .select(`
            username,
            account_type,
            profile_picture_url,
            industry_type,
            team_size,
            website,
            company_info,
            rating,
            created_at,
            updated_at,
            display_name
          `)
          .eq('username', username)
          .eq('account_type', 'business')
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
            <p className="text-gray-600">The business profile you&apos;re looking for doesn&apos; exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container bg-green-light border border-green-dark mx-auto px-4 py-10 max-w-3xl shadow-lg rounded-2xl">
        <div className="bg-white mb-5 rounded-xl shadow-md overflow-hidden border border-green-dark">

          {/* Profile Picture + Display Name + Username (copied from freelancer) */}
          <div className=" flex justify-between items-center px-6 py-4">
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
                    <span className="text-white text-2xl">?</span>
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
                      const ext = file.name.split('.').pop();
                      const filePath = `pfp/${profile.username}_${Date.now()}.${ext}`;
                      const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('profilebucket')
                        .upload(filePath, file, { upsert: true });
                      if (uploadError) throw uploadError;
                      const { data: publicUrlData } = supabase.storage
                        .from('profilebucket')
                        .getPublicUrl(filePath);
                      const publicUrl = publicUrlData?.publicUrl;
                      if (!publicUrl) throw new Error('Could not get public URL');
                      await supabase.from('users')
                        .update({ profile_picture_url: publicUrl })
                        .eq('username', profile.username);
                      // Refresh profile data
                      const { data, error } = await supabase
                        .from('users')
                        .select('*')
                        .eq('username', profile.username)
                        .eq('account_type', 'business')
                        .single();
                      if (!error && data) setProfile(data);
                    } catch (err) {
                      if (err instanceof Error) {
                        setUploadError(err.message || 'Upload failed');
                      } else {
                        setUploadError(String(err));
                      }
                    } finally {
                      setUploadingPfp(false);
                    }
                  }}
                />
                {uploadingPfp && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-xs">Uploading...</span>
                  </div>
                )}
              </div>
              {uploadError && (
                <div className="text-xs text-red-500 mt-1">{uploadError}</div>
              )}
              {/* Display Name and Username */}
              <div className="flex flex-col justify-center">
                <div className="yatra-one-text text-2xl text-heading leading-tight">{profile.display_name || profile.username}</div>
                <div className="text-purple-attention text-xs font-semibold">@{profile.username}</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-1 text-gray-700 hover:text-purple cursor-pointer select-none">
  <Link href="/">
   
      <Home width={20} height={20} />
  </Link>
  <span className="text-sm font-medium">Home</span>
</div>

          </div>


            </div>

            {/* Company Info Section - moved above and full width */}
            <div className="w-full flex flex-col mb-6 bg-opacity-30 rounded-lg">
              <h3 className="text-heading text-lg font-semibold mb-1">Company Info</h3>
              {editingCompanyInfo ? (
                <div className="flex flex-col gap-2 mt-1">
                  <textarea
                    className="w-[280px] bg-gray-input text-base rounded px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple"
                    value={newCompanyInfo}
                    onChange={e => setNewCompanyInfo(e.target.value)}
                    disabled={savingCompanyInfo}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setSavingCompanyInfo(true);
                        await supabase.from('users').update({ company_info: newCompanyInfo }).eq('username', profile.username);
                        setEditingCompanyInfo(false);
                        setSavingCompanyInfo(false);
                        const { data, error } = await supabase
                          .from('users')
                          .select('*')
                          .eq('username', profile.username)
                          .eq('account_type', 'business')
                          .single();
                        if (!error && data) setProfile(data);
                      }}
                      className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
                      disabled={savingCompanyInfo}
                    >Save</button>
                    <button
                      onClick={() => setEditingCompanyInfo(false)}
                      className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
                      disabled={savingCompanyInfo}
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-row items-center gap-2 mt-1 w-full">
                  <span className="text-gray-900 w-full whitespace-pre-line">{profile.company_info || 'No company info set'}</span>
                  {currentUsername === profile.username && (
                    <button onClick={() => {
                      setEditingCompanyInfo(true);
                      setNewCompanyInfo(profile.company_info || '');
                    }} className="px-2 text-white rounded text-xs hover:bg-purple transition" title="Edit Company Info">
                      <img src="/edit.svg" alt="Edit" width={15} height={15} />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
  <h3 className="text-sm font-medium text-gray-500">Industry Type</h3>
  {editingIndustry ? (
    <div className="flex items-center gap-2 mt-1">
      <input
        type="text"
        className="w-[280px] bg-gray-input text-base rounded px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple"
        value={newIndustry}
        onChange={e => setNewIndustry(e.target.value)}
        disabled={savingIndustry}
      />
      <button
        onClick={async () => {
          setSavingIndustry(true);
          await supabase.from('users').update({ industry_type: newIndustry }).eq('username', profile.username);
          setEditingIndustry(false);
          setSavingIndustry(false);
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', profile.username)
            .eq('account_type', 'business')
            .single();
          if (!error && data) setProfile(data);
        }}
        className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
        disabled={savingIndustry}
      >Save</button>
      <button
        onClick={() => setEditingIndustry(false)}
        className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
        disabled={savingIndustry}
      >Cancel</button>
    </div>
  ) : (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-gray-900">{profile.industry_type || 'No industry set'}</span>
      {currentUsername === profile.username && (
        <button onClick={() => {
          setEditingIndustry(true);
          setNewIndustry(profile.industry_type || '');
        }} className="px-2 text-white rounded text-xs" title="Edit Industry Type">
          <img src="/edit.svg" alt="Edit" width={15} height={15} />
        </button>
      )}
    </div>
  )}
</div>

              <div>
  <h3 className="text-sm font-medium text-gray-500">Team Size</h3>
  {editingTeamSize ? (
    <div className="flex items-center gap-2 mt-1">
      <input
        type="text"
        className="w-[280px] bg-gray-input text-base rounded px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple"
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
            .eq('account_type', 'business')
            .single();
          if (!error && data) setProfile(data);
        }}
        className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
        disabled={savingTeamSize}
      >Save</button>
      <button
        onClick={() => setEditingTeamSize(false)}
        className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
        disabled={savingTeamSize}
      >Cancel</button>
    </div>
  ) : (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-gray-900">{profile.team_size || 'N/A'}</span>
      {currentUsername === profile.username && (
        <button onClick={() => {
          setEditingTeamSize(true);
          setNewTeamSize(profile.team_size || '');
        }} className="px-2 text-white rounded text-xs" title="Edit Team Size">
          <img src="/edit.svg" alt="Edit" width={15} height={15} />
        </button>
      )}
    </div>
  )}
</div>

              <div>
  <h3 className="text-sm font-medium text-gray-500">Website</h3>
  {editingWebsite ? (
    <div className="flex items-center gap-2 mt-1">
      <input
        type="text"
        className="w-[280px] bg-gray-input text-base rounded px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple"
        value={newWebsite}
        onChange={e => setNewWebsite(e.target.value)}
        disabled={savingWebsite}
      />
      <button
        onClick={async () => {
          setSavingWebsite(true);
          await supabase.from('users').update({ website: newWebsite }).eq('username', profile.username);
          setEditingWebsite(false);
          setSavingWebsite(false);
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', profile.username)
            .eq('account_type', 'business')
            .single();
          if (!error && data) setProfile(data);
        }}
        className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
        disabled={savingWebsite}
      >Save</button>
      <button
        onClick={() => setEditingWebsite(false)}
        className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
        disabled={savingWebsite}
      >Cancel</button>
    </div>
  ) : (
    <div className="flex items-center gap-2 mt-1">
      {profile.website ? (
        <a
          href={profile.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple hover:text-purple-attention"
        >
          {profile.website}
        </a>
      ) : (
        <span className="text-gray-900">No website set</span>
      )}
      {currentUsername === profile.username && (
        <button onClick={() => {
          setEditingWebsite(true);
          setNewWebsite(profile.website || '');
        }} className="px-2 text-white rounded text-xs" title="Edit Website">
          <img src="/edit.svg" alt="Edit" width={15} height={15} />
        </button>
      )}
    </div>
  )}
</div> 

              <div>
                <h3 className="text-purple-attention text-xs font-bold uppercase tracking-wider">Member Since</h3>
                <p className="mt-1 text-lg text-heading font-semibold">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>

              {profile.rating ? (
                <div className="bg-yellow bg-opacity-60 rounded-lg px-3 py-2 mt-2 flex flex-col items-center shadow-sm">
                  <h3 className="text-purple-attention text-xs font-bold uppercase tracking-wider">Rating</h3>
                  <p className="mt-1 flex items-center text-2xl font-bold text-yellow-500">
                    <span className="mr-1">★</span>
                    {profile.rating.toFixed(1)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
  );
} 