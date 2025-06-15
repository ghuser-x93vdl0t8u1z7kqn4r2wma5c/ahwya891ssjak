'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type Category = {
  id: string;
  title: string;
  rating: number;
  skillCount: number;
  slug: string;
};

const MAX_CATEGORIES = 12;

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch users with their skills
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('main_skill, skills, rating')
          .eq('account_type', 'freelancer')
          .not('main_skill', 'is', null);

        if (userError) throw userError;

        // Process the data to group by skills
        const skillMap = new Map<string, { count: number; totalRating: number; ratingCount: number }>();
        
        userData.forEach(({ main_skill, skills, rating }) => {
          // Create a Set of all skills for this user to avoid duplicates
          const userSkills = new Set<string>();
          
          // Process main skill
          if (main_skill) {
            userSkills.add(main_skill);
          }

          // Process additional skills
          if (skills && Array.isArray(skills)) {
            skills.forEach(skill => {
              if (skill) {
                userSkills.add(skill);
              }
            });
          }

          // Count each unique skill only once per user
          userSkills.forEach(skill => {
            const existing = skillMap.get(skill) || { count: 0, totalRating: 0, ratingCount: 0 };
            existing.count++;
            if (rating) {
              existing.totalRating += rating;
              existing.ratingCount++;
            }
            skillMap.set(skill, existing);
          });
        });

        // Convert map to array and calculate averages
        const categoryArray = Array.from(skillMap.entries())
          .map(([title, info]) => ({
            id: title.toLowerCase().replace(/\s+/g, '-'),
            title,
            rating: info.ratingCount > 0 ? info.totalRating / info.ratingCount : 0,
            skillCount: info.count,
            slug: title.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-') 
          }))
          // Sort by number of people and take top 10
          .sort((a, b) => b.skillCount - a.skillCount)
          .slice(0, MAX_CATEGORIES);

        setCategories(categoryArray);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section className="w-full bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-start space-y-2">
            <h1 className="yatra-one-text text-[2.75rem] md:text-[3.25rem] leading-[1.1] text-black whitespace-pre-line">
              Browse talent by category
            </h1>
            <p className="text-color-text">
              Looking for work? <Link href="/browse-jobs" className="text-purple-attention hover:text-purple">Browse jobs</Link>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={`/category/${category.slug}`}
                className="bg-green-light rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col space-y-2">
                  <h3 className="font-semibold text-lg text-black">{category.title}</h3>
                  <div className="flex flex-row justify-between items-center space-x-2">
                      {/*<span className="text-purple-attention">★ {category.rating.toFixed(2)}/5</span>*/}
                    <span className="text-purple-attention">{category.skillCount} freelancers</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 