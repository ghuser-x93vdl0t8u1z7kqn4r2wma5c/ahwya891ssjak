import React from 'react';

interface EducationProps {
  education: any[];
}

const Education: React.FC<EducationProps> = ({ education }) => {
  return (
    <section>
      <h2>Education</h2>
      {education && education.length > 0 ? (
        <ul>
          {education.map((edu, idx) => (
            <li key={idx}>
              <strong>{edu.degree || edu.title}</strong> at {edu.institution || edu.school} ({edu.start_year || edu.startDate} - {edu.end_year || edu.endDate || 'Present'})
            </li>
          ))}
        </ul>
      ) : (
        <p>No education details provided.</p>
      )}
    </section>
  );
};

export default Education;
