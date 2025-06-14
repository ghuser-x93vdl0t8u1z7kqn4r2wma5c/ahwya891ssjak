
import { Suspense } from 'react';
import Navbar from './components/Navbar/Navbar';
import HeroImage from './components/HeroImage/HeroImage';
import Category from './components/Category/Category';
import FindTalent from './components/FindTalent/FindTalent';
/* import FindClient from './components/FindClient/FindClient'; */
import ListOfCategory from './components/ListOfCategory/ListOfCategory';
import Footer from './components/Footer/Footer';
import GetHired from './components/GetHired/GetHired';

export default async function LandingPage() {
  return (
    <main className="w-full max-w-[1440px] mx-auto">
      <Navbar />
      
      <div className="px-4">
        <Suspense fallback={<div className="w-full h-[400px] animate-pulse bg-gray-100"></div>}>
          <HeroImage />
        </Suspense>
        
        <Suspense fallback={<div className="w-full h-[300px] animate-pulse bg-gray-100"></div>}>
          <Category />
        </Suspense>
        

        <Suspense fallback={<div className="w-full h-[400px] animate-pulse bg-gray-100"></div>}>
          <FindTalent />
        </Suspense>
        
        <Suspense fallback={<div className="w-full h-[400px] animate-pulse bg-gray-100"></div>}>
          <GetHired />
        </Suspense>

        <ListOfCategory />
        <Footer />
        <div className='bg-white h-2'></div>
      </div>
    </main>
  );
} 