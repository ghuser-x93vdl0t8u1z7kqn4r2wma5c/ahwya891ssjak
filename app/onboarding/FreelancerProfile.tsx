'use client';
/* eslint-disable */
import { useState } from 'react';
import Image from 'next/image';

interface FreelancerProfileProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

const SKILLS = [
  'Web Development', 'Mobile App Development', 'UI/UX Design', 'Graphic Design',
  'Content Writing', 'Digital Marketing', 'SEO', 'Social Media Management',
  'Video Editing', 'Photography', 'Data Analysis', 'Project Management',
  'Copywriting', 'Translation', 'Voice Over', 'Animation', '3D Modeling',
  'WordPress Development', 'E-commerce', 'Email Marketing', 'Brand Design',
  'Logo Design', 'Illustration', 'Game Development', 'Machine Learning',
  'DevOps', 'Cloud Computing', 'Cybersecurity', 'Business Consulting'
];

const EDUCATION_LEVELS = [
  'High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree',
  'PhD', 'Professional Certification', 'Self-taught', 'Bootcamp Graduate'
];

const EXPERIENCE_LEVELS = [
  'Less than 1 year', '1-2 years', '3-5 years', '6-10 years', 'Over 10 years'
];

interface FormData {
  hourly_rate: string;
  main_skill: string;
  skills: string[];
  education: string;
  experience: string;
  portfolio: string;
}

const initialFormData: FormData = {
  hourly_rate: '',
  main_skill: '',
  skills: [],
  education: '',
  experience: '',
  portfolio: ''
};

export default function FreelancerProfile({ onNext, onBack }: FreelancerProfileProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [hourlyRateError, setHourlyRateError] = useState<string>('');

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
    return (
      formData.hourly_rate.trim() !== '' &&
      !hourlyRateError &&  // Make sure there's no error
      formData.main_skill !== '' &&
      formData.skills.length > 0
    );
  };

  const isStepTwoValid = () => {
    return (
      formData.education !== '' &&
      formData.experience !== ''
      // portfolio is optional
    );
  };

  const handleSkillChange = (skill: string) => {
    if (!skill) return;
    if (formData.skills.length >= 5 && !formData.skills.includes(skill)) {
      return; // Max 5 skills
    }
    
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && isStepOneValid()) {
      setStep(2);
    } else if (step === 2 && isStepTwoValid()) {
      onNext({ ...formData, account_type: 'freelancer' });
    }
  };

  return (
    <div className="flex min-w-[80vh] md:w-[120vh] max-h-[100vh] bg-white rounded-lg m-5">
      <div className="flex-1 px-12 py-8 flex justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl font-medium text-heading">
              {step === 1 ? 'Hello, Freelancer!' : 'Almost Done!'}
            </h2>
            <p className="text-base text-body">
              {step === 1 ? 'Tell us about your expertise' : 'Just a few more details'}
            </p>
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
                    Main Skill
                  </label>
                  <div className="relative">
                    <select
                      value={formData.main_skill}
                      onChange={(e) => setFormData({ ...formData, main_skill: e.target.value })}
                      className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input appearance-none"
                      required
                    >
                      <option value="">Select Main Skill</option>
                      {SKILLS.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
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
                    Skills (Select Up to 5)
                  </label>
                  <div className="relative">
                    <select
                      value=""
                      onChange={(e) => handleSkillChange(e.target.value)}
                      className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input appearance-none"
                    >
                      <option value="">Select Additional Skills</option>
                      {SKILLS.filter(skill => !formData.skills.includes(skill) && skill !== formData.main_skill).map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-input" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.skills.map(skill => (
                        <span 
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-attention text-white"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillChange(skill)}
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
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-body">
                    Highest Education
                  </label>
                  <div className="relative">
                    <select
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input appearance-none"
                    >
                      <option value="">Select Highest Education</option>
                      {EDUCATION_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
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
                    Years of Experience
                  </label>
                  <div className="relative">
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input appearance-none"
                    >
                      <option value="">Select Years of Experience</option>
                      {EXPERIENCE_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
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
                    Portfolio Link
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="Portfolio Link (Optional)"
                    className="w-full px-6 py-3 rounded-full border border-gray-200 focus:ring-1 focus:ring-purple focus:border-purple outline-none text-gray-input bg-gray-input placeholder-gray-input"
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
      
      <div className="hidden md:flex flex-1 bg-white">
        <div className="h-full w-full flex items-center justify-center">
          <Image
            src="/auth_onboard_svg/freelancer.svg"
            alt="Freelancer illustration"
            width={500}
            height={500}
            priority
          />
        </div>
      </div>
    </div>
  );
} 