import React from 'react';

interface SkillsProps {
  skills: string[];
}

const Skills: React.FC<SkillsProps> = ({ skills }) => {
  return (
    <section>
      <h2>Skills</h2>
      {skills && skills.length > 0 ? (
        <ul>
          {skills.map((skill, idx) => (
            <li key={idx}>{skill}</li>
          ))}
        </ul>
      ) : (
        <p>No skills listed.</p>
      )}
    </section>
  );
};

export default Skills;
