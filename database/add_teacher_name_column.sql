-- Add teacher_name column to batch_subjects table
ALTER TABLE batch_subjects ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(255);

-- Add comment to document the column
COMMENT ON COLUMN batch_subjects.teacher_name IS 'Name of the teacher assigned to this subject';