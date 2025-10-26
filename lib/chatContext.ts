import { supabase } from './supabaseClient';
import { storeUserContext } from './embeddingUtils';

export interface ContextDelta {
  preferences?: string[];
  constraints?: string[];
  goals?: string[] | string;
  dislikes?: string[];
  injuries?: string[];
  schedule?: string[];
  notes?: string;
}

function normalizeArray(value?: string[] | string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

export function mergeContextParagraph(previousContext: string, delta?: ContextDelta): string {
  if (!delta || Object.keys(delta).length === 0) {
    return previousContext || '';
  }

  const prev = previousContext || '';
  const sections: Record<string, Set<string>> = {
    Preferences: new Set<string>(),
    Constraints: new Set<string>(),
    Goals: new Set<string>(),
    Dislikes: new Set<string>(),
    Injuries: new Set<string>(),
    Schedule: new Set<string>()
  };

  // Seed from previousContext by naive parsing of bullets
  prev.split('\n').forEach(line => {
    const trimmed = line.trim();
    const match = trimmed.match(/^[-•]\s*(\w+):\s*(.*)$/i);
    if (match) {
      const key = match[1];
      const value = match[2];
      if (sections[key as keyof typeof sections]) {
        sections[key as keyof typeof sections].add(value);
      }
    }
  });

  // Apply delta additions
  normalizeArray(delta.preferences).forEach(v => sections.Preferences.add(v));
  normalizeArray(delta.constraints).forEach(v => sections.Constraints.add(v));
  normalizeArray(delta.goals).forEach(v => sections.Goals.add(v));
  normalizeArray(delta.dislikes).forEach(v => sections.Dislikes.add(v));
  normalizeArray(delta.injuries).forEach(v => sections.Injuries.add(v));
  normalizeArray(delta.schedule).forEach(v => sections.Schedule.add(v));

  const lines: string[] = [];
  lines.push('## Dynamic User Context');
  (Object.keys(sections) as Array<keyof typeof sections>).forEach(key => {
    const values = Array.from(sections[key]).filter(Boolean);
    if (values.length > 0) {
      values.forEach(v => lines.push(`- ${key}: ${v}`));
    }
  });
  if (delta.notes) {
    lines.push(`- Notes: ${delta.notes}`);
  }

  return lines.join('\n');
}

export async function persistUpdatedContext(sessionId: string, userId: string, updatedContext: string) {
  try {
    await supabase
      .from('chat_sessions')
      .update({ user_context: updatedContext, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    // Optionally store embedding snapshot for retrieval later
    if (userId && updatedContext) {
      await storeUserContext(userId, updatedContext);
    }
  } catch (e) {
    console.warn('Failed to persist updated user context:', e);
  }
}


