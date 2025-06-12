"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { hashPassword, verifyPassword } from "./bcrypt";
import Sidebar from "@/app/dashboard/components/Sidebar";
import { Wallet } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

export default function WalletPage() {
  // Track if a sensitive action is pending (e.g., 'transfer')
  const [pendingAction, setPendingAction] = useState<null | 'transfer'>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [showPasswordPromptDecider, setShowPasswordPromptDecider] = useState(true);


  // On mount, check for wallet unlock session in localStorage (session-based, 15 min)
  useEffect(() => {
    const unlockedUntil = localStorage.getItem('walletUnlockedUntil');
    if (unlockedUntil) {
      const expiry = parseInt(unlockedUntil, 10);
      if (!isNaN(expiry) && Date.now() < expiry) {
        setShowPasswordPrompt(false);
        setShowPasswordPromptDecider(false);
      } else {
        setShowPasswordPrompt(true);
        setShowPasswordPromptDecider(true);
        localStorage.removeItem('walletUnlockedUntil');
      }
    } else {
      setShowPasswordPrompt(true);
      setShowPasswordPromptDecider(true);
    }
  }, []);
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientUser, setRecipientUser] = useState<any>(null);
  const [recipientError, setRecipientError] = useState("");
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [transferCooldown, setTransferCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch user id from Supabase auth
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) setUserId(user.id);
    };
    fetchUser();
  }, []);

  // Fetch wallet and transactions
  useEffect(() => {
    if (!userId) return;
    const fetchWallet = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: walletData, error: walletError } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", userId)
          .single();
        if (walletError && walletError.code !== "PGRST116") throw walletError;
        setWallet(walletData);
        if (!walletData) {
          setWallet(null);
          setShowSetPassword(false);
          setShowPasswordPrompt(false);
        } else if (!walletData.password) {
          setWallet(walletData);
          setShowSetPassword(true);
          setShowPasswordPrompt(false);
        } else {
          setWallet(walletData);
          setShowSetPassword(false);
          setShowPasswordPrompt(showPasswordPromptDecider);
          setShowPasswordPromptDecider(true);
        }
        const { data: txs, error: txsError } = await supabase
          .from("transactions")
          .select("*")
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
    fetchWallet();
  }, [userId]);

  // Hash wallet password with bcrypt
  const hashWalletPassword = async (pwd: string) => {
    return await hashPassword(pwd);
  };
  const verifyWalletPassword = async (input: string, hash: string) => {
    return await verifyPassword(input, hash);
  };

  // Password safety check
  const isPasswordSafe = (pwd: string) => {
    // At least 8 chars, 1 number, 1 letter
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(pwd);
  };

  // Set wallet password
  const handleSetPassword = async () => {
    if (!passwordInput || !userId) return;
    if (!isPasswordSafe(passwordInput)) {
      setPasswordError("Password must be at least 8 characters and include a number and a letter.");
      return;
    }
    setActionLoading(true);
    try {
      // Set wallet password (hash)
      const hashed = await hashWalletPassword(passwordInput);
      const { error: pwError } = await supabase
        .from("wallets")
        .update({ password: hashed })
        .eq("user_id", userId);
      if (pwError) throw pwError;
      setShowSetPassword(false);
      setShowPasswordPrompt(true);
      setPasswordInput("");
      setWallet((w: any) => ({ ...w, password: hashed }));
      setPasswordError("");
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Password prompt for viewing wallet or pending action
  const handlePasswordSubmit = async () => {
    if (!wallet?.password) return;
    // Unlock wallet
    let isValid = false;
    try {
      isValid = await verifyWalletPassword(passwordInput, wallet.password);
    } catch (err) {
      console.error('Error in verifyWalletPassword:', err);
      setPasswordError('Internal error during password check');
      return;
    }
    if (!isValid) {
      setPasswordError("Incorrect password");
      return;
    }
    setPasswordError("");
    setShowPasswordPrompt(false);
    setPassword(passwordInput);
    // Set session-based unlock: 15 min from now
    const unlockForMs = 15 * 60 * 1000;
    localStorage.setItem('walletUnlockedUntil', (Date.now() + unlockForMs).toString());
    // If there was a pending action, perform it now
    if (pendingAction === 'transfer') {
      setPendingAction(null);
      setTimeout(() => {
        handleTransfer();
      }, 0);
    }
  };

  // Top up funds
  const handleTopup = async () => {
    if (!userId || !password || !wallet?.password) return;

    setActionLoading(true);
    try {
      const amt = parseFloat(topupAmount);
      if (isNaN(amt) || amt <= 0) throw new Error("Invalid amount");
      // Add to wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ token_balance: (wallet.token_balance || 0) + amt })
        .eq("user_id", userId);
      if (updateError) throw updateError;
      // Add transaction
      const { error: txError } = await supabase
        .from("transactions")
        .insert({ from_user: userId, to_user: userId, amount: amt, type: "deposit", status: "completed" });
      if (txError) throw txError;
      setWallet((w: any) => ({ ...w, token_balance: (w.token_balance || 0) + amt }));
      setTransactions((txs: any[]) => [{ from_user: userId, to_user: userId, amount: amt, type: "deposit", status: "completed", created_at: new Date().toISOString() }, ...txs]);
      setTopupAmount("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Withdraw funds
  const handleWithdraw = async () => {
    if (!userId || !password || !wallet?.password) return;

    setActionLoading(true);
    try {
      const amt = parseFloat(withdrawAmount);
      if (isNaN(amt) || amt <= 0 || amt > (wallet.token_balance || 0)) throw new Error("Invalid amount");
      // Subtract from wallet
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ token_balance: (wallet.token_balance || 0) - amt })
        .eq("user_id", userId);
      if (updateError) throw updateError;
      // Add transaction
      const { error: txError } = await supabase
        .from("transactions")
        .insert({ from_user: userId, to_user: userId, amount: amt, type: "payout", status: "completed" });
      if (txError) throw txError;
      setWallet((w: any) => ({ ...w, token_balance: (w.token_balance || 0) - amt }));
      setTransactions((txs: any[]) => [{ from_user: userId, to_user: userId, amount: amt, type: "payout", status: "completed", created_at: new Date().toISOString() }, ...txs]);
      setWithdrawAmount("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Transfer funds
  const handleTransfer = async () => {
    if (!userId || !wallet?.password) return;
    // If session is unlocked but password is missing, prompt for password and set pending action
    if (!password) {
      setShowPasswordPrompt(true);
      setPendingAction('transfer');
      return;
    }
    setActionLoading(true);
    try {
      const amt = parseFloat(transferAmount);
      if (isNaN(amt) || amt <= 0 || amt > (wallet.token_balance || 0)) throw new Error("Invalid amount");
      // Get recipient user by username
      const { data: recipientProfile, error: recipientProfileError } = await supabase
        .from("users")
        .select("id, username")
        .eq("username", searchUsername)
        .single();
      if (recipientProfileError || !recipientProfile) {
        setRecipientError("Recipient username not found.");
        setActionLoading(false);
        return;
      }
      // Check if recipient wallet exists by uuid
      const { data: recipientWallet, error: recipientWalletError } = await supabase
        .from("wallets")
        .select("user_id, token_balance")
        .eq("user_id", recipientProfile.id)
        .single();
      if (recipientWalletError || !recipientWallet) {
        setRecipientError("Recipient does not have a wallet. Transfers are only allowed to users with an existing wallet.");
        setActionLoading(false);
        return;
      }
      // Subtract from sender
      const { error: updateError } = await supabase
        .from("wallets")
        .update({ token_balance: (wallet.token_balance || 0) - amt })
        .eq("user_id", userId);
      if (updateError) throw updateError;
      // Add to recipient
      const { error: updateToError } = await supabase
        .from("wallets")
        .update({ token_balance: (recipientWallet.token_balance || 0) + amt })
        .eq("user_id", recipientProfile.id);
      if (updateToError) throw updateToError;
      // Add transaction
      const { error: txError } = await supabase
        .from("transactions")
        .insert({ from_user: userId, to_user: recipientProfile.id, amount: amt, type: "transfer", status: "completed" });
      if (txError) throw txError;
      setWallet((w: any) => ({ ...w, token_balance: (w.token_balance || 0) - amt }));
      setSuccessMessage("Transfer successful!");
      setTimeout(() => setSuccessMessage(""), 4000);
      setTransferAmount("");
      setRecipientUser(null);
      setTransferCooldown(5);
      const cooldownInterval = setInterval(() => {
        setTransferCooldown(prev => {
          if (prev <= 1) {
            clearInterval(cooldownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Manual lock function
  const handleLockWallet = () => {
    setPassword("");
    setShowPasswordPrompt(true);
    setShowPasswordPromptDecider(true);
    localStorage.removeItem('walletUnlockedUntil');
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="flex flex-row justify-between gap-2">
      <div className="w-fit p-4">
    <Sidebar />
    </div>
    <div className="w-full mx-auto p-4">
     
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl yatra-one-text text-purple font-bold">Wallet</h1>
        {!showPasswordPrompt  && !showSetPassword && (
          <button
            onClick={handleLockWallet}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            title="Lock Wallet"
          >
            Lock Wallet
          </button>
        )}
      </div>
      {!wallet && (
       

<div className="mb-6 p-5 border border-yellow-400 bg-yellow-100 rounded-xl shadow flex items-center gap-4">
  {/* Wallet Icon */}
  <div className="p-3 bg-yellow-200 text-yellow-800 rounded-full">
    <Wallet className="w-8 h-8" />
  </div>

  {/* Text and Button */}
  <div className="flex flex-col flex-grow">
    <h2 className="text-md font-semibold text-yellow-900 mb-1">No Wallet Found</h2>
    <p className="text-sm text-yellow-800 mb-3">Create your wallet to start sending, receiving, and storing tokens.</p>

    <button
      className="w-fit bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50"
      disabled={actionLoading}
      onClick={async () => {
        if (!userId) return;
        setActionLoading(true);
        try {
          const { error } = await supabase.from("wallets").insert({ user_id: userId, token_balance: 0 });
          if (error) throw error;
          setWallet({ user_id: userId, token_balance: 0, password: null });
          setShowSetPassword(true);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setActionLoading(false);
        }
      }}
    >
      Create Wallet
    </button>
  </div>
</div>

      )}
      {wallet && showSetPassword && (
    <div className="min-h-[85vh]  flex items-center justify-center">
     <div className="mb-8 p-8 bg-green-light border border-purple bg-purple-attention/20 rounded-2xl shadow-md max-w-2xl mx-auto flex items-center gap-8">
     {/* Left: Form */}
     <div className="flex-1 min-w-[220px]">
       <h2 className="yatra-one-text text-purple font-semibold text-3xl mb-6 text-center text-purple">
         Set a Password for Your Wallet
       </h2>
   
       <div className="flex items-center gap-3 mb-6">
         <input
           type={showPassword ? "text" : "password"}
           className="flex-grow bg-gray-input border border-gray-input-border text-gray-input px-4 py-3 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-purple transition"
           value={passwordInput}
           onChange={(e) => setPasswordInput(e.target.value)}
           placeholder="Enter wallet password"
           disabled={actionLoading}
           autoComplete="new-password"
         />
         <button
           type="button"
           className="text-purple hover:text-purple-attention transition"
           tabIndex={-1}
           onClick={() => setShowPassword((v) => !v)}
           aria-label={showPassword ? "Hide password" : "Show password"}
         >
           {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
         </button>
       </div>
   
       <button
         className="bg-purple text-white font-semibold text-lg w-full py-3 rounded-md hover:bg-purple-attention transition disabled:opacity-50 disabled:cursor-not-allowed"
         onClick={handleSetPassword}
         disabled={actionLoading || !passwordInput}
       >
         Set Password
       </button>
   
       {passwordError && <div className="text-red mt-3 text-center text-base">{passwordError}</div>}
   
       <div className="text-xs text-gray-500 mt-4 text-center">
         Password must be at least 8 characters and include a number and a letter.
       </div>
     </div>
   
     {/* Right: Illustration */}
     <div className="hidden md:flex md:w-1/3 justify-center items-center">
      <img src="/auth_onboard_svg/vault.svg" alt="wallet" className="w-60 h-60" />
    </div>
   </div> 
   </div> 
   
   
   
     
      )}
      {wallet && showPasswordPrompt && !showSetPassword && (
        

<div className="min-h-[85vh]  flex items-center justify-center">
  <div className="w-full bg-green-light max-w-5xl mb-10 p-10 border border-purple bg-purple-attention/10 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-10">
    {/* Left: Password Form */}
    <div className="w-full md:w-2/3">
      <h2 className="yatra-one-text text-purple text-4xl mb-6">Unlock Your Wallet</h2>

      <div className="flex items-center gap-3 mb-5">
        <input
          type={showPassword ? "text" : "password"}
          className="flex-grow bg-gray-input border border-gray-input-border text-gray-input px-3 py-2 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-purple transition"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Enter wallet password"
          disabled={actionLoading}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="text-purple hover:text-purple-attention transition"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <button
        className="bg-purple-attention text-white font-semibold text-base px-5 py-2.5 rounded-md hover:bg-purple-attention transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handlePasswordSubmit}
        disabled={actionLoading || !passwordInput}
      >
        Unlock Wallet
      </button>

      {passwordError && <div className="text-red mt-3 text-base">{passwordError}</div>}
    </div>

    {/* Right: Illustration */}
    <div className="hidden md:flex md:w-1/3 justify-center items-center">
      <img src="/auth_onboard_svg/vault.svg" alt="wallet" className="w-60 h-60" />
    </div>
  </div>
</div>



      )}
      {wallet && !showPasswordPrompt && !showSetPassword && (
        <>
          <div className="mb-6 p-4 border rounded bg-green-50">
            <div className="text-lg font-semibold">Balance: <span className="font-mono">{wallet?.token_balance || 0}</span></div>
          </div>
          <div className="mb-6 p-4 border rounded">
            <h2 className="font-semibold mb-2">Transfer Funds</h2>
            <input
              type="text"
              className="border px-2 py-1 rounded mr-2"
              value={searchUsername}
              onChange={async e => {
                const input = e.target.value;
                setSearchUsername(input);
                setRecipientUser(null);
                if (input.length < 2) {
                  setUsernameSuggestions([]);
                  setRecipientError('');
                  return;
                }
                setRecipientLoading(true);
                const { data, error } = await supabase
                  .from('users')
                  .select('id, username')
                  .ilike('username', `%${input}%`)
                  .limit(5);
                setRecipientLoading(false);
                if (error || !data) {
                  setUsernameSuggestions([]);
                  setRecipientError('No user found');
                } else {
                  setUsernameSuggestions(data);
                  // Live error if no exact match in suggestions
                  if (!data.some(u => u.username === input)) {
                    setRecipientError('Please select a valid recipient username from the list.');
                  } else {
                    setRecipientError('');
                  }
                }
              }}
              placeholder="Search recipient username"
              disabled={actionLoading}
              autoComplete="off"
            />
            {recipientLoading && <span className="text-sm text-gray-500 ml-2">Searching...</span>}
            {usernameSuggestions.length > 0 && (
              <ul className="border rounded bg-white shadow mt-1 max-h-32 overflow-y-auto text-sm">
                {usernameSuggestions.map(user => (
                  <li key={user.id} className="px-2 py-1 cursor-pointer hover:bg-blue-50" onClick={() => {
                    setRecipientUser(user);
                    setSearchUsername(user.username);
                    setUsernameSuggestions([]);
                    setRecipientError("");
                  }}>
                    <a href={`/profile/${user.username}`} className="underline text-blue-600 mr-2" target="_blank" rel="noopener noreferrer">{user.username}</a>
                    <span className="text-gray-500">({user.id.slice(0, 6)}...)</span>
                  </li>
                ))}
              </ul>
            )}
            {recipientUser && (
              <div className="text-sm mt-1 text-green-700">
                Recipient: <a href={`/profile/${recipientUser.username}`} className="underline text-blue-600" target="_blank" rel="noopener noreferrer">{recipientUser.username}</a>
              </div>
            )}
            {recipientError && <div className="text-sm text-red-600 mt-1">{recipientError}</div>}
            <input
              type="number"
              min="1"
              className="border px-2 py-1 rounded mr-2 mt-2"
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
              placeholder="Amount"
              disabled={actionLoading}
            />
            {/* Inline password prompt for transfer */}
            {pendingAction === 'transfer' && (
              <span className="ml-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  className="border px-2 py-1 rounded"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Wallet Password"
                  autoFocus
                />
                <button
                  className="px-2 py-1 rounded bg-blue-500 text-white"
                  onClick={handlePasswordSubmit}
                  disabled={actionLoading || !passwordInput}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="ml-1 text-xs text-gray-600 underline"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
                {passwordError && <span className="text-red-600 text-xs ml-2">{passwordError}</span>}
              </span>
            )}
            <button
              className={`px-3 py-1 rounded ${transferCooldown > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white'}`}
              onClick={handleTransfer}
              disabled={actionLoading || !transferAmount || transferCooldown > 0}
            >
              {transferCooldown > 0 ? `Wait ${transferCooldown}s` : 'Transfer'}
            </button>
          </div>

        </>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded">
          {successMessage}
        </div>
      )}
    </div>
    </div>
  );
}
