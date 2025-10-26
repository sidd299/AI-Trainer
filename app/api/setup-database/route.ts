import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // SQL to create the gemini_responses table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS gemini_responses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        type TEXT DEFAULT 'onboarding',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_gemini_responses_user_id ON gemini_responses(user_id);
      CREATE INDEX IF NOT EXISTS idx_gemini_responses_type ON gemini_responses(type);
      CREATE INDEX IF NOT EXISTS idx_gemini_responses_created_at ON gemini_responses(created_at);
    `;

    // Execute the SQL
    const { data: tableResult, error: tableError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (tableError) {
      console.error('Error creating table:', tableError);
      return NextResponse.json(
        { error: 'Failed to create table', details: tableError.message },
        { status: 500 }
      );
    }

    const { data: indexResult, error: indexError } = await supabase.rpc('exec_sql', {
      sql: createIndexSQL
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
      return NextResponse.json(
        { error: 'Failed to create indexes', details: indexError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database table created successfully',
      table: 'gemini_responses',
      indexes: ['user_id', 'type', 'created_at']
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if the table exists
    const { data, error } = await supabase
      .from('gemini_responses')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        tableExists: false,
        error: error.message,
        message: 'Table does not exist. Run POST to create it.'
      });
    }

    return NextResponse.json({
      success: true,
      tableExists: true,
      message: 'Table exists and is accessible',
      sampleData: data
    });

  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
