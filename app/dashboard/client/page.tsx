'use client';

import { supabase } from '@/app/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import ChatPanel from '../components/ChatPanel';
import ApplicationCard from '../components/ApplicationCard';
import { ChevronDown, ChevronUp,Trash2 } from 'lucide-react';

type Job = {
  job_id: string;
  title: string;
  budget: number;
  pricing_type: string;
  estimated_time_range: string;
  created_at: string;
  status?: 'open' | 'completed' | 'closed';
  applications: Array<{
    application_id: string;
    applicant_uid: string;
    applicant: {
      display_name: string;
      profile_picture_url: string | null;
      main_skill: string | null;
      rating: number | null;
      skills: string[];
    };
    cover_letter: string;
    skills: string[];
    fees: number;
    status: 'pending' | 'interviewing' | 'hired' | 'rejected';
    time_range: string;
    created_at: string;
  }>;
};

export default function ClientDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
const [confirmInput, setConfirmInput] = useState('');
const [deleting, setDeleting] = useState(false);

  // eslint-disable-next-line
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [openChatWithUserId, setOpenChatWithUserId] = useState<string | null>(null);

  // Accordion states
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  // Track open applications per job as a map: jobId -> open application id or null
  const [openApplications, setOpenApplications] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
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

        // Fetch jobs with applications
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(
            `*, 
             applications:applications (
               application_id, applicant_uid, cover_letter, fees, status, time_range, created_at,
               applicant:applicant_uid (display_name, profile_picture_url, main_skill, rating, skills)
             )`
          )
          .eq('client_uid', user.id);
        if (jobsError) throw jobsError;

        setJobs(jobsData || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Unknown error');
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateApplicationStatus = async (
    applicationId: string,
    status: 'interviewing' | 'hired' | 'rejected'
  ) => {
    try {
      const { error } = await supabase.from('applications').update({ status }).eq('application_id', applicationId);
      if (error) throw error;

      setJobs((prevJobs) =>
        prevJobs.map((job) => ({
          ...job,
          applications: job.applications.map((app) =>
            app.application_id === applicationId ? { ...app, status } : app
          ),
        }))
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Error updating application status');
      } else {
        setError(String(err));
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete || confirmInput !== jobToDelete.title) return;
    setDeleting(true);
  
    try {
      const { error } = await supabase.from('jobs').delete().eq('job_id', jobToDelete.job_id);
      if (error) throw error;
  
      setJobs((prev) => prev.filter((job) => job.job_id !== jobToDelete.job_id));
      setJobToDelete(null);
      setConfirmInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  };
  
  

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  // Toggle job accordion open/close
  const toggleJobAccordion = (jobId: string) => {
    setOpenJobId((prev) => (prev === jobId ? null : jobId));
  };

  // Toggle application accordion open/close for a job
  const toggleApplicationAccordion = (jobId: string, appId: string) => {
    setOpenApplications((prev) => ({
      ...prev,
      [jobId]: prev[jobId] === appId ? null : appId,
    }));
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row min-h-screen bg-green-light">
      <div className="flex flex-row gap-2 min-h-screen bg-green-light w-full justify-between">
        <div className='w-5 md:w-64'>
          <Sidebar />
        </div>
      <main className="flex-1 p-4 py-7 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="yatra-one-text text-2xl md:text-4xl text-purple font-bold">Business Dashboard</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="hidden">
              {userId && <NotificationBell userId={userId} />}
            </div>
            <button
              className="bg-purple px-5 py-2 rounded-lg text-white font-bold shadow hover:bg-purple-attention border-2 border-purple-attention transition"
              onClick={() => router.push('/dashboard/client/create-job')}
            >
              Post New Job
            </button>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow border border-purple-attention">
            <h2 className="text-xl font-semibold text-purple-attention">No jobs posted yet</h2>
            <p className="mt-2 text-heading">Get started by posting your first job!</p>
          </div>
        ) : (
          jobs.map((job) => {
            const completed = job.status === 'completed';
            const isJobOpen = openJobId === job.job_id;

            return (
              <section
                key={job.job_id}
                className={`mb-6 bg-white rounded-xl shadow border ${
                  completed ? 'border-green-dark bg-green-light/40' : 'border-purple-attention'
                }`}
              >
                <div className='flex flex-row justify-between items-center p-6 gap-2'>
                <button
                  className="w-full flex justify-between items-center cursor-pointer focus:outline-none"
                  onClick={() => toggleJobAccordion(job.job_id)}
                  aria-expanded={isJobOpen}
                >
                  <div className="flex flex-col justify-items-start">
                    <h2 className="self-start text-xl font-bold text-purple-attention">{job.title}</h2>
                    <p className="text-sm text-gray-600">
                      Posted on:{' '}
                      <span className="font-semibold">{formatDate(job.created_at)}</span> | Budget:{' '}
                      <span className="font-semibold">
                        NPR: {job.budget}{job.pricing_type === 'hourly' ? '/hr' : '/project'}
                      </span>{' '}
                      | Estimated time: {job.estimated_time_range}
                    </p>
                    {completed && (
                      <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full bg-green-dark text-white">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="">
                    {isJobOpen ? (
                      <ChevronUp className="text-purple-attention" />
                    ) : (
                      <ChevronDown className="text-purple-attention" />
                    )}
                  </div>
                </button>
                <button
                      onClick={() => setJobToDelete(job)}
                      className="text-red hover:underline text-sm"
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
               </div>

                {jobToDelete && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-lg font-bold text-red-600 mb-2">Delete Job</h2>
      <p className="text-sm text-gray-700 mb-4">
        This action is permanent. To confirm deletion of{' '}
        <span className="font-semibold">{jobToDelete.title}</span>, type the job title below:
      </p>

      <input
        type="text"
        className="w-full border px-3 py-2 rounded mb-4"
        placeholder="Type job title to confirm"
        value={confirmInput}
        onChange={(e) => setConfirmInput(e.target.value)}
      />

      <div className="flex justify-between">
        <button
          onClick={() => {
            setJobToDelete(null);
            setConfirmInput('');
          }}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteConfirm}
          disabled={confirmInput !== jobToDelete.title || deleting}
          className={`px-4 py-2 rounded text-white text-sm ${
            confirmInput === jobToDelete.title
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-red-300 cursor-not-allowed'
          }`}
        >
          {deleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
      </div>
    </div>
  </div>
)}


                {isJobOpen && (
                  <div className="px-6 pb-6">
                    {job.applications.length === 0 ? (
                      <p className="text-center text-gray-500 italic">No applications yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {job.applications.map((application) => {
                          const isAppOpen = openApplications[job.job_id] === application.application_id;

                          return (
                            <div key={application.application_id} className="border border-gray-200 rounded-lg">
                              <button
                                className="w-full flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 focus:outline-none"
                                onClick={() =>
                                  toggleApplicationAccordion(job.job_id, application.application_id)
                                }
                                aria-expanded={isAppOpen}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="font-semibold text-purple-attention">
                                    {application.applicant.display_name}
                                  </div>
                                  <div className="text-xs px-2 py-1 bg-purple-attention text-white rounded-full border border-purple-attention font-medium">
                                    {application.applicant.main_skill || 'No main skill'}
                                  </div>
                                  <span className="text-xs text-gray-600 capitalize">{application.status}</span>

                                  <div className="text-xs font-semibold text-purple-attention">
                                    Bid: NPR {application.fees}{job.pricing_type === 'hourly' ? '/hr' : '/project'}
                                  </div>
                                </div>
                                <div>
                                  {isAppOpen ? (
                                    <ChevronUp className="text-purple-attention" />
                                  ) : (
                                    <ChevronDown className="text-purple-attention" />
                                  )}
                                </div>
                              </button>

                              {isAppOpen && (
                                <div className="p-4 bg-white">
                                  <ApplicationCard application={application} pricing_type={job.pricing_type}>
                                    <div className="flex flex-wrap gap-2 items-center mt-2">
                                      <button
                                        className="px-3 py-1 text-xs rounded bg-purple text-white hover:bg-purple-attention border-2 border-purple-attention transition"
                                        onClick={() => {
                                          if (application.applicant_uid)
                                            setOpenChatWithUserId(application.applicant_uid);
                                        }}
                                      >
                                        Message Freelancer
                                      </button>

                                      {application.status === 'pending' && (
                                        <>
                                          <button
                                            className="px-3 py-1 text-xs rounded bg-yellow bg-opacity-70 text-heading hover:bg-yellow border-2 border-yellow-300 transition"
                                            onClick={() =>
                                              updateApplicationStatus(application.application_id, 'interviewing')
                                            }
                                          >
                                            Interview
                                          </button>
                                          <button
                                            className="px-3 py-1 text-xs rounded bg-red bg-opacity-30 text-white hover:bg-red border-2 border-red-400 transition"
                                            onClick={() =>
                                              updateApplicationStatus(application.application_id, 'rejected')
                                            }
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}

                                      {application.status === 'interviewing' && (
                                        <button
                                          className="px-3 py-1 text-xs rounded bg-green-light text-heading hover:bg-green-hover border-2 border-green-dark transition"
                                          onClick={() =>
                                            updateApplicationStatus(application.application_id, 'hired')
                                          }
                                        >
                                          Hire
                                        </button>
                                      )}

                                      <span
                                        className={`px-3 py-1 text-xs rounded-full border font-semibold ${
                                          application.status === 'hired'
                                            ? 'bg-green-light text-green-dark border-green-dark'
                                            : application.status === 'rejected'
                                            ? 'bg-red bg-opacity-20 text-white border-red-400'
                                            : 'bg-yellow bg-opacity-60 text-heading border-yellow-300'
                                        }`}
                                      >
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                      </span>

                                      <span className="ml-auto text-xs text-gray-500">
                                        Applied: {formatDate(application.created_at)}
                                      </span>
                                    </div>
                                  </ApplicationCard>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>
      </div>

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
