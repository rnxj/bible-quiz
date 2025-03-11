import sampleQuiz from "@/data/corinthians-1/1.json";
import type { BookInfo, ChapterInfo, QuizData } from "@/types/quiz";

// This would be replaced with actual API/fetch calls in production
const availableBooks: BookInfo[] = [
  {
    id: "corinthians-1",
    name: "1 கொரிந்தியர்",
    chapters: [
      {
        number: 1,
        description:
          "This chapter focuses on Paul's introduction to the Corinthian church, addressing themes of unity and wisdom.",
        questionCount: 40,
      },
    ],
  },
];

// For now, just return the sample quiz data
// In production, this would load the appropriate JSON file
export function loadQuizData(bookId: string, chapterNumber: number): QuizData {
  // In a real app, we would dynamically import the correct JSON file
  // For now, we'll return our sample data
  if (bookId === "corinthians-1" && chapterNumber === 1) {
    return sampleQuiz;
  }

  // Return a placeholder for other books/chapters
  const book = availableBooks.find((b) => b.id === bookId);

  return {
    book: book?.name || "Unknown Book",
    chapter: chapterNumber,
    questions: [],
    description: "Sample quiz data - would be loaded from a JSON file in production.",
  };
}

export function getAvailableBooks(): BookInfo[] {
  return availableBooks;
}

export function getBookById(bookId: string): BookInfo | undefined {
  return availableBooks.find((book) => book.id === bookId);
}

export function getChapterInfo(bookId: string, chapterNumber: number): ChapterInfo | undefined {
  const book = getBookById(bookId);
  return book?.chapters.find((chapter) => chapter.number === chapterNumber);
}
