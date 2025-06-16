import Link from 'next/link';
import { FaTiktok } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


export default function Footer() {
  return (
    <footer className="w-full bg-green-dark text-white rounded-lg">
      <div className="container mx-auto px-4 py-8">
        {/*grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12*/}
        <div className="hidden">
          {/* For Businesses */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">For Businesses</h3>
            <ul className="space-y-4">
              <li><Link href="/how-to-hire" className="text-white/80 hover:text-white transition-colors">How to Hire</Link></li>
              <li><Link href="/talent-marketplace" className="text-white/80 hover:text-white transition-colors">Talent Marketplace</Link></li>
              <li><Link href="/project-catalog" className="text-white/80 hover:text-white transition-colors">Project Catalog</Link></li>
            </ul>
          </div>

          {/* For Talents */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">For Talents</h3>
            <ul className="space-y-4">
              <li><Link href="/how-to-find-work" className="text-white/80 hover:text-white transition-colors">How to Find Work</Link></li>
              <li><Link href="/direct-contracts" className="text-white/80 hover:text-white transition-colors">Direct Contracts</Link></li>
              <li><Link href="/find-freelance-jobs" className="text-white/80 hover:text-white transition-colors">Find Freelance Jobs in Nepal</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Resources</h3>
            <ul className="space-y-4">
              <li><Link href="/help-support" className="text-white/80 hover:text-white transition-colors">Help & Support</Link></li>
              <li><Link href="/success-stories" className="text-white/80 hover:text-white transition-colors">Success Stories</Link></li>
              <li><Link href="/reviews" className="text-white/80 hover:text-white transition-colors">Lahara Reviews</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Company</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-white/80 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="text-white/80 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="text-white/80 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
         {/*mt-16 border-t border-white/20 pt-8*/}
        <div className=" pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <span className="text-white/80">Follows Us</span>
              <div className="flex items-center space-x-4">
                <Link href="https://www.facebook.com/profile.php?id=61576874680153" className="text-white/80 hover:text-white transition-colors">
                <FaFacebook className='w-6 h-6'/>
                </Link>
                <Link href="https://x.com/Lahara_work" className="text-white/80 hover:text-white transition-colors">
                <FaXTwitter className='w-6 h-6'/>
                </Link>
                <Link href="https://www.instagram.com/lahara.work/" className="text-white/80 hover:text-white transition-colors">
                <FaInstagram className='w-6 h-6'/>
                </Link>
                <Link href="https://www.tiktok.com/@lahara.work" className="text-white/80 hover:text-white transition-colors">
                <FaTiktok className='w-6 h-6'/>
                </Link>
                  {/*<Link href="#" className="text-white/80 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                  </Link>*/}
              </div>
            </div>
            <div className="flex items-center space-x-8">
              {/*<Link href="" className="text-white/80 hover:text-white transition-colors">*/}
              <div>
                Mobile Apps
              </div>
              {/*</Link>*/}
              {/*<Link href="/coming-soon" className="text-white/80 hover:text-white transition-colors">*/}
              <div>
                Coming Soon
              </div>
              {/*</Link>*/}
            </div>
          </div>

          {/* Bottom Links */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t border-white/20">
            <p className="text-white/60">© 2025 Lahara.work</p>
            <div className="flex items-center space-x-8 mt-4 md:mt-0">
              <Link href="/terms-of-service" className="text-white/80 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy-policy" className="text-white/80 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact-us" className="text-white/80 hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 