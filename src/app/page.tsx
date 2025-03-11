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
import { useAvailableBooks } from "@/hooks/use-quiz-data";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { BookInfo } from "@/types/quiz";
import { Book, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState<BookInfo | null>(null);
  const locale = useLocale() as Locale;
  const { books, loading, error } = useAvailableBooks(locale);
  const t = useTranslations("HomePage");

  useEffect(() => {
    if (selectedBook && books.length > 0) {
      const updatedBook = books.find((book) => book.id === selectedBook.id);
      if (updatedBook) {
        setSelectedBook(updatedBook);
      } else {
        setSelectedBook(null);
      }
    }
  }, [books, selectedBook]);

  const handleBookSelect = (book: BookInfo) => {
    setSelectedBook(book);
  };

  const navigateToChapter = (bookId: string, chapterNumber: number) => {
    router.push(`/${bookId}/${chapterNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-destructive">{t("errorLoading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-start py-12 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center p-5 rounded-full bg-primary/10">
              <Book className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-primary">{t("title")}</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </section>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Book Selection */}
          <div className={cn("flex flex-col", selectedBook ? "lg:col-span-4" : "lg:col-span-12")}>
            <div className="bg-muted/20 rounded-xl p-6 border border-accent/20">
              <h2 className="text-xl font-semibold mb-5 flex items-center">
                <span className="inline-block w-1.5 h-5 bg-primary/80 rounded-full mr-2.5" />
                <span className="text-primary">{t("selectBook")}</span>
              </h2>

              <div
                className={cn(
                  "grid gap-2.5",
                  selectedBook
                    ? "grid-cols-1"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                )}
              >
                {books.map((book) => (
                  <div key={book.id}>
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
            <div className="lg:col-span-8">
              <div className="bg-muted/20 rounded-xl p-6 border border-accent/20 h-full">
                <h2 className="text-xl font-semibold mb-5 flex items-center">
                  <span className="inline-block w-1.5 h-5 bg-primary/80 rounded-full mr-2.5" />
                  <span className="text-primary">
                    {t("selectChapter", { bookName: selectedBook.name })}
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedBook.chapters.map((chapter) => (
                    <div key={chapter.number}>
                      <Card
                        className="border border-accent/50 hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group"
                        onClick={() => navigateToChapter(selectedBook.id, chapter.number)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between items-center text-lg">
                            <span>{t("chapter", { number: chapter.number })}</span>
                            <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                          </CardTitle>
                          <CardDescription className="flex items-center">
                            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                            {t("questions", { count: chapter.questionCount || 0 })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <p className="line-clamp-2 text-muted-foreground">
                            {chapter.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button
                            variant="ghost"
                            className="w-full hover:bg-primary/10 hover:text-primary group-hover:bg-primary/5 transition-all duration-300"
                          >
                            {t("startQuiz")}
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
        <footer className="mt-16 text-center">
          <p className="text-sm text-muted-foreground max-w-lg mx-auto pb-4">{t("footer")}</p>
        </footer>
      </div>
    </div>
  );
}
