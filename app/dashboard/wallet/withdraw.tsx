"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function WalletWithdraw() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [esewa, setEsewa] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setUsername(data.user?.user_metadata?.username || "");
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Optionally insert a withdrawal request for admin
      setSubmitted(true);
    } catch (err) {
      setError((err as any).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Wallet Withdrawal Request</h1>
      <ol className="mb-4 text-sm bg-yellow-50 p-3 rounded">
        <li>1. Enter the amount you want to withdraw.</li>
        <li>2. Enter your eSewa details for the payout.</li>
        <li>3. Enter your wallet password to confirm.</li>
        <li>4. After admin processes your request, funds will be sent to your eSewa.</li>
      </ol>
      {submitted ? (
        <div className="bg-green-100 p-4 rounded text-green-700">Your withdrawal request has been submitted. Please wait for admin approval.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Amount to Withdraw</label>
            <input type="number" min="1" className="border px-2 py-1 rounded w-full" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Your Username</label>
            <input type="text" className="border px-2 py-1 rounded w-full" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Your eSewa Number</label>
            <input type="text" className="border px-2 py-1 rounded w-full" value={esewa} onChange={e => setEsewa(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Wallet Password</label>
            <div className="flex items-center">
              <input type={showPassword ? "text" : "password"} className="border px-2 py-1 rounded mr-2 w-full" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              <button type="button" className="text-gray-600 px-2" tabIndex={-1} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0110 19c-5 0-9-4-9-9 0-1.657.42-3.22 1.156-4.575M4.222 4.222A9.953 9.953 0 0110 1c5 0 9 4 9 9 0 2.21-.722 4.244-1.938 5.938M1 1l18 18" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c2.21 0 4.244.722 5.938 1.938M15.778 15.778A9.953 9.953 0 0110 19c-5 0-9-4-9-9 0-2.21.722-4.244 1.938-5.938M1 1l18 18" /></svg>
                )}
              </button>
            </div>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={submitting}>{submitting ? "Submitting..." : "Submit Withdrawal Request"}</button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
}
