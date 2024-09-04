import React from 'react';
import { GetServerSideProps } from 'next';
import axios from 'axios';

interface AnimeDetailsProps {
  anime: {
    title: string;
    image_url: string;
    synopsis: string;
    episodes: number;
    characters: {
      id: number;
      name: string;
      image_url: string;
    }[];
  };
}

const AnimeDetails: React.FC<AnimeDetailsProps> = ({ anime }) => {
  return (
    <div className="anime-details">
      <img src={anime.image_url} alt={anime.title} />
      <h1>{anime.title}</h1>
      <p>{anime.synopsis}</p>
      <h2>Episodes: {anime.episodes}</h2>
      <h2>Characters</h2>
      <div className="characters-grid">
        {anime.characters.map((character) => (
          <div key={character.id} className="character-card">
            <img src={character.image_url} alt={character.name} />
            <h3>{character.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
  const anime = response.data.data;

  return {
    props: {
      anime,
    },
  };
};

export default AnimeDetails;