import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


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
    <Card className="character-details">
        <CardHeader>
            <img src={character.image_url} alt={character.name} className="character-image" />
            <CardTitle>{character.name}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="character-description">{character.description}</p>
            <h2 className="section-title">Abilities</h2>
            <ul className="abilities-list">
                {character.abilities.map((ability, index) => (
                    <li key={index} className="ability-item">{ability}</li>
                ))}
            </ul>
            <h2 className="section-title">Anime</h2>
            <p className="character-anime">{character.anime}</p>
        </CardContent>
    </Card>
);
};

export default CharacterDetails;