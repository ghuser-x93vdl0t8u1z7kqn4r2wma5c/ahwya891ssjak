import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="w-full bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold text-purple">
                For every creative.
                <br />
                For every Craft.
              </h1>
              <p className="text-xl text-body max-w-2xl">
                Forget the old rules. You can have the best people. Right now. Right here.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/get-started"
                className="bg-purple text-white px-8 py-3 rounded-full hover:bg-purple-attention transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/learn-more"
                className="text-body hover:text-green-hover px-8 py-3 border border-gray-300 rounded-full hover:border-green-hover transition-colors"
              >
                Learn how to hire
              </Link>
            </div>

            <div className="space-y-4">
              <p className="text-body">Trusted by</p>
              <div className="flex items-center gap-8">
                <Image
                  src="/microsoft-logo.svg"
                  alt="Microsoft"
                  width={120}
                  height={40}
                  className="grayscale hover:grayscale-0 transition-all"
                />
                <Image
                  src="/airbnb-logo.svg"
                  alt="Airbnb"
                  width={100}
                  height={40}
                  className="grayscale hover:grayscale-0 transition-all"
                />
                <Image
                  src="/bissell-logo.svg"
                  alt="Bissell"
                  width={100}
                  height={40}
                  className="grayscale hover:grayscale-0 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1">
            <div className="relative w-full aspect-square">
              <Image
                src="/hero-illustration.svg"
                alt="Hero Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 