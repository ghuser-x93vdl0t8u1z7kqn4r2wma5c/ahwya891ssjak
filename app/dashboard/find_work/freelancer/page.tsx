'use client';
/* eslint-disable */
import { supabase } from '@/app/lib/supabase';
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import ChatPanel from '../../components/ChatPanel';
import JobCard from '../../components/JobCard';

type Job = {
  job_id: string;
  title: string;
  budget: number;
  pricing_type?: string; // New optional field for budget type
  estimated_time_range: string;
  description: string;
  required_skills: string[];
  created_at: string;
  client?: { display_name: string; profile_picture_url: string | null };
};

export default function FindWorkFreelancer() {
  // eslint-disable-next-line
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTime, setFilterTime] = useState('');
  const [filterBudgetMin, setFilterBudgetMin] = useState('');
  const [filterBudgetMax, setFilterBudgetMax] = useState('');
  const [showAll, setShowAll] = useState(false);

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
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('username, profile_picture_url, account_type, skills, main_skill')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;
        setProfile(profileData);
        if (profileData.account_type !== 'freelancer') {
          setError('Unauthorized: Not a freelancer account');
          setLoading(false);
          return;
        }
        // Fetch jobs not applied/bookmarked and matching skills
        const { data: apps } = await supabase
          .from('applications')
          .select('job_id')
          .eq('applicant_uid', user.id);
        const { data: bms } = await supabase
          .from('bookmarks')
          .select('job_id')
          .eq('user_id', user.id);
        const excludeIds = [
          ...(apps || []).map((a: any) => a.job_id),
          ...(bms || []).map((b: any) => b.job_id),
        ];
        let skills = Array.isArray(profileData.skills) ? profileData.skills : [];
        let mainSkill = profileData.main_skill || '';
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .neq('client_uid', user.id);
        if (jobsError) throw jobsError;
        // All jobs: no filtering except not applied/bookmarked/not posted by user
        const allJobs = (jobsData || []).filter((job: any) => !excludeIds.includes(job.job_id));
        // Recommended jobs: match any of user's skills or main_skill
        const recommendedJobs = allJobs.filter((job: any) => {
          if (!Array.isArray(job.required_skills)) return false;
          return job.required_skills.some((skill: string) =>
            skills.includes(skill) || (mainSkill && skill === mainSkill)
          );
        });
        setJobs(allJobs);
        setFilteredJobs(recommendedJobs);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modal state for application
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [applicationFees, setApplicationFees] = useState('');
  const [applicationTime, setApplicationTime] = useState('');
  const [applicationCoverLetter, setApplicationCoverLetter] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const openApplyModal = (job: Job) => {
    setApplyingJob(job);
    setApplicationFees(job.budget ? String(job.budget) : '');
    setApplicationTime(job.estimated_time_range || '');
    setApplicationCoverLetter('');
    setShowApplyModal(true);
    setApplicationSuccess(null);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !applyingJob) return;
    try {
      setLoading(true);
      setError(null);
      // Compose skills_have from profile
      let skills = Array.isArray(profile?.skills) ? profile.skills : [];
      let mainSkill = profile?.main_skill || '';
      let skillsHave = mainSkill && !skills.includes(mainSkill) ? [mainSkill, ...skills] : skills;
      const { error: appError } = await supabase
        .from('applications')
        .insert({
          job_id: applyingJob.job_id,
          applicant_uid: userId,
          cover_letter: applicationCoverLetter || 'I am interested in this job!',
          fees: applicationFees,
          time_range: applicationTime,
          status: 'pending',
          skills_have: skillsHave,
        });
      if (appError) throw appError;
      setApplicationSuccess('Application submitted successfully!');
      setAppliedJobs(prev => [...prev, applyingJob.job_id]);
      setShowApplyModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  // Filtering logic
  const handleFilter = () => {
    let filtered = [...jobs];
    if (!showAll) {
      // Recommended jobs: match at least one freelancer skill
      if (profile?.skills && Array.isArray(profile.skills)) {
        filtered = filtered.filter(job =>
          (job.required_skills || []).some((skill: string) => profile.skills.includes(skill))
        );
      }
    }
    if (filterCategory) {
      filtered = filtered.filter(job => job.required_skills.includes(filterCategory));
    }
    if (filterTime) {
      filtered = filtered.filter(job => job.estimated_time_range === filterTime);
    }
    if (filterBudgetMin) {
      filtered = filtered.filter(job => job.budget >= Number(filterBudgetMin));
    }
    if (filterBudgetMax) {
      filtered = filtered.filter(job => job.budget <= Number(filterBudgetMax));
    }
    setFilteredJobs(filtered);
  };
  // Helper function for budget display
  const formatBudget = (job: Job) => {
    if (!job.budget) return 'NPR 0';
    if (job.pricing_type === 'hourly') {
      return `NPR ${job.budget}/hr`;
    } else {
      return `NPR ${job.budget}/project`;
    }
  };

  return (
    <div className="flex min-h-screen bg-green-light">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="yatra-one-text text-purple-attention text-3xl font-bold text-heading">Find Work</h1>
        </div>
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-8 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium mb-1">Category</label>
            <select
              className="border px-2 py-1 rounded w-44"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="">All</option>
              {skillsList.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Time Period</label>
            <select
              className="border px-2 py-1 rounded w-32"
              value={filterTime}
              onChange={e => setFilterTime(e.target.value)}
            >
              <option value="">All</option>
              {timeRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Budget Min</label>
            <input
              className="border px-2 py-1 rounded w-24"
              type="number"
              value={filterBudgetMin}
              onChange={e => setFilterBudgetMin(e.target.value)}
              placeholder="NPR 0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Budget Max</label>
            <input
              className="border px-2 py-1 rounded w-24"
              type="number"
              value={filterBudgetMax}
              onChange={e => setFilterBudgetMax(e.target.value)}
              placeholder="NPR 1000"
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-medium mb-1">Show</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`px-3 py-1 rounded ${!showAll ? 'bg-green-button text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => { setShowAll(false); setTimeout(handleFilter, 0); }}
              >Recommended</button>
              <button
                type="button"
                className={`px-3 py-1 rounded ${showAll ? 'bg-green-button text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => { setShowAll(true); setTimeout(handleFilter, 0); }}
              >All Jobs</button>
            </div>
          </div>
          <button
            type="button"
            className="ml-auto bg-green-button text-white px-4 py-2 rounded hover:bg-green-dark"
            onClick={handleFilter}
          >Apply Filters</button>
        </div>
        <section>
          <h2 className="text-xl font-semibold mb-4">{showAll ? 'All Jobs' : 'Recommended Jobs'}</h2>
          {filteredJobs.length === 0 ? (
            <div className="text-gray-500">No jobs found for the selected filters.</div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.job_id} job={job}>
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-semibold text-gray-700">{formatBudget(job)}</span>
                  <button
                    className="px-4 py-1.5 text-xs rounded-lg bg-purple-attention text-white font-semibold shadow-sm hover:bg-purple transition disabled:opacity-60"
                    onClick={() => openApplyModal(job)}
                    disabled={appliedJobs.includes(job.job_id)}
                  >{appliedJobs.includes(job.job_id) ? 'Applied' : 'Apply'}</button>
                </div>
              </JobCard>
            ))
          )}

          {/* Application Modal */}
          {showApplyModal && applyingJob && (
           <div className="fixed inset-0 h-full w-full z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <form
             onSubmit={handleApplySubmit}
             className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl relative border border-purple-attention animate-fade-in flex gap-8 max-h-[80vh]"
           >
             {/* Close Button */}
             <button
               type="button"
               className="absolute top-3 right-3 text-purple-attention hover:text-purple text-2xl font-bold"
               onClick={() => setShowApplyModal(false)}
             >
               &times;
             </button>
         
             {/* Left: Job Info */}
             <section className="flex-1 bg-purple-50 p-6 rounded-lg border border-purple-200 text-gray-700 overflow-auto max-h-[70vh]">
               <h3 className="text-2xl font-bold text-purple-attention mb-4">{applyingJob.title}</h3>
               <div className="mb-2">
                 <strong>Budget:</strong> NPR {applyingJob.budget} {applyingJob.pricing_type === 'hourly' ? '/hr' : '/project'}
               </div>
               <div className="mb-2"><strong>Estimated Time:</strong> {applyingJob.estimated_time_range || 'N/A'}</div>
               <div className="mb-2"><strong>Skills Required:</strong> {applyingJob.required_skills?.join(', ') || 'N/A'}</div>
               <div className="mb-4"><strong>Description:</strong> {applyingJob.description || 'No description provided.'}</div>
             </section>
         
             {/* Right: Application Form */}
             <section className="flex-1 max-w-md p-2 overflow-auto max-h-[70vh]">
               <h3 className="text-xl font-semibold text-gray-800 mb-6">
                 Apply to <span className="text-purple-attention">{applyingJob.title}</span>
               </h3>
         
               {/* Fees Input */}
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   What’s your rate {applyingJob.pricing_type === 'hourly' ? 'per hour' : 'for the entire project'} in NPR?
                 </label>
                 <input
                   type="number"
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-attention"
                   value={applicationFees}
                   onChange={e => setApplicationFees(e.target.value)}
                   placeholder="Enter your rate"
                   required
                 />
               </div>
         
               {/* Time Input */}
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                 <select
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-attention"
                   value={applicationTime}
                   onChange={e => setApplicationTime(e.target.value)}
                   required
                 >
                   <option value="" disabled>Select estimated time</option>
                   {timeRanges.map(range => (
                     <option key={range} value={range}>{range}</option>
                   ))}
                 </select>
               </div>
         
               {/* Cover Letter */}
               <div className="mb-4">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                 <textarea
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-attention"
                   value={applicationCoverLetter}
                   onChange={e => setApplicationCoverLetter(e.target.value)}
                   rows={6}
                   placeholder="Write a brief cover letter..."
                 />
               </div>
         
               {/* Submit Button */}
               <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-purple-attention hover:bg-purple text-white font-semibold py-2 rounded-lg transition"
               >
                 {loading ? 'Applying...' : 'Submit Application'}
               </button>
         
               {/* Messages */}
               {error && <div className="text-red-600 mt-3 text-sm">{error}</div>}
               {applicationSuccess && <div className="text-green-600 mt-3 text-sm">{applicationSuccess}</div>}
             </section>
           </form>
         </div>
         
)}


        </section>
      </main>
      {/* Mini Chat Panel */}
      {userId && <ChatPanel userId={userId} />}
    </div>
  );
}
