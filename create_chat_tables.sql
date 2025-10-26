-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_name TEXT DEFAULT 'Chat Session',
    current_workout JSONB, -- Store current workout state
    user_context TEXT, -- Dynamic user context that updates with each chat
    onboarding_context TEXT, -- Original onboarding context
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB, -- Store any additional data like workout changes, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout change proposals table
CREATE TABLE IF NOT EXISTS workout_change_proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    proposed_workout JSONB NOT NULL, -- The new workout plan
    change_summary TEXT, -- Summary of what changed
    ai_coach_tips JSONB, -- Updated AI coach tips
    weight_suggestions JSONB, -- Updated weight suggestions
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_workout_proposals_session_id ON workout_change_proposals(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_proposals_user_id ON workout_change_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_proposals_status ON workout_change_proposals(status);
CREATE INDEX IF NOT EXISTS idx_workout_proposals_created_at ON workout_change_proposals(created_at);

-- Add RLS (Row Level Security) if needed
-- ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workout_change_proposals ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (uncomment if you want to enable RLS)
-- CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
--     FOR SELECT USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
--     FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- CREATE POLICY "Users can view their own chat messages" ON chat_messages
--     FOR SELECT USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can insert their own chat messages" ON chat_messages
--     FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- CREATE POLICY "Users can view their own workout proposals" ON workout_change_proposals
--     FOR SELECT USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can insert their own workout proposals" ON workout_change_proposals
--     FOR INSERT WITH CHECK (auth.uid()::text = user_id);
