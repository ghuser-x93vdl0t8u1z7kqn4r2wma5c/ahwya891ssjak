
"use client"
import { useParams } from 'next/navigation';
import React, { Suspense, lazy } from 'react';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function ProfilePage() {
  const { username } = useParams();
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccountType() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('users')
        .select('account_type')
        .eq('username', username)
        .single();
      if (error || !data) {
        setError('User not found');
        setLoading(false);
        return;
      }
      setAccountType(data.account_type);
      setLoading(false);
    }
    if (username) fetchAccountType();
  }, [username]);

  let DynamicProfileComponent: React.ComponentType<{ username: string }> | null = null;
  if (accountType === 'creator') {
    DynamicProfileComponent = lazy(() => import('./creator/page'));
  } else if (accountType === 'business') {
    DynamicProfileComponent = lazy(() => import('./business/page'));
  } else if (accountType === 'freelancer') {
    DynamicProfileComponent = lazy(() => import('./freelancer/page'));
  }

  // Reload after 5 seconds if still loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        if (loading) window.location.reload();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error === 'User not found') {
    const UserNotFoundComponent = lazy(() => import('./user-not-found/page'));
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <UserNotFoundComponent />
      </Suspense>
    );
  }
  if (error || !DynamicProfileComponent) {
    return <div>{error || 'Unknown account type.'}</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicProfileComponent username={username as string} />
    </Suspense>
  );
}
