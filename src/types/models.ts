export interface Subject {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

export interface SubTopic {
  id: string;
  name: string;
  topic_id: string;
}

export type TestType = "chapterwise" | "pyq" | "mock";
export type Difficulty = "easy" | "medium" | "hard";
export type TestStatus = "draft" | "live" | "unpublished" | "expired" | null;

export interface TestRecord {
  id: string;
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics: string[];
  questions: string[] | null;
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty;
  total_marks: number;
  total_time: number;
  total_questions: number;
  status: TestStatus;
  created_at: string;
  updated_at: string | null;
  scheduled_date: string | null;
  expiry_date: string | null;
}

export interface TestPayload {
  name: string;
  type: TestType;
  subject: string;
  topics: string[];
  sub_topics: string[];
  correct_marks: number;
  wrong_marks: number;
  unattempt_marks: number;
  difficulty: Difficulty;
  total_time: number;
  total_marks: number;
  total_questions: number;
  status?: TestStatus;
  questions?: string[];
  scheduled_date?: string | null;
  expiry_date?: string | null;
}

export type CorrectOption = "option1" | "option2" | "option3" | "option4";

export interface QuestionPayload {
  type: "mcq";
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: CorrectOption;
  explanation?: string;
  difficulty?: Difficulty;
  subject: string;
  topic?: string;
  sub_topic?: string;
  media_url?: string;
  test_id: string;
}

export interface QuestionRecord extends QuestionPayload {
  id: string;
}