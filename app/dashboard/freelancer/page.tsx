'use client';
/* eslint-disable */

import { supabase } from '@/app/lib/supabase';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import ChatPanel from '../components/ChatPanel';
import JobCard from '../components/JobCard';

type Job = {
  job_id: string;
  title: string;
  description?: string;
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

type Review = {
  review_id: string;
  rating: number;
  review: string;
  created_at: string;
  reviewer: { display_name: string; profile_picture_url: string | null };
  job: { title: string };
};

export default function FreelancerDashboard() {
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const [openChatWithUserId, setOpenChatWithUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'applied' | 'saved' | 'reviews'>('applied');

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
        if (profileData.account_type !== 'freelancer') {
          setError('Unauthorized: Not a freelancer account');
          setLoading(false);
          return;
        }
        // Fetch applications
        const { data: apps, error: appsError } = await supabase
          .from('applications')
          .select('application_id, status, cover_letter, fees, time_range, created_at, job:job_id(*)')
          .eq('applicant_uid', user.id);
        if (appsError) throw appsError;
        setApplications(
          (apps || []).map((app: any) => ({
            ...app,
            job: Array.isArray(app.job) ? app.job[0] : app.job,
          }))
        );
        // Fetch bookmarks
        const { data: bms, error: bmsError } = await supabase
          .from('bookmarks')
          .select('bookmark_id, job:job_id(*)')
          .eq('user_id', user.id);
        if (bmsError) throw bmsError;
        setBookmarks(
          (bms || []).map((bm: any) => ({
            ...bm,
            job: Array.isArray(bm.job) ? bm.job[0] : bm.job,
          }))
        );
        // Fetch reviews
        const { data: revs, error: revsError } = await supabase
          .from('reviews')
          .select('review_id, rating, review, created_at, reviewer:reviewer_uid(*), job:job_id(title)')
          .eq('reviewee_uid', user.id);
        if (revsError) throw revsError;
        setReviews(
          (revs || []).map((rev: any) => ({
            ...rev,
            reviewer: Array.isArray(rev.reviewer) ? rev.reviewer[0] : rev.reviewer,
            job: Array.isArray(rev.job) ? rev.job[0] : rev.job,
          }))
        );
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || 'Unknown error');
        } else {
          setError(String(err));
        }
      }
      finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <div className="flex flex-row min-h-screen bg-green-light w-full justify-between">
              <div className='w-5 md:w-64'>
                <Sidebar />
              </div>
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h1 className="yatra-one-text text-2xl md:text-4xl text-purple font-bold">Freelancer Dashboard</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {userId && <NotificationBell userId={userId} />}
          </div>
        </div>
        <div>
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              className={`px-5 py-2 rounded-lg font-semibold transition border-2 ${activeTab === 'applied' ? 'bg-purple-attention text-white border-purple-attention shadow' : 'bg-purple text-white border-purple-attention hover:bg-purple hover:text-white'}`}
              onClick={() => setActiveTab('applied')}
            >Applied Jobs</button>
            <button
              className={`px-5 py-2 rounded-lg font-semibold transition border-2 ${activeTab === 'saved' ? 'bg-purple-attention text-white border-purple-attention shadow' : 'bg-purple text-white border-purple-attention hover:bg-purple hover:text-white'}`}
              onClick={() => setActiveTab('saved')}
            >Saved Jobs</button>
            <button
              className={`px-5 py-2 rounded-lg font-semibold transition border-2 ${activeTab === 'reviews' ? 'bg-purple-attention text-white border-purple-attention shadow' : 'bg-purple text-white border-purple-attention hover:bg-purple hover:text-white'}`}
              onClick={() => setActiveTab('reviews')}
            >Reviews</button>
          </div>
          {activeTab === 'applied' && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Jobs You&apos;ve Applied To</h2>
              {applications.length === 0 ? (
                <div className="text-gray-500">You haven&apos;t applied to any jobs yet.</div>
              ) : (
                applications.map((app) => (
                  <div key={app.application_id} className="relative mb-6">
                    <div className={`bg-green-light shadow-sm rounded-xl transition-all ${openAppId === app.application_id ? 'ring-2 ring-purple-attention bg-purple-attention/5' : ''}`}> 
                      {/* Accordion summary row */}
                      <button
                        className={`w-full flex justify-between items-center px-5 py-4 rounded-t-xl bg-transparent transition focus:outline-none focus:ring-0 ${openAppId === app.application_id ? '' : 'hover:bg-purple-attention/5'}`}
                        aria-expanded={openAppId === app.application_id}
                        onClick={() => setOpenAppId(openAppId === app.application_id ? null : app.application_id)}
                        style={{ border: 'none', boxShadow: 'none' }}
                      >
                        <span className="flex flex-col text-left gap-0.5">
                          <span className="font-bold text-heading text-lg">{app.job?.title}</span>
                          <span className="text-sm text-purple-attention font-medium">NPR {app.job?.budget}</span>
                          <span className="text-xs text-gray-500">{app.job?.estimated_time_range}</span>
                          <span className="text-xs text-gray-400">Posted on {app.job?.created_at ? new Date(app.job.created_at).toLocaleDateString() : ''}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className={
                            'px-3 py-1 rounded-full text-xs font-semibold transition ' +
                            (app.status === 'pending' ? 'bg-yellow text-yellow-900' :
                            app.status === 'interviewing' ? 'bg-purple-attention text-white' :
                            app.status === 'hired' ? 'bg-green-light text-green-dark' :
                            app.status === 'rejected' ? 'bg-red text-white' : 'bg-gray-200 text-gray-600')
                          }>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          <svg className={`w-5 h-5 ml-2 transition-transform ${openAppId === app.application_id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </span>
                      </button>
                      {/* Accordion details */}
                      {openAppId === app.application_id && (
                        <div className="p-6 rounded-b-xl bg-green-light transition-all border-t border-gray-100">
                          {app.job?.description && (
                            <div className="mb-3 text-sm text-gray-700 bg-white rounded p-3">
                              <span className="font-semibold text-purple">Job Description:</span>
                              <div className="mt-1 whitespace-pre-line">{app.job.description}</div>
                            </div>
                          )}
                          <div className="mb-2">
                            <span className="font-semibold text-purple">Your Cover Letter:</span>
                            <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">{app.cover_letter}</div>
                          </div>
                          <div className="flex gap-3 items-center mt-4">
                            <button
                              className="px-4 py-1.5 rounded-lg bg-red text-white text-xs font-semibold shadow-sm hover:bg-red-700 transition"
                              onClick={async () => {
                                if (!window.confirm('Are you sure you want to delete this application?')) return;
                                setLoading(true);
                                try {
                                  const { error } = await supabase
                                    .from('applications')
                                    .delete()
                                    .eq('application_id', app.application_id);
                                  if (error) throw error;
                                  setApplications(prev => prev.filter(a => a.application_id !== app.application_id));
                                } catch (err) {
                                  if (err instanceof Error) {
                                    setError(err.message || 'Could not delete application');
                                  } else {
                                    setError(String(err));
                                  }
                                }
                                finally {
                                  setLoading(false);
                                }
                              }}
                            >Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && <div className="text-gray-500 mt-2">Processing...</div>}
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </section>
          )}
          {activeTab === 'saved' && (
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
          )}
          {activeTab === 'reviews' && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              {reviews.length === 0 ? (
                <div className="text-gray-500">No reviews yet.</div>
              ) : (
                reviews.map((review) => (
                  <div key={review.review_id} className="bg-card p-6 rounded-lg border mb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          {review.reviewer.profile_picture_url ? (
                            <img 
                              src={review.reviewer.profile_picture_url} 
                              alt={review.reviewer.display_name}
                              className="w-full h-full rounded-full object-cover"
                              width={48}
                              height={48}
                            />
                          ) : (
                            <span className="text-lg font-medium">
                              {review.reviewer.display_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{review.reviewer.display_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {review.job?.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-muted'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-muted-foreground">{review.review}</p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </section>
          )}
        </div>
      </main>
      {/* Mini Chat Panel */}
      {userId && <ChatPanel userId={userId} openChatWithUserId={openChatWithUserId} onCloseChat={() => setOpenChatWithUserId(null)} />}
    </div>
    </div>
  );
}
