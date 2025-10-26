# Weight Suggestion Examples

This document shows real examples of weight suggestions based on the updated guidelines with strength standards, equipment-specific calculations, and intelligent set progression.

---

## Example 1: Dumbbell Lunges (Male, Intermediate, 75kg bodyweight)

### **Request:**
```json
{
  "user_context": "Male, 25 years old, 75kg bodyweight, Intermediate (6 months), Goal: Hypertrophy",
  "exercise_details": "Dumbbell Lunges",
  "user_id": "user-123"
}
```

### **Expected Response:**

```json
{
  "exercise_name": "Dumbbell Lunges",
  "sets": [
    {
      "id": "set-1",
      "type": "working",
      "reps": 12,
      "weight": 20,
      "completed": false
    },
    {
      "id": "set-2",
      "type": "working",
      "reps": 10,
      "weight": 22.5,
      "completed": false
    },
    {
      "id": "set-3",
      "type": "working",
      "reps": 8,
      "weight": 22.5,
      "completed": false
    }
  ],
  "reasoning": "Based on intermediate standards (0.28×BW), suggested 20-22.5kg per dumbbell. Started with 20kg for higher reps, progressed to 22.5kg. Weight represents ONE dumbbell (you'll use two).",
  "safety_notes": "Keep torso upright, step far enough forward so knee doesn't pass toes. Control the descent and drive through front heel. Use dumbbells for better balance than barbell."
}
```

**Key Points:**
- ✅ Weight is for **ONE dumbbell** (user holds one in each hand)
- ✅ Rounded to **2.5kg increments** (gym equipment)
- ✅ **No warmup sets** (isolation exercise)
- ✅ **Intelligent progression:** 20kg×12, 22.5kg×10, 22.5kg×8 (no duplicates)
- ✅ Calculation: 75kg × 0.28 = 21kg ≈ 20-22.5kg range

---

## Example 2: Leg Press (Male, Intermediate, 75kg bodyweight)

### **Request:**
```json
{
  "user_context": "Male, 25 years old, 75kg bodyweight, Intermediate (6 months), Goal: Strength and Hypertrophy",
  "exercise_details": "Leg Press",
  "user_id": "user-123"
}
```

### **Expected Response:**

```json
{
  "exercise_name": "Leg Press",
  "sets": [
    {
      "id": "set-1",
      "type": "working",
      "reps": 12,
      "weight": 140,
      "completed": false
    },
    {
      "id": "set-2",
      "type": "working",
      "reps": 10,
      "weight": 150,
      "completed": false
    },
    {
      "id": "set-3",
      "type": "working",
      "reps": 8,
      "weight": 150,
      "completed": false
    }
  ],
  "reasoning": "Intermediate standard (1.925×BW) suggests ~145kg. Started at 140kg for volume work, progressed to 150kg for final sets. Machine exercise allows safe higher loading.",
  "safety_notes": "Keep lower back pressed against pad throughout. Don't lock out knees at top. Control the descent, don't let weight slam down. Foot placement affects muscle emphasis - mid-foot for balanced development."
}
```

**Key Points:**
- ✅ **Machine exercise** (can use any weight, no special rounding)
- ✅ **No warmup sets** (machine provides stability)
- ✅ **Intelligent progression:** 140kg×12, 150kg×10, 150kg×8
- ✅ Calculation: 75kg × 1.925 = 144kg ≈ 140-150kg range
- ✅ Higher weight appropriate for leg press vs free weights

---

## Example 3: Seated Machine Leg Curl (Female, Novice, 60kg bodyweight)

### **Request:**
```json
{
  "user_context": "Female, 23 years old, 60kg bodyweight, Novice (2 months), Goal: Toning and fitness",
  "exercise_details": "Seated Leg Curl",
  "user_id": "user-456"
}
```

### **Expected Response:**

```json
{
  "exercise_name": "Seated Leg Curl",
  "sets": [
    {
      "id": "set-1",
      "type": "working",
      "reps": 15,
      "weight": 18,
      "completed": false
    },
    {
      "id": "set-2",
      "type": "working",
      "reps": 12,
      "weight": 20,
      "completed": false
    },
    {
      "id": "set-3",
      "type": "working",
      "reps": 10,
      "weight": 22,
      "completed": false
    }
  ],
  "reasoning": "Novice female standard (0.315×BW ≈ 19kg). Started lighter at 18kg for higher reps to build confidence, progressive overload to 22kg. Isolation exercise focuses on hamstring development.",
  "safety_notes": "Adjust pad so it sits just above heels. Keep hips pressed against seat. Curl smoothly without jerking. Pause at peak contraction. Don't hyperextend knees when returning."
}
```

**Key Points:**
- ✅ **Female standards** (typically 60-70% of male)
- ✅ **Machine exercise** (direct 3 working sets)
- ✅ **Intelligent progression:** 18kg×15, 20kg×12, 22kg×10 (rep decrease, weight increase)
- ✅ Calculation: 60kg × 0.315 = 18.9kg ≈ 18-22kg range
- ✅ Novice level: lighter weights, higher reps, focus on form

---

## Example 4: Machine Leg Extension (Male, Beginner, 70kg bodyweight)

### **Request:**
```json
{
  "user_context": "Male, 30 years old, 70kg bodyweight, Beginner (2 weeks), Goal: General fitness, no gym experience",
  "exercise_details": "Machine Leg Extension",
  "user_id": "user-789"
}
```

### **Expected Response:**

```json
{
  "exercise_name": "Machine Leg Extension",
  "sets": [
    {
      "id": "set-1",
      "type": "working",
      "reps": 15,
      "weight": 22,
      "completed": false
    },
    {
      "id": "set-2",
      "type": "working",
      "reps": 12,
      "weight": 25,
      "completed": false
    },
    {
      "id": "set-3",
      "type": "working",
      "reps": 12,
      "weight": 25,
      "completed": false
    }
  ],
  "reasoning": "Beginner standard (0.35×BW ≈ 24.5kg). Very light starting weight to learn movement pattern and build confidence. Machine provides safety and stability for learning proper quad engagement.",
  "safety_notes": "IMPORTANT: Adjust pad so it sits on lower shin, just above ankles. Keep back pressed against pad. Extend legs smoothly without jerking or swinging. Don't hyperextend knees - stop just before lockout. This is a knee-isolating exercise, so start very light to protect joints."
}
```

**Key Points:**
- ✅ **Beginner level:** Very conservative weights
- ✅ **Machine exercise:** Safe for learning
- ✅ **Higher reps:** 12-15 for motor learning
- ✅ Calculation: 70kg × 0.35 = 24.5kg ≈ 22-25kg
- ✅ **Emphasis on safety** in notes
- ✅ Last two sets same weight (beginner consistency)

---

## Example 5: Batch Request for Leg Day

### **Request:**
```json
{
  "user_context": "Male, 25 years old, 75kg bodyweight, Intermediate (6 months), Goal: Hypertrophy",
  "exercises": [
    "Barbell Squats",
    "Leg Press",
    "Dumbbell Lunges",
    "Seated Leg Curl",
    "Machine Leg Extension",
    "Standing Calf Raises"
  ],
  "user_id": "user-123"
}
```

### **Expected Response:**

```json
{
  "exercises": [
    {
      "exercise_name": "Barbell Squats",
      "sets": [
        {
          "id": "set-1",
          "type": "warmup",
          "reps": 10,
          "weight": 40,
          "completed": false
        },
        {
          "id": "set-2",
          "type": "warmup",
          "reps": 8,
          "weight": 55,
          "completed": false
        },
        {
          "id": "set-3",
          "type": "working",
          "reps": 8,
          "weight": 75,
          "completed": false
        },
        {
          "id": "set-4",
          "type": "working",
          "reps": 6,
          "weight": 80,
          "completed": false
        },
        {
          "id": "set-5",
          "type": "working",
          "reps": 6,
          "weight": 80,
          "completed": false
        }
      ],
      "reasoning": "Intermediate standard (1.05×BW ≈ 79kg including bar). Two warmup sets prepare joints and CNS. Working weight 75-80kg for hypertrophy range. Barbell weight (20kg) included in total.",
      "safety_notes": "COMPOUND EXERCISE - requires proper form. Keep chest up, core tight, knees tracking over toes. Depth to parallel or below. Use squat rack with safety bars. Consider belt for heavier sets."
    },
    {
      "exercise_name": "Leg Press",
      "sets": [
        {
          "id": "set-1",
          "type": "working",
          "reps": 12,
          "weight": 140,
          "completed": false
        },
        {
          "id": "set-2",
          "type": "working",
          "reps": 10,
          "weight": 150,
          "completed": false
        },
        {
          "id": "set-3",
          "type": "working",
          "reps": 8,
          "weight": 150,
          "completed": false
        }
      ],
      "reasoning": "Machine exercise, no warmup needed after squats. 1.925×BW ≈ 144kg. Progressive overload from 140kg to 150kg.",
      "safety_notes": "Lower back pressed against pad. Don't lock knees. Control the descent."
    },
    {
      "exercise_name": "Dumbbell Lunges",
      "sets": [
        {
          "id": "set-1",
          "type": "working",
          "reps": 12,
          "weight": 20,
          "completed": false
        },
        {
          "id": "set-2",
          "type": "working",
          "reps": 10,
          "weight": 22.5,
          "completed": false
        },
        {
          "id": "set-3",
          "type": "working",
          "reps": 8,
          "weight": 22.5,
          "completed": false
        }
      ],
      "reasoning": "0.28×BW ≈ 21kg per dumbbell. Weight shown is for ONE dumbbell. Rounded to 2.5kg increments.",
      "safety_notes": "Keep torso upright, step far enough forward. One dumbbell in each hand."
    },
    {
      "exercise_name": "Seated Leg Curl",
      "sets": [
        {
          "id": "set-1",
          "type": "working",
          "reps": 12,
          "weight": 35,
          "completed": false
        },
        {
          "id": "set-2",
          "type": "working",
          "reps": 10,
          "weight": 40,
          "completed": false
        },
        {
          "id": "set-3",
          "type": "working",
          "reps": 10,
          "weight": 40,
          "completed": false
        }
      ],
      "reasoning": "0.7×BW ≈ 52.5kg for intermediate. Started conservative at 35kg as hamstrings are pre-fatigued from squats and lunges.",
      "safety_notes": "Pad above heels, hips pressed down. Smooth curling motion, pause at peak."
    },
    {
      "exercise_name": "Machine Leg Extension",
      "sets": [
        {
          "id": "set-1",
          "type": "working",
          "reps": 15,
          "weight": 60,
          "completed": false
        },
        {
          "id": "set-2",
          "type": "working",
          "reps": 12,
          "weight": 65,
          "completed": false
        },
        {
          "id": "set-3",
          "type": "working",
          "reps": 10,
          "weight": 65,
          "completed": false
        }
      ],
      "reasoning": "0.875×BW ≈ 66kg. Higher reps (15-12-10) for quad isolation at end of workout. Quads pre-fatigued from compound work.",
      "safety_notes": "Pad on lower shin. Don't hyperextend. Isolation exercise - control over weight."
    },
    {
      "exercise_name": "Standing Calf Raises",
      "sets": [
        {
          "id": "set-1",
          "type": "working",
          "reps": 20,
          "weight": 85,
          "completed": false
        },
        {
          "id": "set-2",
          "type": "working",
          "reps": 15,
          "weight": 90,
          "completed": false
        },
        {
          "id": "set-3",
          "type": "working",
          "reps": 12,
          "weight": 90,
          "completed": false
        }
      ],
      "reasoning": "Calves respond well to higher reps. 1.225×BW ≈ 92kg. Started at 85kg for 20 reps, increased to 90kg for final sets.",
      "safety_notes": "Full range of motion - stretch at bottom, peak contraction at top. Stand on edge of platform. Keep knees straight but not locked."
    }
  ]
}
```

**Key Points:**
- ✅ **Batch processing:** All 6 exercises in ONE API call (~5-10 seconds)
- ✅ **Compound exercise (Squats):** 2 warmup + 3 working sets
- ✅ **Isolation/Machine exercises:** Direct 3 working sets
- ✅ **Intelligent progression:** Every exercise has unique set/rep scheme
- ✅ **Equipment-specific:**
  - Barbell Squats: 20kg bar included, rounded to 5kg (40, 55, 75, 80)
  - Dumbbell Lunges: Per-dumbbell weight, 2.5kg rounding (20, 22.5, 22.5)
  - Machines: Any weight (no special rounding)
- ✅ **Fatigue consideration:** Later exercises have more conservative weights
- ✅ **Individual reasoning:** Each exercise has specific justification

---

## Comparison: Old vs New

### **OLD METHOD (Individual API Calls):**
```
Exercise 1: API Call → 2s → Response
Wait 2s (rate limit)
Exercise 2: API Call → 2s → Response
Wait 2s (rate limit)
Exercise 3: API Call → 2s → Response
Wait 2s (rate limit)
Exercise 4: API Call → 2s → Response
Wait 2s (rate limit)
Exercise 5: API Call → 2s → Response
Wait 2s (rate limit)
Exercise 6: API Call → 2s → Response

Total time: ~24 seconds
Total API calls: 6
```

### **NEW METHOD (Batch API):**
```
All 6 exercises: API Call → 5-8s → Response

Total time: ~5-8 seconds
Total API calls: 1
Speed improvement: 67-80% faster
```

---

## Strength Standards Reference

### **Legs (Multiplier × Bodyweight)**

| Exercise | Male Beginner | Male Novice | Male Intermediate | Female Beginner | Female Novice | Female Intermediate |
|----------|--------------|-------------|------------------|----------------|--------------|-------------------|
| **Squats** | 0.525× | 0.875× | 1.05× | 0.35× | 0.525× | 0.875× |
| **Leg Press** | 0.7× | 1.225× | 1.925× | 0.35× | 0.875× | 1.4× |
| **Leg Extension** | 0.35× | 0.525× | 0.875× | 0.175× | 0.35× | 0.7× |
| **Seated Leg Curl** | 0.35× | 0.525× | 0.7× | 0.175× | 0.315× | 0.525× |
| **Dumbbell Lunges** | 0.07× | 0.14× | 0.28× | 0.07× | 0.14× | 0.21× |
| **Goblet Squat** | 0.14× | 0.245× | 0.385× | 0.105× | 0.175× | 0.28× |
| **Calf Raises** | 0.35× | 0.7× | 1.225× | 0.175× | 0.525× | 0.875× |

### **Back (Multiplier × Bodyweight)**

| Exercise | Male Beginner | Male Novice | Male Intermediate | Female Beginner | Female Novice | Female Intermediate |
|----------|--------------|-------------|------------------|----------------|--------------|-------------------|
| **Barbell Row** | 0.35× | 0.525× | 0.7× | 0.175× | 0.28× | 0.455× |
| **Lat Pull Down** | 0.35× | 0.525× | 0.7× | 0.21× | 0.315× | 0.49× |
| **Dumbbell Row** | 0.14× | 0.245× | 0.385× | 0.07× | 0.14× | 0.245× |
| **Seated Cable Row** | 0.35× | 0.525× | 0.7× | 0.21× | 0.35× | 0.525× |
| **Barbell Shrug** | 0.35× | 0.7× | 1.05× | 0.175× | 0.35× | 0.7× |

---

## Key Features Summary

✅ **Equipment-Specific Weights:**
- Dumbbells: Weight for ONE dumbbell (user holds two)
- Barbells: Includes 20kg bar weight
- Machines/Cables: Total weight on stack

✅ **Gym-Realistic Rounding:**
- Dumbbells: 2.5kg, 5kg, 7.5kg, 10kg, 12.5kg, 15kg...
- Barbells: 20kg (bar) + multiples of 5kg plates (25kg, 30kg, 35kg...)
- Machines: No special rounding (standard gym increments)

✅ **Intelligent Set Progression:**
- ❌ BAD: 60kg×10, 60kg×10, 60kg×10 (all identical)
- ✅ GOOD: 60kg×12, 65kg×10, 65kg×8 (progressive overload)
- ✅ GOOD: 70kg×10, 70kg×9, 65kg×12 (drop set)

✅ **Warmup Requirements:**
- Compound exercises (squat, deadlift, bench, rows): 2 warmup + 3 working sets
- Isolation exercises (curls, extensions, raises): 3 working sets only
- Machine exercises: 3 working sets only

✅ **Experience-Based Standards:**
- Beginner: Very light, focus on form
- Novice: Light to moderate, building confidence
- Intermediate: Moderate, progressive overload
- Advanced: Higher weights, advanced techniques

✅ **Gender Adjustments:**
- Female standards: ~60-70% of male standards
- Adjusted for natural strength differences
- Same form and safety principles apply

---

**Last Updated:** October 26, 2025  
**Version:** 2.0.0 (Batch API + Enhanced Guidelines)

