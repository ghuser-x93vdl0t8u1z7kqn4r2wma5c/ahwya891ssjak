import React, { useState, useEffect } from 'react';
import { supabase } from "@/app/lib/supabase";
import Link from 'next/link';
import { SidebarIcon } from 'lucide-react';
interface Profile {
  username: string;
  account_type: 'freelancer' | 'business';
  profile_picture_url: string;
  // add other fields as needed
}

export default function Sidebar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('username, account_type, profile_picture_url')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setProfile(data);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const [open, setOpen] = useState(false);

  const freelancerLinks = [
    { href: '/', label: 'Home' },
    { href: profile ? `/profile/${profile.username}` : '#', label: 'Profile', isLink: true },
    { href: '/dashboard/', label: 'Dashboard' },
    { href: '/dashboard/find_work/freelancer', label: 'Find Work' },
    { href: '/dashboard/wallet', label: 'Wallet' },
    { href: '/dashboard/topup', label: 'Topup' },
    { href: '/dashboard/transactions', label: 'Transactions' },
    { href: '/dashboard/withdraw', label: 'Withdraw' },
  ];

  const businessLinks = [
    { href: '/', label: 'Home' },
    { href: profile ? `/profile/${profile.username}` : '#', label: 'Profile', isLink: true },
    { href: '/dashboard/', label: 'Dashboard' },
    { href: '/dashboard/client/create-job', label: 'Post New Job' },
    { href: '/dashboard/wallet', label: 'Wallet' },
    { href: '/dashboard/topup', label: 'Topup' },
    { href: '/dashboard/transactions', label: 'Transactions' },
    { href: '/dashboard/withdraw', label: 'Withdraw' },
  ];

  const links = profile?.account_type === 'business' ? businessLinks : freelancerLinks;
  if (loading) {
    return (
      <div className=" hidden md:flex w-full bg-green-dark h-full p-4 md:h-[100vh] flex-col gap-3">
      {/* Top profile box */}
      <div className="bg-green-light h-20 mb-10 rounded-lg animate-pulse"></div>

      {/* Nav items (5 total) */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-green-light h-8 rounded-md animate-pulse"></div>
      ))}
    </div>
  );
  }

  return (
    <div className="bg-green-dark">
      
      {/* Hamburger for small screens */}
      <button
        className={`md:hidden z-50 absolute top-4 left-4  rounded transition-colors ${
          open ? 'bg-white p-2' : ''
        }`}
        onClick={() => setOpen(!open)}
        aria-label="Open sidebar"
      >
        <SidebarIcon />
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full min-h-screen w-64 bg-green-dark border-r p-4 transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0 flex' : '-translate-x-full'} md:translate-x-0 md:flex flex-col hidden`}
      >
        <div className="mb-8 bg-white border-1 border-purple-attention rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : profile ? (
            // <ProfilePreview profile={profile} />
            <div className="p-4 flex items-center gap-2">
              <img src={profile.profile_picture_url} alt="Profile Picture" className="w-12 h-12 rounded-full" />
              <div className="flex flex-col gap-1">
                <div className="font-bold text-lg">{profile.username}</div>
                <div className="text-xs text-gray-600">{profile.account_type}</div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-gray-500 text-center">No profile found</div>
          )}
        </div>
        <nav className="space-y-2">
          {links.map((link, idx) =>
            link.isLink ? (
              <Link
                key={idx}
                className="block yatra-one-text bold px-3 py-2 rounded text-white hover:bg-purple hover:purple-attention transition font-semibold"
                href={link.href}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={idx}
                className="block yatra-one-text bold px-3 py-2 rounded text-white hover:bg-purple hover:purple-attention transition font-semibold"
                href={link.href}
              >
                {link.label}
              </a>
            )
          )}
        </nav>
      </aside>
      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-green-dark z-40 p-4 py-20 flex flex-col"
          onClick={() => setOpen(false)}
        >
          {/* Prevent closing when clicking inside nav */}
          <nav
            className="space-y-2 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <div className="flex items-center justify-center h-auto">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : profile ? (
              <div className="p-4 flex items-center gap-2 mb-4 bg-white border-1 border-purple-attention rounded-lg">
                <img
                  src={profile.profile_picture_url}
                  alt="Profile Picture"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex flex-col gap-1">
                  <div className="font-bold text-lg">{profile.username}</div>
                  <div className="text-xs text-gray-600">{profile.account_type}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-gray-500 text-center mb-4">No profile found</div>
            )}
            {links.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="block yatra-one-text bold px-3 py-2 rounded text-white hover:bg-purple hover:purple-attention transition font-semibold"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
