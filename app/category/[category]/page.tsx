'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Freelancer = {
  id: string;
  username: string;
  main_skill: string;
  skills: string[];
  profile_picture_url: string | null;
};

const FETCH_LIMIT = 30;

export default function CategoryPage() {
  const params = useParams();
  const rawCategory = params.category as string;
  const category = useMemo(() => rawCategory.replace(/-/g, ' ').toLowerCase(), [rawCategory]);

  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchFreelancers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, main_skill, skills, profile_picture_url')
          .eq('account_type', 'freelancer')
          .limit(FETCH_LIMIT * 3);

        if (error) throw error;

        const lcCategory = category.toLowerCase();
        const matched = (data || []).filter((user) => {
          const mainSkillMatch = user.main_skill?.toLowerCase().includes(lcCategory);
          const skillMatch =
            Array.isArray(user.skills) &&
            user.skills.some((skill: string) => skill.toLowerCase().includes(lcCategory));
          return mainSkillMatch || skillMatch;
        });

        setFreelancers(matched);
      } catch (err) {
        console.error('Error fetching freelancers:', err);
        setError('Failed to load freelancers');
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, [category]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-light">
        <div className="space-y-4 w-full max-w-7xl px-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 animate-pulse bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="h-14 w-14 rounded-full bg-gray-300" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-5 bg-gray-300 rounded w-1/3" />
                <div className="h-4 bg-gray-300 rounded w-1/4" />
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-300 rounded w-10" />
                  <div className="h-5 bg-gray-300 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-light flex items-center justify-center">
        <p className="text-red text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-green-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl yatra-one-text font-extrabold text-purple-attention uppercase">
              {category}
            </h1>
            <Link href="/" className="flex items-center gap-2 text-purple hover:underline">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Categories</span>
            </Link>
          </div>
          <p className="mt-2 text-body text-lg">
            {freelancers.length} freelancer{freelancers.length !== 1 ? 's' : ''} matched with{' '}
            <span className="text-purple font-semibold">{category}</span>
          </p>
        </header>

        {freelancers.length === 0 ? (
          <section className="py-20 text-center text-gray-input">
            <h2 className="text-2xl font-semibold mb-2">No freelancers found</h2>
            <p>
              No one matched with <span className="text-purple font-semibold">{category}</span>.
            </p>
          </section>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((freelancer) => (
              <Link
                key={freelancer.id}
                href={`/profile/${freelancer.username}`}
                className="group block bg-white border border-gray-input-border hover:border-purple transition duration-200 rounded-xl p-5 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {freelancer.profile_picture_url ? (
                      <img
                        src={freelancer.profile_picture_url}
                        alt={freelancer.username}
                        className="h-14 w-14 rounded-full object-cover border border-gray-input-border"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-purple-attention flex items-center justify-center text-xl font-bold text-white">
                        {freelancer.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-heading group-hover:text-purple">
                      {freelancer.username}
                    </h3>
                    <p className="text-sm text-purple capitalize">{freelancer.main_skill}</p>
                    {freelancer.skills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {freelancer.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-purple-attention text-white text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
