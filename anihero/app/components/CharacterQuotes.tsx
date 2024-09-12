/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Quote {
  quote: string
  context?: string
}

interface CharacterQuotesProps {
  name: string
  quotes: Quote[]
}

export default function CharacterQuotes({ name, quotes }: CharacterQuotesProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const nextQuote = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length)
  }

  const prevQuote = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex - 1 + quotes.length) % quotes.length)
  }

  if (quotes.length === 0) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{name}'s Quotes</CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="italic text-lg mb-2">"{quotes[currentQuoteIndex].quote}"</blockquote>
        {quotes[currentQuoteIndex].context && (
          <p className="text-sm text-muted-foreground mb-4">Context: {quotes[currentQuoteIndex].context}</p>
        )}
        <div className="flex justify-between">
          <Button onClick={prevQuote} variant="outline" size="sm">Previous</Button>
          <span className="text-sm text-muted-foreground">
            {currentQuoteIndex + 1} of {quotes.length}
          </span>
          <Button onClick={nextQuote} variant="outline" size="sm">Next</Button>
        </div>
      </CardContent>
    </Card>
  )
}