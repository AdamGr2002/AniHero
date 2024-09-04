import React from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';

interface CharacterDetailsProps {
  character: {
    name: string;
    image_url: string;
    description: string;
    abilities: string[];
    anime: string;
  };
}

const CharacterDetails: React.FC<CharacterDetailsProps> = ({ character }) => {
  return (
    <div className="character-details">
      <img src={character.image_url} alt={character.name} />
      <h1>{character.name}</h1>
      <p>{character.description}</p>
      <h2>Abilities</h2>
      <ul>
        {character.abilities.map((ability, index) => (
          <li key={index}>{ability}</li>
        ))}
      </ul>
      <h2>Anime</h2>
      <p>{character.anime}</p>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const response = await axios.get(`https://api.jikan.moe/v4/characters/${id}`);
  const character = response.data.data;

  return {
    props: {
      character,
    },
  };
};

export default CharacterDetails;