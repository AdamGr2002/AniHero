"use client"

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Character {
  mal_id: number
  name: string
  name_kanji: string
  images: {
    jpg: {
      image_url: string
    }
  }
  about: string
  anime: {
    title: string
    role: string
  }[]
  quotes: string[]
}

export function CharacterOfTheDay() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const fetchCharacterOfTheDay = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get('/api/anime', {
        params: {
          page: Math.floor(Math.random() * 10) + 1, // Random page between 1 and 10
          limit: 1,
          order_by: 'favorites',
          sort: 'desc'
        }
      })
      if (response.data.data && response.data.data.length > 0) {
        const fetchedCharacter = response.data.data[0]
        // Fetch quotes for the character
        const quotesResponse = await axios.get(`/api/quotes/${fetchedCharacter.mal_id}`)
        fetchedCharacter.quotes = quotesResponse.data.quotes || []
        setCharacter(fetchedCharacter)
        setCurrentQuoteIndex(0)
      } else {
        throw new Error("No character data received")
      }
    } catch (error) {
      console.error('Failed to fetch character of the day:', error)
      setError("Failed to fetch the character of the day. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacterOfTheDay()
  }, [])

  const cycleQuote = () => {
    if (character && character.quotes.length > 0) {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % character.quotes.length)
    }
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load character of the day</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={fetchCharacterOfTheDay}>Try Again</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Character of the Day</CardTitle>
        <CardDescription>Discover a new character every day!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading || !character ? (
          <>
            <Skeleton className="w-full h-64 rounded-lg" />
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-full h-24" />
          </>
        ) : (
          <>
            <img
              src={character.images.jpg.image_url}
              alt={character.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <h2 className="text-2xl font-bold">{character.name}</h2>
            {character.name_kanji && (
              <p className="text-lg text-gray-600">{character.name_kanji}</p>
            )}
            <p className="text-sm line-clamp-4">{character.about}</p>
            {character.anime.length > 0 && (
              <div>
                <h3 className="font-semibold">Appears in:</h3>
                <ul className="list-disc list-inside">
                  {character.anime.slice(0, 3).map((anime, index) => (
                    <li key={index}>
                      {anime.title} ({anime.role})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {character.quotes.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">Quote:</h3>
                <p className="italic">"{character.quotes[currentQuoteIndex]}"</p>
                <Button onClick={cycleQuote} variant="outline" className="mt-2">
                  Next Quote
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchCharacterOfTheDay} disabled={loading}>
          {loading ? 'Loading...' : 'Get New Character of the Day'}
        </Button>
      </CardFooter>
    </Card>
  )
}