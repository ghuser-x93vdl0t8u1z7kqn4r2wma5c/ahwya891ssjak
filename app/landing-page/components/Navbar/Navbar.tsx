"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

type User = {
  username: string;
  profile_picture_url: string | null;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  {/* Check session expiry to be deleted */}
  useEffect(() => {
    const checkSessionExpiry = async () => {
      const sessionResponse = await supabase.auth.getSession();
  
      if (sessionResponse.data.session) {
        const accessToken = sessionResponse.data.session.access_token;
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('Token expires at (unix):', payload.exp);
        console.log('Expires at (date):', new Date(payload.exp * 1000));
      } else {
        console.log('No active session found.');
      }
    };
  
    checkSessionExpiry();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        
        if (session?.user) {
          // Fetch user profile data
          const { data: userData, error } = await supabase
            .from('users')
            .select('username, profile_picture_url')
            .eq('id', session.user.id)
            .single();

          if (!error && userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: userData } = await supabase
          .from('users')
          .select('username, profile_picture_url')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setUser(userData);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsDropdownOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className="w-full bg-background border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="yatra-one-text text-2xl text-purple">Lahara</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative group">
    
            </div>
            <div className="relative group">
              
            </div>
            <div className="relative group">
              
            </div>
          
          </div>

          {/* Search and Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      {user.profile_picture_url ? (
                        <img
                          src={user.profile_picture_url}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 text-sm font-semibold">
                            {user.username?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <span className="text-body">{user.username}</span>
                      <svg className="w-4 h-4 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <Link
                          href={`/profile/${user.username}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href={`/dashboard`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="text-body hover:text-green-hover">
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-green-button text-white px-6 py-2 rounded-full hover:bg-green-hover transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-body hover:text-green-hover"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              {!loading && (
                <div className="flex flex-col space-y-2 pt-4">
                  {user ? (
                    <>
                      <Link
                        href={`/profile/${user.username}`}
                        className="text-body hover:text-green-hover flex items-center space-x-2"
                      >
                        {user.profile_picture_url ? (
                          <img
                            src={user.profile_picture_url}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 text-sm font-semibold">
                              {user.username?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <span>{user.username}</span>
                        
                      </Link>
                        <Link
                        href={`/dashboard`}
                        className="text-body hover:text-green-hover flex items-center space-x-2"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-body hover:text-green-hover text-left"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="text-body hover:text-green-hover">
                        Log In
                      </Link>
                      <Link
                        href="/signup"
                        className="bg-green-button text-white px-6 py-2 rounded-full hover:bg-green-hover transition-colors text-center"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 