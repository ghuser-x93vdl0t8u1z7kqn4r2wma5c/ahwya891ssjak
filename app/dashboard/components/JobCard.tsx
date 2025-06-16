import React from 'react';

// eslint-disable-next-line
export default function JobCard({ job, children }: { job: any, children?: React.ReactNode }) {
  // Format date as "15 Jun 2025"
  const formattedDate = job.created_at
    ? new Date(job.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Unknown Date';

  return (
    <div className="p-4 bg-white rounded-lg shadow border mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-nowrap text-purple-attention">{job.title}</h3>
          <div className="text-xs text-primary text-nowrap">Time Range: <span className="text-purple-attention font-semibold text-md">{job.estimated_time_range}</span></div>
          <div className="text-xs text-primary text-nowrap">Posted On: <span className="text-purple-attention font-semibold text-md">{formattedDate}</span></div>
        </div>
          {children}
      </div>
    </div>
  );
}
