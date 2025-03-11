export interface QuizQuestion {
  id: number;
  verse: number;
  question: string;
  options: string[];
  correctAnswer: number;
  book?: string;
  chapter?: number;
}

export interface QuizData {
  book: string;
  chapter: number;
  questions: QuizQuestion[];
  description?: string;
}

export interface QuizResult {
  questionId: number;
  userAnswer: number | null;
}

export interface BookInfo {
  id: string;
  name: string;
  chapters: ChapterInfo[];
}

export interface ChapterInfo {
  number: number;
  description?: string;
  questionCount?: number;
}
