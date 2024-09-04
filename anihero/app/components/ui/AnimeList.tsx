import React from 'react';
import Link from 'next/link';

interface AnimeListProps {
  animes: {
    id: number;
    title: string;
    image_url: string;
  }[];
}

const AnimeList: React.FC<AnimeListProps> = ({ animes }) => {
  return (
    <div className="anime-list">
      {animes.map((anime) => (
        <div key={anime.id} className="anime-card">
          <img src={anime.image_url} alt={anime.title} />
          <h3>{anime.title}</h3>
          <Link href={`/anime/${anime.id}`}>
            <a className="anime-link">View Details</a>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AnimeList;