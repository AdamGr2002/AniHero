import React from 'react';

interface UserProfileProps {
  user: {
    name: string;
    favoriteCharacters: {
      id: number;
      name: string;
      image_url: string;
    }[];
    comments: string[];
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="user-profile">
      <h1>{user.name}&apos;s Profile</h1>
      <h2>Favorite Characters</h2>
      <div className="favorite-characters">
        {user.favoriteCharacters.map((character) => (
          <div key={character.id} className="character-card">
            <img src={character.image_url} alt={character.name} />
            <h3>{character.name}</h3>
          </div>
        ))}
      </div>
      <h2>Comments</h2>
      <ul>
        {user.comments.map((comment, index) => (
          <li key={index}>{comment}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserProfile;