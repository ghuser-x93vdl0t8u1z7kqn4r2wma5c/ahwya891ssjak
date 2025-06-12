import React from 'react';

export default function JobCard({ job, children }: { job: any, children?: React.ReactNode }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow border mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">{job.title}</h3>
          <div className="text-sm text-gray-600">Budget: NPR {job.budget}</div>
          <div className="text-xs text-gray-500">Time Range: {job.estimated_time_range}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
