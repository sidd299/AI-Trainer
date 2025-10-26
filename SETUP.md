# AI Trainer Setup Guide

## Gemini AI Integration Setup

To enable the AI chat functionality, you need to set up a Gemini API key:

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Create the environment file
touch .env.local
```

Add your API key to the file:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Restart the Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Enhanced AI Context

The AI now has a comprehensive fixed context that includes:

### Professional Expertise
- Certified personal trainer with 10+ years of experience
- Specializes in functional fitness, strength training, and injury prevention
- Understands different fitness levels (beginner, intermediate, advanced)
- Prioritizes safety, proper form, and progressive overload

### Workout Structure Knowledge
- **Warmup**: Dynamic movements (5-10 minutes)
- **Main Workout**: Strength training and compound movements (20-40 minutes)
- **Cardio**: High-intensity intervals or steady-state cardio (10-20 minutes)
- **Cooldown**: Static stretching and recovery (5-10 minutes)

### Exercise Categories
- **Strength**: Compound movements (squats, push-ups, rows, planks)
- **Cardio**: High-intensity exercises (burpees, jumping jacks, mountain climbers)
- **Warmup**: Dynamic movements (arm circles, leg swings, jumping jacks)
- **Cooldown**: Static stretches (hip flexor, shoulder, cat-cow)

### Progression Principles
- **Beginners**: Focus on form, bodyweight exercises, 8-12 reps
- **Intermediate**: Add resistance, 10-15 reps, 2-3 sets
- **Advanced**: Higher intensity, 6-12 reps, 3-4 sets

## Chat Features

Once set up, you can use the AI chat to:

### Exercise Management
- **Add exercises**: "Add more push-ups to my workout"
- **Remove exercises**: "Remove burpees from cardio"
- **Swap exercises**: "Replace squats with lunges"
- **Modify exercises**: "Make push-ups easier" or "Increase squat weight"

### Set Modifications
- **Add sets**: "Add 2 more sets to push-ups"
- **Modify reps/weights**: "Increase push-up reps by 5" or "Add 10 lbs to squats"
- **Adjust difficulty**: "Make this workout easier" or "Make it more challenging"

### General Requests
- **Workout advice**: "I'm feeling tired today"
- **Goal-based changes**: "I want to focus on strength training"
- **Time constraints**: "I only have 20 minutes today"

## Example Conversations

**User**: "Add more cardio to my workout"
**AI**: "I'll add some high-intensity cardio exercises to boost your heart rate and burn more calories!"

**User**: "Make push-ups easier"
**AI**: "I'll reduce the reps for your push-ups to make them more manageable. You can always increase them as you get stronger!"

**User**: "I want to focus on my core today"
**AI**: "Perfect! Let me add some targeted core exercises and increase the intensity of your existing core work."

## Troubleshooting

### Chat Not Working
- Ensure your API key is correctly set in `.env.local`
- Check that the development server has been restarted
- Verify your internet connection

### API Key Issues
- Make sure you're using the correct API key format
- Check that your Google AI Studio account has API access enabled
- Ensure the key has the necessary permissions

### Performance
- The AI responses may take a few seconds to generate
- Large workout modifications might take longer to process
- If responses are slow, try breaking down complex requests into smaller parts

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your API key secure and don't share it publicly
- The API key is only used client-side for this demo - in production, consider server-side implementation
