import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog"
import { ScrollArea } from "../components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface CharacterModalProps {
  character: AnimeCharacter | null
  isOpen: boolean
  onClose: () => void
}

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

export function CharacterModal({ character, isOpen, onClose }: CharacterModalProps) {
  if (!character) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{character.name}</DialogTitle>
          <DialogDescription>{character.name_kanji}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <img
              src={character.images?.jpg?.image_url || '/placeholder.svg?height=128&width=128'}
              alt={character.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium">Favorites: {character.favorites}</p>
              {character.nicknames && character.nicknames.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Nicknames: {character.nicknames.join(", ")}
                </p>
              )}
            </div>
          </div>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <p className="text-sm">{character.about}</p>
          </ScrollArea>
          <div>
            <h4 className="mb-2 font-semibold">Anime Appearances</h4>
            <div className="flex flex-wrap gap-2">
              {character.anime && character.anime.map((anime, index) => (
                <Badge key={index} variant="secondary">
                  {anime.title} ({anime.role})
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Manga Appearances</h4>
            <div className="flex flex-wrap gap-2">
              {character.manga && character.manga.map((manga, index) => (
                <Badge key={index} variant="outline">
                  {manga.title} ({manga.role})
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Voice Actors</h4>
            <div className="flex flex-wrap gap-2">
              {character.voices && character.voices.map((voice, index) => (
                <Badge key={index}>
                  {voice.person.name} ({voice.language})
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}