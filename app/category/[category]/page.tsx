'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type Freelancer = {
  id: string;
  username: string;
  main_skill: string;
  skills: string[];
  rating: number;
  profile_picture_url: string | null;
};

export default function CategoryPage() {
  const params = useParams();
  const category = (params.category as string).replace(/-/g, ' ');
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        // Fetch freelancers where either main_skill matches or category is in skills array
        const { data, error } = await supabase
          .from('users')
          .select('id, username, main_skill, skills, rating, profile_picture_url')
          .eq('account_type', 'freelancer')
          .or(`main_skill.ilike.${category},skills.cs.{"${category}"}`);

        if (error) throw error;

        setFreelancers(data || []);
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="animate-pulse">Loading freelancers...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category.charAt(0).toUpperCase() + category.slice(1)} Freelancers
          </h1>
          <p className="text-gray-600">
            Found {freelancers.length} freelancer{freelancers.length !== 1 ? 's' : ''} specializing in {category}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((freelancer) => (
            <Link 
              key={freelancer.id}
              href={`/profile/${freelancer.username}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {freelancer.profile_picture_url ? (
                    <img
                      src={freelancer.profile_picture_url}
                      alt={freelancer.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 text-lg font-semibold">
                        {freelancer.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {freelancer.username}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <span className="text-purple-600">★ {freelancer.rating?.toFixed(1) || 'N/A'}</span>
                    <span>•</span>
                    <span>{freelancer.main_skill}</span>
                  </div>
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
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
        </div>

        {freelancers.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No freelancers found
            </h3>
            <p className="text-gray-500">
              We couldn't find any freelancers specializing in {category}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 