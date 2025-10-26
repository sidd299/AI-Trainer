import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { mergeContextParagraph, ContextDelta } from '../../../lib/chatContext';
import { storeUserContext } from '../../../lib/embeddingUtils';

interface UpdateContextRequest {
  user_id: string;
  session_id: string;
  action: 'like' | 'dislike' | 'favorite' | 'delete_forever' | 'skip';
  exercise_name: string;
  reason?: string; // Optional reason for the action
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateContextRequest = await request.json();
    const { user_id, session_id, action, exercise_name, reason } = body;

    if (!user_id || !session_id || !action || !exercise_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`📝 Updating user context: ${action} for ${exercise_name}`);

    // Get current session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Create context delta based on action
    const delta: ContextDelta = {};

    switch (action) {
      case 'like':
      case 'favorite':
        delta.preferences = [`Enjoys ${exercise_name}`];
        break;
      
      case 'dislike':
      case 'delete_forever':
        const dislikeReason = reason ? ` (${reason})` : '';
        delta.dislikes = [`${exercise_name}${dislikeReason}`];
        break;
      
      case 'skip':
        // Skip is temporary - don't add to permanent context
        // But log it for analytics
        console.log(`⏭️ User skipped ${exercise_name} - not added to permanent context`);
        return NextResponse.json({
          success: true,
          message: 'Skip action logged (not added to permanent context)'
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Merge with existing context
    const updatedContext = mergeContextParagraph(session.user_context || '', delta);

    // Save to database
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        user_context: updatedContext,
        updated_at: new Date().toISOString()
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Error updating context:', updateError);
      return NextResponse.json(
        { error: 'Failed to update context' },
        { status: 500 }
      );
    }

    // Store embedding for retrieval
    try {
      await storeUserContext(user_id, updatedContext);
    } catch (embedError) {
      console.warn('Failed to store embedding:', embedError);
      // Don't fail the request if embedding fails
    }

    console.log('✅ User context updated successfully');

    return NextResponse.json({
      success: true,
      updated_context: updatedContext,
      message: `Successfully updated context for ${action} on ${exercise_name}`
    });

  } catch (error) {
    console.error('Update context API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


