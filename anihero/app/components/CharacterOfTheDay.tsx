/* eslint-disable react/no-unescaped-entities */
"use client"

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface AnimeCharacter {
  mal_id: number
  name: string
  about: string
  images: {
    jpg: {
      image_url: string
    }
  }
  anime: {
    title: string
  }[]
  quotes?: {
    quote: string
    anime: string
  }[]
}

const fallbackCharacters: AnimeCharacter[] = [
  {
    mal_id: 1,
    name: "Monkey D. Luffy",
    about: "The main protagonist of One Piece and captain of the Straw Hat Pirates.",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/9/310307.jpg" } },
    anime: [{ title: "One Piece" }],
    quotes: [{ quote: "I'm gonna be the Pirate King!", anime: "One Piece" }]
  },
  {
    mal_id: 2,
    name: "Naruto Uzumaki",
    about: "The main protagonist of the Naruto series and the Seventh Hokage of Konohagakure.",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/2/284121.jpg" } },
    anime: [{ title: "Naruto" }],
    quotes: [{ quote: "I'm going to be Hokage!", anime: "Naruto" }]
  },
  {
    mal_id: 3,
    name: "Goku",
    about: "The main protagonist of the Dragon Ball series, known for his incredible strength and kind heart.",
    images: { jpg: { image_url: "https://cdn.myanimelist.net/images/characters/15/72546.jpg" } },
    anime: [{ title: "Dragon Ball" }],
    quotes: [{ quote: "I am the hope of the universe. I am the answer to all living things that cry out for peace.", anime: "Dragon Ball Z" }]
  }
]

export default function CharacterOfTheDay() {
  const [character, setCharacter] = useState<AnimeCharacter | null>(null)
  const [quoteOfTheDay, setQuoteOfTheDay] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRandomCharacter = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('/api/anime/characters/random')
        let selectedCharacter = response.data.data

        if (!selectedCharacter) {
          selectedCharacter = fallbackCharacters[Math.floor(Math.random() * fallbackCharacters.length)]
        }

        setCharacter(selectedCharacter)

        // Fetch quotes for the character
        if (selectedCharacter.mal_id) {
          const quotesResponse = await axios.get(`/api/anime/characters/${selectedCharacter.mal_id}/quotes`)
          const quotes = quotesResponse.data.data
          if (quotes && quotes.length > 0) {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
            setQuoteOfTheDay(randomQuote.quote)
          } else if (selectedCharacter.quotes && selectedCharacter.quotes.length > 0) {
            setQuoteOfTheDay(selectedCharacter.quotes[0].quote)
          }
        }
      } catch (error) {
        console.error('Failed to fetch random character:', error)
        const fallbackCharacter = fallbackCharacters[Math.floor(Math.random() * fallbackCharacters.length)]
        setCharacter(fallbackCharacter)
        if (fallbackCharacter.quotes && fallbackCharacter.quotes.length > 0) {
          setQuoteOfTheDay(fallbackCharacter.quotes[0].quote)
        }
      }
      setIsLoading(false)
    }

    fetchRandomCharacter()
  }, [])

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Character of the Day</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Skeleton className="w-24 h-36 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!character) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">Character of the Day</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
        <img 
          src={character.images?.jpg?.image_url || '/placeholder.svg?height=150&width=100'} 
          alt={character.name} 
          className="w-24 h-36 object-cover rounded-md"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{character.about || 'No description available.'}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {character.anime && character.anime.length > 0 ? (
              character.anime.slice(0, 3).map((anime, index) => (
                <Badge key={index} variant="secondary">
                  {anime.title}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary">No anime information available</Badge>
            )}
          </div>
          {quoteOfTheDay && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold mb-2">Quote of the Day</h4>
              <blockquote className="italic text-sm text-muted-foreground">"{quoteOfTheDay}"</blockquote>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}