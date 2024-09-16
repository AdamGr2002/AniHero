import { NextResponse } from 'next/server';
import axios from 'axios';

let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 5000; // 5 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get('amount') || '5';

  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - (now - lastRequestTime);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  try {
    const response = await axios.get('https://opentdb.com/api.php', {
      params: { 
        amount: Number(amount),
        type: 'multiple',
        category: 31 // Anime & Manga category
      }
    });
    lastRequestTime = Date.now();
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to fetch quiz questions' }, { status: 500 });
  }
}