"use client"

import { useState } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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

export default function CharacterComparison() {
  const [character1, setCharacter1] = useState<Character | null>(null)
  const [character2, setCharacter2] = useState<Character | null>(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [error1, setError1] = useState<string | null>(null)
  const [error2, setError2] = useState<string | null>(null)
  const [search1, setSearch1] = useState('')
  const [search2, setSearch2] = useState('')
  const [expandedAbout1, setExpandedAbout1] = useState(false)
  const [expandedAbout2, setExpandedAbout2] = useState(false)

  const fetchCharacter = async (search: string, setCharacter: (char: Character | null) => void, setLoading: (loading: boolean) => void, setError: (error: string | null) => void) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get('/api/anime', {
        params: {
          q: search,
          limit: 1,
          order_by: 'favorites',
          sort: 'desc'
        }
      })
      if (response.data.data && response.data.data.length > 0) {
        setCharacter(response.data.data[0])
      } else {
        setError("No character found")
      }
    } catch (error) {
      console.error('Failed to fetch character:', error)
      setError("Failed to fetch character. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch1 = () => fetchCharacter(search1, setCharacter1, setLoading1, setError1)
  const handleSearch2 = () => fetchCharacter(search2, setCharacter2, setLoading2, setError2)

  const renderCharacterCard = (character: Character | null, loading: boolean, error: string | null, expanded: boolean, setExpanded: (expanded: boolean) => void) => {
    if (loading) {
      return (
        <Card className="w-full">
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
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )
    }

    if (!character) return null

    return (
      <Card className="w-full">
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
            <p className={`text-sm ${expanded ? '' : 'line-clamp-3'}`}>{character.about}</p>
            {character.about && character.about.length > 150 && (
              <Button variant="link" onClick={() => setExpanded(!expanded)} className="p-0 h-auto">
                {expanded ? (
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Character Comparison</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <Label htmlFor="search1">Search Character 1</Label>
          <div className="flex space-x-2">
            <Input
              id="search1"
              value={search1}
              onChange={(e) => setSearch1(e.target.value)}
              placeholder="Enter character name"
            />
            <Button onClick={handleSearch1}>Search</Button>
          </div>
        </div>
        <div>
          <Label htmlFor="search2">Search Character 2</Label>
          <div className="flex space-x-2">
            <Input
              id="search2"
              value={search2}
              onChange={(e) => setSearch2(e.target.value)}
              placeholder="Enter character name"
            />
            <Button onClick={handleSearch2}>Search</Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderCharacterCard(character1, loading1, error1, expandedAbout1, setExpandedAbout1)}
        {renderCharacterCard(character2, loading2, error2, expandedAbout2, setExpandedAbout2)}
      </div>
    </div>
  )
}