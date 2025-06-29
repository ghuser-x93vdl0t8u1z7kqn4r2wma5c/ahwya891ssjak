import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function NotificationBell({ userId }: { userId: string }) {
  // eslint-disable-next-line
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchNotifications();
  }, [userId]);

  return (
    <div className="relative">
      <button className="relative">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
        )}
      </button>
      {/* You can add a dropdown to show notifications here */}
      {loading && <div className="absolute right-0 mt-2 px-2 py-1 text-xs bg-white border rounded shadow">Loading...</div>}
      {error && <div className="absolute right-0 mt-2 px-2 py-1 text-xs bg-red-100 text-red-800 border rounded shadow">{error}</div>}
    </div>
  );
}
