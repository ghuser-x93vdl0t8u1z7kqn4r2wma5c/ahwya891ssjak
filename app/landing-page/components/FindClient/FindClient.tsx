"use client"
import Link from 'next/link';
import Image from 'next/image';

export default function FindClient() {
  return (
    <section className="w-full bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 bg-purple-attention rounded-lg p-12 text-white">
            <div className="space-y-8">
              <span className="text-white/80">For Client</span>
              
              <div className="space-y-6">
                <h2 className="text-4xl font-bold">
                  Find talent faster.
                  <br />
                  No stress.
                </h2>
                <p className="text-lg opacity-90 max-w-xl">
                  Work with the largest network of independent professionals and get things done—from quick turnarounds to big transformations.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="flex-1">Post a job and hire a pro</p>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="flex-1">Browse and buy projects</p>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="flex-1">Let us help you find the right talent</p>
                </div>
              </div>

              <Link
                href="/post-job"
                className="inline-block bg-white text-purple-attention px-8 py-3 rounded-lg hover:bg-white/90 transition-colors"
              >
                Post a Job
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1">
            <div className="relative w-full aspect-video">
              <Image
                src="/client-working.jpg"
                alt="Client working with freelancers"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 