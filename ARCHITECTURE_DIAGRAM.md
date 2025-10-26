# AI Trainer - System Architecture Diagram

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ONBOARDING                              │
│  (Age, Weight, Experience, Goals, Equipment, Recent Workouts, etc.)  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ POST /api/onboarding
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   INITIAL WORKOUT GENERATION                         │
│                     POST /api/workout                                │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  1. GEMINI API CALL #1: Generate Workout Plan                │  │
│  │     Input:  User Context + AI Guidelines                     │  │
│  │     Output: Workout JSON (4 sections, 5-8 exercises)         │  │
│  │             + AI Coach Tips                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  2. FOR EACH EXERCISE → POST /api/suggest-weights-ai         │  │
│  │     GEMINI API CALLS #2-#N: Generate Weight Suggestions      │  │
│  │     Input:  User Context + Exercise Details                  │  │
│  │     Output: Sets with weights, reps, reasoning               │  │
│  │     Rate Limiting: 2-second delay between calls              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  3. Merge Results                                            │  │
│  │     workout_plan.weight_suggestions = {                      │  │
│  │       "Exercise 1": { sets, reasoning, safety_notes },       │  │
│  │       "Exercise 2": { sets, reasoning, safety_notes },       │  │
│  │       ...                                                     │  │
│  │     }                                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Return complete workout with weights
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND: DISPLAY WORKOUT                         │
│   - Save to localStorage("currentWorkout")                           │
│   - Render TodayWorkout component                                    │
│   - Show AI Coach Tips                                               │
│   - Display InlineChatStrip                                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ User clicks chat strip
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         CHAT INTERACTION                             │
│                       POST /api/chat                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  1. Create/Load Chat Session                                 │  │
│  │     - session_id                                             │  │
│  │     - current_workout (JSONB)                                │  │
│  │     - user_context (TEXT - dynamic)                          │  │
│  │     - onboarding_context (TEXT - static)                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  2. Store User Message in chat_messages table                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  3. GEMINI API CALL: Generate Chat Response                  │  │
│  │     Input:  User Message + Current Workout +                 │  │
│  │             User Context + Onboarding Context +              │  │
│  │             Recent Chat History (last 5 messages)            │  │
│  │     Output: <<<RESPONSE_START>>>                             │  │
│  │             AI response (max 60-70 words)                    │  │
│  │             <<<RESPONSE_END>>>                               │  │
│  │             <<<CONTEXT_START>>>                              │  │
│  │             preferences: ...                                 │  │
│  │             goals: ...                                       │  │
│  │             <<<CONTEXT_END>>>                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  4. Parse Response                                           │  │
│  │     - Extract ai_message between delimiters                  │  │
│  │     - Extract context_delta between delimiters               │  │
│  │     - Check if should_propose_changes (keywords)             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  5. Merge Dynamic Context                                    │  │
│  │     updated_user_context = mergeContextParagraph(            │  │
│  │       existing_context, context_delta                        │  │
│  │     )                                                         │  │
│  │     Update chat_sessions.user_context                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  6. Store AI Response in chat_messages table                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  7. Return to Frontend                                       │  │
│  │     {                                                         │  │
│  │       ai_response: "...",                                    │  │
│  │       should_propose_changes: true/false,                    │  │
│  │       updated_user_context: "...",                           │  │
│  │       session_id: "..."                                      │  │
│  │     }                                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ If should_propose_changes = true
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   PROPOSE WORKOUT CHANGES                            │
│            POST /api/chat/propose-workout-changes                    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  1. Fetch Session Data                                       │  │
│  │     - current_workout                                        │  │
│  │     - user_context (updated from chat)                       │  │
│  │     - onboarding_context                                     │  │
│  │     - chat_history (last 10 messages)                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  2. GEMINI API CALL: Generate New Workout Plan               │  │
│  │     Input:  Current Workout + User Context +                 │  │
│  │             Onboarding Context + Chat History +              │  │
│  │             Change Request + AI Guidelines                   │  │
│  │     Output: New Workout JSON + AI Coach Tips +               │  │
│  │             change_summary                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  3. Identify NEW Exercises                                   │  │
│  │     new_exercises = []                                       │  │
│  │     for each exercise in new_workout:                        │  │
│  │       if exercise NOT in current_workout.weight_suggestions: │  │
│  │         new_exercises.append(exercise)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  4. Generate Weights ONLY for NEW Exercises                  │  │
│  │     weight_suggestions = { ...existing_weights }             │  │
│  │     for exercise in new_exercises:                           │  │
│  │       GEMINI API CALL: POST /api/suggest-weights-ai          │  │
│  │       wait 2 seconds (rate limiting)                         │  │
│  │       weight_suggestions[exercise] = result                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  5. Store Proposal in workout_change_proposals table         │  │
│  │     {                                                         │  │
│  │       proposal_id: "...",                                    │  │
│  │       proposed_workout: new_workout_with_weights,            │  │
│  │       change_summary: "...",                                 │  │
│  │       ai_coach_tips: [...],                                  │  │
│  │       status: "pending"                                      │  │
│  │     }                                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Return proposal to frontend
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  FRONTEND: CONFIRMATION DIALOG                       │
│   - Display change_summary                                           │
│   - Show old vs new exercises                                        │
│   - Show AI coach tips                                               │
│   - Buttons: "Apply Changes" | "Cancel"                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ User clicks "Apply Changes"
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     CONFIRM WORKOUT CHANGES                          │
│           POST /api/chat/confirm-workout-changes                     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  1. Fetch Proposal from workout_change_proposals             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  2. Update Proposal Status to "accepted"                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  3. Return proposed_workout to frontend                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  FRONTEND: UPDATE WORKOUT                            │
│                                                                      │
│  1. Transform API workout format to TodayWorkout type               │
│  2. SAVE TO localStorage("currentWorkout") ← CRITICAL               │
│  3. Call onWorkoutUpdate(transformedWorkout)                         │
│  4. Update React state                                               │
│  5. Close chat window                                                │
│  6. Refresh page → Workout loaded from localStorage                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Tables

```
┌─────────────────────────────────────────────────────────────────────┐
│                         chat_sessions                                │
├─────────────────────────────────────────────────────────────────────┤
│  id                    UUID PRIMARY KEY                              │
│  user_id               UUID NOT NULL                                 │
│  session_name          TEXT                                          │
│  current_workout       JSONB                                         │
│  user_context          TEXT    ← Dynamic (updated from chat)         │
│  onboarding_context    TEXT    ← Static (from initial setup)         │
│  created_at            TIMESTAMP                                     │
│  updated_at            TIMESTAMP                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         chat_messages                                │
├─────────────────────────────────────────────────────────────────────┤
│  id                    UUID PRIMARY KEY                              │
│  session_id            UUID FOREIGN KEY → chat_sessions              │
│  user_id               UUID NOT NULL                                 │
│  message_type          TEXT ('user' | 'assistant')                   │
│  content               TEXT                                          │
│  metadata              JSONB                                         │
│  created_at            TIMESTAMP                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    workout_change_proposals                          │
├─────────────────────────────────────────────────────────────────────┤
│  id                    UUID PRIMARY KEY                              │
│  session_id            UUID FOREIGN KEY → chat_sessions              │
│  user_id               UUID NOT NULL                                 │
│  proposed_workout      JSONB                                         │
│  change_summary        TEXT                                          │
│  ai_coach_tips         TEXT[]                                        │
│  weight_suggestions    JSONB                                         │
│  status                TEXT ('pending' | 'accepted' | 'rejected')    │
│  created_at            TIMESTAMP                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       weight_suggestions                             │
├─────────────────────────────────────────────────────────────────────┤
│  id                    UUID PRIMARY KEY                              │
│  user_id               UUID NOT NULL                                 │
│  exercise_name         TEXT                                          │
│  exercise_details      TEXT                                          │
│  user_context          TEXT                                          │
│  suggested_weight      FLOAT                                         │
│  sets                  JSONB (array of set objects)                  │
│  user_profile          JSONB (reasoning, safety_notes)               │
│  calculation_details   JSONB (method, prompt_used)                   │
│  is_restricted         BOOLEAN                                       │
│  restriction_reason    TEXT                                          │
│  created_at            TIMESTAMP                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       gemini_responses                               │
│                      (Audit Trail)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  id                    UUID PRIMARY KEY                              │
│  user_id               UUID NOT NULL                                 │
│  prompt                TEXT                                          │
│  response              TEXT                                          │
│  type                  TEXT ('daily_workout' | 'chat' | ...)         │
│  created_at            TIMESTAMP                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Design Decisions

### **1. Two-Context System**

```
┌────────────────────────────┐     ┌────────────────────────────┐
│   Onboarding Context       │     │    User Context            │
│   (Static)                 │     │    (Dynamic)               │
├────────────────────────────┤     ├────────────────────────────┤
│ - Initial user info        │     │ - Updated from chat        │
│ - Age, weight, experience  │     │ - New preferences          │
│ - Goals, equipment         │     │ - New goals                │
│ - Initial constraints      │     │ - New constraints          │
│                            │     │ - Injuries mentioned       │
│ Set ONCE at onboarding     │     │ - Schedule changes         │
│ Never changes              │     │ - Additional notes         │
│                            │     │                            │
│ Used for: Reference only   │     │ Used for: All AI decisions │
└────────────────────────────┘     └────────────────────────────┘
```

**Why?** Preserves original context while allowing evolution based on conversations.

---

### **2. Selective Weight Generation**

```
Initial Workout:
┌─────────────────────────────────────────────────────────────┐
│  Exercise A ──→ Generate Weights (API Call 1)               │
│  Exercise B ──→ Generate Weights (API Call 2)               │
│  Exercise C ──→ Generate Weights (API Call 3)               │
│  Exercise D ──→ Generate Weights (API Call 4)               │
│  Exercise E ──→ Generate Weights (API Call 5)               │
│                                                             │
│  Total: 5 API calls, ~10 seconds (with 2s delays)          │
└─────────────────────────────────────────────────────────────┘

Workout Modification:
┌─────────────────────────────────────────────────────────────┐
│  Exercise A ──→ ✅ Reuse existing weights                   │
│  Exercise B ──→ ✅ Reuse existing weights                   │
│  Exercise F ──→ 🔄 Generate NEW weights (API Call 1)       │
│  Exercise G ──→ 🔄 Generate NEW weights (API Call 2)       │
│                                                             │
│  Total: 2 API calls, ~4 seconds (66% faster)               │
└─────────────────────────────────────────────────────────────┘
```

**Why?** Reduces API calls, avoids rate limits, improves user experience.

---

### **3. Delimiter-Based Parsing**

```
❌ Old Method (JSON Parsing):
   LLM Response: "```json\n{\"ai_message\": \"...\"}\n```"
   Problem: Inconsistent formatting, markdown issues

✅ New Method (Delimiter Extraction):
   LLM Response: "<<<RESPONSE_START>>>...<<<RESPONSE_END>>>"
   Benefit: Robust, handles any formatting
```

**Why?** LLMs are inconsistent with JSON formatting, delimiters are more reliable.

---

### **4. localStorage + State + Database**

```
┌──────────────────────────────────────────────────────────────┐
│                    Data Persistence Strategy                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Database (Supabase)                                      │
│     - Chat sessions and messages                             │
│     - Workout proposals                                      │
│     - Weight suggestions                                     │
│     Purpose: Long-term storage, audit trail                  │
│                                                              │
│  2. localStorage                                             │
│     - currentWorkout                                         │
│     - userId                                                 │
│     - onboardingSummary                                      │
│     Purpose: Quick access, persist across refreshes          │
│                                                              │
│  3. React State                                              │
│     - workout (TodayWorkout)                                 │
│     - workoutKey (force re-render)                           │
│     Purpose: Reactive UI updates                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Update Flow:
1. API returns new workout
2. Save to localStorage (SYNC - immediate)
3. Update React state (triggers re-render)
4. Refresh page → Load from localStorage
```

**Why?** Ensures data persists even if state update or refresh happens before async operations complete.

---

## 📈 API Call Frequency

### **Typical User Session:**

```
1. Onboarding               → 1 API call  (workout generation)
2. Initial Weight Gen       → 8 API calls (avg 8 exercises)
3. Chat (5 messages)        → 5 API calls
4. Propose Workout Change   → 1 API call  (new workout)
5. Weight Gen (2 new)       → 2 API calls (only new exercises)
                              ─────────────
                              Total: 17 API calls per session
```

### **Token Usage Estimate:**

```
Workout Generation:     ~1,600 tokens
Weight Suggestions:     ~800 tokens each × 8 = ~6,400 tokens
Chat Messages:          ~950 tokens each × 5 = ~4,750 tokens
Workout Changes:        ~2,000 tokens
New Weight Gen:         ~800 tokens × 2 = ~1,600 tokens
                        ─────────────────────────────────────
                        Total: ~16,350 tokens per session
```

---

## 🎯 Architecture Strengths

✅ **Modular**: Each API route has a single responsibility  
✅ **Scalable**: Can easily add new workout types or features  
✅ **Robust**: Delimiter parsing handles LLM inconsistencies  
✅ **Efficient**: Selective weight generation reduces API calls by 60-70%  
✅ **Context-Aware**: Dynamic context updates from conversations  
✅ **Safe**: AI guidelines prevent dangerous exercise recommendations  
✅ **Auditable**: All API responses stored in database  

---

## 🔮 Future Architecture Improvements

1. **Caching Layer:**
   ```
   User A requests "chest workout" → Generate & Cache
   User B requests "chest workout" → Return from cache
   ```

2. **Batch Weight Generation:**
   ```
   Current: 8 exercises → 8 API calls
   Future:  8 exercises → 1 API call (batch request)
   ```

3. **Streaming Responses:**
   ```
   Current: Wait for full workout + all weights
   Future:  Stream workout → Stream weights as they generate
   ```

4. **Smart Context Compression:**
   ```
   Current: Send full chat history (grows over time)
   Future:  Summarize old messages, send summary + recent
   ```

---

**Last Updated:** October 26, 2025  
**Version:** 1.0.0


