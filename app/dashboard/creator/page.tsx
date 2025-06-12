'use client';

import { supabase } from '@/app/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import ProfilePreview from '../components/ProfilePreview';
import ChatPanel from '../components/ChatPanel';
import JobCard from '../components/JobCard';
import ApplicationCard from '../components/ApplicationCard';

type Job = {
  job_id: string;
  title: string;
  budget: number;
  estimated_time_range: string;
  required_skills: string[];
  created_at: string;
  client?: { display_name: string; profile_picture_url: string | null };
};

type Application = {
  application_id: string;
  job: Job;
  status: 'pending' | 'interviewing' | 'hired' | 'rejected';
  cover_letter: string;
  fees: number;
  time_range: string;
  created_at: string;
};

type Bookmark = {
  bookmark_id: string;
  job: Job;
};

export default function CreatorDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [discoverJobs, setDiscoverJobs] = useState<Job[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('username, profile_picture_url, account_type, skills')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;
        setProfile(profileData);
        if (profileData.account_type !== 'creator') {
          setError('Unauthorized: Not a creator account');
          setLoading(false);
          return;
        }
        // Fetch applications
        const { data: apps, error: appsError } = await supabase
          .from('applications')
          .select('application_id, status, cover_letter, fees, time_range, created_at, job:job_id(*)')
          .eq('applicant_uid', user.id);
        if (appsError) throw appsError;
        setApplications(apps || []);
        // Fetch bookmarks
        const { data: bms, error: bmsError } = await supabase
          .from('bookmarks')
          .select('bookmark_id, job:job_id(*)')
          .eq('user_id', user.id);
        if (bmsError) throw bmsError;
        setBookmarks(bms || []);
        // Fetch discover jobs
        const appliedJobIds = (apps || []).map((a: any) => a.job?.job_id);
        const bookmarkedJobIds = (bms || []).map((b: any) => b.job?.job_id);
        const excludeIds = [...appliedJobIds, ...bookmarkedJobIds];
        let skills = Array.isArray(profileData.skills) ? profileData.skills : [];
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .neq('client_uid', user.id);
        if (jobsError) throw jobsError;
        // Filter jobs by skills and not applied/bookmarked
        const filteredJobs = (jobsData || []).filter((job: any) =>
          !excludeIds.includes(job.job_id) &&
          (job.required_skills || []).some((skill: string) => skills.includes(skill))
        );
        setDiscoverJobs(filteredJobs);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const applyToJob = async (job: Job) => {
    if (!userId) return;
    try {
      setLoading(true);
      const { error: appError } = await supabase
        .from('applications')
        .insert({
          job_id: job.job_id,
          applicant_uid: userId,
          cover_letter: 'I am interested in this job!',
          fees: job.budget,
          time_range: job.estimated_time_range,
          status: 'pending',
        });
      if (appError) throw appError;
      // Refresh
      window.location.reload();
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
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <div className="flex items-center space-x-4">
            {userId && <NotificationBell userId={userId} />}
          </div>
        </div>
        <div className="space-y-12">
          {/* Applied Jobs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Jobs You've Applied To</h2>
            {applications.length === 0 ? (
              <div className="text-gray-500">You haven't applied to any jobs yet.</div>
            ) : (
              applications.map((app) => (
                <ApplicationCard key={app.application_id} application={app} />
              ))
            )}
          </section>
          {/* Saved Jobs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Saved Jobs</h2>
            {bookmarks.length === 0 ? (
              <div className="text-gray-500">No saved jobs.</div>
            ) : (
              bookmarks.map((bm) => (
                <JobCard key={bm.bookmark_id} job={bm.job} />
              ))
            )}
          </section>
          {/* Discover Jobs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Discover Jobs</h2>
            {discoverJobs.length === 0 ? (
              <div className="text-gray-500">No new jobs matching your skills.</div>
            ) : (
              discoverJobs.map((job) => (
                <JobCard key={job.job_id} job={job}>
                  <button
                    className="ml-4 px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => applyToJob(job)}
                  >Apply</button>
                </JobCard>
              ))
            )}
          </section>
        </div>
      </main>
      {/* Mini Chat Panel */}
      {userId && <ChatPanel userId={userId} />}
    </div>
  );
}
