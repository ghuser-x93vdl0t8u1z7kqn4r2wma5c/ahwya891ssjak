"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Sidebar from "../components/Sidebar";

export default function WalletWithdraw() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"withdraw" | "requests">("withdraw");
  const serviceFeePercent = 5;

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data.user;
      setUser(currentUser);

      if (currentUser) {
        const [{ data: profileData }, { data: walletData }, { data: withdraws }] =
          await Promise.all([
            supabase.from("users").select("username").eq("id", currentUser.id).single(),
            supabase.from("wallets").select("token_balance").eq("user_id", currentUser.id).single(),
            supabase
              .from("withdraw_requests")
              .select("*")
              .eq("user_id", currentUser.id)
              .order("requested_at", { ascending: false }),
          ]);

        if (profileData) setUsername(profileData.username);
        if (walletData) setBalance(walletData.token_balance);
        setWithdrawRequests(withdraws || []);
      }
    });
  }, []);

  const netAmount = (() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return null;
    return +(num * (1 - serviceFeePercent / 100)).toFixed(2);
  })();

  const handleWithdraw = async () => {
    if (!user) return alert("User not logged in.");
    if (!amount) return alert("Please enter an amount.");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return alert("Enter a valid amount.");

    if (balance === null) return alert("Fetching balance... Please try again.");
    if (parsedAmount > balance) return alert(`Insufficient balance. Your balance: NRS ${balance}`);

    setSubmitting(true);
    try {
      const { error } = await supabase.from("withdraw_requests").insert([
        {
          user_id: user.id,
          username,
          amount: parsedAmount,
          status: "pending",
          requested_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
      setAmount("");

      const { data: withdraws } = await supabase
        .from("withdraw_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false });
      setWithdrawRequests(withdraws || []);

      setBalance((prev) => (prev !== null ? prev - parsedAmount : prev));
      setActiveTab("requests"); // Switch to requests tab after submit
    } catch (err: any) {
      alert("Failed to submit: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex flex-grow items-center justify-center p-6 bg-gray-50">
        <section className="max-w-xl w-full bg-white rounded-lg shadow-md p-6 flex flex-col gap-2 min-h-[520px]">
          <h1 className="text-3xl font-extrabold text-purple yatra-one-text">
            Wallet Withdrawals
          </h1>

          {/* Tabs */}
          <div className="flex border-b border-gray-300">
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`px-6 py-2 -mb-px font-semibold text-lg ${
                activeTab === "withdraw"
                  ? "border-b-4 border-purple-600 text-purple-700"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Withdraw
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-6 py-2 -mb-px font-semibold text-lg ${
                activeTab === "requests"
                  ? "border-b-4 border-purple-600 text-purple-700"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              Withdrawal Requests
            </button>
          </div>

          {activeTab === "withdraw" && (
            <div className="flex flex-col justify-center" style={{ minHeight: "350px" }}>
              <p className="mb-5 text-sm bg-yellow-50 border border-yellow-300 rounded-md px-3 py-2 font-semibold text-yellow-800 max-w-max">
                Note: <span className="text-red-600">{serviceFeePercent}%</span> service fee applies
              </p>

              {submitted ? (
                <div className="rounded-md bg-green-100 text-green-800 px-5 py-3 text-center font-semibold">
                  Your withdrawal request has been submitted. Please wait for admin approval.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleWithdraw();
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label htmlFor="amount" className="block mb-1 font-medium text-gray-700">
                      Amount to Withdraw
                    </label>
                    <input
                      id="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoComplete="off"
                    />
                    {netAmount !== null && (
                      <p className="mt-1 text-gray-600 text-sm italic">
                        You will receive:{" "}
                        <span className="font-semibold text-green-600">NRS {netAmount}</span>
                      </p>
                    )}
                    {balance !== null && (
                      <p className="mt-1 text-gray-600 text-sm italic">
                        Your current balance: <span className="font-semibold">NRS {balance}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="username" className="block mb-1 font-medium text-gray-700">
                      Your Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      disabled
                      className="w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-lg cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 transition-colors text-white font-semibold rounded-md py-2.5 text-lg shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit Withdraw Request"}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Withdrawal Requests</h2>
              {withdrawRequests.length === 0 ? (
                <p className="text-gray-600 italic">You have no withdrawal requests yet.</p>
              ) : (
                <ul className="space-y-4 max-h-[360px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-100">
                  {withdrawRequests.map((req) => (
                    <li
                      key={req.id}
                      className="flex justify-between border border-gray-200 rounded-lg p-4 shadow-sm bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-purple-700 text-lg">
                          NRS {req.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Requested: {new Date(req.requested_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between">
                        <div className="text-sm text-gray-700">
                          Service Fee: <span className="font-medium">NRS {req.service_charge?.toFixed(2) ?? "0.00"}</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          Net: <span className="font-medium">NRS {req.net_amount?.toFixed(2) ?? "0.00"}</span>
                        </div>
                        <div
                          className={`mt-1 font-semibold ${
                            req.status === "pending"
                              ? "text-yellow-600"
                              : req.status === "approved"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
