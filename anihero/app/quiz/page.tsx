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
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface APIQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  streak: number;
}

const QUESTIONS_PER_PAGE = 5;

const fetchQuizQuestions = async (amount: number = 5): Promise<Question[]> => {
  try {
    const response = await fetch(`/api/quiz?amount=${amount}`);
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few seconds.");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.results) {
      return data.results.map((q: APIQuestion) => ({
        question: q.question,
        options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
        correctAnswer: q.correct_answer
      }));
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    console.error('Failed to fetch quiz questions:', error);
    throw error;
  }
};

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
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizStats, setQuizStats] = useState<QuizStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    streak: 0,
  })
  const { toast } = useToast()

  const loadQuestions = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const newQuestions = await fetchQuizQuestions(QUESTIONS_PER_PAGE);
      setQuestions(prevQuestions => [...prevQuestions, ...newQuestions]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Rate limit exceeded") && retryCount < 3) {
        // Wait for 5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
        return loadQuestions(retryCount + 1);
      }
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Update score and stats
    if (isCorrect) {
      setScore(score + 1);
      setQuizStats(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        streak: prev.streak + 1,
      }));
    } else {
      setQuizStats(prev => ({
        ...prev,
        incorrectAnswers: prev.incorrectAnswers + 1,
        streak: 0,
      }));
    }

    setQuizStats(prev => ({ ...prev, totalQuestions: prev.totalQuestions + 1 }));

    // Check if it's the last question
    if (currentQuestionIndex === questions.length - 1) {
      setQuizCompleted(true);
      // Here you would add logic to save the result, e.g.:
      // saveQuizResult(score, quizStats);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const restartQuiz = () => {
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setQuizCompleted(false)
    setQuizStats({
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streak: 0,
    })
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
          <Button onClick={() => loadQuestions()}>Try Again</Button>
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
          <Button onClick={() => loadQuestions()}>Reload Quiz</Button>
        </CardFooter>
      </Card>
    )
  }

  if (quizCompleted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Quiz Completed!</CardTitle>
          <CardDescription>Your final results</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-center mb-4">{score} / {quizStats.totalQuestions}</p>
          <div className="space-y-2">
            <p>Total Questions: {quizStats.totalQuestions}</p>
            <p>Correct Answers: {quizStats.correctAnswers}</p>
            <p>Incorrect Answers: {quizStats.incorrectAnswers}</p>
            <p>Longest Streak: {quizStats.streak}</p>
            <p>Accuracy: {((quizStats.correctAnswers / quizStats.totalQuestions) * 100).toFixed(2)}%</p>
          </div>
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
        <CardTitle>Anime & Manga Quiz</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-4" dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
        <RadioGroup onValueChange={handleAnswerSelect} value={selectedAnswer || undefined}>
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} dangerouslySetInnerHTML={{ __html: option }} />
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch">
        <Button onClick={handleNextQuestion} disabled={!selectedAnswer} className="mb-4">
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
        <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-full" />
        <div className="mt-4 text-sm text-gray-500">
          Current Score: {score} | Streak: {quizStats.streak}
        </div>
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