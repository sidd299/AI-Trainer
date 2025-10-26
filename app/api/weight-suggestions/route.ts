import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const exerciseName = searchParams.get('exerciseName');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('weight_suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by exercise name if provided
    if (exerciseName) {
      query = query.eq('exercise_name', exerciseName);
    }

    const { data: suggestions, error } = await query;

    if (error) {
      console.error('Error fetching weight suggestions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch weight suggestions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      suggestions,
      count: suggestions?.length || 0
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weight suggestions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, exerciseName, limit = 10 } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('weight_suggestions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by exercise name if provided
    if (exerciseName) {
      query = query.eq('exercise_name', exerciseName);
    }

    const { data: suggestions, error } = await query;

    if (error) {
      console.error('Error fetching weight suggestions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch weight suggestions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      suggestions,
      count: suggestions?.length || 0
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weight suggestions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
