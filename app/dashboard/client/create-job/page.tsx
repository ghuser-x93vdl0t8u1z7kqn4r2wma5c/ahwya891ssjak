'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import ProfilePreview from '../../components/ProfilePreview';
import ChatPanel from '../../components/ChatPanel';

export default function CreateJob() {
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [estimatedTimeRange, setEstimatedTimeRange] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const skillsList = [
    'Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Social Media Management',
    'Video Editing', 'Photography', 'Data Analysis', 'Project Management',
    'Copywriting', 'Translation', 'Voice Over', 'Animation', '3D Modeling',
    'WordPress Development', 'E-commerce', 'Email Marketing', 'Brand Design',
    'Logo Design', 'Illustration', 'Game Development', 'Machine Learning',
    'DevOps', 'Cloud Computing', 'Cybersecurity', 'Business Consulting'
  ];

  const timeRanges = [
    '1 day', '3 days', '1 week', '2 weeks', '1 month', '2 months', '3+ months'
  ];

  // Fetch client profile for sidebar
  useState(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profileData } = await supabase
        .from('users')
        .select('username, profile_picture_url, account_type')
        .eq('id', user.id)
        .single();
      setProfile(profileData);
    })();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!title || !budget || !estimatedTimeRange || requiredSkills.length === 0 || !description) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: insertError } = await supabase
        .from('jobs')
        .insert({
          title,
          budget: Number(budget),
          estimated_time_range: estimatedTimeRange,
          required_skills: requiredSkills,
          description,
          client_uid: user.id,
        });
      if (insertError) throw insertError;
      router.push('/dashboard/client');
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
     <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Post a New Job</h1>
          {userId && <NotificationBell userId={userId} />}
        </div>
        <form onSubmit={handleSubmit} className="max-w-xl bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Budget (USD)</label>
            <input
              className="w-full border px-3 py-2 rounded"
              type="number"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Estimated Time Range</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={estimatedTimeRange}
              onChange={e => setEstimatedTimeRange(e.target.value)}
              required
            >
              <option value="" disabled>Select time period</option>
              {timeRanges.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              className="w-full border px-3 py-2 rounded min-h-[100px]"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Required Skills</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
              {skillsList.map(skill => (
                <label key={skill} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={requiredSkills.includes(skill)}
                    onChange={e => {
                      if (e.target.checked) {
                        setRequiredSkills([...requiredSkills, skill]);
                      } else {
                        setRequiredSkills(requiredSkills.filter(s => s !== skill));
                      }
                    }}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </main>
      {userId && <ChatPanel userId={userId} />}
    </div>
  );
}
