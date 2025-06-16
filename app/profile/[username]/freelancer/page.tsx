
'use client';
/* eslint-disable */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/app/lib/supabase';
import EditEdu from './EditEdu';
import EditWork from './EditWork';
import Link from 'next/link';
import { Home } from 'lucide-react';

type Profile = {
  username: string;
  account_type: 'freelancer';
  profile_picture_url: string | null;
  title: string | null;
  // Freelancer fields only
  hourly_rate?: string;
  main_skill?: string;
  skills?: string[];
  education?: string;
  experience?: string;
  portfolio?: string;
  rating: number | null;
  created_at: string;
  updated_at?: string;
  display_name: string;
  bio: string;
};

const predefinedSkills = [
  'Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Social Media Management',
    'Video Editing', 'Photography', 'Data Analysis', 'Project Management',
    'Copywriting', 'Translation', 'Voice Over', 'Animation', '3D Modeling',
    'WordPress Development', 'E-commerce', 'Email Marketing', 'Brand Design',
    'Logo Design', 'Illustration', 'Game Development', 'Machine Learning',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'Business Consulting'
];

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingRate, setEditingRate] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingMainSkill, setEditingMainSkill] = useState(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newRate, setNewRate] = useState<string>("");
  const [newBio, setNewBio] = useState<string>("");
  const [newPortfolio, setNewPortfolio] = useState<string>("");
  const [newSkills, setNewSkills] = useState<string[]>([]);
  const [newMainSkill, setNewMainSkill] = useState<string>("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingMainSkill, setSavingMainSkill] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddEducation, setShowAddEducation] = useState(false);

  // Profile picture upload state
  const [uploadingPfp, setUploadingPfp] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];


  // Skill input and suggestions (must be after newSkills is defined)
  const [skillInput, setSkillInput] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredSkills = predefinedSkills.filter(
    skill =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !newSkills.includes(skill)
  );


  // Fetch profile info
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
          title,
          skills,
          education,
          experience,
          portfolio,
          rating,
          created_at,
          updated_at,
          display_name,
          bio
        `)
        .eq('username', username)
        .eq('account_type', 'freelancer')
        .single();
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      if (!data) {
        throw new Error('Profile not found');
      }
      setProfile(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching profile:', {
        error: err,
        message: errorMessage,
        username: username
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch education and work experience for this profile
  const fetchExtra = async () => {
    if (!username) return;
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    if (!userData?.id) return;
    const { data: edu } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', userData.id)
      .order('start_year', { ascending: false });
    setEducation(edu || []);
    const { data: exp } = await supabase
      .from('work_experience')
      .select('*')
      .eq('user_id', userData.id)
      .order('start_date', { ascending: false });
    setExperience(exp || []);
  };

  useEffect(() => {
    // Get logged-in user id and username
    supabase.auth.getUser().then(async ({ data }) => {
      setCurrentUserId(data.user?.id || null);
      if (data.user?.id) {
        // Fetch username for logged-in user
        const { data: userData } = await supabase
          .from('users')
          .select('username')
          .eq('id', data.user.id)
          .single();
        setCurrentUsername(userData?.username || null);
      }
    });
    fetchProfile();
    fetchExtra();
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
    <div className="border-b border-gray-200 bg-white flex items-center px-6 py-4 justify-between">
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
                // Upload to Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('profilebucket')
                  .upload(filePath, file, { upsert: true });
                if (uploadError) throw uploadError;
                // Get public URL
                const { data: publicUrlData } = supabase.storage
                  .from('profilebucket')
                  .getPublicUrl(filePath);
                const publicUrl = publicUrlData?.publicUrl;
                if (!publicUrl) throw new Error('Could not get public URL');
                // Update user profile
                await supabase.from('users')
                  .update({ profile_picture_url: publicUrl })
                  .eq('username', profile.username);
                // Refresh profile data
                await fetchProfile();
                await fetchExtra();
              } catch (err: any) {
                setUploadError(err.message || 'Upload failed');
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
        <div>
          <div className="font-bold text-3xl text-heading leading-tight">
            {profile?.display_name}
          </div>
          <div className="text-xs text-gray-600">@{profile?.username}</div>
          {uploadError && (
            <div className="text-xs text-red-500 mt-1">{uploadError}</div>
          )}
        </div>
      </div>
        <div className="flex flex-col items-center space-y-1 text-gray-700 hover:text-purple cursor-pointer select-none">
  <Link href="/">
   
      <Home width={20} height={20} />
  </Link>
  <span className="text-sm font-medium">Home</span>
</div>
    </div>
    {/* Main Layout */}
    <div className="flex mt-2 max-w-6xl mx-auto">
      {/* Sidebar */}
      <aside className="mx-0 w-1/4 min-w-[250px] border-r border-gray-200 bg-green-light pt-6 px-6 pb-8 flex flex-col gap-8">
        {/* Avatar, Name, Username, Location are in header */}

        <div>
          <div className="font-bold text-2xl text-heading mb-2 flex justify-between items-center gap-2">Education
          {currentUsername === profile.username && (
  <button
    className="px-2 text-white rounded text-xs"
    onClick={() => setShowAddEducation(true)}
  >
     <Image src="/edit.svg" alt="Edit" width={15} height={15} />
  </button>
)}
</div>
{showAddEducation && (
  <div className="mb-4">
    <EditEdu
      userId={currentUserId || ''}
      education={education}
      onUpdated={() => {
        setShowAddEducation(false);
        fetchExtra();
      }}
    />
    <button
      className="mt-2 bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
      onClick={() => setShowAddEducation(false)}
    >
      ← Back
    </button>
  </div>
)}
{education.length > 0 ? (
  education.map((item, idx) => (
    <div key={item.id || idx} className="mb-4">
      <div className="flex items-center gap-2">
        <div className="text-lg text-heading font-medium leading-tight">{item.school}</div>
      </div>
      <div className="text-md text-green">{item.course}</div>
      <div className="text-md text-gray-500">{item.level}</div>
      <div className="text-md text-gray-400">{item.start_year} - {item.end_year || 'Present'}</div>
    </div>
  ))
) : (
  <div className="text-xs text-gray-400">No education added yet.</div>
)}
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-white px-8 pb-6 flex flex-col gap-8">
        {/* Title, Rate, Bio, Skills, Portfolio, Website */}
        <div className="bg-green-light w-full border border-gray-200 rounded shadow-sm p-6 flex flex-col gap-4 min-h-[200px]">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
            {editingTitle ? (
  <div className="flex flex-wrap items-start gap-2 mb-2 w-full">
    <input
      type="text"
      className="w-[280px] bg-gray-input text-base rounded px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple"
      value={newTitle}
      onChange={e => setNewTitle(e.target.value)}
      disabled={savingTitle}
      placeholder="Enter your professional title"
    />
    <button
      onClick={async () => {
        setSavingTitle(true);
        await supabase.from('users').update({ title: newTitle }).eq('username', profile.username);
        setEditingTitle(false);
        setSavingTitle(false);
        const { data, error } = await supabase
          .from('users')
          .select(`
            username,
            account_type,
            profile_picture_url,
            hourly_rate,
            main_skill,
            title,
            skills,
            education,
            experience,
            portfolio,
            rating,
            created_at,
            updated_at,
            display_name,
            bio
          `)
          .eq('username', profile.username)
          .eq('account_type', 'freelancer')
          .single();
        if (!error && data) setProfile(data);
      }}
      disabled={savingTitle}
      className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
    >
      {savingTitle ? 'Saving...' : 'Save'}
    </button>
    <button
      onClick={() => setEditingTitle(false)}
      disabled={savingTitle}
      className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
    >
      Cancel
    </button>
  </div>
) : (
  <div className="flex items-center gap-2 flex-wrap mb-2">
    <span className="font-bold text-2xl text-heading">
      {profile.title || 'This user has not configured their title'}
    </span>
    {currentUsername === profile.username && (
      <button
        onClick={() => {
          setEditingTitle(true);
          setNewTitle(profile.title || '');
        }}
        className="p-2 rounded-full hover:bg-purple-attention transition"
        title="Edit Title"
      >
        <Image src="/edit.svg" alt="Edit" width={16} height={16} />
      </button>
    )}
  </div>
)}

</div>
            <div className="flex items-center gap-2">
  {editingRate ? (
    <>
      <input
        type="number"
        className="w-[280px] bg-gray-input text-base rounded px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple"
        value={newRate}
        onChange={e => setNewRate(e.target.value)}
        disabled={savingRate}
        min={0}
        style={{ minWidth: 80 }}
      />
      <span className="text-xs">/hr</span>
      <button
        onClick={async () => {
          setSavingRate(true);
          await supabase.from('users').update({ hourly_rate: newRate }).eq('username', profile.username);
          setEditingRate(false);
          setSavingRate(false);
          // Refresh profile data
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', profile.username)
            .eq('account_type', 'freelancer')
            .single();
          if (!error && data) setProfile(data);
        }}
        className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
        disabled={savingRate}
      >Save</button>
      <button
        onClick={() => setEditingRate(false)}
        className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
        disabled={savingRate}
      >Cancel</button>
    </>
  ) : (
    <>
      <span className="text-md font-bold text-purple">NPR {profile.hourly_rate || '200+'}/hour</span>
      {currentUsername === profile.username && (
        <button onClick={() => {
          setEditingRate(true);
          setNewRate(profile.hourly_rate || '');
        }} className="px-2 text-white rounded " title="Edit Hourly Rate">
          <Image src="/edit.svg" alt="Edit" width={15} height={15} />
        </button>
      )}
    </>
  )}
</div>
          </div>
          <div className="flex h-full w-full items-center gap-2">
  {editingBio ? (
    <>
      <textarea
        className="w-full bg-gray-input text-base rounded px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple"
        value={newBio}
        onChange={e => setNewBio(e.target.value)}
        disabled={savingBio}
        rows={5}
        style={{ minWidth: 160 }} 
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
            .eq('account_type', 'freelancer')
            .single();
          if (!error && data) setProfile(data);
        }}
        className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
        disabled={savingBio}
      >Save</button>
      <button
        onClick={() => setEditingBio(false)}
        className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
        disabled={savingBio}
      >Cancel</button>
    </>
  ) : (
    <div className='flex flex-col gap-2'>
       <p
            className={`text-sm text-gray-500 whitespace-pre-wrap ${
              !expanded
                ? 'line-clamp-5 overflow-hidden'
                : ''
            }`}
            style={{ wordBreak: 'break-word' }}
          >
            {profile.bio || 'The user has not configured his bio'}
          </p>
        <div className='flex flex-row items-center gap-2'>
          {profile.bio && profile.bio.split('\n').length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-block px-3 py-1 bg-purple text-white rounded hover:bg-purple-attention text-xs font-semibold cursor-pointer select-none"
              aria-label={expanded ? 'Show less' : 'Show more'}
            >
              {expanded ? 'Show less' : 'Show More'}
            </button>
          )}
      {currentUsername === profile.username && (
        <button onClick={() => {
          setEditingBio(true);
          setNewBio(profile.bio || '');
        }} className="px-2 text-white rounded text-xs" title="Edit Bio">
          <Image src="/edit.svg" alt="Edit" width={15} height={15} />
        </button>
      )}
    </div>
    </div>
  )}
</div>
          <div className="flex flex-wrap gap-2">
          <div className="flex flex-col gap-2 mb-1">
          <span className="font-bold text-lg text-heading">Main Skill</span>
          <div className="flex w-full items-start justify-start gap-2 mb-1">
  {/* Main skill single select */}
  {editingMainSkill ? (
  <div className="space-y-4">
    <div className="flex items-start gap-2 flex-wrap w-full">
      <div className="w-1/2">
        <select
          className="w-full bg-gray-input text-sm rounded px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple"
          value={newMainSkill}
          onChange={e => setNewMainSkill(e.target.value)}
          disabled={savingMainSkill}
        >
          <option value="">Select main skill</option>
          {predefinedSkills.map(skill => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={async () => {
            setSavingMainSkill(true);
            await supabase
              .from('users')
              .update({ main_skill: newMainSkill })
              .eq('username', profile.username);
            setEditingMainSkill(false);
            setSavingMainSkill(false);
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('username', profile.username)
              .eq('account_type', 'freelancer')
              .single();
            if (!error && data) setProfile(data);
          }}
          disabled={savingMainSkill}
          className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
        >
          {savingMainSkill ? 'Saving...' : 'Save'}
        </button>

        <button
          onClick={() => setEditingMainSkill(false)}
          disabled={savingMainSkill}
          className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
) : (
  <div className="flex items-center flex-wrap gap-2 mb-1">
    {profile.main_skill && (
      <span className="bg-purple text-white text-sm px-3 py-1 rounded-full font-semibold">
        {profile.main_skill}
      </span>
    )}
    {currentUsername === profile.username && (
      <button
        onClick={() => {
          setEditingMainSkill(true);
          setNewMainSkill(profile.main_skill || '');
        }}
        className="flex items-center justify-center p-2 rounded-full hover:bg-purple-attention transition"
        title="Edit Main Skill"
      >
        <Image src="/edit.svg" alt="Edit" width={16} height={16} />
      </button>
    )}
  </div>
)}



</div>

<span className="font-bold text-lg text-heading">Skills</span>
  {/* Skills multi-select, tag delete/add */}
  {editingSkills ? (
  <div className="space-y-4">
    {/* Selected Skills */}
    <div className="flex flex-wrap gap-2">
      {newSkills.map((skill) => (
        <span
          key={skill}
          className="flex items-center bg-purple-attention text-white text-sm px-3 py-1 rounded-full"
        >
          {skill}
          <button
            type="button"
            className="ml-2 text-xs text-red-200 hover:text-red-500 focus:outline-none"
            onClick={() => setNewSkills(newSkills.filter((s) => s !== skill))}
            disabled={savingSkills}
            title="Remove Skill"
          >
            ×
          </button>
        </span>
      ))}
    </div>

    {/* Input, Suggestions, Save/Cancel Buttons */}
    <div className="flex items-start gap-2 flex-wrap w-full">
      <div className="relative w-1/2">
        <input
          type="text"
          className="w-full bg-gray-input text-sm rounded px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple"
          placeholder="Add a skill"
          value={skillInput}
          onChange={(e) => {
            setSkillInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          disabled={savingSkills}
        />
        {showSuggestions && filteredSkills.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-md max-h-40 overflow-y-auto text-sm">
            {filteredSkills.map((skill) => (
              <li
                key={skill}
                className="px-3 py-2 cursor-pointer hover:bg-purple-attention"
                onMouseDown={() => {
                  if (!newSkills.includes(skill)) {
                    setNewSkills([...newSkills, skill]);
                  }
                  setSkillInput('');
                  setShowSuggestions(false);
                }}
              >
                {skill}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={async () => {
            setSavingSkills(true);
            await supabase.from('users').update({ skills: newSkills }).eq('username', profile.username);
            setEditingSkills(false);
            setSavingSkills(false);
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('username', profile.username)
              .eq('account_type', 'freelancer')
              .single();
            if (!error && data) setProfile(data);
          }}
          disabled={savingSkills}
          className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
        >
          {savingSkills ? 'Saving...' : 'Save'}
        </button>

        <button
          onClick={() => setEditingSkills(false)}
          disabled={savingSkills}
          className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
) : (
  <div className="flex items-center flex-wrap gap-2 mb-1">
    {profile.skills && profile.skills.length > 0 && profile.skills.map((skill, idx) => (
      <span
        key={idx}
        className="bg-purple-attention text-white text-sm px-3 py-1 rounded-full flex items-center gap-1"
      >
        {skill}
        {currentUsername === profile.username && (
          <button
            className="ml-1 text-xs text-red-300 hover:text-red-500"
            title="Remove Skill"
            onClick={async () => {
              const updatedSkills = (profile.skills || []).filter((s: string) => s !== skill);
              setSavingSkills(true);
              await supabase.from('users').update({ skills: updatedSkills }).eq('username', profile.username);
              setSavingSkills(false);
              const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', profile.username)
                .eq('account_type', 'freelancer')
                .single();
              if (!error && data) setProfile(data);
            }}
            disabled={savingSkills}
          >
            ×
          </button>
        )}
      </span>
    ))}
    {currentUsername === profile.username && (
      <button
        onClick={() => {
          setEditingSkills(true);
          setNewSkills(profile.skills || []);
        }}
        className="flex items-center justify-center p-2 rounded-full hover:bg-purple-attention transition"
        title="Edit Skills"
      >
        <Image src="/edit.svg" alt="Edit" width={16} height={16} />
      </button>
    )}
  </div>
)}


</div>
</div>
</div>
 <div className="bg-green-light w-full border border-gray-200 rounded shadow-sm p-6 flex flex-col gap-4">
 <div className="flex items-center gap-2">
  <span className="text-2xl text-heading font-bold">Portfolio</span>
</div>
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col items-center gap-2">

<div className="flex flex-row items-center gap-2">
{profile.portfolio ? (
  <a
    href={
      profile.portfolio.startsWith('http://') || profile.portfolio.startsWith('https://')
        ? profile.portfolio
        : `https://${profile.portfolio}`
    }
    target="_blank"
    rel="noopener noreferrer"
    className="text-purple hover:text-purple-attention"
  >
    {profile.portfolio}
  </a>
) : (
  <span className="text-gray-500">No Portfolio Links</span>
)}


  {editingPortfolio ? (
    <>
      <input
        type="text"
        className="w-[280px] bg-gray-input text-base rounded px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple"
        value={newPortfolio}
        onChange={e => setNewPortfolio(e.target.value)}
        disabled={savingPortfolio}
        style={{ minWidth: 120 }}
      />
      <button
        onClick={async () => {
          setSavingPortfolio(true);
          await supabase.from('users').update({ portfolio: newPortfolio }).eq('username', profile.username);
          setEditingPortfolio(false);
          setSavingPortfolio(false);
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', profile.username)
            .eq('account_type', 'freelancer')
            .single();
          if (!error && data) setProfile(data);
        }}
        className="bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
        disabled={savingPortfolio}
      >Save</button>
      <button
        onClick={() => setEditingPortfolio(false)}
        className="bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded hover:bg-gray-300 transition disabled:opacity-50"
        disabled={savingPortfolio}
      >Cancel</button>
    </>
  ) : (
    <>
      {currentUsername === profile.username && (
        <button onClick={() => {
          setEditingPortfolio(true);
          setNewPortfolio(profile.portfolio || '');
        }} className="px-2 text-white rounded text-xs" title="Edit Portfolio">
          <Image src="/edit.svg" alt="Edit" width={15} height={15} />
        </button>
      )}
    </>
  )}
</div>
</div>
</div>
</div>

      
        {/* Employment History */}
        <div className="bg-green-light border border-gray-200 rounded shadow-sm p-6">
        <div className="font-bold text-2xl text-heading mb-2 flex justify-between items-center gap-2">Employment history
        {currentUsername === profile.username && (
  <button
    className="px-2 py-1 text-white rounded text-xs"
    onClick={() => setShowAddExperience(true)}
  >
     <Image src="/edit.svg" alt="Edit" width={15} height={15} />
  </button>
)}
</div>
{showAddExperience && (
  <div className="mb-4">
    <EditWork
      userId={currentUserId || ''}
      experience={experience}
      onUpdated={() => {
        setShowAddExperience(false);
        fetchExtra();
      }}
    />
    <button
      className="mt-2 bg-purple text-white text-sm px-4 py-2 rounded hover:bg-purple-attention transition disabled:opacity-50"
      onClick={() => setShowAddExperience(false)}
    >
      ← Back
    </button>
  </div>
)}
{experience.length > 0 ? (
  experience.map((item, idx) => (
    <div key={item.id || idx} className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="font-bold text-xl text-heading">
          {item.position || item.title} | {item.company || 'Freelance'}
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-1">
        {item.start_date ? `${item.start_date} - ${item.end_date || 'Present'}` : null}
      </div>
      <div className="text-xs text-gray-700 mb-1 whitespace-pre-line">
        {item.description}
      </div>
    </div>
  ))
) : (
  <div className="text-xs text-gray-400">No work experience added yet.</div>
)}
        </div>
      </main>
    </div>
  </div>
);
}     