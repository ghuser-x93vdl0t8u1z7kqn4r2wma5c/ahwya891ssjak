'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';

type User = {
  email: string;
  username: string;
  account_type: string;
  profile_picture_url: string | null;
  main_skill: string | null;
  rating: number | null;
  created_at: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First get the current user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          // If no session, redirect to login
          router.push('/login');
          return;
        }

        // Get the user's data from the users table
        const { data, error } = await supabase
          .from('users')
          .select('email, username, account_type, profile_picture_url, main_skill, rating, created_at')
          .eq('email', session.user.email)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-pulse">Loading your data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="text-red-500">Please log in to view your dashboard</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              {user.profile_picture_url ? (
                <img 
                  src={user.profile_picture_url} 
                  alt={user.username}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                    <p className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-sm font-semibold rounded-full ${
                        user.account_type === 'freelancer' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {user.account_type}
                      </span>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Main Skill</h3>
                    <p className="mt-1 text-gray-900">{user.main_skill || 'Not specified'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                    <p className="mt-1">
                      {user.rating ? (
                        <span className="flex items-center text-gray-900">
                          <span className="text-yellow-400 mr-1">★</span>
                          {user.rating.toFixed(1)}
                        </span>
                      ) : 'Not rated yet'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                    <p className="mt-1 text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 