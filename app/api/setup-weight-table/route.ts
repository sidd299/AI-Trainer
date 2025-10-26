import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST() {
  try {
    console.log('🔧 Setting up weight_suggestions table...');

    // Create the table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS weight_suggestions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          exercise_name TEXT NOT NULL,
          exercise_details TEXT,
          user_context TEXT,
          suggested_weight DECIMAL(5,2) NOT NULL,
          sets JSONB NOT NULL,
          is_restricted BOOLEAN DEFAULT FALSE,
          restriction_reason TEXT,
          user_profile JSONB,
          calculation_details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createError) {
      console.error('Error creating table:', createError);
      return NextResponse.json(
        { error: 'Failed to create table', details: createError },
        { status: 500 }
      );
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_weight_suggestions_user_id ON weight_suggestions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_weight_suggestions_exercise_name ON weight_suggestions(exercise_name);',
      'CREATE INDEX IF NOT EXISTS idx_weight_suggestions_created_at ON weight_suggestions(created_at);',
      'CREATE INDEX IF NOT EXISTS idx_weight_suggestions_user_exercise ON weight_suggestions(user_id, exercise_name);'
    ];

    for (const indexSQL of indexes) {
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: indexSQL
      });
      
      if (indexError) {
        console.warn('Warning creating index:', indexError);
      }
    }

    console.log('✅ Weight suggestions table setup completed');

    return NextResponse.json({
      success: true,
      message: 'Weight suggestions table created successfully',
      table: 'weight_suggestions',
      indexes: indexes.length
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup table', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if table exists by trying to query it
    const { data, error } = await supabase
      .from('weight_suggestions')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({
        exists: false,
        message: 'Table does not exist or is not accessible',
        error: error.message
      });
    }

    return NextResponse.json({
      exists: true,
      message: 'Weight suggestions table exists and is accessible',
      sample_data: data
    });

  } catch (error) {
    return NextResponse.json({
      exists: false,
      message: 'Error checking table',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
