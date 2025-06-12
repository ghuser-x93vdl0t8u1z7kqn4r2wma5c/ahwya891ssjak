import React from 'react';

interface BioProps {
  bio: string;
}

const Bio: React.FC<BioProps> = ({ bio }) => {
  return (
    <section>
      <h2>Bio</h2>
      <p>{bio || 'No bio provided.'}</p>
    </section>
  );
};

export default Bio;
