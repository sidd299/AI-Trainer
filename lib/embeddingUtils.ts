import { supabase } from './supabaseClient';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

// Function to get embeddings from Gemini
export async function getEmbedding(text: string) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  return data?.embedding?.value || [];
}

// Function to store user context with embedding
export async function storeUserContext(userId: string, contextText: string) {
  const embedding = await getEmbedding(contextText);

  const { data, error } = await supabase
    .from('user_contexts')
    .insert([
      { user_id: userId, context_text: contextText, embedding }
    ]);

  if (error) console.error("Error storing user context:", error);
  else console.log("Stored user context successfully:", data);
}
