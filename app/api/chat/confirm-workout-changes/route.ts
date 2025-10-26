import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

interface ConfirmWorkoutRequest {
  proposal_id: string;
  user_id: string;
  accepted: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmWorkoutRequest = await request.json();
    const { proposal_id, user_id, accepted } = body;

    // Validate required fields
    if (!proposal_id || !user_id || accepted === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: proposal_id, user_id, and accepted are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 ${accepted ? 'Accepting' : 'Rejecting'} workout changes for proposal:`, proposal_id);

    // Get the workout change proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('workout_change_proposals')
      .select('*')
      .eq('id', proposal_id)
      .eq('user_id', user_id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: 'Workout change proposal not found' },
        { status: 404 }
      );
    }

    // Check if proposal is still pending
    if (proposal.status !== 'pending') {
      return NextResponse.json(
        { error: 'This proposal has already been processed' },
        { status: 400 }
      );
    }

    // Update proposal status
    const { error: updateError } = await supabase
      .from('workout_change_proposals')
      .update({
        status: accepted ? 'accepted' : 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', proposal_id);

    if (updateError) {
      console.error('Error updating proposal status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update proposal status' },
        { status: 500 }
      );
    }

    if (accepted) {
      // Update the chat session with the new workout
      const { error: sessionUpdateError } = await supabase
        .from('chat_sessions')
        .update({
          current_workout: proposal.proposed_workout,
          updated_at: new Date().toISOString()
        })
        .eq('id', proposal.session_id);

      if (sessionUpdateError) {
        console.error('Error updating session workout:', sessionUpdateError);
        return NextResponse.json(
          { error: 'Failed to update workout in session' },
          { status: 500 }
        );
      }

      // Store a system message about the workout change
      const { error: systemMessageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: proposal.session_id,
          user_id: user_id,
          message_type: 'system',
          content: `✅ Workout plan updated! ${proposal.change_summary}`,
          metadata: {
            proposal_id: proposal_id,
            workout_changed: true,
            new_workout: proposal.proposed_workout
          }
        });

      if (systemMessageError) {
        console.error('Error storing system message:', systemMessageError);
        // Don't fail the request for this
      }

      console.log('✅ Workout changes accepted and applied');

      return NextResponse.json({
        success: true,
        accepted: true,
        new_workout_plan: proposal.proposed_workout,
        change_summary: proposal.change_summary,
        ai_coach_tips: proposal.ai_coach_tips,
        weight_suggestions: proposal.weight_suggestions,
        message: 'Workout changes have been applied successfully'
      });
    } else {
      // Store a system message about the rejection
      const { error: systemMessageError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: proposal.session_id,
          user_id: user_id,
          message_type: 'system',
          content: '❌ Workout changes were not applied. Your current workout plan remains unchanged.',
          metadata: {
            proposal_id: proposal_id,
            workout_changed: false
          }
        });

      if (systemMessageError) {
        console.error('Error storing system message:', systemMessageError);
        // Don't fail the request for this
      }

      console.log('❌ Workout changes rejected');

      return NextResponse.json({
        success: true,
        accepted: false,
        message: 'Workout changes have been rejected. Your current workout plan remains unchanged.'
      });
    }

  } catch (error) {
    console.error('Confirm workout changes API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
