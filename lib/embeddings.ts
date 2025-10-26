import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

/**
 * Generate embedding for a text and store it in Supabase
 */
export async function storeUserContextEmbedding(
  userId: string,
  text: string,
  metadata: Record<string, any> = {}
) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    const embedding = result.embedding.values;

    const { error } = await supabase.from("user_context_embeddings").insert([
      {
        user_id: userId,
        content: text,
        embedding,
        metadata,
      },
    ]);

    if (error) throw error;
    console.log("✅ Embedding stored successfully!");
  } catch (err) {
    console.error("❌ Error generating/storing embedding:", err);
  }
}
