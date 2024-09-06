import React from 'react';
import Link from 'next/link';

interface CharacterCardProps {
  character: {
    name: string;
    image_url: string;
    description: string;
    id: number;
  };
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  return (
    <div className="card anime-card">
      <div className="card-image">
        <img src={character.image_url} alt={character.name} />
      </div>
      <div className="card-content">
        <h3 className="card-title">{character.name}</h3>
        <p className="card-description">{character.description}</p>
        <Link href={`/character/${character.id}`}className="card-link">View Details
        </Link>
      </div>
    </div>
  );
};

export default CharacterCard;