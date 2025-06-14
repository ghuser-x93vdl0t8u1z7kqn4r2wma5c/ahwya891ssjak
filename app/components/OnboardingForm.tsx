'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';

const SKILL_OPTIONS = [
  'JavaScript Development',
  'Python Development',
  'React Development',
  'UI Design',
  'UX Design',
  'Content Writing',
  'Digital Marketing',
  'Data Analysis',
  'Project Management',
  'Video Editing'
];

export default function OnboardingForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'freelancer' | 'client'>('freelancer');
  const [mainSkill, setMainSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { error } = await supabase
        .from('users')
        .update({
          account_type: accountType,
          main_skill: mainSkill
        })
        .eq('id', user.id);

      if (error) throw error;

      // Redirect to dashboard after successful update
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Lahara!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let&apos;s set up your profile
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                I am a...
              </label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="freelancer"
                    checked={accountType === 'freelancer'}
                    onChange={(e) => setAccountType(e.target.value as 'freelancer' | 'client')}
                    className="form-radio h-4 w-4 text-purple-600"
                  />
                  <span className="ml-2">Freelancer</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="client"
                    checked={accountType === 'client'}
                    onChange={(e) => setAccountType(e.target.value as 'freelancer' | 'client')}
                    className="form-radio h-4 w-4 text-purple-600"
                  />
                  <span className="ml-2">Client</span>
                </label>
              </div>
            </div>

            {accountType === 'freelancer' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  What&apos;s your main skill?
                </label>
                <select
                  value={mainSkill}
                  onChange={(e) => setMainSkill(e.target.value)}
                  required
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select a skill</option>
                  {SKILL_OPTIONS.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || (accountType === 'freelancer' && !mainSkill)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
            >
              {loading ? 'Setting up...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 