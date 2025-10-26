-- Create table for storing first weight suggestions
CREATE TABLE weight_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    exercise_details TEXT, -- Original exercise details from first API
    user_context TEXT, -- User onboarding context
    suggested_weight DECIMAL(5,2) NOT NULL, -- Base suggested weight
    sets JSONB NOT NULL, -- Array of sets with weights, reps, and types
    is_restricted BOOLEAN DEFAULT FALSE,
    restriction_reason TEXT,
    user_profile JSONB, -- User weight, gender, experience level
    calculation_details JSONB, -- Base weight, multipliers, max allowed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_weight_suggestions_user_id ON weight_suggestions(user_id);
CREATE INDEX idx_weight_suggestions_exercise_name ON weight_suggestions(exercise_name);
CREATE INDEX idx_weight_suggestions_created_at ON weight_suggestions(created_at);
CREATE INDEX idx_weight_suggestions_user_exercise ON weight_suggestions(user_id, exercise_name);

-- Add RLS (Row Level Security) if needed
-- ALTER TABLE weight_suggestions ENABLE ROW LEVEL SECURITY;

-- Create a policy for RLS (uncomment if you want to enable RLS)
-- CREATE POLICY "Users can view their own weight suggestions" ON weight_suggestions
--     FOR SELECT USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can insert their own weight suggestions" ON weight_suggestions
--     FOR INSERT WITH CHECK (auth.uid()::text = user_id);
