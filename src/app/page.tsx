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
import type { BookInfo } from "@/types/quiz";
import { Book, BookOpen, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const slideDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-accent/30 p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          className="mb-10 text-center"
          initial="hidden"
          animate="visible"
          variants={slideDown}
        >
          <div className="inline-flex items-center justify-center p-4 mb-4 rounded-full bg-primary/10">
            <Book className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            பைபிள் வினாடி வினா
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Test your knowledge of the Bible with interactive quizzes from various books and
            chapters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Book Selection */}
          <motion.div
            className={`${selectedBook ? "md:col-span-4" : "md:col-span-12"}`}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-accent/20">
              <h2 className="text-xl font-semibold mb-4 text-primary">Select a Book</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
                {books.map((book) => (
                  <Button
                    key={book.id}
                    variant={selectedBook?.id === book.id ? "default" : "outline"}
                    className={`justify-between h-auto py-3 text-left ${
                      selectedBook?.id === book.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent/20"
                    }`}
                    onClick={() => handleBookSelect(book)}
                  >
                    <span className="font-medium">{book.name}</span>
                    <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chapter Selection - Only show if book is selected */}
          {selectedBook && (
            <motion.div
              className="md:col-span-8"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-accent/20">
                <h2 className="text-xl font-semibold mb-4 text-primary">Select a Chapter</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedBook.chapters.map((chapter, index) => (
                    <motion.div
                      key={chapter.number}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className="border border-accent/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-white/80"
                        onClick={() => navigateToChapter(selectedBook.id, chapter.number)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between items-center text-lg">
                            <span>Chapter {chapter.number}</span>
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </CardTitle>
                          <CardDescription>{chapter.questionCount} questions</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p className="line-clamp-2 text-muted-foreground">
                            {chapter.description || "Take a quiz on this chapter"}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button
                            variant="ghost"
                            className="w-full hover:bg-primary/10 hover:text-primary"
                          >
                            Start Quiz
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <motion.p
          className="text-sm text-muted-foreground mt-10 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Study the Bible, grow in knowledge, and deepen your faith
        </motion.p>
      </div>
    </div>
  );
}
