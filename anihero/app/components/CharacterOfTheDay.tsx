"use client"

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronUp } from 'lucide-react'

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
  favorites: number
  anime: {
    title: string
    role: string
  }[]
}

export function CharacterOfTheDay() {
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedAbout, setExpandedAbout] = useState(false)

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
      const randomPage = (seed % 10) + 1

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
      setError("Failed to fetch the character of the day. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacterOfTheDay()

    const timer = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        fetchCharacterOfTheDay()
      }
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
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

  if (!character) return null

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{character.name}</CardTitle>
        <CardDescription>{character.name_kanji}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <img
          src={character.images.jpg.image_url}
          alt={character.name}
          className="w-full h-64 object-cover rounded-lg"
        />
        <div>
          <h3 className="font-semibold mb-2">About</h3>
          <p className={`text-sm ${expandedAbout ? '' : 'line-clamp-3'}`}>{character.about}</p>
          {character.about && character.about.length > 150 && (
            <Button variant="link" onClick={() => setExpandedAbout(!expandedAbout)} className="p-0 h-auto">
              {expandedAbout ? (
                <>
                  Show Less <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Show More <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Popularity</h3>
          <Progress value={character.favorites} max={100000} className="w-full" />
          <p className="text-sm mt-1">{character.favorites.toLocaleString()} favorites</p>
        </div>
        {character.anime.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Appears in:</h3>
            <ul className="list-disc list-inside">
              {character.anime.slice(0, 3).map((anime, index) => (
                <li key={index} className="text-sm">
                  {anime.title} ({anime.role})
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}