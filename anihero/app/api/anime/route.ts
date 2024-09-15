import { NextResponse } from 'next/server'
import axios from 'axios'

// Simple in-memory cache
const cache: { [key: string]: { data: any; timestamp: number } } = {}

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 3600000

// Simple in-memory rate limiting
const rateLimits: { [key: string]: number[] } = {}

// Rate limit: 10 requests per 10 seconds
const RATE_LIMIT = 10
const RATE_LIMIT_WINDOW = 10000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '10'
  const orderBy = searchParams.get('order_by') || 'favorites'
  const sort = searchParams.get('sort') || 'desc'

  // Generate a cache key based on the request parameters
  const cacheKey = `anime:${q}:${page}:${limit}:${orderBy}:${sort}`

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'anonymous'
  const now = Date.now()
  const userRequests = rateLimits[ip] || []
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW)

  if (recentRequests.length >= RATE_LIMIT) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  rateLimits[ip] = [...recentRequests, now]

  try {
    // Check cache
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
      return NextResponse.json(cache[cacheKey].data)
    }

    // Fetch data from Jikan API
    const response = await axios.get('https://api.jikan.moe/v4/characters', {
      params: {
        q,
        page,
        limit,
        order_by: orderBy,
        sort,
      },
    })

    // Process and normalize the data
    const processedData = response.data.data.map((character: any) => ({
      mal_id: character.mal_id,
      name: character.name,
      name_kanji: character.name_kanji,
      images: character.images,
      about: character.about || 'No description available.',
      favorites: character.favorites || 0,
      anime: character.anime,
    }))

    const result = {
      data: processedData,
      pagination: response.data.pagination,
    }

    // Cache the result
    cache[cacheKey] = { data: result, timestamp: now }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching data from Jikan API:', error)
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return NextResponse.json({ error: 'No characters found' }, { status: 404 })
      }
      if (error.response?.status === 429) {
        return NextResponse.json({ error: 'Jikan API rate limit exceeded' }, { status: 429 })
      }
    }
    
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}