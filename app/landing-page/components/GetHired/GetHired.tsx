import Link from 'next/link';
import Image from 'next/image';

export default function GetHired() {
  return (
    <section className="w-full bg-background py-16">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-stretch bg-purple-attention rounded-lg overflow-hidden min-h-[600px]">
          
          {/* Left Image (Take more space) */}
          <div className="flex-[1.5] w-full">
            <div className="relative w-full h-full min-h-[400px]">
              <Image
                src="/freelancer-outdoor.jpg"
                alt="Freelancer working outdoors"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right Content with Flex */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between gap-8">
            
            {/* Top Heading & Description */}
            <div className="">
              <span className="text-white text-sm">For Talent</span>
              <h2 className="text-5xl font-bold text-white yatra-one-text leading-tight mt-5">
                Get hired faster.
                <br />
                No stress.
              </h2>
              <p className="text-lg text-white">
                Meet clients you're excited to work with and take your career or business to new heights.
              </p>
            </div>
<div>


            {/* Divider */}
            <div className="bg-white w-full h-[1px] mb-5" />

            {/* Middle 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-white">
                <p>Find opportunities for every stage of your freelance career</p>
              </div>
              <div className="text-white">
                <p>Control when, where, and how you work</p>
              </div>
              <div className="text-white">
                <p>Explore different ways to earn</p>
              </div>
            </div>
            </div>
            {/* Bottom Button */}
            <div>
              <Link
                href="/find-opportunities"
                className="inline-block bg-white text-sm font-medium px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
              >
                Find Opportunities
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
