"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) setUserId(user.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: txs, error: txsError } = await supabase
          .from("transactions")
          .select("*")
          .or(`from_user.eq.${userId},to_user.eq.${userId}`)
          .order("created_at", { ascending: false })
          .range(0, 999);
        if (txsError) throw txsError;
        // Mark direction for each transaction
        const txsWithDirection = (txs || []).map((tx: any) => {
          let direction = 'Other';
          if (tx.from_user === userId && tx.to_user === userId) direction = 'Self';
          else if (tx.from_user === userId) direction = 'Sent';
          else if (tx.to_user === userId) direction = 'Received';
          return { ...tx, direction };
        });
        // Fetch usernames for all unique from_user and to_user
        const userIds = Array.from(new Set((txsWithDirection.flatMap((tx: any) => [tx.from_user, tx.to_user]).filter(Boolean))));
        let userMap: Record<string, string> = {};
        if (userIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, username')
            .in('id', userIds);
          if (!usersError && users) {
            userMap = Object.fromEntries(users.map((u: any) => [u.id, u.username]));
          }
        }
        // Attach usernames to transactions
        const txsWithNames = txsWithDirection.map((tx: any) => ({
          ...tx,
          from_username: userMap[tx.from_user] || 'Unknown',
          to_username: userMap[tx.to_user] || 'Unknown',
        }));
        setTransactions(txsWithNames);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [userId]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-gray-500">No transactions yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">S.N.</th>
              <th className="text-left py-1">Date</th>
              <th className="text-left py-1">Type</th>
              <th className="text-left py-1">Direction</th>
              <th className="text-left py-1">From</th>
              <th className="text-left py-1">To</th>
              <th className="text-right py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={tx.id || tx.created_at} className="border-b last:border-0">
                <td>{idx + 1}</td>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
                <td>{tx.type}</td>
                <td>{tx.direction}</td>
                <td className="font-mono text-xs">{tx.from_username}</td>
                <td className="font-mono text-xs">{tx.to_username}</td>
                <td className="text-right">{tx.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
