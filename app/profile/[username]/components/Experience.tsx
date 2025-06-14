'use client';

/* eslint-disable */
import React from 'react';

interface ExperienceProps {
  experience: any[];
}

const Experience: React.FC<ExperienceProps> = ({ experience }) => {
  return (
    <section>
      <h2>Experience</h2>
      {experience && experience.length > 0 ? (
        <ul>
          {experience.map((exp, idx) => (
            <li key={idx}>
              <strong>{exp.position || exp.title}</strong> at {exp.company} ({exp.start_date || exp.startDate} - {exp.end_date || exp.endDate || 'Present'})
            </li>
          ))}
        </ul>
      ) : (
        <p>No experience details provided.</p>
      )}
    </section>
  );
};

export default Experience;
