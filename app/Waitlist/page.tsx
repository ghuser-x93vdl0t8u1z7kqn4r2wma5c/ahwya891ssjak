'use client';

import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaFacebookF } from 'react-icons/fa';


// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailCount, setEmailCount] = useState(0);

  const fetchEmailCount = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'waitlist'));
      setEmailCount(querySnapshot.size);
    } catch (error) {
      console.error('Error fetching email count:', error);
    }
  };

  useEffect(() => {
    fetchEmailCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      // Add email to Firestore waitlist collection
      await addDoc(collection(db, 'waitlist'), { email, timestamp: new Date() });

      // Call your API to send confirmation email
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      setIsSubmitted(true);
      setEmail('');
      fetchEmailCount();
    } catch (error) {
      console.error('Error submitting waitlist:', error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/bg.jpg')`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Header */}
        <div className="mb-10 w-full flex items-center justify-between md:items-end">
          <div className="flex items-center justify-center mb-4 md:mb-0">
            <img
              src="/logo.png"
              alt="Lahara Logo"
              className="w-32 md:w-50 2xl:w-[333px] h-auto 2xl:m-7 mr-0 md:mr-3"
            />
          </div>
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-medium text-black bg-white bg-opacity-20 backdrop-blur-sm 2xl:text-4xl 2xl:px-7 2xl:py-3"
            style={{ fontFamily: 'Yatra One, cursive' }}
          >
            Coming Soon
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto mb-8 2xl:w-full">
          <h2
            className="text-left text-5xl md:text-6xl 2xl:text-[5.5rem] font-bold text-white"
            style={{ fontFamily: 'Yatra One, cursive' }}
          >
            REACH NEW <br />
            <span style={{ color: '#6C59D5' }}>HEIGHTS.</span>
          </h2>
          <p
            className="text-xl md:text-4xl 2xl:text-5xl text-white mt-6 mb-2 font-medium"
            style={{ fontFamily: 'Yatra One, cursive' }}
          >
            Nepal&apos;s First Freelancing & Influencer Marketplace.
          </p>
          <p className="text-lg 2xl:text-2xl text-gray-200 yatra-one-text">
            Hire talent. Buy reach. Grow your brand. All in one platform.
          </p>
        </div>

        {/* Email Section */}
        <div className="flex flex-col md:flex-row w-full justify-center items-center gap-4 yatra-one-text">
          {!isSubmitted && (
            <div className="text-white mb-0">
              <p className="text-xl 2xl:text-2xl">
                <span className="font-bold">{50 + emailCount}+</span> joined. Join the wave.
              </p>
            </div>
          )}

          <div className="w-full max-w-sm 2xl:max-w-md mb-0">
            {!isSubmitted ? (
              <form
                onSubmit={handleSubmit}
                className="flex items-center rounded-full overflow-hidden"
                style={{
                  border: '1px solid #d1d5db',
                  height: '40px',
                  backgroundColor: '#fff',
                }}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 text-gray-700 placeholder-gray-500 text-sm px-4 focus:outline-none 2xl:text-2xl 2xl:px-6 2xl:h-20"
                  style={{ border: 'none', backgroundColor: 'transparent' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="h-5 w-px bg-gray-300 mx-2" />
                <button
                  type="submit"
                  className="text-sm text-gray-700 font-medium px-4 focus:outline-none 2xl:text-2xl 2xl:px-8 2xl:h-20"
                  style={{ backgroundColor: 'transparent' }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Joining...' : 'Join'}
                </button>
              </form>
            ) : (
              <div className="flex flex-row justify-center items-center gap-3 text-white">
                <div className="flex flex-col">
                  <div className="flex flex-row items-center gap-3">
                    <div
                      className="inline-flex items-center justify-center rounded-full"
                      style={{ backgroundColor: '#8F65C7', width: '24px', height: '24px' }}
                    >
                      <svg
                        className="w-4 h-4 2xl:w-6 2xl:h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold">Thank you for joining the waitlist!</h3>
                  </div>
                  <p className="text-lg font-semibold mt-1 text-left">
                    Stay tuned for updates from the Lahara team.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-row gap-10 mt-8">
          <a
            href="https://www.instagram.com/lahara.work/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-purple-400 transition"
            aria-label="Instagram"
          >
            <FaInstagram size={32} />
          </a>
          <a
            href="https://www.tiktok.com/@lahara.work"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-purple-400 transition"
            aria-label="TikTok"
          >
            <FaTiktok size={32} />
          </a>
        <a
  href="https://www.facebook.com/profile.php?id=61577030906411"
  target="_blank"
  rel="noopener noreferrer"
  className="text-white hover:text-purple-400 transition rounded-full"
  aria-label="Facebook"
>
  <FaFacebookF size={32} />
</a>

          <a
            href="https://x.com/Lahara_work"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-purple-400 transition"
            aria-label="Twitter"
          >
            <FaXTwitter size={32} />
          </a>
        </footer>
      </div>
    </div>
  );
}
