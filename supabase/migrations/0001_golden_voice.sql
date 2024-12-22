/*
  # Initial Schema for Engineering LMS

  1. New Tables
    - users (extends auth.users)
      - id (uuid, primary key)
      - role (text)
      - full_name (text)
      - created_at (timestamp)
    
    - courses
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - instructor_id (uuid, foreign key)
      - created_at (timestamp)
    
    - modules
      - id (uuid, primary key)
      - course_id (uuid, foreign key)
      - title (text)
      - order_index (integer)
      - created_at (timestamp)
    
    - mcq_questions
      - id (uuid, primary key)
      - module_id (uuid, foreign key)
      - question (text)
      - options (jsonb)
      - correct_answer (integer)
      - explanation (text)
      - created_at (timestamp)
    
    - coding_exercises
      - id (uuid, primary key)
      - module_id (uuid, foreign key)
      - title (text)
      - description (text)
      - initial_code (text)
      - test_cases (jsonb)
      - language (text)
      - created_at (timestamp)
    
    - user_progress
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - module_id (uuid, foreign key)
      - mcq_scores (jsonb)
      - coding_submissions (jsonb)
      - completed (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on their roles
*/

-- Create tables
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  instructor_id uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) NOT NULL,
  title text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE mcq_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE coding_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  initial_code text NOT NULL,
  test_cases jsonb NOT NULL,
  language text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  module_id uuid REFERENCES modules(id) NOT NULL,
  mcq_scores jsonb DEFAULT '[]'::jsonb,
  coding_submissions jsonb DEFAULT '[]'::jsonb,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Instructors and admins can read all users
CREATE POLICY "Instructors and admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role IN ('instructor', 'admin')
    )
  );

-- Course policies
CREATE POLICY "Anyone can view courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND role IN ('instructor', 'admin')
    )
  );

CREATE POLICY "Instructors can update own courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (instructor_id = auth.uid())
  WITH CHECK (instructor_id = auth.uid());

-- Module policies
CREATE POLICY "Anyone can view modules"
  ON modules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors can manage modules"
  ON modules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- MCQ policies
CREATE POLICY "Anyone can view MCQs"
  ON mcq_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors can manage MCQs"
  ON mcq_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = mcq_questions.module_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- Coding exercise policies
CREATE POLICY "Anyone can view coding exercises"
  ON coding_exercises
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Instructors can manage coding exercises"
  ON coding_exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = coding_exercises.module_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- User progress policies
CREATE POLICY "Users can view and update own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Instructors can view progress for their courses
CREATE POLICY "Instructors can view progress for their courses"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = user_progress.module_id
      AND courses.instructor_id = auth.uid()
    )
  );