"use client";
/* eslint-disable */
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

  // Security question/answer for wallet password reset
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotAnswerInput, setForgotAnswerInput] = useState("");
  const [forgotAnswerCorrect, setForgotAnswerCorrect] = useState(false);
  const [forgotPwError, setForgotPwError] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");


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
    if (!securityQuestion.trim() || !securityAnswer.trim()) {
      setPasswordError("Please enter a security question and answer.");
      return;
    }
    setActionLoading(true);
    try {
      // Set wallet password (hash)
      const hashed = await hashWalletPassword(passwordInput);
      const { error: pwError } = await supabase
        .from("wallets")
        .update({ password: hashed, question: securityQuestion.trim(), answer: securityAnswer.trim() })
        .eq("user_id", userId);
      if (pwError) throw pwError;
      setShowSetPassword(false);
      setShowPasswordPrompt(true);
      setPasswordInput("");
      setSecurityQuestion("");
      setSecurityAnswer("");
      setWallet((w: any) => ({ ...w, password: hashed, question: securityQuestion.trim(), answer: securityAnswer.trim() }));
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

  if (loading) return <div className="flex items-center justify-center h-[100vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="flex w-full bg-green-light">
    <div className="flex flex-row gap-2 md:gap-8 min-h-screen bg-green-light w-full justify-between">
            <div className='w-5 md:w-64'>
              <Sidebar />
            </div>
    <div className="w-full mx-5 p-4">
     
      {/* Forgot Password Flow */}
     
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
   
      {/* Security Question */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Security Question</label>
        <input
          type="text"
          className="w-full border border-gray-input-border bg-gray-input text-heading px-3 py-2 rounded mb-2"
          value={securityQuestion}
          onChange={e => setSecurityQuestion(e.target.value)}
          placeholder="e.g. What is your favorite color?"
          disabled={actionLoading}
        />
      </div>
      {/* Security Answer */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-1">Answer</label>
        <input
          type="text"
          className="w-full border border-gray-input-border bg-gray-input text-heading px-3 py-2 rounded mb-2"
          value={securityAnswer}
          onChange={e => setSecurityAnswer(e.target.value)}
          placeholder="Enter answer"
          disabled={actionLoading}
        />
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
      {wallet && showPasswordPrompt && !showSetPassword && !showForgotPassword && (
        

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
    <div className="w-full flex justify-between">

   
      <button
        className="bg-purple-attention text-white font-semibold text-base px-5 py-2.5 rounded-md hover:bg-purple-attention transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handlePasswordSubmit}
        disabled={actionLoading || !passwordInput}
      >
        Unlock Wallet
      </button>

      
      <div className="mt-4 text-center">
        <button
          type="button"
          className="text-purple underline text-sm hover:text-purple-attention"
          onClick={() => {
            setShowForgotPassword(true);
            setForgotAnswerInput("");
            setForgotAnswerCorrect(false);
            setNewPasswordInput("");
            setForgotPwError("");
            setNewPasswordError("");
            setSecurityQuestion(wallet?.question || "");
            setSecurityAnswer(wallet?.answer || "");
          }}
        >
          Forgot Password?
        </button>
      </div>

      </div>
      {passwordError && <div className="text-red mt-3 text-base">{passwordError}</div>}

    </div>

    {/* Right: Illustration */}
    <div className="hidden md:flex md:w-1/3 justify-center items-center">
      <img src="/auth_onboard_svg/vault.svg" alt="wallet" className="w-60 h-60" />
    </div>
  </div>
</div>



      )}
       {showForgotPassword && (
        <div className="mb-8 p-6 border border-purple rounded-xl bg-purple-attention/10 max-w-lg mx-auto flex flex-col gap-4">
          <h2 className="text-xl font-bold text-purple mb-2">Reset Wallet Password</h2>
          <div className="mb-2">
            <span className="font-medium">Security Question:</span>
            <span className="ml-2">{securityQuestion || 'No question set.'}</span>
          </div>
          <input
            type="text"
            className="w-full border border-gray-input-border bg-gray-input text-heading px-3 py-2 rounded mb-2"
            value={forgotAnswerInput}
            onChange={e => {
              setForgotAnswerInput(e.target.value);
              setForgotPwError("");
            }}
            placeholder="Enter your answer"
          />
          {forgotPwError && (
            <div className="text-red-600 text-sm mb-2">{forgotPwError}</div>
          )}
          <button
            className="bg-purple-attention text-white font-semibold text-base px-5 py-2.5 rounded-md hover:bg-purple-attention transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (forgotAnswerInput.trim().toLowerCase() === securityAnswer.trim().toLowerCase()) {
                setForgotAnswerCorrect(true);
                setForgotPwError("");
              } else {
                setForgotAnswerCorrect(false);
                setForgotPwError("Incorrect answer. Please try again.");
              }
            }}
          >
            Verify Answer
          </button>
          <div className={forgotAnswerCorrect ? "mt-4" : "mt-4 hidden"}>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-input-border bg-gray-input text-heading px-3 py-2 rounded mb-2 pr-10"
                value={newPasswordInput}
                onChange={e => setNewPasswordInput(e.target.value)}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-purple"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {newPasswordError && (
              <div className="text-red-600 text-sm mb-2">{newPasswordError}</div>
            )}
            <button
              className="bg-purple-attention text-white font-semibold text-base px-5 py-2.5 rounded-md hover:bg-purple-attention transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={async () => {
                if (!isPasswordSafe(newPasswordInput)) {
                  setNewPasswordError("Password must be at least 8 characters and include a number and a letter.");
                  return;
                }
                try {
                  const hashed = await hashWalletPassword(newPasswordInput);
                  const { error } = await supabase
                    .from("wallets")
                    .update({ password: hashed })
                    .eq("user_id", userId);
                  if (error) throw error;
                  setNewPasswordError("");
                  setShowForgotPassword(false);
                  setForgotAnswerInput("");
                  setForgotAnswerCorrect(false);
                  setNewPasswordInput("");
                  // Optionally show a success message here
                } catch (err: any) {
                  setNewPasswordError(err.message || "Failed to update password.");
                }
              }}
            >
              Change Password
            </button>
          </div>
        </div>
      )}
      {wallet && !showPasswordPrompt && !showSetPassword && (
       <>
       <div className="flex flex-col md:flex-row gap-6">
         {/* Left Side: Transfer Section */}
         <div className="flex-1">
           {/* Balance Box */}
           <div className="mb-6 p-4 border border-green-button rounded bg-green-light text-green-dark shadow-sm">
             <div className="text-lg font-semibold">
               Balance: <span className="font-mono">{wallet?.token_balance || 0}</span>
             </div>
           </div>
     
           {/* Transfer Card */}
           <div className="mb-6 p-6 border border-gray-input-border rounded bg-white shadow-md">
             <h2 className="text-heading font-semibold mb-4 text-lg">Transfer Funds</h2>
     
             {/* Username Search */}
             <label className="block text-sm font-medium text-heading mb-1">Search Recipient</label>
             <input
               type="text"
               className="w-full border border-gray-input-border bg-gray-input text-heading px-3 py-2 rounded mb-2"
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
                   if (!data.some(u => u.username === input)) {
                     setRecipientError('Please select a valid recipient username from the list.');
                   } else {
                     setRecipientError('');
                   }
                 }
               }}
               placeholder="Recipient Username"
               disabled={actionLoading}
               autoComplete="off"
             />
             {recipientLoading && <span className="text-sm text-gray-input ml-2">Searching...</span>}
     
             {/* Suggestions */}
             {usernameSuggestions.length > 0 && (
               <ul className="border border-gray-input-border rounded bg-white shadow mt-1 max-h-32 overflow-y-auto text-sm">
                 {usernameSuggestions.map(user => (
                   <li
                     key={user.id}
                     className="px-3 py-2 cursor-pointer hover:bg-green-light"
                     onClick={() => {
                       setRecipientUser(user);
                       setSearchUsername(user.username);
                       setUsernameSuggestions([]);
                       setRecipientError("");
                     }}
                   >
                     <a
                       href={`/profile/${user.username}`}
                       className="underline text-purple mr-2"
                       target="_blank"
                       rel="noopener noreferrer"
                     >
                       {user.username}
                     </a>
                     <span className="text-gray-input">({user.id.slice(0, 6)}...)</span>
                   </li>
                 ))}
               </ul>
             )}
     
             {/* Selected Recipient */}
             {recipientUser && (
               <div className="text-sm mt-2 text-green-hover">
                 Recipient:{" "}
                 <a
                   href={`/profile/${recipientUser.username}`}
                   className="underline text-purple"
                   target="_blank"
                   rel="noopener noreferrer"
                 >
                   {recipientUser.username}
                 </a>
               </div>
             )}
     
             {/* Error */}
             {recipientError && (
               <div className="text-sm text-red mt-2">{recipientError}</div>
             )}
     
             {/* Amount */}
             <label className="block text-sm font-medium text-heading mt-4 mb-1">Amount</label>
             <input
               type="number"
               min="1"
               className="w-full border border-gray-input-border bg-gray-input text-heading px-3 py-2 rounded mb-3"
               value={transferAmount}
               onChange={e => setTransferAmount(e.target.value)}
               placeholder="Enter amount"
               disabled={actionLoading}
             />
     
             {/* Password Section */}
             {pendingAction === 'transfer' && (
               <div className="mt-3 space-y-2">
                 <label className="block text-sm font-medium text-heading">Wallet Password</label>
                 <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                   <input
                     type={showPassword ? "text" : "password"}
                     className="border border-gray-input-border px-3 py-2 rounded w-full sm:w-auto"
                     value={passwordInput}
                     onChange={e => setPasswordInput(e.target.value)}
                     placeholder="••••••••"
                     autoFocus
                   />
                   <button
                     className="bg-green-button text-white px-3 py-2 rounded hover:bg-green-hover"
                     onClick={handlePasswordSubmit}
                     disabled={actionLoading || !passwordInput}
                   >
                     Submit
                   </button>
                   <button
                     type="button"
                     className="text-xs text-gray-input underline"
                     onClick={() => setShowPassword(!showPassword)}
                   >
                     {showPassword ? "Hide" : "Show"}
                   </button>
                 </div>
                 {passwordError && (
                   <span className="text-red text-xs">{passwordError}</span>
                 )}
               </div>
             )}
     
             {/* Transfer Button */}
             <button
               className={`mt-5 w-full py-2 rounded font-semibold ${
                 transferCooldown > 0
                   ? 'bg-gray-400 cursor-not-allowed text-white'
                   : 'bg-[#6c63ff] text-white hover:bg-purple'
               }`}
               onClick={handleTransfer}
               disabled={actionLoading || !transferAmount || transferCooldown > 0}
             >
               {transferCooldown > 0 ? `Wait ${transferCooldown}s` : 'Transfer'}
             </button>
           </div>
         </div>
     
         {/* Right Side: SVG Illustration */}
         <div className="hidden md:flex items-center justify-center w-full md:max-w-sm">
           <img
             src="/auth_onboard_svg/transfer_illustration.svg"
             alt="Transfer Illustration"
             className="w-full h-auto object-contain"
           />
         </div>
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
    </div>
  );
}