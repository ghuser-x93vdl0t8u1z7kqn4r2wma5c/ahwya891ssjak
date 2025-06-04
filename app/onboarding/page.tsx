'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

type AccountType = 'freelancer' | 'client';

const AVAILABLE_SKILLS = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'SEO',
  'Data Analysis',
  'Video Editing',
  'Photography',
  'Social Media Management',
  'Copywriting',
  'Translation',
  'Voice Over',
  'Animation',
  'Illustration',
  '3D Modeling',
  'Game Development',
  'Database Administration',
  'DevOps Engineering',
  'Cybersecurity',
  'Machine Learning',
  'Artificial Intelligence',
  'Business Analysis',
  'Project Management'
].sort();

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedUsername, setSuggestedUsername] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    accountType: '' as AccountType,
    skills: [] as string[],
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      if (!session) {
        router.push('/login');
        return;
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  const checkUsername = async (username: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code === 'PGRST116') {
      // No match found, username is available
      return true;
    }

    // Username exists, generate suggestion
    let suggestion = username;
    let counter = 1;
    let isAvailable = false;

    while (!isAvailable && counter <= 99) {
      suggestion = `${username}${counter}`;
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', suggestion)
        .single();

      if (error && error.code === 'PGRST116') {
        isAvailable = true;
      } else {
        counter++;
      }
    }

    setSuggestedUsername(suggestion);
    return false;
  };

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setFormData(prev => ({ ...prev, username }));
    
    if (username.length >= 3) {
      const isAvailable = await checkUsername(username);
      if (!isAvailable && suggestedUsername) {
        setError(`Sorry, this username is unavailable. Recommended: ${suggestedUsername}`);
      } else {
        setError(null);
        setSuggestedUsername(null);
      }
    }
  };

  const handleSkillChange = (skill: string) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : prev.skills.length < 5
        ? [...prev.skills, skill]
        : prev.skills;
      return { ...prev, skills };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      // Final username check before submission
      const isAvailable = await checkUsername(formData.username);
      const finalUsername = isAvailable ? formData.username : suggestedUsername;

      if (!finalUsername) {
        throw new Error('Sorry, please choose an available username');
      }

      if (formData.accountType === 'freelancer' && formData.skills.length === 0) {
        throw new Error('Please select at least one skill');
      }

      // First, try to get the existing user record
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing user:', fetchError);
        throw new Error('Error checking user profile');
      }

      // Prepare the user data
      const userData = {
        username: finalUsername,
        account_type: formData.accountType,
        skills: formData.accountType === 'freelancer' ? formData.skills : [],
        main_skill: formData.accountType === 'freelancer' ? formData.skills[0] : null,
      };

      let updateError;
      if (!existingUser) {
        // If user doesn't exist, insert with id
        const { error } = await supabase
          .from('users')
          .insert([{ id: session.user.id, ...userData }]);
        updateError = error;
      } else {
        // If user exists, update
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', session.user.id);
        updateError = error;
      }

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(updateError.message || 'Error updating profile');
      }

      // Redirect to their new profile page
      router.push(`/profile/${finalUsername}`);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Choose a username"
                  required
                  minLength={3}
                  pattern="[a-z0-9]+"
                />
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600">
                  {error}
                  {suggestedUsername && (
                    <span
                      onClick={() => {
                        setFormData(prev => ({ ...prev, username: suggestedUsername }));
                        setError(null);
                        setSuggestedUsername(null);
                      }}
                      className="ml-2 text-purple-600 hover:text-purple-500 cursor-pointer underline"
                    >
                      {suggestedUsername}
                    </span>
                  )}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                id="accountType"
                value={formData.accountType}
                onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value as AccountType }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select account type</option>
                <option value="freelancer">Freelancer</option>
                <option value="client">Client</option>
              </select>
            </div>

            {formData.accountType === 'freelancer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Skills (select up to 5)
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Selected: {formData.skills.length}/5
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {AVAILABLE_SKILLS.map((skill) => (
                    <div key={skill} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleSkillChange(skill)}
                          disabled={!formData.skills.includes(skill) && formData.skills.length >= 5}
                          className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label className="text-gray-700">{skill}</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !!error}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
            >
              {submitting ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 