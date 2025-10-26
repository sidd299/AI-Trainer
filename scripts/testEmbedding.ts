import { storeUserContextEmbedding } from "../lib/embeddings.js";

(async () => {
  const userId = "test_user_123";
  const text = "User likes push-pull-legs workout split and prefers dumbbell exercises.";
  const metadata = { type: "onboarding", date: new Date().toISOString() };

  await storeUserContextEmbedding(userId, text, metadata);
})();
