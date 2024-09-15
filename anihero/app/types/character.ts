export interface Character {
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