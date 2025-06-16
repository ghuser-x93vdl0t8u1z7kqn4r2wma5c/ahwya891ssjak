'use client';
/* eslint-disable */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import FreelancerProfile from './FreelancerProfile';
import CreatorProfile from './CreatorProfile';
import BusinessProfile from './BusinessProfile';

type AccountType = 'freelancer' | 'creator' | 'business';

interface FormData {
  username: string;
  display_name: string;
  bio: string;
  account_type: AccountType | '';
}

const initialFormData: FormData = {
  username: '',
  display_name: '',
  bio: '',
  account_type: ''
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();

      if (!userError && userData?.onboarding_completed === 'true') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, [router]);

  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameError(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setUsernameError(data ? 'This username is already taken' : null);
    } catch (err) {
      console.error('Error checking username:', err);
      setUsernameError('Error checking username availability');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'username') {
      // Allow only a-z and 0-9 — remove spaces and special chars immediately
      const filteredValue = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
      checkUsername(filteredValue);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
};

  const handleNext = (data?: any) => {
    if (data) setProfileData(data);
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (profileData?.primary_skill) {
        profileData.main_skill = profileData.primary_skill;
        delete profileData.primary_skill;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          account_type: formData.account_type,
          onboarding_completed: 'true',
          ...profileData
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-heading">Welcome to Lahara!</h2>
              <p className="mt-1 text-sm text-body">Let&apos;s set up your profile</p>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-body">Username</label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    pattern="^[A-Za-z0-9]+$"
                    title="Username can only contain letters (A-Z, a-z) and numbers (0-9)"
                    required
                    className={`block w-full rounded-full px-4 py-2 border ${usernameError ? 'border-red' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-purple bg-gray-input text-gray-input`}
                    placeholder="Enter your username"
                  />
                  {isCheckingUsername && (
                    <div className="absolute right-3 top-2.5 animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple"></div>
                  )}
                </div>
                {usernameError && <p className="mt-1 text-sm text-red">{usernameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-body">Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-full px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple bg-gray-input text-gray-input"
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-body">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-lg px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple bg-gray-input text-gray-input resize-none"
                  placeholder="Tell us about yourself"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-body">I am a...</label>
                <select
                  name="account_type"
                  value={formData.account_type}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-full px-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple bg-gray-input text-gray-input"
                >
                  <option value="">Select account type</option>
                  <option value="freelancer">Freelancer</option>
                  {/*<option value="creator">Creator</option>*/}
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => handleNext()}
                  disabled={
                    !formData.username ||
                    !!usernameError ||
                    !formData.account_type ||
                    !formData.display_name ||
                    !formData.bio
                  }
                  className="px-6 py-3 text-sm font-medium text-white bg-purple hover:bg-purple-attention rounded-full focus:outline-none focus:ring-2 focus:ring-purple disabled:bg-gray-input disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        );

      case 2:
        switch (formData.account_type) {
          case 'freelancer':
            return <FreelancerProfile onNext={handleNext} onBack={handleBack} />;
          case 'creator':
            return <CreatorProfile onNext={handleNext} onBack={handleBack} />;
          case 'business':
            return <BusinessProfile onNext={handleNext} onBack={handleBack} />;
          default:
            return null;
        }

      case 3:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-heading">Almost there!</h2>
              <p className="mt-1 text-sm text-body">Review and confirm your profile details</p>
            </div>

            <div className="bg-gray-input shadow rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium text-heading">Profile Summary</h3>
              <p><strong>Username:</strong> {formData.username}</p>
              <p><strong>Display Name:</strong> {formData.display_name}</p>
              <p><strong>Bio:</strong> {formData.bio}</p>
              <p><strong>Account Type:</strong> {formData.account_type}</p>
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={handleBack} className="px-6 py-3 text-sm font-medium bg-gray-300 rounded-full">Back</button>
              <button type="submit" disabled={submitting} className="px-6 py-3 text-sm font-medium text-white bg-purple hover:bg-purple-attention rounded-full">
                {submitting ? 'Submitting...' : 'Finish'}
              </button>
            </div>
            {error && <p className="text-sm text-red">{error}</p>}
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {renderStep()}
    </div>
  );
}
