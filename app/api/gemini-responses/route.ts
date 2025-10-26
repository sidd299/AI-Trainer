import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'onboarding';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Fetch Gemini responses for the user
    const { data: responses, error } = await supabase
      .from('gemini_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    console.log('Fetching responses for user:', userId, 'type:', type);
    console.log('Query result:', { responses, error });

    if (error) {
      console.error('Error fetching Gemini responses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      type,
      responses: responses || [],
      count: responses?.length || 0
    });

  } catch (error) {
    console.error('Gemini responses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, prompt, response, type = 'onboarding' } = body;

    if (!userId || !prompt || !response) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, prompt, and response are required' },
        { status: 400 }
      );
    }

    // Store Gemini response
    const { data: newResponse, error } = await supabase
      .from('gemini_responses')
      .insert({
        user_id: userId,
        prompt: prompt,
        response: response,
        type: type,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error storing Gemini response:', error);
      return NextResponse.json(
        { error: 'Failed to store response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response: newResponse,
      message: 'Gemini response stored successfully'
    });

  } catch (error) {
    console.error('Gemini responses POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
