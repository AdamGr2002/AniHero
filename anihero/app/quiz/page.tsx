"use client"

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Link from 'next/link'
import { ErrorBoundary } from 'react-error-boundary'

interface Character {
  mal_id: number
  name: string
  images: {
    jpg: {
      image_url: string
    }
  }
  anime: {
    title: string
  }[]
}

interface Question {
  character: Character
  type: 'name' | 'anime'
  options: string[]
  correctAnswer: string
}

const QUESTIONS_PER_PAGE = 5
const CHARACTERS_PER_FETCH = 25

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>There was an error loading the quiz</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-red-500">{error.message}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </CardFooter>
    </Card>
  )
}

function QuizContent() {
  const { isSignedIn, user } = useUser()
  const [characters, setCharacters] = useState<Character[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchCharacters = async (page: number) => {
    try {
      const response = await axios.get('/api/anime', {
        params: {
          page,
          limit: CHARACTERS_PER_FETCH,
          order_by: 'favorites',
          sort: 'desc'
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch characters:', error)
      throw new Error("Failed to load characters. Please try again.")
    }
  }

  const generateQuestions = (chars: Character[]): Question[] => {
    const questions: Question[] = []
    const usedCharacters = new Set()

    while (questions.length < QUESTIONS_PER_PAGE && chars.length > 0) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      const character = chars[randomIndex]

      if (!usedCharacters.has(character.mal_id)) {
        usedCharacters.add(character.mal_id)

        const questionType = Math.random() < 0.5 ? 'name' : 'anime'
        let options: string[]
        let correctAnswer: string

        if (questionType === 'name') {
          correctAnswer = character.name
          options = [correctAnswer]
          while (options.length < 4) {
            const randomChar = chars[Math.floor(Math.random() * chars.length)]
            if (!options.includes(randomChar.name)) {
              options.push(randomChar.name)
            }
          }
        } else {
          correctAnswer = character.anime[0]?.title || 'Unknown Anime'
          options = [correctAnswer]
          while (options.length < 4) {
            const randomChar = chars[Math.floor(Math.random() * chars.length)]
            const randomAnime = randomChar.anime[0]?.title
            if (randomAnime && !options.includes(randomAnime)) {
              options.push(randomAnime)
            }
          }
        }

        options = options.sort(() => Math.random() - 0.5)

        questions.push({
          character,
          type: questionType,
          options,
          correctAnswer
        })
      }

      chars.splice(randomIndex, 1)
    }

    return questions
  }

  const loadQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const newCharacters = await fetchCharacters(currentPage)
      setCharacters(prevCharacters => [...prevCharacters, ...newCharacters])
      const newQuestions = generateQuestions(newCharacters)
      setQuestions(prevQuestions => [...prevQuestions, ...newQuestions])
      setCurrentPage(prevPage => prevPage + 1)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [])

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1)
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    } else {
      if (currentQuestionIndex === questions.length - 1 && questions.length < 50) {
        loadQuestions()
      } else {
        setQuizCompleted(true)
      }
    }
  }

  const restartQuiz = () => {
    setCharacters([])
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizCompleted(false)
    setCurrentPage(1)
    loadQuestions()
  }

  if (loading && questions.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Loading Quiz</CardTitle>
          <CardDescription>Please wait while we prepare your questions...</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={100} className="w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={loadQuestions}>Try Again</Button>
        </CardFooter>
      </Card>
    )
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>No Questions Available</CardTitle>
          <CardDescription>Please try again later</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={loadQuestions}>Reload Quiz</Button>
        </CardFooter>
      </Card>
    )
  }

  if (quizCompleted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Quiz Completed!</CardTitle>
          <CardDescription>Your final score</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-center">{score} / {questions.length}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={restartQuiz}>Restart Quiz</Button>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Anime Character Quiz</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center mb-4">
          <img
            src={currentQuestion.character.images.jpg.image_url}
            alt="Character"
            className="w-32 h-32 object-cover rounded-full mb-4 md:mb-0 md:mr-4"
          />
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {currentQuestion.type === 'name'
                ? "What's this character's name?"
                : "Which anime is this character from?"}
            </h3>
            <RadioGroup onValueChange={handleAnswerSelect} value={selectedAnswer || undefined}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch">
        <Button onClick={handleNextQuestion} disabled={!selectedAnswer} className="mb-4">
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
        <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-full" />
      </CardFooter>
    </Card>
  )
}

export default function QuizPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <QuizContent />
    </ErrorBoundary>
  )
}