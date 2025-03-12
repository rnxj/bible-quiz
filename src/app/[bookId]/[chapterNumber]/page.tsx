"use client";

import { ProgressBar } from "@/components/quiz/progress-bar";
import { QuizCard } from "@/components/quiz/quiz-card";
import { ScoreDisplay } from "@/components/quiz/score-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loadQuizData } from "@/lib/quiz-loader";
import type { QuizResult, QuizSummary } from "@/types/quiz";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Book, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define the quiz states
type QuizState = "start" | "quiz" | "result";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const Quiz = () => {
  const router = useRouter();
  const params = useParams();
  const bookId = params.bookId as string;
  const chapterNumber = params.chapterNumber as string;

  // State machine state
  const [quizState, setQuizState] = useState<QuizState>("start");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const [quizData, setQuizData] = useState(() => {
    if (bookId && chapterNumber) {
      return loadQuizData(bookId, Number.parseInt(chapterNumber));
    }
    return null;
  });

  useEffect(() => {
    // If direct navigation without params, redirect to home
    if (!bookId || !chapterNumber) {
      router.push("/");
      return;
    }

    // Load quiz data if not already loaded
    if (!quizData) {
      try {
        const data = loadQuizData(bookId, Number.parseInt(chapterNumber));
        setQuizData(data);
      } catch (error) {
        console.error("Error loading quiz data:", error);
        router.push("/");
      }
    }
  }, [bookId, chapterNumber, router, quizData]);

  // If quiz data is not loaded yet, show loading state
  if (!quizData) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, repeatType: "reverse" }}
        >
          Loading quiz...
        </motion.div>
      </div>
    );
  }

  // Get current question with necessary book and chapter properties
  const currentQuestion = quizData.questions[currentQuestionIndex]
    ? {
        ...quizData.questions[currentQuestionIndex],
        book: quizData.book,
        chapter: quizData.chapter,
      }
    : null;

  // If no current question, redirect to home
  if (!currentQuestion) {
    router.push("/");
    return null;
  }

  // Find user's answer for current question
  const currentResult = results.find((r) => r.questionId === currentQuestion.id);

  // Progress percentage
  const progress = isReviewing
    ? currentQuestionIndex + 1
    : results.filter((r) => r.userAnswer !== null).length;

  // Handle answer submission
  const handleAnswer = (questionId: number, selectedOption: number) => {
    const question = quizData.questions.find((q) => q.id === questionId);

    if (!question) return;

    const isCorrect = selectedOption === question.correctAnswer;
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

    // Update results
    setResults((prev) => {
      const existingResultIndex = prev.findIndex((r) => r.questionId === questionId);

      if (existingResultIndex >= 0) {
        const newResults = [...prev];
        newResults[existingResultIndex] = {
          questionId,
          userAnswer: selectedOption,
          isCorrect,
        };
        return newResults;
      }

      return [
        ...prev,
        {
          questionId,
          userAnswer: selectedOption,
          isCorrect,
        },
      ];
    });

    // Auto advance to next question after a delay based on correctness
    // Don't auto-advance on the last question
    if (!isReviewing && !isLastQuestion) {
      const delay = isCorrect ? 1000 : 2000; // 1s for correct, 2s for incorrect
      setTimeout(() => {
        handleNextQuestion();
      }, delay);
    }
  };

  // Handle next question navigation
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (!isReviewing && results.length === quizData.questions.length) {
      // All questions answered, go to results
      calculateSummary();
      setQuizState("result");
    }
  };

  // Handle previous question navigation
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Check if all questions answered
  const allQuestionsAnswered = results.length === quizData.questions.length;

  // Start review mode
  const startReview = () => {
    setIsReviewing(true);
    setCurrentQuestionIndex(0);
  };

  // Calculate summary data for results
  const calculateSummary = () => {
    const totalQuestions = quizData.questions.length;
    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = correctAnswers / totalQuestions;

    setSummary({
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      results,
    });
  };

  // Finish quiz
  const finishQuiz = () => {
    calculateSummary();
    setQuizState("result");
  };

  // Start the quiz
  const startQuiz = () => {
    setQuizState("quiz");
    setCurrentQuestionIndex(0);
    setResults([]);
    setIsReviewing(false);
  };

  // Go back to books
  const goBack = () => {
    router.push("/");
  };

  // Restart quiz
  const restartQuiz = () => {
    setQuizState("start");
    setCurrentQuestionIndex(0);
    setResults([]);
    setIsReviewing(false);
    setSummary(null);
  };

  // Render the start screen
  const renderStartScreen = () => {
    return (
      <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <motion.div variants={fadeIn}>
            <Button variant="ghost" className="mb-8" onClick={goBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Books
            </Button>
          </motion.div>

          <motion.div className="mb-8 text-center" variants={fadeIn}>
            <motion.div
              className="inline-flex items-center justify-center p-4 mb-4 rounded-full bg-primary/10"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Book className="h-10 w-10 text-primary" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
              {quizData?.book}
            </h1>
            <p className="text-xl text-muted-foreground">Chapter {quizData?.chapter}</p>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="glass-panel border border-accent/50 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Quiz Overview</CardTitle>
                <CardDescription>
                  {quizData?.questions.length} questions from chapter {quizData?.chapter}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {quizData?.description ||
                    "This quiz will test your knowledge of the selected chapter."}
                </p>

                <div className="bg-accent/20 rounded-lg p-4 text-sm">
                  <h3 className="font-medium mb-2">Quiz Instructions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Read each question carefully</li>
                    <li>Select the best answer from the options provided</li>
                    <li>Submit your answer before moving to the next question</li>
                    <li>Review your answers at the end if needed</li>
                    <li>View your final score and correct answers</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center pt-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" onClick={startQuiz} className="relative overflow-hidden">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    <span className="relative z-10">Start Quiz</span>
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.p className="text-sm text-muted-foreground text-center" variants={fadeIn}>
            Study to show thyself approved unto God, a workman that needeth not to be ashamed,
            rightly dividing the word of truth. - 2 Timothy 2:15
          </motion.p>
        </motion.div>
      </div>
    );
  };

  // Render the quiz screen
  const renderQuizScreen = () => {
    return (
      <div className="min-h-[calc(100vh-65px)]">
        <motion.div
          className="w-full max-w-4xl mx-auto px-4 py-8 sm:px-6 min-h-[calc(100vh-8rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <motion.div
              className="flex justify-between items-center mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold">
                {quizData.book} {quizData.chapter}
              </h1>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </span>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ProgressBar current={progress} total={quizData.questions.length} className="mb-8" />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <QuizCard
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  showResult={Boolean(currentResult?.userAnswer !== null) || isReviewing}
                  userAnswer={currentResult?.userAnswer || null}
                />
              </motion.div>
            </AnimatePresence>

            <motion.div
              className="flex justify-between mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              </motion.div>

              <div className="flex gap-2">
                {allQuestionsAnswered && !isReviewing && (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" onClick={startReview}>
                      Review Answers
                    </Button>
                  </motion.div>
                )}

                {isReviewing && currentQuestionIndex === quizData.questions.length - 1 && (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button onClick={finishQuiz}>See Results</Button>
                  </motion.div>
                )}

                {!isReviewing && allQuestionsAnswered ? (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button onClick={finishQuiz}>Finish Quiz</Button>
                  </motion.div>
                ) : (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleNextQuestion}
                      disabled={
                        (!isReviewing && (!currentResult || currentResult.userAnswer === null)) ||
                        (currentQuestionIndex === quizData.questions.length - 1 &&
                          !allQuestionsAnswered)
                      }
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Render the result screen
  const renderResultScreen = () => {
    if (!summary) return null;

    return (
      <div className="min-h-[calc(100vh-65px)] py-12">
        <motion.div
          className="w-full max-w-3xl mx-auto px-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
              },
            },
          }}
        >
          <motion.div
            className="flex flex-col items-center mb-10"
            variants={{
              hidden: { opacity: 0, y: -50 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <h1 className="text-3xl font-bold text-center mb-1">Quiz Completed!</h1>
            <p className="text-center text-muted-foreground">
              {quizData.book} {quizData.chapter}
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
            }}
          >
            <ScoreDisplay summary={summary} className="mb-8" />
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-10"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={restartQuiz} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Try Again
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={goBack}>Return Home</Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  };

  // Render the appropriate screen based on the current state
  switch (quizState) {
    case "start":
      return renderStartScreen();
    case "quiz":
      return renderQuizScreen();
    case "result":
      return renderResultScreen();
    default:
      return renderStartScreen();
  }
};

export default Quiz;
