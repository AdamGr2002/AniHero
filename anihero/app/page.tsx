'use client';
import React, { useEffect, useState } from 'react';
import { fetchAnimeCharacters } from './api/anime/route';
import CharacterCard from './components/ui/card';
import AnimeList from './components/ui/AnimeList';

const Home: React.FC = () => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [animes, setAnimes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sort, setSort] = useState<string>('name');
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const getCharacters = async () => {
      setLoading(true);
      const animeId = 1; // Replace with the desired anime ID
      const charactersData = await fetchAnimeCharacters(animeId, page, 10, sort, filter);
      setCharacters(charactersData);
      setLoading(false);
      // Assuming the API response includes total pages information
      setTotalPages(Math.ceil(charactersData.length / 10)); // Adjust based on actual API response
    };

    getCharacters();
  }, [page, sort, filter, search]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Anime Characters</h1>
      <div className="controls">
        <label htmlFor="sort">Sort by: </label>
        <select id="sort" value={sort} onChange={handleSortChange}>
          <option value="name">Name</option>
          <option value="popularity">Popularity</option>
        </select>
        <label htmlFor="filter">Filter by name: </label>
        <input
          type="text"
          id="filter"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Enter character name"
        />
        <label htmlFor="search">Search: </label>
        <input
          type="text"
          id="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search characters or anime"
        />
      </div>
      <div className="characters-grid">
        {characters.map((character) => (
          <CharacterCard key={character.mal_id} character={character.character} />
        ))}
      </div>
      <div className="pagination-controls">
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
      <h2>Anime List</h2>
      <AnimeList animes={animes} />
    </div>
  );
};

export default Home;