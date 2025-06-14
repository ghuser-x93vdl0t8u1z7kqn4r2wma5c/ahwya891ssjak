import React from 'react';

export default function ApplicationCard({
  application,
  pricing_type,
  children,
}: {
  // eslint-disable-next-line
  application: any;
  pricing_type: 'hourly' | 'fixed' | string; // adjust to match your pricing types
  children?: React.ReactNode;
}) {
  const mainSkill =
    application.applicant?.main_skill || application.main_skill || 'No main skill';
  const secondarySkills =
    application.applicant?.skills?.filter((skill: string) => skill !== mainSkill) || [];

  return (
    <div className="p-6 bg-white rounded-xl border shadow-sm mb-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          {/* Name */}
          <div className="text-lg font-semibold text-heading">
            {application.applicant?.display_name || application.display_name}
          </div>

          {/* Main Skill */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold">Main Skill:</span>
            <span className="px-2 py-1 bg-purple-attention text-white rounded-full text-xs font-medium border border-purple-attention">
              {mainSkill}
            </span>
          </div>

          {/* Fees and Time */}
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Fees:</span> NPR {application.fees}
            {pricing_type === 'hourly' ? '/hr' : '/project'} &bull;{' '}
            <span className="font-semibold">Estimated Time:</span> {application.time_range}
          </div>
        </div>

        {children}
      </div>

      {/* Secondary Skills */}
      {secondarySkills.length > 0 && (
        <div className="mt-5">
          <div className="text-xs font-semibold text-gray-500 mb-2">Other Skills:</div>
          <div className="flex flex-wrap gap-2">
            {secondarySkills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 text-purple-attention text-xs font-medium rounded-full border border-purple-attention"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cover Letter */}
      {application.cover_letter && (
        <div className="mt-6">
          <div className="text-xs font-semibold text-gray-500 mb-2">Cover Letter:</div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            {application.cover_letter}
          </div>
        </div>
      )}
    </div>
  );
}
