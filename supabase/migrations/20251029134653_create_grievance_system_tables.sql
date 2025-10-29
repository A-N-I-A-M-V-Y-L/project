/*
  # College Grievance Management System Database Schema

  ## Overview
  Creates a comprehensive database structure for the college grievance management system
  with secure role-based access control and detailed grievance tracking.

  ## 1. New Tables

  ### users
  Stores all user information including students, faculty, and admins
  - `id` (uuid, primary key) - Unique identifier linked to auth.users
  - `email` (text, unique, not null) - User's email for login
  - `role` (text, not null) - User role: 'Student', 'Faculty', or 'Admin'
  - `full_name` (text, not null) - User's complete name
  - `user_id` (text, not null) - Student ID, Faculty ID, or Admin ID
  - `department` (text) - Department name
  - `created_at` (timestamptz) - Account creation timestamp

  ### grievances
  Stores all submitted grievances with detailed tracking
  - `id` (uuid, primary key) - Internal unique identifier
  - `grievance_id` (text, unique, not null) - Human-readable tracking ID (e.g., G-2025-001)
  - `submitted_by` (uuid, not null) - References users.id
  - `title` (text, not null) - Brief grievance title
  - `description` (text, not null) - Detailed problem description
  - `category` (text, not null) - Main category (Academic/Facility/Examination/Placement/Other)
  - `status` (text, not null) - Current status (Submitted/In Progress/Resolved/Closed)
  - `created_at` (timestamptz) - Submission timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `assigned_to` (uuid) - References users.id for admin handling the case
  - `resolution_comments` (text) - Admin's resolution notes
  - `details` (jsonb, not null) - Category-specific fields stored as JSON

  ## 2. Security
  - Enable Row Level Security (RLS) on both tables
  - Users can only read/update their own profile
  - Students/Faculty can only view their own grievances
  - Admins have full access to all grievances
  - Authenticated users can create grievances
  - Only admins can update grievance status and assignments

  ## 3. Indexes
  - Index on grievance_id for fast lookups
  - Index on submitted_by for user's grievances
  - Index on category and status for filtering
  - Index on created_at for chronological sorting

  ## 4. Functions
  - Auto-generate unique grievance IDs
  - Auto-update timestamps on changes
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('Student', 'Faculty', 'Admin')),
  full_name text NOT NULL,
  user_id text NOT NULL,
  department text,
  created_at timestamptz DEFAULT now()
);

-- Create grievances table
CREATE TABLE IF NOT EXISTS grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id text UNIQUE NOT NULL,
  submitted_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('Academic', 'Facility', 'Examination', 'Placement', 'Other')),
  status text NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'In Progress', 'Resolved', 'Closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  resolution_comments text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_grievances_grievance_id ON grievances(grievance_id);
CREATE INDEX IF NOT EXISTS idx_grievances_submitted_by ON grievances(submitted_by);
CREATE INDEX IF NOT EXISTS idx_grievances_category ON grievances(category);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_created_at ON grievances(created_at DESC);

-- Function to auto-generate grievance ID
CREATE OR REPLACE FUNCTION generate_grievance_id()
RETURNS text AS $$
DECLARE
  next_num integer;
  year_prefix text;
  new_id text;
BEGIN
  year_prefix := 'G-' || EXTRACT(YEAR FROM CURRENT_DATE)::text || '-';
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(grievance_id FROM '\d+$') AS integer)), 0) + 1
  INTO next_num
  FROM grievances
  WHERE grievance_id LIKE year_prefix || '%';
  
  new_id := year_prefix || LPAD(next_num::text, 3, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate grievance_id before insert
CREATE OR REPLACE FUNCTION set_grievance_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.grievance_id IS NULL OR NEW.grievance_id = '' THEN
    NEW.grievance_id := generate_grievance_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_grievance_id
  BEFORE INSERT ON grievances
  FOR EACH ROW
  EXECUTE FUNCTION set_grievance_id();

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_grievances_updated_at
  BEFORE UPDATE ON grievances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

-- RLS Policies for grievances table

-- Students/Faculty can view their own grievances
CREATE POLICY "Users can view own grievances"
  ON grievances FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

-- Admins can view all grievances
CREATE POLICY "Admins can view all grievances"
  ON grievances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

-- Authenticated users can create grievances
CREATE POLICY "Authenticated users can create grievances"
  ON grievances FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

-- Admins can update all grievances
CREATE POLICY "Admins can update grievances"
  ON grievances FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );

-- Admins can delete grievances
CREATE POLICY "Admins can delete grievances"
  ON grievances FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Admin'
    )
  );