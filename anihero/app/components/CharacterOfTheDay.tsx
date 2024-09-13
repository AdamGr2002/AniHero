/* eslint-disable react/no-unescaped-entities */
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
}

export function CharacterOfTheDay() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCharacterOfTheDay = async () => {
    setLoading(true)
    setError(null)

    const today = new Date().toISOString().split('T')[0]
    const cachedCharacter = localStorage.getItem(`characterOfTheDay-${today}`)

    if (cachedCharacter) {
      setCharacter(JSON.parse(cachedCharacter))
      setLoading(false)
      return
    }

    try {
      const seed = parseInt(today.replace(/-/g, ''))
      const randomPage = (seed % 10) + 1 // Generate a consistent random page for the day

      const response = await axios.get('/api/anime', {
        params: {
          page: randomPage,
          limit: 1,
          order_by: 'favorites',
          sort: 'desc'
        }
      })
      if (response.data.data && response.data.data.length > 0) {
        const fetchedCharacter = response.data.data[0]
        setCharacter(fetchedCharacter)
        localStorage.setItem(`characterOfTheDay-${today}`, JSON.stringify(fetchedCharacter))
      } else {
        throw new Error("No character data received")
      }
    } catch (error) {
      console.error('Failed to fetch character of the day:', error)
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        setError("Rate limit exceeded. Please try again in a few moments.")
      } else {
        setError("Failed to fetch the character of the day. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacterOfTheDay()

    // Set up a timer to check for day change
    const timer = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        fetchCharacterOfTheDay()
      }
    }, 60000) // Check every minute

    return () => clearInterval(timer)
  }, [])

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
        <CardDescription>Today's featured character!</CardDescription>
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
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchCharacterOfTheDay} disabled={loading}>
          Refresh
        </Button>
      </CardFooter>
    </Card>
  )
}