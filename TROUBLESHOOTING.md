# Gemini API Troubleshooting Guide

## 404 Errors in Gemini API Dashboard

If you're seeing 404 errors in your Google Gemini API dashboard, here are the most common causes and solutions:

### 1. **API Key Format Issues**

**Problem**: API key is not in the correct format
**Solution**: 
- Your API key should start with `AIzaSy`
- It should be 39 characters long
- Make sure there are no extra spaces or characters

**Check your `.env.local` file:**
```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. **API Key Not Activated**

**Problem**: API key exists but isn't activated
**Solution**:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Make sure your API key is active
3. Check if you have the necessary permissions
4. Try creating a new API key if the current one isn't working

### 3. **Model Name Issues**

**Problem**: Using wrong model name
**Solution**: The app uses `gemini-1.5-flash` model. Make sure this model is available in your region.

### 4. **Rate Limiting**

**Problem**: Too many requests
**Solution**: 
- Wait a few minutes before trying again
- Check your API quota in the dashboard
- Consider upgrading your plan if needed

### 5. **Network/Firewall Issues**

**Problem**: Network blocking the requests
**Solution**:
- Check your internet connection
- Try from a different network
- Check if your firewall is blocking the requests

## Debug Steps

1. **Open Browser Console** (F12 → Console tab)
2. **Open the chat** and look for these messages:

```
🔑 API Key Status: { hasApiKey: true, isValid: true, keyLength: 39, keyPrefix: "AIzaSyB...", isPlaceholder: false }
🧪 Testing Gemini API key...
✅ API Test Response: API test successful
```

3. **If you see errors**, check:
   - `hasApiKey: false` → API key not set properly
   - `isValid: false` → API key format is wrong
   - `isPlaceholder: true` → Still using placeholder text

## Quick Fixes

### Fix 1: Recreate API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Delete the old key
3. Create a new key
4. Update your `.env.local` file
5. Restart the dev server

### Fix 2: Check Environment File
Make sure your `.env.local` file is in the project root and contains:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### Fix 3: Restart Everything
1. Stop the dev server (Ctrl+C)
2. Delete `.next` folder: `rm -rf .next`
3. Restart: `npm run dev`

## Test Commands

Try these in the chat to test different scenarios:

- **"test"** - Simple test message
- **"add more cardio"** - Should add an exercise
- **"make it easier"** - Should modify existing exercise
- **"I'm feeling tired"** - Should reduce intensity

## Still Having Issues?

If you're still seeing 404 errors:

1. **Check the browser console** for specific error messages
2. **Verify your API key** at Google AI Studio
3. **Try a different API key** to rule out key-specific issues
4. **Check your Google Cloud billing** - some APIs require billing to be enabled

The app will work with the local fallback even if the API isn't working, but you'll get more basic responses.
