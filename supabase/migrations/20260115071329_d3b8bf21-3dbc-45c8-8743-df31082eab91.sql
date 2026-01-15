-- Add count tracking fields to habits table
ALTER TABLE public.habits
ADD COLUMN track_count boolean NOT NULL DEFAULT false,
ADD COLUMN count_goal integer;

-- Add count field to habit_completions table
ALTER TABLE public.habit_completions
ADD COLUMN count integer;