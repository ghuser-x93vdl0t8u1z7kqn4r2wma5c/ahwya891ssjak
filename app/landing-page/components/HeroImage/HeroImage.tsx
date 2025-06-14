'use client';

import Link from "next/link";

export default function HeroImage() {
  return (
    <section className="w-full bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 py-16">
          
          {/* Left Content */}
          <div className="flex-1">
            <h1 className="yatra-one-text font-bold text-[2.75rem] md:text-[3.25rem] leading-[1.1] text-purple-attention mb-6 whitespace-pre-line">
              For every Creative.{'\n'}For every Craft.
            </h1>
            <p className="text-color-text text-lg md:text-xl mb-10 max-w-xl">
              Forget the old rules. You can have the best people. Right now. Right here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/signup">
              <button className="w-full sm:w-auto bg-[#6941C6] text-white px-8 py-3.5 rounded-lg hover:bg-opacity-90 transition-colors text-lg font-medium">
                Get Started
              </button>
              </Link>
            </div>
            <div>
              <p className="text-[#667085] text-sm mb-4">Trusted by</p>
              <div className="flex items-center gap-8">
                <img src="/microsoft.svg" alt="Microsoft Logo" className="h-7" />
                <img src="/airbnb.svg" alt="Airbnb Logo" className="h-7" />
                <img src="/bissell.svg" alt="Bissell Logo" className="h-7" />
              </div>
            </div>
          </div>

          {/* Right Background Image */}
          <div
            className="flex-1 h-[400px] w-full bg-cover bg-center rounded-lg"
            style={{ backgroundImage: "url('/hero-illustration.jpg')" }}
          ></div>
          
        </div>
      </div>
    </section>
  );
}
