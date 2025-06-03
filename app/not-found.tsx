'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const alreadyRedirected = sessionStorage.getItem('redirectedFrom404');

    if (!alreadyRedirected) {
      sessionStorage.setItem('redirectedFrom404', 'true');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-black mb-2">Oops!</h1>
      <p className="text-sm text-gray-600 mb-6">Looks like this page doesn’t exist.</p>


      {/* Illustration */}
      <div className="w-full max-w-xs sm:max-w-sm mb-6">
        <Image
          src="/group.svg" // Ensure this is placed in public/group.svg
          alt="Lost illustration"
          width={400}
          height={400}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Go Home button */}
      <Link
        href="/"
        className="inline-block rounded-full border border-black px-5 py-2 text-sm font-medium text-black hover:bg-black hover:text-white transition"
      >
        ← Go Home
      </Link>
    </div>
  );
}
