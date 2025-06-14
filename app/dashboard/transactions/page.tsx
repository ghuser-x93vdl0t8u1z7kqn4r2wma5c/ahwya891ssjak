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

        const userIds = Array.from(new Set(
          txsWithDirection.flatMap((tx: any) => [tx.from_user, tx.to_user]).filter(Boolean)
        ));

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
        setError(err instanceof Error ? err.message : String(err));
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

  const SortIcons = ({ column }: { column: string }) => {
    const isActive = sortKey === column;
    return (
      <span className="inline-flex flex-row ml-1 space-x-0.5 text-[10px] leading-none select-none">
        <ArrowUp className={`w-3 h-3 ${isActive && sortOrder === "asc" ? "text-white" : "text-gray-input"}`} />
        <ArrowDown className={`w-3 h-3 ${isActive && sortOrder === "desc" ? "text-white" : "text-gray-input"}`} />
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-green-light flex flex-col gap-2 md:flex-row">
      {/* Sidebar */}
      <div className="w-full h-full md:w-64">
        <Sidebar />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 py-4">
        <h1 className="text-2xl md:text-4xl font-bold text-purple yatra-one-text mb-6">Transactions</h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="text-sm flex items-center flex-wrap gap-2">
            Show:
            {[10, 20, 50].map(size => (
              <button
                key={size}
                className={`px-2 py-1 border rounded ${pageSize === size ? 'bg-green-light' : ''}`}
                onClick={() => { setPageSize(size); setCurrentPage(1); }}
              >
                {size}
              </button>
            ))}
            per page
          </div>
          <div className="text-sm">Page {currentPage} of {totalPages}</div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <p className="text-red text-sm">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-input">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300 rounded-lg">
              <thead className="text-xs text-white bg-green-dark">
                <tr>
                  <th className="py-2 px-3 text-left">S.N.</th>
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
                    className="py-2 px-3 text-right cursor-pointer select-none flex items-center justify-end"
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
                    className={`${idx % 2 === 0 ? 'bg-green-light' : 'bg-white'} hover:bg-[--color-green-hover]/10 transition`}
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
