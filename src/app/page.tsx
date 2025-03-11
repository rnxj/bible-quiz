"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAvailableBooks } from "@/lib/quiz-loader";
import { cn } from "@/lib/utils";
import type { BookInfo } from "@/types/quiz";
import { Book, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null);
  const books = getAvailableBooks();

  const handleBookSelect = (book: BookInfo) => {
    setSelectedBook(book);
  };

  const navigateToChapter = (bookId: string, chapterNumber: number) => {
    router.push(`/${bookId}/${chapterNumber}`);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-start py-12 px-4 sm:px-6 md:px-8 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <section
          className={cn(
            "mb-12 text-center transition-all duration-500",
            selectedBook ? "transform -translate-y-4" : "",
          )}
        >
          <div className="mb-6 animate-in fade-in duration-700">
            <div className="inline-flex items-center justify-center p-5 rounded-full bg-primary/10">
              <Book className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 animate-in fade-in duration-700">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70">
              பைபிள் வினாடி வினா
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto animate-in fade-in duration-700 delay-150">
            Test your knowledge of the Bible with interactive quizzes from various books and
            chapters.
          </p>
        </section>

        {/* Content Section */}
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-500",
            selectedBook ? "animate-in fade-in duration-500" : "",
          )}
        >
          {/* Book Selection */}
          <div className={cn("flex flex-col", selectedBook ? "lg:col-span-4" : "lg:col-span-12")}>
            <div
              className={cn(
                "bg-muted/20 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-accent/20 transition-all duration-500",
                selectedBook ? "h-full" : "",
              )}
            >
              <h2 className="text-xl font-semibold mb-5 flex items-center">
                <span className="inline-block w-1.5 h-5 bg-primary/80 rounded-full mr-2.5" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Select a Book
                </span>
              </h2>

              <div
                className={cn(
                  "grid gap-2.5 transition-all duration-500",
                  selectedBook
                    ? "grid-cols-1"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                )}
              >
                {books.map((book, index) => (
                  <div
                    key={book.id}
                    className="animate-in fade-in duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Button
                      variant={selectedBook?.id === book.id ? "default" : "outline"}
                      className={cn(
                        "justify-between h-auto py-3 text-left w-full transition-all duration-300",
                        selectedBook?.id === book.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-accent/20 hover:border-primary/30 hover:shadow-sm",
                      )}
                      onClick={() => handleBookSelect(book)}
                    >
                      <span className="font-medium">{book.name}</span>
                      <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chapter Selection - Only show if book is selected */}
          {selectedBook && (
            <div className="lg:col-span-8 animate-in slide-in-from-right duration-500">
              <div className="bg-muted/20 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-accent/20 h-full">
                <h2 className="text-xl font-semibold mb-5 flex items-center">
                  <span className="inline-block w-1.5 h-5 bg-primary/80 rounded-full mr-2.5" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    {selectedBook.name}: Select a Chapter
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedBook.chapters.map((chapter, index) => (
                    <div
                      key={chapter.number}
                      className="animate-in fade-in duration-500"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <Card
                        className="border border-accent/50 hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group"
                        onClick={() => navigateToChapter(selectedBook.id, chapter.number)}
                      >
                        <CardHeader className="pb-2 relative">
                          <CardTitle className="flex justify-between items-center text-lg">
                            <span>Chapter {chapter.number}</span>
                            <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                          </CardTitle>
                          <CardDescription className="flex items-center">
                            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                            {chapter.questionCount} questions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p className="line-clamp-2 text-muted-foreground">
                            {chapter.description || "Take a quiz on this chapter"}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button
                            variant="ghost"
                            className="w-full hover:bg-primary/10 hover:text-primary group-hover:bg-primary/5 transition-all duration-300"
                          >
                            Start Quiz
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center animate-in fade-in duration-700">
          <p className="text-sm text-muted-foreground max-w-lg mx-auto pb-4">
            Study the Bible, grow in knowledge, and deepen your faith through interactive learning
          </p>
        </footer>
      </div>
    </div>
  );
}
