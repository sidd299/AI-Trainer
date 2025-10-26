# AI Trainer - Prompt Examples

This document shows **real examples** of the exact prompts sent to Gemini API and the expected responses.

---

## Example 1: Initial Workout Generation

### **Input to `/api/workout`**

**User Context:**
```
Name: John Doe
Age: 25
Gender: Male
Weight: 75kg
Height: 180cm
Experience Level: Intermediate (6 months)
Fitness Goals: Build muscle, improve strength
Available Equipment: Gym (full equipment)
Workout Frequency: 5 days per week
Time per Session: 60 minutes
Injuries/Limitations: None
Recent Workouts:
- Yesterday: Chest and triceps (Bench press, Incline dumbbell press, Tricep pushdowns, Cable flyes)
- 2 days ago: Legs (Squats, Leg press, Leg curls, Calf raises)
Preferred Cardio: Running, basketball
```

### **Prompt Sent to Gemini:**

```markdown
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
Name: John Doe
Age: 25
Gender: Male
Weight: 75kg
Height: 180cm
Experience Level: Intermediate (6 months)
Fitness Goals: Build muscle, improve strength
Available Equipment: Gym (full equipment)
Workout Frequency: 5 days per week
Time per Session: 60 minutes
Injuries/Limitations: None
Recent Workouts:
- Yesterday: Chest and triceps (Bench press, Incline dumbbell press, Tricep pushdowns, Cable flyes)
- 2 days ago: Legs (Squats, Leg press, Leg curls, Calf raises)
Preferred Cardio: Running, basketball
```

### **Expected Response from Gemini:**

```json
{
  "today": [
    {
      "section": "Warmup",
      "exercises": [
        "5-minute light cardio (rowing or cycling)",
        "Arm circles - 10 each direction",
        "Shoulder dislocations with band - 10 reps",
        "Cat-cow stretches - 10 reps"
      ]
    },
    {
      "section": "Main Workout",
      "exercises": [
        "Pull-ups - 4 sets of 8-10 reps",
        "Barbell rows - 4 sets of 8-10 reps",
        "Dumbbell shoulder press - 3 sets of 10-12 reps",
        "Lateral raises - 3 sets of 12-15 reps",
        "Barbell bicep curls - 3 sets of 10-12 reps",
        "Hammer curls - 3 sets of 10-12 reps"
      ]
    },
    {
      "section": "Cardio",
      "exercises": [
        "Basketball shooting drills - 20 minutes"
      ]
    },
    {
      "section": "Cooldown",
      "exercises": [
        "Upper back and shoulder stretches - 5 minutes",
        "Deep breathing exercises - 3 minutes"
      ]
    }
  ],
  "ai_coach_tips": [
    "Avoiding push after yesterday's chest",
    "Back and shoulders for balanced development",
    "Pull movements for upper body strength",
    "Moderate volume for muscle growth",
    "Basketball for cardio enjoyment"
  ]
}
```

---

## Example 2: Weight Suggestion for Single Exercise

### **Input to `/api/suggest-weights-ai`**

```json
{
  "user_context": "Name: John Doe, Age: 25, Gender: Male, Weight: 75kg, Experience: Intermediate (6 months), Goals: Hypertrophy and strength",
  "exercise_details": "Pull-ups - 4 sets of 8-10 reps",
  "user_id": "user-123"
}
```

### **Prompt Sent to Gemini:**

```markdown
You are an expert strength coach and exercise physiologist. Your task is to suggest optimal sets, reps, and weights for exercises based on the user's profile and exercise details.

## User Profile Context:
Name: John Doe, Age: 25, Gender: Male, Weight: 75kg, Experience: Intermediate (6 months), Goals: Hypertrophy and strength

## Exercise Details:
Pull-ups - 4 sets of 8-10 reps

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
```

### **Expected Response from Gemini:**

```json
{
  "exercise_name": "Pull-ups",
  "sets": [
    {
      "id": "set-1",
      "type": "warmup",
      "reps": 10,
      "weight": 0,
      "completed": false
    },
    {
      "id": "set-2",
      "type": "working",
      "reps": 8,
      "weight": 0,
      "completed": false
    },
    {
      "id": "set-3",
      "type": "working",
      "reps": 8,
      "weight": 0,
      "completed": false
    },
    {
      "id": "set-4",
      "type": "working",
      "reps": 8,
      "weight": 0,
      "completed": false
    }
  ],
  "reasoning": "Pull-ups are a bodyweight exercise. At 75kg bodyweight with intermediate experience, you should be able to perform strict pull-ups with your own bodyweight. If needed, use assistance bands for warmup set. Progress by adding weighted vest or belt once bodyweight reps become easy.",
  "safety_notes": "Use full range of motion - chin over bar at top, full arm extension at bottom. Avoid swinging or kipping. Keep shoulders engaged throughout. If struggling, use resistance band assistance."
}
```

**Note:** For weighted exercises like barbell rows, the response would include actual weight values in kg.

---

## Example 3: Chat Conversation

### **Input to `/api/chat`**

```json
{
  "user_id": "user-123",
  "message": "I want to add more leg work today, can we add barbell squats and leg press?",
  "session_id": "session-456",
  "current_workout": { /* current workout JSON */ },
  "user_context": "Male, 25, intermediate, goals: muscle gain",
  "onboarding_context": "John Doe, 6 months experience, 5x/week training"
}
```

### **Prompt Sent to Gemini:**

```markdown
You are an AI fitness coach and personal trainer. You're having a conversation with a user about their workout plan and fitness goals.

Current Workout Plan:
{
  "today": [
    {
      "section": "Main Workout",
      "exercises": [
        "Pull-ups - 4 sets of 8-10 reps",
        "Barbell rows - 4 sets of 8-10 reps",
        "Dumbbell shoulder press - 3 sets of 10-12 reps",
        "Lateral raises - 3 sets of 12-15 reps"
      ]
    }
  ]
}

User Context (Dynamic - Updated with each conversation):
Male, 25, intermediate, goals: muscle gain

Original Onboarding Context:
John Doe, 6 months experience, 5x/week training, no injuries

Recent Chat History:
user: Hey coach
assistant: Hello! How can I help you with your workout today?

User's Current Message:
I want to add more leg work today, can we add barbell squats and leg press?

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
```

### **Expected Response from Gemini:**

```
<<<RESPONSE_START>>>
Great! Adding barbell squats and leg press is a smart move for leg development. I can definitely incorporate these compound movements for hypertrophy. Since you already have upper body exercises, I'll create a balanced push-pull-legs workout. Would you like me to update your plan?
<<<RESPONSE_END>>>
<<<CONTEXT_START>>>
preferences: barbell squats, leg press
goals: leg muscle development
<<<CONTEXT_END>>>
```

### **Parsed Result:**

```json
{
  "ai_response": "Great! Adding barbell squats and leg press is a smart move for leg development. I can definitely incorporate these compound movements for hypertrophy. Since you already have upper body exercises, I'll create a balanced push-pull-legs workout. Would you like me to update your plan?",
  "context_delta": {
    "preferences": ["barbell squats", "leg press"],
    "goals": ["leg muscle development"]
  },
  "should_propose_changes": true
}
```

---

## Example 4: Propose Workout Changes

### **Input to `/api/chat/propose-workout-changes`**

```json
{
  "session_id": "session-456",
  "user_id": "user-123",
  "change_request": "Add barbell squats and leg press"
}
```

### **Prompt Sent to Gemini:**

```markdown
You are an AI fitness coach. Based on the user's chat conversation, you need to generate a NEW workout plan that incorporates their feedback and requests.

## Current Workout Plan:
{
  "date": "2025-10-26",
  "today": [
    {
      "section": "Warmup",
      "exercises": ["Arm circles", "Shoulder dislocations"]
    },
    {
      "section": "Main Workout",
      "exercises": [
        "Pull-ups - 4 sets of 8-10 reps",
        "Barbell rows - 4 sets of 8-10 reps",
        "Dumbbell shoulder press - 3 sets of 10-12 reps",
        "Lateral raises - 3 sets of 12-15 reps"
      ]
    },
    {
      "section": "Cardio",
      "exercises": ["Basketball - 20 minutes"]
    },
    {
      "section": "Cooldown",
      "exercises": ["Stretching - 10 minutes"]
    }
  ]
}

## User Context (Dynamic - Updated with each conversation):
Male, 25, intermediate, goals: muscle gain, leg muscle development
Preferences: barbell squats, leg press

## Original Onboarding Context:
John Doe, 6 months experience, 5x/week training, no injuries

## Recent Chat History:
user: Hey coach
assistant: Hello! How can I help you with your workout today?
user: I want to add more leg work today, can we add barbell squats and leg press?
assistant: Great! Adding barbell squats and leg press is a smart move for leg development...

## User's Change Request:
Add barbell squats and leg press

## AI Guidelines:
[Full GUIDELINES content - same as Example 1]

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
      "exercises": ["Exercise 1", "Exercise 2"]
    },
    {
      "section": "Main Workout", 
      "exercises": ["Exercise 1", "Exercise 2", "Exercise 3"]
    },
    {
      "section": "Cardio",
      "exercises": ["Exercise 1"]
    },
    {
      "section": "Cooldown",
      "exercises": ["Exercise 1", "Exercise 2"]
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
```

### **Expected Response from Gemini:**

```json
{
  "today": [
    {
      "section": "Warmup",
      "exercises": [
        "5-minute light cardio",
        "Leg swings - 10 each leg",
        "Bodyweight squats - 15 reps",
        "Arm circles - 10 each direction"
      ]
    },
    {
      "section": "Main Workout",
      "exercises": [
        "Barbell Squats - 4 sets of 8-10 reps",
        "Leg Press - 4 sets of 10-12 reps",
        "Pull-ups - 3 sets of 8-10 reps",
        "Barbell rows - 3 sets of 8-10 reps",
        "Dumbbell shoulder press - 3 sets of 10-12 reps",
        "Lateral raises - 3 sets of 12-15 reps"
      ]
    },
    {
      "section": "Cardio",
      "exercises": [
        "Basketball - 20 minutes"
      ]
    },
    {
      "section": "Cooldown",
      "exercises": [
        "Quad stretch - 2 minutes each leg",
        "Hamstring stretch - 2 minutes each leg",
        "Upper body stretches - 3 minutes"
      ]
    }
  ],
  "ai_coach_tips": [
    "Added squats for quad development",
    "Leg press targets full lower body",
    "Reduced upper body volume for balance",
    "Hypertrophy rep ranges for growth",
    "Extended warmup for leg safety"
  ],
  "change_summary": "Added barbell squats and leg press to the main workout as requested. These compound leg movements are placed first for maximum energy and focus. Slightly reduced upper body volume to maintain balanced session length and prevent overtraining. Added leg-specific stretches to the cooldown."
}
```

---

## Summary: Prompt Characteristics

### **Workout Generation Prompt:**
- **Length:** ~1,200 tokens
- **Structure:** Guidelines + User Context
- **Output:** Structured JSON with 4 sections
- **Key Feature:** Detailed guardrails for safety and variety

### **Weight Suggestion Prompt:**
- **Length:** ~600 tokens
- **Structure:** Expert role + Guidelines + User/Exercise context
- **Output:** Sets with weights, reps, reasoning
- **Key Feature:** Experience-based progressive loading

### **Chat Prompt:**
- **Length:** ~800 tokens
- **Structure:** Conversational + Current state + History
- **Output:** Delimited response + context delta
- **Key Feature:** 60-70 word limit, context extraction

### **Workout Changes Prompt:**
- **Length:** ~1,500 tokens
- **Structure:** Full context + Guidelines + Change request
- **Output:** New workout + change summary
- **Key Feature:** Incorporates chat history and dynamic context

---

**Last Updated:** October 26, 2025  
**Gemini Model:** `gemini-2.0-flash`


