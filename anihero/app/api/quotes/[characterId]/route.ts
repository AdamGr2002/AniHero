import { NextResponse } from 'next/server'
import axios from 'axios'

const JIKAN_API_BASE_URL = 'https://api.jikan.moe/v4'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const REQUEST_DELAY = 1000 // 1 second delay between requests

const cache = new Map<string, { data: any; timestamp: number }>()

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let lastRequestTime = 0

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

  const now = Date.now()
  if (now - lastRequestTime < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - (now - lastRequestTime)
    console.log(`Waiting for ${waitTime}ms before making the request`)
    await delay(waitTime)
  }

  try {
    const response = await axios.get(`${JIKAN_API_BASE_URL}/characters/${characterId}/quotes`)

    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.error('Invalid response format from Jikan API:', response.data)
      throw new Error('Invalid response format from Jikan API')
    }

    const quotes = response.data.data.map((quote: any) => quote.quote)

    const result = {
      characterId,
      quotes,
    }

    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    lastRequestTime = Date.now()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching character quotes:', error)
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data)
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