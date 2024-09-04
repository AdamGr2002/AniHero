import axios from 'axios';

const BASE_URL = 'https://api.jikan.moe/v4';

export const fetchAnimeCharacters = async (animeId: number, page: number = 1, limit: number = 10, sort: string = 'name', filter: string = '') => {
  const response = await axios.get(`${BASE_URL}/anime/${animeId}/characters`, {
    params: {
      page,
      limit,
    },
  });
  let characters = response.data.data;

  if (sort === 'name') {
    characters.sort((a: any, b: any) => a.character.name.localeCompare(b.character.name));
  } else if (sort === 'popularity') {
    characters.sort((a: any, b: any) => b.popularity - a.popularity);
  }

  if (filter) {
    characters = characters.filter((character: any) =>
      character.character.name.toLowerCase().includes(filter.toLowerCase())
    );
  }

  return characters;
};