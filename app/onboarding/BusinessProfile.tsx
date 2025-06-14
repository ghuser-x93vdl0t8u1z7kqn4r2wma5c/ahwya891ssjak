'use client';

/* eslint-disable */
import { useState } from 'react';
import Image from 'next/image';

interface BusinessProfileProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const BUSINESS_TYPES = [
  'Technology', 'E-commerce', 'Healthcare', 'Education', 'Finance',
  'Manufacturing', 'Retail', 'Real Estate', 'Hospitality', 'Media',
  'Consulting', 'Non-profit', 'Agriculture', 'Construction', 'Transportation'
];

const TEAM_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const INDUSTRY_TYPES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Real Estate', 'Hospitality', 'Transportation', 'Entertainment', 'Food & Beverage',
  'Fashion', 'Sports', 'Non-profit', 'Government', 'Consulting', 'Marketing',
  'Legal', 'Construction', 'Energy'
];

const BUDGET_RANGES = [
  'Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $25,000',
  '$25,000 - $50,000', '$50,000 - $100,000', 'Over $100,000'
];

interface FormData {
  industry_type: string;
  team_size: string;
  website: string;
  company_info: string;
}

const initialFormData: FormData = {
  industry_type: '',
  team_size: '',
  website: '',
  company_info: ''
};

export default function BusinessProfile({ onNext, onBack }: BusinessProfileProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const isStepOneValid = () => {
    return (
      formData.industry_type !== '' &&
      formData.team_size !== ''
    );
  };

  const isStepTwoValid = () => {
    return true; // website and company_info are optional
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && isStepOneValid()) {
      setStep(2);
    } else if (step === 2 && isStepTwoValid()) {
      onNext({ ...formData, account_type: 'business' });
    }
  };

  return (
    <div className="flex min-w-[80vh] w-[120vh] max-h-[100vh] bg-white rounded-lg m-5">
      <div className="flex-1 px-12 py-8 flex justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-medium text-heading">
              {step === 1 ? 'Hello, Business!' : 'Almost Done!'}
            </h2>
            <p className="text-base text-body">
              {step === 1 ? 'Tell us about your business' : 'Just a few more details'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-body">
                    Industry Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.industry_type}
                      onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })}
                      className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input appearance-none"
                      required
                    >
                      <option value="">Select Industry Type</option>
                      {INDUSTRY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
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
                    Business Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input placeholder-gray-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-body">
                    Company Info
                  </label>
                  <textarea
                    value={formData.company_info}
                    onChange={(e) => setFormData({ ...formData, company_info: e.target.value })}
                    rows={4}
                    className="w-full px-6 py-3 rounded-lg border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input"
                    placeholder="Tell us about your company..."
                  />
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
            src="/auth_onboard_svg/business.svg"
            alt="Business illustration"
            width={500}
            height={500}
            priority
          />
        </div>
      </div>
    </div>
  );
} 