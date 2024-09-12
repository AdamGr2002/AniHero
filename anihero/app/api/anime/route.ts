import { NextResponse } from 'next/server'
import axios from 'axios'

const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const REQUEST_DELAY = 1000 // 1 second delay between requests
const MAX_LIMIT = 25 // Maximum limit allowed by Jikan API

const cache = new Map<string, { data: any; timestamp: number }>()

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let lastRequestTime = 0

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') || '1'
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), MAX_LIMIT)
  const q = searchParams.get('q') || ''
  const orderBy = searchParams.get('order_by') || 'favorites'
  const sort = searchParams.get('sort') || 'desc'

  const cacheKey = `${page}-${limit}-${q}-${orderBy}-${sort}`

  const cachedData = cache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('Returning cached data')
    return NextResponse.json(cachedData.data)
  }

  console.log('Fetching characters with params:', { page, limit, q, orderBy, sort })

  const now = Date.now()
  if (now - lastRequestTime < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - (now - lastRequestTime)
    console.log(`Waiting for ${waitTime}ms before making the request`)
    await delay(waitTime)
  }

  try {
    const characters = await fetchAllCharacters(page, limit, q, orderBy, sort)

    const result = {
      data: characters,
      pagination: {
        current_page: parseInt(page),
        has_next_page: characters.length === limit,
      },
    }

    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    lastRequestTime = Date.now()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching characters:', error)
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data)
      return NextResponse.json(
        { error: `Failed to fetch characters: ${error.message}` },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching characters' },
      { status: 500 }
    )
  }
}

async function fetchAllCharacters(page: string, limit: number, q: string, orderBy: string, sort: string) {
  let allCharacters: any[] = []
  let currentPage = parseInt(page)
  const totalLimit = limit

  while (allCharacters.length < totalLimit) {
    const remainingLimit = Math.min(MAX_LIMIT, totalLimit - allCharacters.length)
    const response = await axios.get(`${JIKAN_API_BASE_URL}/characters`, {
      params: {
        page: currentPage,
        limit: remainingLimit,
        q,
        order_by: orderBy,
        sort,
      },
    })

    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.error('Invalid response format from Jikan API:', response.data)
      throw new Error('Invalid response format from Jikan API')
    }

    const characters = response.data.data.map((char: any) => ({
      mal_id: char.mal_id,
      name: char.name,
      name_kanji: char.name_kanji,
      nicknames: char.nicknames,
      favorites: char.favorites,
      about: char.about,
      images: char.images,
      anime: (char.anime || []).map((a: any) => ({
        title: a.anime?.title || 'Unknown Anime',
        role: a.role || 'Unknown Role',
      })),
      manga: (char.manga || []).map((m: any) => ({
        title: m.manga?.title || 'Unknown Manga',
        role: m.role || 'Unknown Role',
      })),
      voices: (char.voices || []).map((v: any) => ({
        person: {
          name: v.person?.name || 'Unknown Voice Actor',
        },
        language: v.language || 'Unknown Language',
      })),
    }))

    allCharacters = allCharacters.concat(characters)
    
    if (response.data.pagination.has_next_page === false || allCharacters.length >= totalLimit) {
      break
    }

    currentPage++
    await delay(REQUEST_DELAY)
  }

  return allCharacters.slice(0, totalLimit)
}