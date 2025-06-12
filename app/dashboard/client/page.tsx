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
import Link from 'next/link';

type Job = {
  job_id: string;
  title: string;
  budget: number;
  estimated_time_range: string;
  created_at: string;
  applications: Array<{
    application_id: string;
    applicant_uid: string;
    applicant: {
      display_name: string;
      profile_picture_url: string | null;
      main_skill: string | null;
      rating: number | null;
    };
    cover_letter: string;
    fees: number;
    status: 'pending' | 'interviewing' | 'hired' | 'rejected';
    time_range: string;
  }>;
};

export default function ClientDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [openChatWithUserId, setOpenChatWithUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('username, profile_picture_url, account_type')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;
        setProfile(profileData);
        // Fetch jobs created by the client
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`*, applications:applications (application_id, applicant_uid, cover_letter, fees, status, time_range, applicant:applicant_uid (display_name, profile_picture_url, main_skill, rating))`)
          .eq('client_uid', user.id);
        if (jobsError) throw jobsError;
        setJobs(jobsData || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateApplicationStatus = async (applicationId: string, status: 'interviewing' | 'hired' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('application_id', applicationId);
      if (error) throw error;
      // Update local state
      setJobs(prevJobs =>
        prevJobs.map(job => ({
          ...job,
          applications: job.applications.map(app =>
            app.application_id === applicationId ? { ...app, status } : app
          )
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Error updating application status');
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
    <div className="flex flex-col md:flex-row min-h-screen bg-green-light">
      {/* Sidebar: collapsible on mobile */}
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="yatra-one-text text-2xl md:text-4xl text-heading font-bold">Client Dashboard</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {userId && <NotificationBell userId={userId} />}
            <button
              className="bg-purple px-5 py-2 rounded-lg text-white font-bold shadow hover:bg-purple-attention border-2 border-purple-attention transition"
              onClick={() => router.push('/dashboard/client/create-job')}
            >
              Post New Job
            </button>
          </div>
        </div>
        <div className="space-y-8">
          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border border-purple-attention">
              <h2 className="text-xl font-semibold text-purple-attention">No jobs posted yet</h2>
              <p className="mt-2 text-heading">Get started by posting your first job!</p>
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard key={job.job_id} job={job}>
                <span className="text-sm font-medium text-purple-attention">
                  {job.applications.length} {job.applications.length === 1 ? 'Application' : 'Applications'}
                </span>
              </JobCard>
            ))
          )}
          {/* Applications section for each job */}
          {jobs.map((job) => (
            job.applications.length > 0 && (
              <div key={job.job_id + '-applications'} className="bg-white rounded-xl shadow p-6 border border-purple-attention">
                <h3 className="text-lg font-semibold mb-4 text-purple-attention">Applications for {job.title}</h3>
                <div className="space-y-4">
                  {job.applications.map((application) => (
                    <ApplicationCard key={application.application_id} application={application}>
                      <div className="flex flex-wrap gap-2 items-center">
                        <button
                          className="px-3 py-1 text-xs rounded bg-purple text-white hover:bg-purple-attention border-2 border-purple-attention transition"
                          onClick={() => {
                            if (application.applicant_uid) setOpenChatWithUserId(application.applicant_uid);
                          }}
                        >
                          Message Freelancer
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button
                              className="px-3 py-1 text-xs rounded bg-yellow bg-opacity-70 text-heading hover:bg-yellow border-2 border-yellow-300 transition"
                              onClick={() => updateApplicationStatus(application.application_id, 'interviewing')}
                            >
                              Interview
                            </button>
                            <button
                              className="px-3 py-1 text-xs rounded bg-red bg-opacity-30 text-red hover:bg-red border-2 border-red-400 transition"
                              onClick={() => updateApplicationStatus(application.application_id, 'rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {application.status === 'interviewing' && (
                          <button
                            className="px-3 py-1 text-xs rounded bg-green-light text-heading hover:bg-green-hover border-2 border-green-dark transition"
                            onClick={() => updateApplicationStatus(application.application_id, 'hired')}
                          >
                            Hire
                          </button>
                        )}
                        <span className={`px-3 py-1 text-xs rounded-full border font-semibold ${
                          application.status === 'hired' ? 'bg-green-light text-green-dark border-green-dark' :
                          application.status === 'rejected' ? 'bg-red bg-opacity-20 text-red border-red-400' :
                          'bg-yellow bg-opacity-60 text-heading border-yellow-300'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </ApplicationCard>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </main>
      {/* Mini Chat Panel */}
      {userId && (
        <ChatPanel
          userId={userId}
          openChatWithUserId={openChatWithUserId}
          onCloseChat={() => setOpenChatWithUserId(null)}
        />
      )}
    </div>
  );
}
