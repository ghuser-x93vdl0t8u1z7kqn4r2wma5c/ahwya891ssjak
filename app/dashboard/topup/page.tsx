"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Sidebar from "../components/Sidebar";

export default function WalletTopup() {
  // eslint-disable-next-line
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Get the authenticated user
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data.user;
      setUser(currentUser);

      if (currentUser) {
        // Fetch username from your users table by user id
        const { data: profileData, error } = await supabase
          .from("users")
          .select("username")
          .eq("id", currentUser.id)
          .single();

        if (error) {
          console.error("Failed to fetch username:", error.message);
          setUsername("");
        } else {
          setUsername(profileData?.username || "");
        }
      }
    });
  }, []);

  const handleUpload = async () => {
    if (!user || !screenshot || !amount) return alert("Fill all fields.");

    setUploading(true);
    try {
      const ext = screenshot.name.split(".").pop();
      const filePath = `${user.id}/topup_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("userbucket")
        .upload(filePath, screenshot);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("userbucket")
        .getPublicUrl(filePath);
      const screenshotUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from("topup_requests").insert([
        {
          user_id: user.id,
          username,
          amount: parseFloat(amount),
          screenshot_url: screenshotUrl,
          status: "pending",
        },
      ]);

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err) {
      alert("Failed: " + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="m-auto flex w-full h-full flex-row justify-between gap-2">
   <div className="flex flex-row min-h-screen bg-green-light w-full justify-between">
           <div className='w-5 md:w-64'>
             <Sidebar />
           </div>
    <div className="md:max-w-2xl md:w-full w-full max-w-lg mx-auto p-8">
     <h1 className="text-4xl font-bold text-purple yatra-one-text mb-6">Wallet Top Up Request</h1>

      <ol className="mb-4 text-sm bg-yellow-50 p-3 rounded">
        <li>1. Enter the amount you want to top up.</li>
        <li>2. Send the money to admin&apos;s eSewa: <b>9869606609</b>.</li>
        <li>
          3. In eSewa remarks, enter your username: <b>{username}</b>.
        </li>
        <li>4. Upload a screenshot of your payment below.</li>
        <li>5. After admin verifies, your balance will be updated.</li>
      </ol>
      {submitted ? (
        <div className="bg-green-100 p-4 rounded text-green-700">
          Your topup request has been submitted. Please wait for admin approval.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpload();
          }}
        >
          <div className="mb-4">
            <label className="block mb-1 font-medium">Amount to Top Up</label>
            <input
              type="number"
              min="1"
              className="border px-2 py-1 rounded w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Show username as readonly text instead of input */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Your Username</label>
            <input
              type="text"
              className="border px-2 py-1 rounded w-full bg-gray-100 cursor-not-allowed"
              value={username}
              disabled
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Upload Payment Screenshot</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit"}
          </button>
        </form>
      )}
    </div>
    </div>
    </div>
  );
}
