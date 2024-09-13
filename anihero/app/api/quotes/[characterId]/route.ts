import { NextResponse } from 'next/server'
import axios from 'axios'
import { jikanRateLimiter } from '@/app/utils/rateLimiter'

const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

const cache = new Map<string, { data: any; timestamp: number }>()

export async function GET(
  request: Request,
  { params }: { params: { characterId: string } }
) {
  const characterId = params.characterId

  const cacheKey = `quotes-${characterId}`

  const cachedData = cache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('Returning cached quotes data')
    return NextResponse.json(cachedData.data)
  }

  console.log(`Fetching quotes for character ID: ${characterId}`)

  try {
    const result = await jikanRateLimiter.enqueue(async () => {
      const response = await axios.get(`${JIKAN_API_BASE_URL}/characters/${characterId}/quotes`)

      if (!response.data.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from Jikan API')
      }

      const quotes = response.data.data.map((quote: any) => quote.quote)

      return {
        characterId,
        quotes,
      }
    })

    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching character quotes:', error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: `Failed to fetch character quotes: ${error.message}` },
        { status: error.response?.status || 500 }
      )
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching character quotes' },
      { status: 500 }
    )
  }
}