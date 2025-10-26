import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { mergeContextParagraph, persistUpdatedContext, ContextDelta } from '../../../lib/chatContext';

// Configuration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Try different models in order of preference
const AVAILABLE_MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
];

/**
 * Find a working model using direct REST API calls
 */
async function findWorkingModel(): Promise<string> {
  console.log('🔍 Testing available models for chat...');
  
  for (const model of AVAILABLE_MODELS) {
    try {
      const testRequest = {
        contents: [{
          role: 'user',
          parts: [{ text: 'Hello' }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      };
      
      const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRequest)
      });
      
      if (response.ok) {
        console.log(`✅ Found working model for chat: ${model}`);
        return model;
      } else {
        console.log(`❌ Model ${model} not available: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Model ${model} error:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  console.error('❌ No working models found for chat!');
  return AVAILABLE_MODELS[0]; // Return first model as fallback
}

/**
 * Generate AI response for chat
 */
async function generateChatResponse(
  userMessage: string,
  currentWorkout: any,
  userContext: string,
  onboardingContext: string,
  chatHistory: any[]
): Promise<{ aiMessage: string; contextDelta?: ContextDelta }> {
  try {
    const modelName = await findWorkingModel();
    
    const prompt = `You are an AI fitness coach and personal trainer. You're having a conversation with a user about their workout plan and fitness goals.

Current Workout Plan:
${JSON.stringify(currentWorkout, null, 2)}

User Context (Dynamic - Updated with each conversation):
${userContext}

Original Onboarding Context:
${onboardingContext}

Recent Chat History:
${chatHistory.slice(-5).map(msg => `${msg.message_type}: ${msg.content}`).join('\n')}

User's Current Message:
${userMessage}

Instructions:
1. Be conversational and supportive. Reference the current workout when relevant.
2. If the user mentions new preferences, goals, constraints, injuries, dislikes, schedule, or notes, extract them.
3. Keep responses concise - MAXIMUM 60-70 words.
4. If you suggest workout changes, mention that you'll need to confirm the changes.

Format your response EXACTLY like this (replace content but keep the delimiters):
<<<RESPONSE_START>>>
Your conversational response here (plain text, can use multiple paragraphs and line breaks)
<<<RESPONSE_END>>>
<<<CONTEXT_START>>>
preferences: preference1, preference2
goals: goal1, goal2
constraints: constraint1
dislikes: dislike1
injuries: injury1
schedule: schedule1
notes: any notes
<<<CONTEXT_END>>>

Only include context fields that have new information. Leave out empty fields.`;

    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const apiUrl = `${GEMINI_BASE_URL}/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    console.log('Making chat request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chat API error response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract response text
    let responseText = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      responseText = data.candidates[0].content.parts[0].text || '';
    } else {
      throw new Error('No valid response from chat API');
    }

    console.log('🔍 [CHAT] Raw response from LLM (length:', responseText.length, ')');

    // Extract AI message using delimiters
    const responseMatch = responseText.match(/<<<RESPONSE_START>>>([\s\S]*?)<<<RESPONSE_END>>>/);
    const aiMessage = responseMatch ? responseMatch[1].trim() : responseText.trim();
    
    console.log('✅ Extracted AI message (first 150 chars):', aiMessage.substring(0, 150));

    // Extract context delta using delimiters
    let contextDelta: ContextDelta = {};
    const contextMatch = responseText.match(/<<<CONTEXT_START>>>([\s\S]*?)<<<CONTEXT_END>>>/);
    
    if (contextMatch) {
      const contextText = contextMatch[1];
      console.log('🔍 [CHAT] Found context block:', contextText.substring(0, 200));
      
      // Parse each line in the context block
      const lines = contextText.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim();
          const keyTrimmed = key.trim() as keyof ContextDelta;
          
          if (value && value !== '') {
            // Split comma-separated values
            const values = value.split(',').map(v => v.trim()).filter(v => v);
            
            if (keyTrimmed === 'notes') {
              contextDelta[keyTrimmed] = value; // Keep notes as string
            } else if (values.length > 0) {
              (contextDelta as any)[keyTrimmed] = values;
            }
          }
        }
      }
      
      console.log('✅ Parsed context delta:', JSON.stringify(contextDelta, null, 2));
    } else {
      console.log('ℹ️ No context delta found in response');
    }

    console.log('✅ Chat response generated successfully');
    console.log('📝 Final AI message (first 100 chars):', aiMessage.substring(0, 100));
    return { aiMessage, contextDelta: Object.keys(contextDelta).length > 0 ? contextDelta : undefined };
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
}

/**
 * Check if the AI response suggests workout changes
 */
function shouldProposeWorkoutChanges(aiResponse: string): boolean {
  const changeIndicators = [
    'suggest', 'recommend', 'modify', 'change', 'adjust', 'update',
    'instead of', 'better to', 'consider', 'try', 'switch',
    'add', 'remove', 'replace', 'increase', 'decrease'
  ];
  
  const lowerResponse = aiResponse.toLowerCase();
  return changeIndicators.some(indicator => lowerResponse.includes(indicator));
}

interface ChatRequest {
  user_id: string;
  message: string;
  session_id?: string;
  current_workout?: any;
  user_context?: string;
  onboarding_context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { user_id, message, session_id, current_workout, user_context, onboarding_context } = body;

    // Validate required fields
    if (!user_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id and message are required' },
        { status: 400 }
      );
    }

    console.log('💬 Processing chat message for user:', user_id);

    // Get or create chat session
    let session;
    if (session_id) {
      const { data: existingSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', session_id)
        .eq('user_id', user_id)
        .single();

      if (sessionError || !existingSession) {
        return NextResponse.json(
          { error: 'Chat session not found' },
          { status: 404 }
        );
      }
      session = existingSession;
    } else {
      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user_id,
          current_workout: current_workout || {},
          user_context: user_context || '',
          onboarding_context: onboarding_context || '',
          session_name: `Chat Session ${new Date().toLocaleDateString()}`
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating chat session:', createError);
        return NextResponse.json(
          { error: 'Failed to create chat session' },
          { status: 500 }
        );
      }
      session = newSession;
    }

    // Get chat history
    const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error('Error fetching chat history:', historyError);
    }

    // Store user message
    const { error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: user_id,
        message_type: 'user',
        content: message,
        metadata: {}
      });

    if (userMessageError) {
      console.error('Error storing user message:', userMessageError);
    }

    // Generate AI response
    let aiResponse;
    let contextDelta: ContextDelta | undefined;
    try {
      const result = await generateChatResponse(
        message,
        session.current_workout || current_workout || {},
        session.user_context || user_context || '',
        session.onboarding_context || onboarding_context || '',
        chatHistory || []
      );
      aiResponse = result.aiMessage;
      contextDelta = result.contextDelta;
    } catch (error) {
      console.error('Error generating AI response:', error);
      aiResponse = "I'm sorry, I'm having trouble processing your message right now. Please try again in a moment.";
    }

    // Store AI response
    const { error: aiMessageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        user_id: user_id,
        message_type: 'assistant',
        content: aiResponse,
        metadata: {}
      });

    if (aiMessageError) {
      console.error('Error storing AI message:', aiMessageError);
    }

    // Check if we should propose workout changes
    const shouldProposeChanges = shouldProposeWorkoutChanges(aiResponse);

    // Merge and persist dynamic user context
    let updatedUserContext = session.user_context || user_context || '';
    if (contextDelta && Object.keys(contextDelta).length > 0) {
      updatedUserContext = mergeContextParagraph(updatedUserContext, contextDelta);
      await persistUpdatedContext(session.id, user_id, updatedUserContext);
    }

    return NextResponse.json({
      success: true,
      session_id: session.id,
      ai_response: aiResponse,
      should_propose_changes: shouldProposeChanges,
      updated_user_context: updatedUserContext,
      message: 'Chat processed successfully'
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    if (sessionId) {
      // Get specific session with messages
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError || !session) {
        return NextResponse.json(
          { error: 'Chat session not found' },
          { status: 404 }
        );
      }

      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      }

      return NextResponse.json({
        success: true,
        session: session,
        messages: messages || []
      });
    } else {
      // Get all sessions for user
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      }

      return NextResponse.json({
        success: true,
        sessions: sessions || []
      });
    }

  } catch (error) {
    console.error('Chat GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
