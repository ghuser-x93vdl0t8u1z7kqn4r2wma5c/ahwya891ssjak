'use client';
/* eslint-disable */

import { useState } from 'react';
import Image from 'next/image';

interface CreatorProfileProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const NICHES = [
  'Technology', 'Gaming', 'Lifestyle', 'Fashion', 'Food & Cooking',
  'Travel', 'Fitness & Health', 'Beauty', 'Entertainment', 'Education',
  'Business & Finance', 'Art & Design', 'Music', 'Comedy', 'News & Politics',
  'Science', 'Sports', 'Parenting', 'DIY & Crafts', 'Photography'
];

const SOCIAL_PLATFORMS = [
  'YouTube', 'Instagram', 'TikTok', 'Facebook'
];

const FOLLOWER_RANGES = [
  'Under 1K',
  '1K - 5K',
  '5K - 10K',
  '10K - 50K',
  '50K - 100K',
  '100K - 500K',
  '500K - 1M',
  '1M - 5M',
  'Over 5M'
];

const TEAM_SIZES = [
  'Solo Creator',
  '2-3 people',
  '4-5 people',
  '6-10 people',
  '11-20 people',
  'Over 20 people'
];

export default function CreatorProfile({ onNext, onBack }: CreatorProfileProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hourly_rate: '',
    niche: '',
    social_medias: [] as string[],
    followers: '',
    channel_links: {} as Record<string, string>,
    team_size: ''
  });
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});
  const [hourlyRateError, setHourlyRateError] = useState<string>('');

  const formatChannelLinks = (platforms: string[]) => {
    return platforms
      .map(platform => {
        switch(platform) {
          case 'YouTube':
            return 'YouTube: https://youtube.com/@your-channel';
          case 'Instagram':
            return 'Instagram: https://instagram.com/your-username';
          case 'TikTok':
            return 'TikTok: https://tiktok.com/@your-username';
          case 'Twitter/X':
            return 'Twitter/X: https://twitter.com/your-username';
          case 'Facebook':
            return 'Facebook: https://facebook.com/your-page';
          case 'LinkedIn':
            return 'LinkedIn: https://linkedin.com/in/your-profile';
          case 'Twitch':
            return 'Twitch: https://twitch.tv/your-channel';
          case 'Discord':
            return 'Discord: https://discord.gg/your-server';
          case 'Pinterest':
            return 'Pinterest: https://pinterest.com/your-profile';
          case 'Snapchat':
            return 'Snapchat: https://snapchat.com/add/your-username';
          case 'Reddit':
            return 'Reddit: https://reddit.com/u/your-username';
          case 'Medium':
            return 'Medium: https://medium.com/@your-username';
          case 'Substack':
            return 'Substack: https://your-newsletter.substack.com';
          case 'Patreon':
            return 'Patreon: https://patreon.com/your-page';
          case 'OnlyFans':
            return 'OnlyFans: https://onlyfans.com/your-page';
          case 'Clubhouse':
            return 'Clubhouse: https://clubhouse.com/@your-username';
          default:
            return `${platform}: your-link-here`;
        }
      })
      .join('\n');
  };

  const handleSocialMediaChange = (platform: string) => {
    const updatedPlatforms = formData.social_medias.includes(platform)
      ? formData.social_medias.filter(p => p !== platform)
      : formData.social_medias.length < 5  // Limit to 5 platforms
        ? [...formData.social_medias, platform]
        : formData.social_medias;

    // Update channel_links object when platforms change
    const updatedLinks = { ...formData.channel_links };
    if (!updatedPlatforms.includes(platform)) {
      delete updatedLinks[platform];
    }

    setFormData(prev => ({
      ...prev,
      social_medias: updatedPlatforms,
      channel_links: updatedLinks
    }));
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      channel_links: {
        ...prev.channel_links,
        [platform]: value
      }
    }));

    // Clear error when user starts typing
    if (value === '') {
      setLinkErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[platform];
        return newErrors;
      });
      return;
    }

    // Validate URL format
    if (!isValidUrl(value)) {
      setLinkErrors(prev => ({
        ...prev,
        [platform]: 'Please enter a valid URL (e.g., https://example.com)'
      }));
    } else {
      setLinkErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[platform];
        return newErrors;
      });
    }
  };

  const getPlaceholder = (platform: string) => {
    switch(platform) {
      case 'YouTube':
        return 'https://youtube.com/@your-channel';
      case 'Instagram':
        return 'https://instagram.com/your-username';
      case 'TikTok':
        return 'https://tiktok.com/@your-username';
      case 'Twitter/X':
        return 'https://twitter.com/your-username';
      case 'Facebook':
        return 'https://facebook.com/your-page';
      case 'LinkedIn':
        return 'https://linkedin.com/in/your-profile';
      case 'Twitch':
        return 'https://twitch.tv/your-channel';
      case 'Discord':
        return 'https://discord.gg/your-server';
      case 'Pinterest':
        return 'https://pinterest.com/your-profile';
      case 'Snapchat':
        return 'https://snapchat.com/add/your-username';
      case 'Reddit':
        return 'https://reddit.com/u/your-username';
      case 'Medium':
        return 'https://medium.com/@your-username';
      case 'Substack':
        return 'https://your-newsletter.substack.com';
      case 'Patreon':
        return 'https://patreon.com/your-page';
      case 'OnlyFans':
        return 'https://onlyfans.com/your-page';
      case 'Clubhouse':
        return 'https://clubhouse.com/@your-username';
      default:
        return 'Enter your link here';
    }
  };

  const handleHourlyRateChange = (value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      setHourlyRateError('Please enter numbers only');
      return;
    }

    setHourlyRateError('');
    setFormData(prev => ({
      ...prev,
      hourly_rate: value
    }));
  };

  const isStepOneValid = () => {
    const valid = formData.hourly_rate.trim() !== '' &&
      !hourlyRateError &&  // Make sure there's no error
      formData.niche !== '' &&
      formData.team_size !== '';
    console.log('Step 1 validation:', {
      hourlyRate: formData.hourly_rate,
      hourlyRateError,
      niche: formData.niche,
      teamSize: formData.team_size,
      isValid: valid
    });
    return valid;
  };

  const isStepTwoValid = () => {
    return (
      formData.social_medias.length > 0 &&
      formData.followers !== '' &&
      Object.keys(formData.channel_links).length > 0 &&
      Object.keys(linkErrors).length === 0 && // Make sure there are no URL errors
      formData.social_medias.every(platform => // Make sure all selected platforms have valid URLs
        formData.channel_links[platform] && isValidUrl(formData.channel_links[platform])
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { step, formData, isStepOneValid: isStepOneValid() });
    if (step === 1 && isStepOneValid()) {
      console.log('Moving to step 2');
      setStep(2);
    } else if (step === 2 && isStepTwoValid()) {
      console.log('Submitting form');
      onNext({ ...formData, account_type: 'creator' });
    }
  };

  return (
    <div className="flex min-w-[80vh] w-[120vh] max-h-[100vh] bg-white rounded-lg m-5">
      <div className="flex-1 px-12 py-8 flex justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-medium text-heading">Hello, Creator!</h2>
            <p className="text-base text-body">Tell us about your content</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-body">
                    Hourly Rate, in NPR
                  </label>
                  <input
                    type="text"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={(e) => handleHourlyRateChange(e.target.value)}
                    required
                    className={`w-full px-6 py-3 rounded-full border ${
                      hourlyRateError ? 'border-red' : 'border-gray-200'
                    } focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input`}
                    placeholder="Enter your hourly rate"
                  />
                  {hourlyRateError && (
                    <p className="mt-1 text-sm text-red">{hourlyRateError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-body">
                    Content Niche
                  </label>
                  <div className="relative">
                    <select
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input appearance-none"
                      required
                    >
                      <option value="">Select Your Niche</option>
                      {NICHES.map(niche => (
                        <option key={niche} value={niche}>{niche}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-body">
                    Team Size
                  </label>
                  <div className="relative">
                    <select
                      value={formData.team_size}
                      onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                      className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input appearance-none"
                      required
                    >
                      <option value="">Select Team Size</option>
                      {TEAM_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-body">
                    Social Media Platforms
                  </label>
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => handleSocialMediaChange(e.target.value)}
                      className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input appearance-none"
                    >
                      <option value="">Select Platform</option>
                      {SOCIAL_PLATFORMS
                        .filter(platform => !formData.social_medias.includes(platform))
                        .map(platform => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))
                      }
                    </select>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {formData.social_medias.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.social_medias.map(platform => (
                        <span 
                          key={platform}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-attention text-white"
                        >
                          {platform}
                          <button
                            type="button"
                            onClick={() => handleSocialMediaChange(platform)}
                            className="ml-2 focus:outline-none"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-body">
                    Total Followers
                  </label>
                  <div className="relative">
                    <select
                      value={formData.followers}
                      onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                      className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input appearance-none"
                      required
                    >
                      <option value="">Select Total Followers Range</option>
                      {FOLLOWER_RANGES.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-body">
                    Channel Links
                  </label>
                  <div className="space-y-3">
                    {formData.social_medias.map(platform => (
                      <div key={platform} className="flex flex-col w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-body min-w-[100px]">{platform}:</span>
                          <input
                            type="url"
                            value={formData.channel_links[platform] || ''}
                            onChange={(e) => handleLinkChange(platform, e.target.value)}
                            placeholder={getPlaceholder(platform)}
                            className={`flex-1 px-4 py-2 rounded-full border ${
                              linkErrors[platform] ? 'border-red' : 'border-gray-200'
                            } focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input placeholder-gray-input text-sm`}
                            required
                          />
                        </div>
                        {linkErrors[platform] && (
                          <p className="mt-1 text-sm text-red ml-[108px]">{linkErrors[platform]}</p>
                        )}
                      </div>
                    ))}
                    {formData.social_medias.length === 0 && (
                      <p className="text-sm text-gray-input italic">Select social media platforms above to add your channel links</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 flex flex-row gap-5">
              <button
                type="submit"
                disabled={step === 1 ? !isStepOneValid() : !isStepTwoValid()}
                className={`w-1/2 py-3 rounded-full text-white font-medium text-sm transition-colors ${
                  (step === 1 ? isStepOneValid() : isStepTwoValid())
                    ? 'bg-purple hover:bg-purple-attention' 
                    : 'bg-gray-input cursor-not-allowed'
                }`}
              >
                Next
              </button>
              <button
                type="button"
                onClick={step === 1 ? onBack : () => setStep(1)}
                className="w-1/2 py-3 rounded-full border border-gray-200 text-body hover:bg-gray-input transition-colors font-medium text-sm"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="flex-1 bg-white">
        <div className="h-full w-full flex items-center justify-center">
          <Image
            src="/auth_onboard_svg/creator.svg"
            alt="Creator illustration"
            width={500}
            height={500}
            priority
          />
        </div>
      </div>
    </div>
  );
} 