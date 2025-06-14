"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Sidebar from "../components/Sidebar";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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
          .order(sortKey, { ascending: sortOrder === 'asc' })
          .range(0, 999);

        if (txsError) throw txsError;
        const txsWithDirection = (txs || []).map((tx: any) => {
          let direction = 'Other';
          if (tx.from_user === userId && tx.to_user === userId) direction = 'Self';
          else if (tx.from_user === userId) direction = 'Sent';
          else if (tx.to_user === userId) direction = 'Received';
          return { ...tx, direction };
        });

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

        const txsWithNames = txsWithDirection.map((tx: any) => ({
          ...tx,
          from_username: userMap[tx.from_user] || 'Unknown',
          to_username: userMap[tx.to_user] || 'Unknown',
        }));
        setTransactions(txsWithNames);
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
    fetchTransactions();
  }, [userId, sortKey, sortOrder]);

  const paginatedTx = transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(transactions.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Both arrows side-by-side, highlight active one, dim inactive
  const SortIcons = ({ column }: { column: string }) => {
    const isActive = sortKey === column;
    return (
      <span className="inline-flex flex-row ml-1 space-x-0.5 text-[10px] leading-none select-none">
        <ArrowUp
          className={`w-3 h-3 ${isActive && sortOrder === "asc" ? "text-white" : "text-gray-input"}`}
        />
        <ArrowDown
          className={`w-3 h-3 ${isActive && sortOrder === "desc" ? "text-white" : "text-gray-input"}`}
        />
      </span>
    );
  };

  return (
    <div className="flex w-full h-full flex-row justify-between gap-2">
      <div className="w-fit h-full bg-green-dark">
        <Sidebar />
      </div>
      <div className="w-full h-full mx-auto px-6 py-2">
        <h1 className="text-4xl font-bold text-purple yatra-one-text mb-6">Transactions</h1>

        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="text-sm flex items-center justify-between gap-2">
            Show:
            {[10, 20, 50].map(size => (
              <button
                key={size}
                className={`ml-2 px-2 py-1 rounded border ${pageSize === size ? 'bg-green-light' : ''}`}
                onClick={() => { setPageSize(size); setCurrentPage(1); }}
              >
                {size}
              </button>
            ))}
            per page
          </div>
          <div className="text-sm">Page {currentPage} of {totalPages}</div>
          <div className="flex justify-center gap-4 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-input">Loading...</div>
        ) : error ? (
          <div className="text-red text-sm">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-gray-input">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300 rounded-lg">
              <thead className="w-full text-xs text-white bg-green-dark rounded-t-lg">
                <tr>
                  <th className="py-2 px-3 text-left rounded-tl-lg">S.N.</th>
                  <th
                    className="py-2 px-3 text-left cursor-pointer select-none flex items-center"
                    onClick={() => handleSort("created_at")}
                  >
                    Date <SortIcons column="created_at" />
                  </th>
                  <th className="py-2 px-3 text-left">Type</th>
                  <th className="py-2 px-3 text-left">Direction</th>
                  <th className="py-2 px-3 text-left">From</th>
                  <th className="py-2 px-3 text-left">To</th>
                  <th
                    className="py-2 px-3 text-right cursor-pointer select-none flex items-center justify-end rounded-tr-lg"
                    onClick={() => handleSort("amount")}
                  >
                    Amount (NRS) <SortIcons column="amount" />
                  </th>
                </tr>
              </thead>
              <tbody>
  {paginatedTx.map((tx, idx) => (
    <tr
      key={tx.id || tx.created_at}
      className={`${idx % 2 === 0 ? 'bg-green-light' : 'bg-white'} hover:bg-[--color-green-hover]/10 transition rounded-xl text-[--color-text]`}
    >
      <td className="py-2 px-3 font-medium">{(currentPage - 1) * pageSize + idx + 1}</td>
      <td className="py-2 px-3 whitespace-nowrap">{new Date(tx.created_at).toLocaleString()}</td>
      <td className="py-2 px-3 text-purple font-semibold">{tx.type}</td>
      <td className="py-2 px-3 text-purple-attention capitalize">{tx.direction}</td>
      <td className="py-2 px-3 font-mono text-xs text-gray-input">{tx.from_username}</td>
      <td className="py-2 px-3 font-mono text-xs text-gray-input">{tx.to_username}</td>
      <td className="py-2 px-3 text-right font-bold text-green-hover">
        {tx.amount} <span className="text-xs text-gray-input font-medium">NRS</span>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}
