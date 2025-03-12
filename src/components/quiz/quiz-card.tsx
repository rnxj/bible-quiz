"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types/quiz";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (questionId: number, selectedOption: number) => void;
  showResult: boolean;
  userAnswer: number | null;
}

export const QuizCard = ({ question, onAnswer, showResult, userAnswer }: QuizCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(userAnswer);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(userAnswer !== null);

  // Reset state when userAnswer changes
  useEffect(() => {
    setSelectedOption(userAnswer);
    setIsSubmitted(userAnswer !== null);
  }, [userAnswer]);

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
    setIsSubmitted(true);
    onAnswer(question.id, index);
  };

  const getOptionClass = (index: number) => {
    if (!showResult || !isSubmitted) {
      return selectedOption === index ? "ring-2 ring-primary" : "";
    }

    if (index === question.correctAnswer) {
      return "correct border-green-500 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100";
    }

    if (index === selectedOption && selectedOption !== question.correctAnswer) {
      return "incorrect border-red-500 bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100";
    }

    return "";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="text-xs">
            {question.book || "Book"} {question.chapter || "Chapter"}:{question.verse}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-tight tracking-tight">{question.question}</CardTitle>
      </CardHeader>

      <CardContent className="pt-4 pb-6">
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <Button
              key={`${question.id}-option-${index}-${option.substring(0, 10)}`}
              variant="outline"
              className={cn(
                "justify-start h-auto min-h-[3rem] py-3 px-5 text-left w-full break-words whitespace-normal",
                getOptionClass(index),
              )}
              onClick={() => handleOptionSelect(index)}
              disabled={isSubmitted}
            >
              <div className="flex w-full items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <span className="flex-grow">{option}</span>
                {showResult && isSubmitted && (
                  <div className="flex-shrink-0 ml-2">
                    {index === question.correctAnswer ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : index === selectedOption ? (
                      <X className="h-5 w-5 text-red-600" />
                    ) : null}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
