"use client"

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import anime from 'animejs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CharacterModal } from './CharacterModal'

interface AnimeCharacter {
  mal_id: number
  name: string
  name_kanji: string
  nicknames: string[]
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

export default function AnimeWiki() {
  const [characters, setCharacters] = useState<AnimeCharacter[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<AnimeCharacter | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState("favorites")
  const [sortOrder, setSortOrder] = useState("desc")
  const charactersRef = useRef<HTMLDivElement>(null)

  const fetchCharacters = async (page: number, query: string = "") => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get('/api/anime', {
        params: {
          page,
          limit: 8,
          q: query,
          order_by: sortBy,
          sort: sortOrder
        }
      })
      setCharacters(response.data.data || [])
      setTotalPages(response.data.pagination?.last_visible_page || 1)
    } catch (err) {
      setError("Failed to fetch characters. Please try again later.")
      console.error(err)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCharacters(currentPage, searchTerm)
  }, [currentPage, searchTerm, sortBy, sortOrder])

  useEffect(() => {
    if (!isLoading && charactersRef.current) {
      anime({
        targets: charactersRef.current.children,
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        easing: 'easeOutQuad',
        duration: 500
      })
    }
  }, [characters, isLoading])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCharacters(1, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCharacterClick = (character: AnimeCharacter) => {
    setSelectedCharacter(character)
    setIsModalOpen(true)
  }

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-')
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Anime Character Wiki</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Input
          type="text"
          placeholder="Search characters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow max-w-md"
        />
        <Button onClick={handleSearch}>Search</Button>
        <Select onValueChange={handleSortChange} defaultValue="favorites-desc">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="favorites-desc">Most Popular</SelectItem>
            <SelectItem value="favorites-asc">Least Popular</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div ref={charactersRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {characters.map(char => (
          <Card 
            key={char.mal_id} 
            className="flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => handleCharacterClick(char)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <img src={char.images?.jpg?.image_url || '/placeholder.svg?height=64&width=64'} alt={char.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <CardTitle className="text-lg">{char.name}</CardTitle>
                  <CardDescription>{char.name_kanji}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-2">
                <Badge variant="secondary" className="mr-2">Favorites: {char.favorites || 0}</Badge>
                {char.nicknames && char.nicknames.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Badge variant="outline">Nicknames</Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{char.nicknames.join(", ")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{char.about || 'No description available.'}</p>
              <div className="space-y-2">
                {char.anime && char.anime.slice(0, 2).map((anime, index) => (
                  <Badge key={index} className="mr-2">
                    {anime.title} ({anime.role})
                  </Badge>
                ))}
                {char.manga && char.manga.slice(0, 2).map((manga, index) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {manga.title} ({manga.role})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {characters.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground mt-6">No characters found.</p>
      )}

      <div className="flex justify-center mt-6 gap-2">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        <span className="flex items-center">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
        </Button>
      </div>

      <CharacterModal
        character={selectedCharacter}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}