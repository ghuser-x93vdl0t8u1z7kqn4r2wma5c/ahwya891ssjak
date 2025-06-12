import React from 'react';

export default function ApplicationCard({ application, children }: { application: any, children?: React.ReactNode }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border mb-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{application.applicant?.display_name || application.display_name}</div>
          <div className="text-xs text-gray-500">{application.applicant?.main_skill || application.main_skill}</div>
          <div className="text-xs">Fees: ${application.fees} | {application.time_range}</div>
        </div>
        {children}
      </div>
      <div className="mt-2 text-sm text-gray-700">{application.cover_letter}</div>
    </div>
  );
}
