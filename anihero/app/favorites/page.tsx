/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useEffect } from 'react'
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from 'lucide-react'
import Link from 'next/link'

interface AnimeCharacter {
  mal_id: number
  name: string
  images: {
    jpg: {
      image_url: string
    }
  }
  favorites: number
  about: string
}

export default function FavoritesPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [favorites, setFavorites] = useState<AnimeCharacter[]>([])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const storedFavorites = localStorage.getItem(`favorites_${user.id}`)
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }
    }
  }, [isLoaded, isSignedIn, user])

  const removeFavorite = (id: number) => {
    const updatedFavorites = favorites.filter(char => char.mal_id !== id)
    setFavorites(updatedFavorites)
    if (user) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites))
    }
  }

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 bg-white bg-opacity-90 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Favorite Characters</h1>
      <Link href="/">
        <Button className="mb-4">Back to Home</Button>
      </Link>
      {favorites.length === 0 ? (
        <p className="text-center text-lg">You haven't added any favorites yet.</p>
      ) : (
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          {favorites.map(char => (
            <Card key={char.mal_id} className="mb-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={char.images?.jpg?.image_url || '/placeholder.svg?height=64&width=64'} 
                      alt={char.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <CardTitle>{char.name}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeFavorite(char.mal_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Favorites: {char.favorites}</p>
                <p className="text-sm line-clamp-3">{char.about}</p>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      )}
    </div>
  )
}