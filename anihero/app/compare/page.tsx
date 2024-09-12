"use client"

import { useState, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import axios from 'axios'
import Link from 'next/link'

interface AnimeCharacter {
  mal_id: number
  name: string
  name_kanji: string
  favorites: number
  about: string
  images: {
    jpg: {
      image_url: string
    }
  }
  anime: {
    title: string
    role: string
  }[]
  manga: {
    title: string
    role: string
  }[]
  voices: {
    person: {
      name: string
    }
    language: string
  }[]
}

export default function ComparePage() {
  const { isLoaded, isSignedIn } = useUser()
  const [characters, setCharacters] = useState<AnimeCharacter[]>([])
  const [selectedCharacters, setSelectedCharacters] = useState<[AnimeCharacter | null, AnimeCharacter | null]>([null, null])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTopCharacters = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('/api/anime', {
          params: {
            page: 1,
            limit: 20,
            order_by: 'favorites',
            sort: 'desc'
          }
        })
        setCharacters(response.data.data || [])
      } catch (error) {
        console.error('Failed to fetch top characters:', error)
      }
      setIsLoading(false)
    }

    if (isLoaded && isSignedIn) {
      fetchTopCharacters()
    }
  }, [isLoaded, isSignedIn])

  const handleCharacterSelect = (index: number, characterId: string) => {
    const character = characters.find(char => char.mal_id.toString() === characterId)
    const newSelectedCharacters = [...selectedCharacters] as [AnimeCharacter | null, AnimeCharacter | null]
    newSelectedCharacters[index] = character || null
    setSelectedCharacters(newSelectedCharacters)
  }

  const renderCharacterStats = (character: AnimeCharacter | null) => {
    if (!character) return <div className="text-center">Select a character</div>

    return (
      <ScrollArea className="h-[500px] w-full rounded-md border p-4">
        <img 
          src={character.images?.jpg?.image_url || '/placeholder.svg?height=200&width=150'} 
          alt={character.name} 
          className="w-32 h-48 object-cover mx-auto mb-4 rounded"
        />
        <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{character.name_kanji}</p>
        <Badge variant="secondary" className="mb-2">Favorites: {character.favorites}</Badge>
        <p className="text-sm mb-4 line-clamp-4">{character.about || 'No description available.'}</p>
        <div className="space-y-2">
          <h4 className="font-semibold">Anime Appearances:</h4>
          {character.anime && character.anime.slice(0, 3).map((anime, index) => (
            <Badge key={index} className="mr-2 mb-2">
              {anime.title} ({anime.role})
            </Badge>
          ))}
        </div>
        <div className="space-y-2 mt-4">
          <h4 className="font-semibold">Manga Appearances:</h4>
          {character.manga && character.manga.slice(0, 3).map((manga, index) => (
            <Badge key={index} variant="outline" className="mr-2 mb-2">
              {manga.title} ({manga.role})
            </Badge>
          ))}
        </div>
        <div className="space-y-2 mt-4">
          <h4 className="font-semibold">Voice Actors:</h4>
          {character.voices && character.voices.slice(0, 3).map((voice, index) => (
            <p key={index} className="text-sm">
              {voice.person.name} ({voice.language})
            </p>
          ))}
        </div>
      </ScrollArea>
    )
  }

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 bg-white bg-opacity-90 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Character Comparison</h1>
      <Link href="/">
        <Button className="mb-4">Back to Home</Button>
      </Link>
      <div className="flex flex-col md:flex-row gap-4">
        {[0, 1].map((index) => (
          <div key={index} className="flex-1">
            <Select
              onValueChange={(value) => handleCharacterSelect(index, value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Select a character" />
              </SelectTrigger>
              <SelectContent>
                {characters.map((char) => (
                  <SelectItem key={char.mal_id} value={char.mal_id.toString()}>
                    {char.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderCharacterStats(selectedCharacters[index])}
          </div>
        ))}
      </div>
    </div>
  )
}