import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST() {
  try {
    console.log('🔧 Setting up chat tables...');

    // Create chat sessions table
    const createChatSessionsSQL = `
      CREATE TABLE IF NOT EXISTS chat_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          session_name TEXT DEFAULT 'Chat Session',
          current_workout JSONB,
          user_context TEXT,
          onboarding_context TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create chat messages table
    const createChatMessagesSQL = `
      CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL,
          message_type TEXT NOT NULL,
          content TEXT NOT NULL,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Create workout change proposals table
    const createWorkoutProposalsSQL = `
      CREATE TABLE IF NOT EXISTS workout_change_proposals (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
          user_id TEXT NOT NULL,
          proposed_workout JSONB NOT NULL,
          change_summary TEXT,
          ai_coach_tips JSONB,
          weight_suggestions JSONB,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Execute table creation
    const tables = [
      { name: 'chat_sessions', sql: createChatSessionsSQL },
      { name: 'chat_messages', sql: createChatMessagesSQL },
      { name: 'workout_change_proposals', sql: createWorkoutProposalsSQL }
    ];

    for (const table of tables) {
      const { error: tableError } = await supabase.rpc('exec_sql', {
        sql: table.sql
      });
      
      if (tableError) {
        console.error(`Error creating ${table.name}:`, tableError);
        return NextResponse.json(
          { error: `Failed to create ${table.name}`, details: tableError },
          { status: 500 }
        );
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active);',
      'CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_workout_proposals_session_id ON workout_change_proposals(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_workout_proposals_user_id ON workout_change_proposals(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_workout_proposals_status ON workout_change_proposals(status);',
      'CREATE INDEX IF NOT EXISTS idx_workout_proposals_created_at ON workout_change_proposals(created_at);'
    ];

    for (const indexSQL of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: indexSQL
      });
      
      if (indexError) {
        console.warn('Warning creating index:', indexError);
      }
    }

    console.log('✅ Chat tables setup completed');

    return NextResponse.json({
      success: true,
      message: 'Chat tables created successfully',
      tables: ['chat_sessions', 'chat_messages', 'workout_change_proposals'],
      indexes: indexes.length
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup chat tables', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if tables exist
    const tables = ['chat_sessions', 'chat_messages', 'workout_change_proposals'];
    const results: any = {};

    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      results[tableName] = {
        exists: !error,
        error: error?.message || null
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Chat tables status check completed',
      tables: results
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error checking chat tables',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
