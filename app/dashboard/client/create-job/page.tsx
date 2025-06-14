'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Sidebar from '../../components/Sidebar';
import NotificationBell from '../../components/NotificationBell';
import ChatPanel from '../../components/ChatPanel';

export default function CreateJob() {
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [pricingType, setPricingType] = useState<'hourly' | 'fixed'>('fixed');
  const [estimatedTimeRange, setEstimatedTimeRange] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
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
    '1 hour', '2 hours', '4 hours', '8 hours', '12 hours',
    '1 day', '2 days', '3 days', '1 week', '2 weeks',
    '1 month', '2 months', '3+ months'
  ];

  useEffect(() => {
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
  }, []);

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
          pricing_type: pricingType,
          estimated_time_range: estimatedTimeRange,
          required_skills: requiredSkills,
          description,
          client_uid: user.id,
        });
      if (insertError) throw insertError;
      router.push('/dashboard/client');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create job');
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="flex flex-row min-h-screen bg-green-light w-full justify-between">
        <div className='w-5 md:w-64'>
          <Sidebar />
        </div>
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Post a New Job</h1>
          {userId && <NotificationBell userId={userId} />}
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8 space-y-8 border border-gray-200"
          noValidate
        >
          {/* Title */}
          <div>
            <label htmlFor="title" className="block mb-2 font-semibold text-gray-700">Title</label>
            <input
              id="title"
              type="text"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              placeholder="Enter job title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          {/* Pricing Type */}
          <div>
            <label htmlFor="pricingType" className="block mb-2 font-semibold text-gray-700">Pricing Type</label>
            <select
              id="pricingType"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              value={pricingType}
              onChange={e => setPricingType(e.target.value as 'hourly' | 'fixed')}
              required
            >
              <option value="fixed">Fixed / Project</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block mb-2 font-semibold text-gray-700">Budget (NRS)</label>
            <input
              id="budget"
              type="number"
              min="0"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              placeholder="Enter budget amount"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              required
            />
          </div>

          {/* Estimated Time Range */}
          <div>
            <label htmlFor="timeRange" className="block mb-2 font-semibold text-gray-700">Estimated Time Range</label>
            <select
              id="timeRange"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              value={estimatedTimeRange}
              onChange={e => setEstimatedTimeRange(e.target.value)}
              required
            >
              <option value="" disabled>Select estimated time</option>
              {timeRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-2 font-semibold text-gray-700">Description</label>
            <textarea
              id="description"
              rows={5}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition resize-none"
              placeholder="Describe the job details..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block mb-3 font-semibold text-gray-700">Required Skills</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
              {skillsList.map(skill => (
                <label
                  key={skill}
                  className="flex items-center space-x-3 cursor-pointer text-gray-800 hover:text-purple-700 select-none"
                >
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
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-sm">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-center font-medium">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3 rounded-lg transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </main>
      {userId && <ChatPanel userId={userId} />}
    </div>
    </div>
  );
}
