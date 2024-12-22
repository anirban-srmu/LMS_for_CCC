export type User = {
  id: string;
  role: 'student' | 'instructor' | 'admin';
  full_name: string;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  created_at: string;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
};

export type MCQQuestion = {
  id: string;
  module_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  created_at: string;
};

export type CodingExercise = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  initial_code: string;
  test_cases: {
    input: string;
    expected_output: string;
  }[];
  language: string;
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  module_id: string;
  mcq_scores: {
    question_id: string;
    score: number;
    attempts: number;
  }[];
  coding_submissions: {
    exercise_id: string;
    code: string;
    passed: boolean;
    submission_time: string;
  }[];
  completed: boolean;
  created_at: string;
  updated_at: string;
};