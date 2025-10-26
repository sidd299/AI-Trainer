# Onboarding API Documentation

## Overview

The onboarding API endpoint allows you to submit user onboarding data and automatically process it using AI to extract structured information for personalized workout recommendations.

## Endpoint

```
POST /api/onboarding
```

## Request Format

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "userId": "string",
  "paragraph": "string"
}
```

### Parameters
- `userId` (required): Unique identifier for the user
- `paragraph` (required): Raw onboarding text describing user's fitness goals, preferences, and constraints

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "sessionId": "uuid",
  "summary": "AI-generated structured summary",
  "message": "Onboarding data processed successfully"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": "Missing required fields: userId and paragraph are required"
}
```

#### 405 Method Not Allowed
```json
{
  "error": "Method not allowed. Use POST to submit onboarding data."
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Example Usage

### JavaScript/TypeScript
```typescript
const response = await fetch('/api/onboarding', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'user_123',
    paragraph: 'I am a 25-year-old software developer who wants to build muscle. I prefer home workouts with dumbbells and can work out 4 times per week for 45 minutes. I have some lower back issues.'
  }),
});

const result = await response.json();
console.log(result);
```

### cURL
```bash
curl -X POST http://localhost:3000/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "paragraph": "I am a 25-year-old software developer who wants to build muscle. I prefer home workouts with dumbbells and can work out 4 times per week for 45 minutes. I have some lower back issues."
  }'
```

## What the API Does

1. **Validates Input**: Ensures required fields are present and properly formatted
2. **Generates AI Summary**: Uses Google Gemini to analyze the onboarding text and extract structured information about:
   - Fitness goals
   - Preferred workout types/splits
   - Equipment preferences
   - Experience level
   - Specific preferences or constraints
3. **Stores Data**: 
   - Creates a chat session with the raw onboarding message
   - Updates the user record with the AI-generated summary
   - Marks onboarding as completed
4. **Returns Results**: Provides the session ID and generated summary

## Database Schema Requirements

The API works with your existing Supabase tables:

### `users` table
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  onboarding_info JSONB,
  chat_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `embeddings` table (pgvector)
```sql
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content TEXT,
  embedding VECTOR(1536),
  type TEXT, -- 'chat', 'summary', 'exercise', etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Row Level Security (RLS)

**Important**: Your Supabase tables have Row Level Security enabled. To allow the API to insert data, you need to either:

1. **Disable RLS temporarily** (for development):
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE embeddings DISABLE ROW LEVEL SECURITY;
   ```

2. **Create appropriate RLS policies** (recommended for production):
   ```sql
   -- Allow service role to insert/update users
   CREATE POLICY "Allow service role access" ON users
   FOR ALL USING (auth.role() = 'service_role');
   
   -- Allow service role to insert embeddings
   CREATE POLICY "Allow service role access" ON embeddings
   FOR ALL USING (auth.role() = 'service_role');
   ```

The API will continue to work even if database operations fail, providing graceful fallbacks.

## Testing

Run the test script to verify the API works correctly:

```bash
# Make sure your Next.js dev server is running first
npm run dev

# In another terminal, run the test
npx tsx scripts/testOnboardingAPI.ts
```

## Environment Variables Required

Make sure these environment variables are set in your `.env.local`:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Error Handling

The API includes comprehensive error handling for:
- Missing or invalid request data
- Database connection issues
- AI service failures (with fallback to simple summary)
- Network timeouts
- Invalid HTTP methods

## Rate Limits

Be aware of Google Gemini API rate limits when processing multiple onboarding requests. The API includes error handling for quota exceeded scenarios.
