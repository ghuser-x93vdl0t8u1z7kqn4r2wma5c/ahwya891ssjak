"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Optional: nice loading icon

export default function WalletTopup() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setUsername(data.user?.user_metadata?.username || "");
    });
  }, []);

  const handleUpload = async () => {
    if (!user || !screenshot || !amount) return alert("Please fill in all fields.");

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
      alert("Failed: " + (err as any).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 md:p-8 bg-white shadow-lg rounded-xl mt-10 border border-gray-200">
      <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Wallet Top-Up</h1>

      <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 text-sm text-gray-700 rounded mb-6">
        <ol className="space-y-1 list-decimal list-inside">
          <li>Enter the amount you want to top up.</li>
          <li>Send the money to admin’s eSewa: <span className="font-semibold">9869606609</span>.</li>
          <li>In eSewa remarks, enter your username: <span className="font-semibold">{username || "..."}</span>.</li>
          <li>Upload a screenshot of your payment.</li>
          <li>Admin will verify and update your balance.</li>
        </ol>
      </div>

      {submitted ? (
        <div className="bg-green-100 border border-green-400 p-4 rounded text-green-800 text-center">
          ✅ Your top-up request has been submitted. Please wait for admin approval.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpload();
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Top Up</label>
            <input
              type="number"
              min="1"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Screenshot</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 px-4 rounded-md flex items-center justify-center"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Uploading...
              </>
            ) : (
              "Submit Top-Up Request"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
