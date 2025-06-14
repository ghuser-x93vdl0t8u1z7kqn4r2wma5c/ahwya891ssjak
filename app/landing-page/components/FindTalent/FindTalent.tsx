import Link from 'next/link';
import Image from 'next/image';

export default function FindTalent() {
  return (
    <section className="w-full relative bg-black py-16">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/freelancer-working.jpg"
          alt="Background professional"
          fill
          className="object-cover object-center opacity-30"
          priority
        />
      </div>
      <div className="relative container mx-auto px-4 z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-white">
            <span className="text-white/80 text-sm mb-6 block">For Businesses</span>
            
            <div className="space-y-6">
              <h2 className="text-5xl font-bold yatra-one-text">
                Find the right talent,
                <br />
                without the hassle
              </h2>
              <p className="text-lg text-white/90 max-w-xl">
                Work with Nepal&apos;s first freelance and creator network. Lahara connects you with skilled professionals ready to help your business grow.
              </p>
            </div>

            <div className="mt-12">
              <Link
                href="/signup"
                className="inline-flex flex-col bg-purple-attention px-8 py-6 rounded-lg hover:bg-purple hover:scale-105 transition-all"
              >
                <span className="text-xl font-medium ">Post a job and hire a professional</span>
                <div className="flex items-center mt-2">
                  <span className="text-sm">Lahara Postings</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1">
            <div className="relative w-full aspect-video">
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 