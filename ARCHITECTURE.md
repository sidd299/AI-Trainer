# AI Trainer Architecture Documentation

## 📐 System Overview

The AI Trainer application uses a **multi-step AI pipeline** with Google's Gemini API to generate personalized workout plans, suggest weights, and provide conversational coaching.

---

## 🔄 Data Flow Architecture

```
User Onboarding
    ↓
Generate Daily Workout Plan (API: /api/workout)
    ↓
Generate Weight Suggestions for ALL exercises (API: /api/suggest-weights-ai)
    ↓
Display Workout with Weights
    ↓
User Chats with AI Coach (API: /api/chat)
    ↓
AI Proposes Workout Changes (API: /api/chat/propose-workout-changes)
    ↓
User Confirms → Update Workout (API: /api/chat/confirm-workout-changes)
```

---

## 🔑 Key Components

### 1. **Gemini API Configuration**

**Base URL:** `https://generativelanguage.googleapis.com/v1beta/models`

**Model Fallback Chain (Priority Order):**
1. `gemini-2.0-flash` (Primary - faster, cheaper)
2. `gemini-1.5-flash` (Fallback)
3. `gemini-1.5-pro` (Fallback)
4. `gemini-pro` (Last resort)

**Rate Limiting Strategy:**
- 2-second delay between consecutive weight generation API calls
- Model availability testing before each major operation

**Generation Config (Standard):**
```json
{
  "temperature": 0.7,
  "topK": 40,
  "topP": 0.95,
  "maxOutputTokens": 1024
}
```

---

## 📝 Prompt Engineering Details

### **PROMPT 1: Daily Workout Generation** (`/api/workout`)

**Location:** `/Users/siddhantatrish/Desktop/AITrainerOctober/app/api/workout/route.ts` (Lines 298-303)

**Prompt Structure:**
```
${GUIDELINES}

User Context:
${context}
```

**Full Prompt Template:**

````markdown
You are a strength coach, and your goal is to suggest a personalized workout plan for **today** based on the user's inputs.

---

🏋️‍♂️ **Workout Structure:**
Divide the workout into the following sections:
1. Warmup
2. Main Workout
3. Cardio
4. Cooldown

💡 For Cardio: Consider if the user plays a sport or has any preferred form of cardio.

---

🧠 **Guardrails for Main Workout:**

**Fatigue & Split:**  
Understand the user's recent split and fatigue (from recent workouts). Avoid training the same muscle group as yesterday or over-fatiguing any area.

**Volume:**  
- Total exercises per session: 5–8  
- Exercises per muscle per day: ≤ 5  

**Variety:**  
Include different movement patterns within each muscle group.  
Vary across:
- **Type:** machine vs free weights  
- **Movement Type:** compound vs isolation  
- **Form:** standing / seated / incline / flat / decline / overhead / below-head  
- **Club:** press / fly / row / hinge / squat / lunge  
Avoid redundant selections (e.g., Barbell Bench Press + Dumbbell Bench Press).

**Difficulty Level (Based on Experience):**

- **Beginner (0–1 month):**  
  Exclude all barbell compound lifts (squat, deadlift, overhead press, barbell row), Olympic lifts, behind-the-neck variations, advanced core moves, and plyometrics.  
  Use stable, machine-based, or simple dumbbell/bodyweight exercises only.

- **Novice (1–3 months):**  
  Avoid Olympic lifts, behind-the-neck movements, advanced plyometrics, and very high-skill barbell lifts (snatch, clean & jerk).  
  You may introduce barbell squat, bench, and deadlift in light variations with strict form and low load.

---

🧾 **Final Output Format (JSON only):**

Return the plan in **this exact JSON format**:

{
  "today": [
    {
      "section": "Warmup",
      "exercises": [
        "Exercise 1",
        "Exercise 2"
      ]
    },
    {
      "section": "Main Workout",
      "exercises": [
        "Exercise 1",
        "Exercise 2",
        "Exercise 3"
      ]
    },
    {
      "section": "Cardio",
      "exercises": [
        "Exercise 1"
      ]
    },
    {
      "section": "Cooldown",
      "exercises": [
        "Exercise 1",
        "Exercise 2"
      ]
    }
  ],
  "ai_coach_tips": [
    "Avoiding chest after yesterday's workout",
    "Upper body focus for balanced training",
    "Compound movements for maximum efficiency",
    "Moderate volume prevents overtraining risk"
  ]
}

**AI Coach Tips Guidelines:**
- Provide 4-5 short reasoning explanations (5-6 words each)
- Explain WHY this specific workout was chosen based on the user's context
- Focus on training logic, recovery, balance, and progression
- Reference user's recent workouts, goals, and experience level
- Keep language simple and educational
- Examples: "Avoiding chest after yesterday", "Upper body for balance", "Compound for efficiency", "Beginner-safe exercises only", "Recovery day for legs"

Return only this JSON — no text or commentary.

User Context:
[User's onboarding data, experience level, goals, equipment, recent workouts, etc.]
````

**Expected Response Format:**
```json
{
  "today": [
    { "section": "Warmup", "exercises": [...] },
    { "section": "Main Workout", "exercises": [...] },
    { "section": "Cardio", "exercises": [...] },
    { "section": "Cooldown", "exercises": [...] }
  ],
  "ai_coach_tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
}
```

**Post-Processing:**
- JSON parsing with fallback to hardcoded workout if parsing fails
- Weight suggestions generated for ALL exercises (next step)

---

### **PROMPT 2: Weight Suggestions** (`/api/suggest-weights-ai`)

**Location:** `/Users/siddhantatrish/Desktop/AITrainerOctober/app/api/suggest-weights-ai/route.ts` (Lines 5-87)

**Prompt Structure:**
```
[System Instructions]
## User Profile Context:
{user_context}

## Exercise Details:
{exercise_details}

[Guidelines]

[Output Format]
```

**Full Prompt Template:**

````markdown
You are an expert strength coach and exercise physiologist. Your task is to suggest optimal sets, reps, and weights for exercises based on the user's profile and exercise details.

## User Profile Context:
{user_context}

## Exercise Details:
{exercise_details}

## Guidelines for Weight Suggestions:

### 1. **Experience-Based Recommendations:**
- **Beginner (0-1 month)**: Start with very light weights, focus on form
- **Novice (1-3 months)**: Light to moderate weights, building confidence
- **Intermediate (3-12 months)**: Moderate weights, progressive overload
- **Advanced (1+ years)**: Higher weights, advanced techniques

### 2. **Exercise-Specific Considerations:**
- **Compound movements** (squat, deadlift, bench press): Higher weight, lower reps
- **Isolation exercises** (curls, extensions): Lower weight, higher reps
- **Machine exercises**: Can handle slightly higher weights safely
- **Dumbbell exercises**: Consider unilateral strength differences

### 3. **Set and Rep Guidelines:**
- **Strength focus**: 3-5 sets, 4-6 reps, higher weight
- **Hypertrophy focus**: 3-4 sets, 8-12 reps, moderate weight
- **Endurance focus**: 2-3 sets, 15+ reps, lighter weight
- **Beginner focus**: 2-3 sets, 10-15 reps, very light weight

### 4. **Progressive Loading:**
- **Warmup sets**: 50-70% of working weight
- **Working sets**: 80-100% of target weight
- **Final set**: Can be 100-110% for advanced users

### 5. **Safety Considerations:**
- Never suggest weights that could cause injury
- Consider user's body weight for relative strength
- Account for gender differences in strength standards
- Ensure proper form can be maintained

## Output Format:
Return ONLY a JSON object with this exact structure:

{
  "exercise_name": "Exercise Name",
  "sets": [
    {
      "id": "set-1",
      "type": "warmup",
      "reps": 10,
      "weight": 20,
      "completed": false
    },
    {
      "id": "set-2", 
      "type": "working",
      "reps": 8,
      "weight": 30,
      "completed": false
    },
    {
      "id": "set-3",
      "type": "working", 
      "reps": 8,
      "weight": 30,
      "completed": false
    }
  ],
  "reasoning": "Brief explanation of why these weights were chosen (2-3 sentences)",
  "safety_notes": "Any important safety considerations for this exercise"
}

## Important Notes:
- Weight should be in kg
- Include 2-4 sets total
- First set should be warmup (50-70% of working weight)
- Subsequent sets should be working sets
- Consider the user's experience level and body weight
- Ensure weights are realistic and safe
- Provide reasoning for your choices

Return only the JSON, no additional text or formatting.
````

**Example Input:**
```json
{
  "user_context": "Male, 25 years old, 75kg, intermediate level (6 months experience), goal: hypertrophy, no injuries",
  "exercise_details": "Barbell Bench Press - 3 sets of 8-10 reps",
  "user_id": "user-123"
}
```

**Expected Response Format:**
```json
{
  "exercise_name": "Barbell Bench Press",
  "sets": [
    { "id": "set-1", "type": "warmup", "reps": 10, "weight": 40, "completed": false },
    { "id": "set-2", "type": "working", "reps": 8, "weight": 60, "completed": false },
    { "id": "set-3", "type": "working", "reps": 8, "weight": 60, "completed": false }
  ],
  "reasoning": "At 6 months experience, you can handle moderate loads. 60kg (~80% of estimated 1RM) is appropriate for hypertrophy in the 8-rep range. Warmup at 40kg ensures joints and muscles are prepared.",
  "safety_notes": "Keep feet planted, back arched slightly, and bar path straight over mid-chest. Use a spotter for safety."
}
```

**Post-Processing:**
- JSON cleaning (removes markdown fences)
- Stored in `weight_suggestions` table in Supabase
- Added to workout plan under `weight_suggestions` key

**Generation Strategy:**
- **Initial Workout:** Generate weights for ALL exercises
- **Workout Changes:** Only generate weights for NEW exercises (reuse existing for unchanged exercises)
- **Rate Limiting:** 2-second delay between consecutive calls

---

### **PROMPT 3: Chat Conversation** (`/api/chat`)

**Location:** `/Users/siddhantatrish/Desktop/AITrainerOctober/app/api/chat/route.ts` (Lines 71-108)

**Prompt Structure:**
```
[System Role]

Current Workout Plan:
${currentWorkout}

User Context (Dynamic):
${userContext}

Original Onboarding Context:
${onboardingContext}

Recent Chat History:
${chatHistory}

User's Current Message:
${userMessage}

[Instructions]

[Output Format with Delimiters]
```

**Full Prompt Template:**

````markdown
You are an AI fitness coach and personal trainer. You're having a conversation with a user about their workout plan and fitness goals.

Current Workout Plan:
{JSON of current workout with all exercises and sections}

User Context (Dynamic - Updated with each conversation):
{Dynamic user context - preferences, goals, constraints updated from chat}

Original Onboarding Context:
{Static onboarding summary from initial setup}

Recent Chat History:
{Last 5 messages: "user: message", "assistant: message"}

User's Current Message:
{User's latest message}

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

Only include context fields that have new information. Leave out empty fields.
````

**Example Response:**

```
<<<RESPONSE_START>>>
Great! Adding two leg exercises for hypertrophy is definitely doable. I'm thinking of adding barbell squats and leg press to really target those muscles. Would you like me to update your workout plan?
<<<RESPONSE_END>>>
<<<CONTEXT_START>>>
preferences: barbell squats, leg press
goals: leg hypertrophy
<<<CONTEXT_END>>>
```

**Post-Processing:**
1. **Extract AI Message:** Text between `<<<RESPONSE_START>>>` and `<<<RESPONSE_END>>>`
2. **Extract Context Delta:** Parse key-value pairs between `<<<CONTEXT_START>>>` and `<<<CONTEXT_END>>>`
3. **Merge Context:** Combine context delta with existing user context using `mergeContextParagraph()`
4. **Persist Context:** Update chat session in database
5. **Check for Changes:** If AI response contains keywords like "suggest", "modify", "add", "change", etc., set `should_propose_changes: true`

**Dynamic Context Management:**
- **Context Delta Format:**
  ```typescript
  {
    preferences?: string[],
    goals?: string[],
    constraints?: string[],
    dislikes?: string[],
    injuries?: string[],
    schedule?: string[],
    notes?: string
  }
  ```
- **Merging Strategy:** Append new values to existing lists, avoid duplicates
- **Storage:** Persisted in `chat_sessions.user_context` field

---

### **PROMPT 4: Propose Workout Changes** (`/api/chat/propose-workout-changes`)

**Location:** `/Users/siddhantatrish/Desktop/AITrainerOctober/app/api/chat/propose-workout-changes/route.ts` (Lines 20-99)

**Prompt Structure:**
```
[System Role]

## Current Workout Plan:
${currentWorkout}

## User Context (Dynamic):
${userContext}

## Original Onboarding Context:
${onboardingContext}

## Recent Chat History:
${chatHistory}

## User's Change Request:
${changeRequest}

## AI Guidelines:
${GUIDELINES}

[Instructions]

[Output Format]
```

**Full Prompt Template:**

````markdown
You are an AI fitness coach. Based on the user's chat conversation, you need to generate a NEW workout plan that incorporates their feedback and requests.

## Current Workout Plan:
{JSON of current workout plan with all sections}

## User Context (Dynamic - Updated with each conversation):
{Dynamic user context with preferences, goals, constraints}

## Original Onboarding Context:
{Static onboarding data}

## Recent Chat History:
{Last 10 messages from chat}

## User's Change Request:
{Specific change request that triggered this proposal}

## AI Guidelines:
[Full GUIDELINES content from aiGuidelines.ts - same as PROMPT 1]

## Instructions:
1. **Analyze the user's feedback** - What specific changes do they want?
2. **Generate a NEW workout plan** - Don't just modify the existing one, create a fresh plan
3. **Incorporate their preferences** - Use the updated user context and chat history
4. **Maintain safety** - Follow all the guidelines for their experience level
5. **Provide reasoning** - Explain why you made these changes

## Output Format:
Return ONLY a JSON object with this exact structure:

{
  "today": [
    {
      "section": "Warmup",
      "exercises": [
        "Exercise 1",
        "Exercise 2"
      ]
    },
    {
      "section": "Main Workout", 
      "exercises": [
        "Exercise 1",
        "Exercise 2",
        "Exercise 3"
      ]
    },
    {
      "section": "Cardio",
      "exercises": [
        "Exercise 1"
      ]
    },
    {
      "section": "Cooldown",
      "exercises": [
        "Exercise 1",
        "Exercise 2"
      ]
    }
  ],
  "ai_coach_tips": [
    "Tip 1 (5-6 words)",
    "Tip 2 (5-6 words)", 
    "Tip 3 (5-6 words)",
    "Tip 4 (5-6 words)"
  ],
  "change_summary": "Brief explanation of what changed and why (2-3 sentences)"
}

## Important Notes:
- Return only the JSON, no additional text or commentary
- Make sure the changes address the user's specific requests
- Keep the same structure but update exercises as needed
- Provide 4-5 AI coach tips that explain the reasoning behind the changes
- The change_summary should clearly explain what was modified

Return only the JSON object:
````

**Expected Response Format:**
```json
{
  "today": [
    { "section": "Warmup", "exercises": [...] },
    { "section": "Main Workout", "exercises": ["Barbell Squats", "Leg Press", ...] },
    { "section": "Cardio", "exercises": [...] },
    { "section": "Cooldown", "exercises": [...] }
  ],
  "ai_coach_tips": [
    "Added squats for quad development",
    "Leg press targets full lower body",
    "Hypertrophy rep ranges for growth",
    "Balanced with upper body work"
  ],
  "change_summary": "Added barbell squats and leg press to the main workout as requested. These compound movements will target the legs with 8-12 reps per set for hypertrophy, while maintaining balance with the existing upper body exercises."
}
```

**Post-Processing:**
1. **Generate Weights for NEW Exercises ONLY:**
   - Compare new workout with current workout
   - Identify exercises that don't exist in `current_workout.weight_suggestions`
   - Generate weights only for these new exercises (saves time + avoids rate limits)
   - Reuse existing weight suggestions for unchanged exercises
   - 2-second delay between weight generation calls

2. **Store Proposal:**
   - Saved in `workout_change_proposals` table
   - Status: `pending`
   - Includes: proposed workout, change summary, AI coach tips, weight suggestions

3. **Return to Frontend:**
   - Frontend displays proposal in confirmation dialog
   - User can accept or reject

---

## 🗄️ Database Schema

### **Key Tables:**

1. **`chat_sessions`**
   - `id`, `user_id`, `session_name`, `created_at`, `updated_at`
   - `current_workout` (JSONB)
   - `user_context` (TEXT) - Dynamic, updated from chat
   - `onboarding_context` (TEXT) - Static, from initial setup

2. **`chat_messages`**
   - `id`, `session_id`, `user_id`, `message_type`, `content`, `metadata`, `created_at`

3. **`workout_change_proposals`**
   - `id`, `session_id`, `user_id`, `proposed_workout` (JSONB), `change_summary`, `ai_coach_tips`, `weight_suggestions`, `status`, `created_at`

4. **`weight_suggestions`**
   - `id`, `user_id`, `exercise_name`, `exercise_details`, `suggested_weight`, `sets` (JSONB), `user_context`, `user_profile`, `calculation_details`, `created_at`

5. **`gemini_responses`** (Audit Trail)
   - `id`, `user_id`, `prompt`, `response`, `type`, `created_at`

---

## 🎯 Key Features

### **1. Dynamic Context Management**

The system maintains TWO types of context:

- **Onboarding Context (Static):** User's initial setup data (age, weight, goals, experience, equipment, etc.)
- **User Context (Dynamic):** Updated continuously from chat conversations
  - Format: Paragraph text with key information
  - Updated via `mergeContextParagraph()` function
  - Persisted in `chat_sessions.user_context`
  - Used in ALL subsequent AI calls

**Context Merging Logic:**
```typescript
function mergeContextParagraph(existingContext: string, delta: ContextDelta): string {
  // 1. Parse existing context into structured format
  // 2. Merge new values from delta
  // 3. Remove duplicates
  // 4. Convert back to paragraph format
  // 5. Return updated context
}
```

### **2. Workout Change Flow**

```
User: "Add barbell squats and leg press"
    ↓
Chat API (/api/chat) → Detects change request → Returns should_propose_changes: true
    ↓
Frontend: Calls /api/chat/propose-workout-changes
    ↓
Backend: Generates new workout + weights for new exercises only
    ↓
Frontend: Shows confirmation dialog with change summary + new exercises
    ↓
User: Clicks "Confirm Changes"
    ↓
Frontend: Calls /api/chat/confirm-workout-changes
    ↓
Backend: Marks proposal as accepted, returns new workout
    ↓
Frontend: Updates workout state + localStorage + closes chat + refreshes page
    ↓
User: Sees updated workout immediately
```

### **3. Weight Generation Optimization**

**Problem:** Generating weights for all exercises is slow and hits rate limits

**Solution:**
- **Initial Workout:** Generate for ALL exercises (unavoidable)
- **Workout Modifications:** Generate ONLY for NEW exercises
- **Reuse:** Keep existing weight suggestions for unchanged exercises
- **Rate Limiting:** 2-second delay between API calls
- **Model Change:** Switched from `gemini-2.0-flash-exp` to `gemini-2.0-flash` (more stable)

**Example:**
```
Current Workout: [Exercise A, Exercise B, Exercise C] (all have weights)
User Request: "Add Exercise D and Exercise E"
New Workout: [Exercise A, Exercise B, Exercise D, Exercise E]

Weight Generation:
✅ Exercise A: Reuse existing
✅ Exercise B: Reuse existing
🔄 Exercise D: Generate new (2s delay)
🔄 Exercise E: Generate new (2s delay)

Result: Only 2 API calls instead of 5
```

---

## 🔧 Configuration Files

### **Environment Variables (.env.local)**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your Vercel URL
```

### **Key Files**

- **API Routes:**
  - `/app/api/workout/route.ts` - Initial workout generation
  - `/app/api/suggest-weights-ai/route.ts` - Weight suggestions
  - `/app/api/chat/route.ts` - Chat conversation
  - `/app/api/chat/propose-workout-changes/route.ts` - Workout modifications
  - `/app/api/chat/confirm-workout-changes/route.ts` - Accept/reject changes

- **Libraries:**
  - `/lib/aiGuidelines.ts` - Shared AI prompts
  - `/lib/chatContext.ts` - Context merging logic
  - `/lib/gemini.ts` - Gemini API utilities
  - `/lib/supabaseClient.ts` - Supabase client
  - `/lib/workoutActions.ts` - Workout transformation logic

- **Components:**
  - `/components/TodayWorkout.tsx` - Main workout display
  - `/components/InlineChatStrip.tsx` - Chat trigger
  - `/components/ChatWindow.tsx` - Chat interface
  - `/components/ConfirmationDialog.tsx` - Workout change confirmation

- **Main Page:**
  - `/app/page.tsx` - Application entry point, state management

---

## 📊 Prompt Token Estimates

| Prompt Type | Avg Input Tokens | Avg Output Tokens | Total |
|------------|------------------|-------------------|-------|
| Daily Workout | ~1,200 | ~400 | ~1,600 |
| Weight Suggestion (per exercise) | ~600 | ~200 | ~800 |
| Chat Message | ~800 | ~150 | ~950 |
| Workout Changes | ~1,500 | ~500 | ~2,000 |

**Note:** Actual token counts vary based on user context length and chat history.

---

## 🚀 Deployment Checklist

### **Vercel Environment Variables:**

Ensure these are set in Vercel dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_GEMINI_API_KEY
```

### **Supabase Setup:**

1. Create all required tables (see database schema)
2. Enable Row Level Security (RLS) policies
3. Set up storage buckets if needed
4. Configure API keys

---

## 🐛 Common Issues & Fixes

### **1. "supabaseUrl is required" Error**
- **Cause:** Environment variables not set in Vercel
- **Fix:** Add env vars in Vercel dashboard, redeploy

### **2. Rate Limit Exceeded (429)**
- **Cause:** Too many Gemini API calls
- **Fix:** Implemented 2-second delays, changed to `gemini-2.0-flash`

### **3. Workout Changes Not Reflecting**
- **Cause:** Async state updates, localStorage timing
- **Fix:** Save to localStorage BEFORE state update and page refresh

### **4. LLM Returning Raw JSON in Chat**
- **Cause:** LLM wrapping response in markdown fences
- **Fix:** Delimiter-based parsing (`<<<RESPONSE_START>>>`, etc.)

---

## 📈 Recent Improvements (October 2025)

### ✅ **Batch Weight Generation API** (Implemented)
- **New Endpoint:** `/api/suggest-weights-batch`
- **Benefit:** Generate weights for ALL exercises in ONE API call
- **Performance:** ~80-90% faster than individual calls
- **Fallback:** Automatically falls back to individual calls if batch fails
- **Usage:** 
  ```javascript
  POST /api/suggest-weights-batch
  {
    "user_context": "...",
    "exercises": ["Exercise 1", "Exercise 2", "Exercise 3"],
    "user_id": "..."
  }
  ```

### ✅ **Enhanced Weight Guidelines** (Implemented)
- **Equipment-specific calculations:**
  - Dumbbells: Weight for ONE dumbbell (user holds two)
  - Barbells: Includes 20kg bar weight
- **Gym-realistic rounding:**
  - Dumbbells: 2.5kg increments
  - Barbells: 5kg increments (multiples of 5)
- **Intelligent set progression:** No duplicate sets with same weight/reps
- **Warmup requirements:**
  - Compound exercises: 2 warmup + 3 working sets
  - Isolation/Machine: 3 working sets only
- **Strength standards:** Based on bodyweight multipliers for 30+ exercises

### 🔮 Future Improvements

1. **Caching:** Cache workout plans and weight suggestions for faster load times
2. **Progressive Enhancement:** Load workout first, then stream weight suggestions
3. **Context Compression:** Summarize chat history to reduce token usage
4. **User Feedback Loop:** Learn from user's weight adjustments to improve suggestions
5. **Real-time Progress Tracking:** Show "Generating weights..." status in UI

---

**Last Updated:** October 26, 2025  
**Version:** 1.0.0  
**Gemini Model:** `gemini-2.0-flash`


