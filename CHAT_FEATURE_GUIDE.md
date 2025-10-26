# AI Chat Feature - Implementation Guide

## ✅ Implementation Complete

The AI chat feature has been fully implemented with dynamic user context management and workout modification capabilities.

## 🎯 What Was Built

### 1. **Dynamic User Context Management**
- **File**: `lib/chatContext.ts`
- **Features**:
  - Extracts user preferences, constraints, goals, injuries, dislikes, schedule from conversations
  - Merges context updates into a structured paragraph
  - Persists context to Supabase `chat_sessions` table
  - Stores context snapshots as embeddings for future retrieval

### 2. **Chat API with Context Updates**
- **File**: `app/api/chat/route.ts`
- **Features**:
  - LLM generates structured JSON responses with `ai_message` and `context_delta`
  - Automatically parses and applies context updates
  - Returns `updated_user_context` to frontend
  - Maintains conversation history in Supabase
  - Detects when workout changes should be proposed

### 3. **Workout Change Proposal System**
- **File**: `app/api/chat/propose-workout-changes/route.ts`
- **Features**:
  - Generates new workout plans based on chat conversation
  - Includes AI coach tips explaining the changes
  - Automatically generates weight suggestions for all exercises
  - Stores proposals in `workout_change_proposals` table
  - Creates change summaries for user confirmation

### 4. **Workout Change Confirmation**
- **File**: `app/api/chat/confirm-workout-changes/route.ts`
- **Features**:
  - Handles acceptance/rejection of proposed changes
  - Updates chat session with new workout on acceptance
  - Logs system messages for audit trail
  - Returns updated workout with weights and tips

### 5. **Chat UI Component**
- **File**: `components/ChatWindow.tsx`
- **Features**:
  - Full-featured chat interface with message history
  - Real-time context updates (maintained in component state)
  - Animated confirmation dialog for workout changes
  - Shows AI coach tips in confirmation popup
  - Transforms API workout format to frontend format
  - Auto-scrolls to latest messages
  - Loading states and error handling

### 6. **Database Tables**
- **Files**: `create_chat_tables.sql`, `app/api/setup-chat-tables/route.ts`
- **Tables Created**:
  - `chat_sessions` - Stores chat sessions with current workout and contexts
  - `chat_messages` - Stores all messages (user, assistant, system)
  - `workout_change_proposals` - Stores proposed workout changes with status

## 🚀 How to Use

### For Users:

1. **Open Chat**: Click the floating chat button (bottom-right corner with message icon)

2. **Start Conversation**: Chat naturally about your workout plan
   - "I want to focus more on shoulders today"
   - "Can we add more cardio?"
   - "I have a knee injury, can we modify the squats?"

3. **Context Updates**: The AI automatically tracks:
   - New preferences you mention
   - Constraints (time, equipment)
   - Goals and objectives
   - Injuries or limitations
   - Exercises you like/dislike
   - Schedule preferences

4. **Workout Changes**: When AI suggests changes:
   - A confirmation popup appears
   - Shows summary of changes
   - Displays AI coach tips explaining the reasoning
   - Click "Apply Changes" to update your workout
   - Click "Keep Current Plan" to decline

5. **Updated Workout**: After confirmation:
   - New exercises appear in your workout sections
   - AI coach tips update to reflect new plan
   - Weight suggestions regenerate for new exercises
   - Chat history saves your decision

### For Developers:

#### Setting Up Chat Tables:

```bash
# Option 1: Run SQL directly in Supabase dashboard
# Copy contents of create_chat_tables.sql and run in SQL editor

# Option 2: Use the setup API endpoint
curl -X POST http://localhost:3000/api/setup-chat-tables
```

#### Testing the Chat:

1. **Complete Onboarding**: Go through onboarding to create a user
2. **Check User ID**: Open browser console and run:
   ```javascript
   console.log(localStorage.getItem('userId'));
   ```
3. **Open Chat**: Click the chat button
4. **Send Messages**: Type messages and watch context updates in console
5. **Check Database**: View tables in Supabase dashboard:
   - `chat_sessions` - Session with dynamic context
   - `chat_messages` - All messages
   - `user_contexts` - Embedding snapshots (if RAG enabled)

#### API Endpoints:

**POST `/api/chat`**
- Creates/continues chat session
- Generates AI responses with context updates
- Returns: `{ ai_response, updated_user_context, should_propose_changes, session_id }`

**GET `/api/chat?userId=X&sessionId=Y`**
- Retrieves chat history
- Returns: `{ session, messages }`

**POST `/api/chat/propose-workout-changes`**
- Generates new workout plan from chat
- Body: `{ session_id, user_id, change_request }`
- Returns: `{ proposal_id, new_workout_plan, change_summary, ai_coach_tips }`

**POST `/api/chat/confirm-workout-changes`**
- Confirms or rejects workout changes
- Body: `{ proposal_id, user_id, accepted }`
- Returns: `{ new_workout_plan, change_summary, ai_coach_tips, weight_suggestions }`

## 🧠 How Context Management Works

### Context Flow:

```
User Message
    ↓
LLM Prompt (with current context, workout, history)
    ↓
LLM Response (JSON with ai_message + context_delta)
    ↓
Parse context_delta: { preferences: [...], goals: [...], injuries: [...], ... }
    ↓
Merge with existing context → Updated paragraph
    ↓
Persist to Supabase (chat_sessions.user_context)
    ↓
Store embedding snapshot (user_contexts table)
    ↓
Return updated_user_context to frontend
    ↓
Frontend updates local state for next message
```

### Context Delta Structure:

```typescript
interface ContextDelta {
  preferences?: string[];     // "prefers morning workouts"
  constraints?: string[];     // "limited to 30 minutes"
  goals?: string[] | string;  // "build muscle mass"
  dislikes?: string[];        // "doesn't like burpees"
  injuries?: string[];        // "recovering from knee injury"
  schedule?: string[];        // "trains Mon/Wed/Fri"
  notes?: string;            // "preparing for marathon"
}
```

### Example Context Evolution:

**Initial Onboarding Context:**
```
Age: 25, Weight: 70kg, Gender: Male
Experience: Less than 6 months
Goal: Build muscle
```

**After Chat 1** ("I prefer training in the morning"):
```
## Dynamic User Context
- Preferences: prefers morning workouts
```

**After Chat 2** ("I have a shoulder injury"):
```
## Dynamic User Context
- Preferences: prefers morning workouts
- Injuries: recovering from shoulder injury
```

**After Chat 3** ("I can only train 3 days per week"):
```
## Dynamic User Context
- Preferences: prefers morning workouts
- Injuries: recovering from shoulder injury
- Schedule: trains 3 days per week
```

## 🎨 UI/UX Flow

1. **Chat Button**: Fixed bottom-right, gradient blue-purple, animated hover
2. **Chat Window**: Full modal overlay, 80vh height, white rounded card
3. **Messages**: 
   - User messages (right, blue background)
   - AI messages (left, gray background)
   - System messages (left, gray with border)
4. **Confirmation Dialog**: 
   - Overlays chat window (higher z-index)
   - Shows change summary
   - Lists AI coach tips in blue box
   - Two action buttons: "Keep Current" vs "Apply Changes"

## 🔒 Data Privacy & Security

- All data stored in user-specific rows (user_id column)
- Row Level Security (RLS) policies available in SQL file (commented out)
- Chat sessions can be soft-deleted (is_active flag)
- Embeddings stored separately for optional RAG retrieval
- No external API calls except to Gemini for AI responses

## 🚨 Error Handling

- **Gemini API failures**: Fallback message displayed, chat continues
- **Database errors**: Logged but don't break user experience
- **JSON parse errors**: Falls back to treating entire response as text
- **Context delta parsing**: Gracefully handles missing or malformed deltas
- **Workout transformation**: Provides sensible defaults for missing fields

## 📊 Monitoring & Debugging

### Console Logs:
- `💬 Processing chat message for user: X`
- `✅ Chat response generated successfully`
- `🔄 Proposing workout changes for session: X`
- `✅ Workout changes accepted and applied`

### Check Context Updates:
```javascript
// In browser console after chatting
const userId = localStorage.getItem('userId');
// Then check Supabase dashboard: chat_sessions table
```

## 🔮 Future Enhancements (Optional)

### RAG (Retrieval Augmented Generation):
Currently, context is passed directly in each prompt. To add RAG:

1. **Enable embedding search** in `lib/embeddingUtils.ts`
2. **Add retrieval step** before LLM prompt in `app/api/chat/route.ts`:
   ```typescript
   // Retrieve relevant past context
   const relevantContext = await retrieveRelevantContext(userId, message);
   // Add to prompt
   ```
3. **Use vector similarity** to find related past conversations
4. **Merge retrieved context** with current context for richer prompts

### Multi-Session Management:
- UI to view/switch between past chat sessions
- Session naming and categorization
- Archive old sessions
- Export chat history

### Advanced Context:
- Track exercise performance over time
- Learn from user feedback patterns
- Predict preferences based on behavior
- Suggest proactive workout adjustments

## ✅ Testing Checklist

- [x] Chat opens and closes properly
- [x] Messages send and display correctly
- [x] Context updates persist to database
- [x] AI suggests workout changes when appropriate
- [x] Confirmation dialog appears with correct data
- [x] Accepting changes updates workout in frontend
- [x] Rejecting changes keeps current workout
- [x] AI coach tips update after changes
- [x] Weight suggestions regenerate for new exercises
- [x] Chat history persists across sessions
- [x] Multiple users can chat simultaneously (separate sessions)
- [x] Error states display gracefully

## 🎉 Summary

The chat feature is fully functional and production-ready! Users can:
- Have natural conversations about their workouts
- Get personalized AI coaching advice
- Request and confirm workout modifications
- Build a dynamic context that evolves with each conversation

The system automatically tracks preferences, handles workout updates, generates weight suggestions, and provides clear confirmation flows - all while maintaining a clean, intuitive UI.

**No RAG is needed initially** - the system works great by passing current context, workout, and recent chat history directly to the LLM. RAG can be added later if you need long-term memory retrieval across many sessions.

