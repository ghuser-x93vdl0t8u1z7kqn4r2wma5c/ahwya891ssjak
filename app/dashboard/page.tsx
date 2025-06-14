"use client"
import React, { useEffect, useState } from 'react';
import ClientDashboard from './client/page';
import FreelancerDashboard from './freelancer/page';
import { supabase } from '@/app/lib/supabase';

const DashboardPage = () => {
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountType = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAccountType(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('account_type')
        .eq('id', user.id)
        .single();
      if (error || !data) {
        setAccountType(null);
      } else {
        setAccountType(data.account_type);
      }
      setLoading(false);
    };
    fetchAccountType();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (accountType === 'business') return <ClientDashboard />;
  if (accountType === 'freelancer') return <FreelancerDashboard />;
  return <div>Account type not recognized.</div>;
};

export default DashboardPage;
