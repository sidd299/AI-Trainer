/**
 * Dynamic User Context Manager
 * 
 * This utility manages the evolving user context that gets updated
 * with each chat interaction, incorporating new preferences, goals,
 * and constraints mentioned during conversations.
 */

export interface UserContextData {
  // Basic info from onboarding
  age?: number;
  weight?: number;
  gender?: string;
  experience_level?: string;
  goals?: string[];
  
  // Dynamic preferences that evolve
  preferred_exercises?: string[];
  avoided_exercises?: string[];
  equipment_preferences?: string[];
  time_constraints?: string;
  injury_concerns?: string[];
  recent_feedback?: string[];
  
  // Workout preferences
  preferred_split?: string;
  workout_frequency?: string;
  session_duration?: string;
  intensity_preference?: string;
  
  // Recent chat insights
  last_workout_feedback?: string;
  current_challenges?: string[];
  motivation_level?: string;
  progress_notes?: string[];
}

export class UserContextManager {
  private baseContext: UserContextData;
  private chatHistory: string[] = [];

  constructor(initialContext: string) {
    this.baseContext = this.parseInitialContext(initialContext);
  }

  /**
   * Parse the initial onboarding context into structured data
   */
  private parseInitialContext(context: string): UserContextData {
    const data: UserContextData = {};
    
    // Extract basic info using regex patterns
    const ageMatch = context.match(/age[:\s]*(\d+)/i);
    if (ageMatch) data.age = parseInt(ageMatch[1]);

    const weightMatch = context.match(/weight[:\s]*(\d+)/i);
    if (weightMatch) data.weight = parseInt(weightMatch[1]);

    const genderMatch = context.match(/gender[:\s]*(male|female|other)/i);
    if (genderMatch) data.gender = genderMatch[1].toLowerCase();

    const experienceMatch = context.match(/experience[:\s]*(less than 6 months|6 months - 1 year|1-2 years|2+ years)/i);
    if (experienceMatch) data.experience_level = experienceMatch[1];

    // Extract goals
    const goalMatches = context.match(/goal[:\s]*(muscle building|weight loss|strength|endurance|general fitness)/gi);
    if (goalMatches) {
      data.goals = goalMatches.map(g => g.toLowerCase());
    }

    // Extract split preference
    const splitMatch = context.match(/split[:\s]*(push-pull-legs|full body|bro-split|custom)/i);
    if (splitMatch) data.preferred_split = splitMatch[1].toLowerCase();

    return data;
  }

  /**
   * Update context based on new chat message
   */
  updateContext(userMessage: string, aiResponse: string): void {
    this.chatHistory.push(`User: ${userMessage}`);
    this.chatHistory.push(`AI: ${aiResponse}`);

    // Extract new preferences from user message
    this.extractPreferences(userMessage);
    
    // Extract feedback from AI response
    this.extractFeedback(aiResponse);

    // Keep only last 10 interactions to manage context size
    if (this.chatHistory.length > 20) {
      this.chatHistory = this.chatHistory.slice(-20);
    }
  }

  /**
   * Extract user preferences from their message
   */
  private extractPreferences(message: string): void {
    const lowerMessage = message.toLowerCase();

    // Exercise preferences
    if (lowerMessage.includes('like') || lowerMessage.includes('prefer') || lowerMessage.includes('enjoy')) {
      const exerciseMatches = message.match(/\b(squat|deadlift|bench|press|row|curl|extension|lunges|push-ups|pull-ups)\b/gi);
      if (exerciseMatches) {
        this.baseContext.preferred_exercises = [
          ...(this.baseContext.preferred_exercises || []),
          ...exerciseMatches.map(e => e.toLowerCase())
        ];
      }
    }

    // Avoided exercises
    if (lowerMessage.includes('don\'t like') || lowerMessage.includes('avoid') || lowerMessage.includes('hate') || lowerMessage.includes('can\'t do')) {
      const exerciseMatches = message.match(/\b(squat|deadlift|bench|press|row|curl|extension|lunges|push-ups|pull-ups)\b/gi);
      if (exerciseMatches) {
        this.baseContext.avoided_exercises = [
          ...(this.baseContext.avoided_exercises || []),
          ...exerciseMatches.map(e => e.toLowerCase())
        ];
      }
    }

    // Time constraints
    if (lowerMessage.includes('time') || lowerMessage.includes('busy') || lowerMessage.includes('schedule')) {
      const timeMatch = message.match(/(\d+)\s*(minute|hour)/i);
      if (timeMatch) {
        this.baseContext.time_constraints = `${timeMatch[1]} ${timeMatch[2]}s`;
      }
    }

    // Injury concerns
    if (lowerMessage.includes('hurt') || lowerMessage.includes('pain') || lowerMessage.includes('injury') || lowerMessage.includes('sore')) {
      const bodyPartMatches = message.match(/\b(back|knee|shoulder|wrist|ankle|neck|elbow)\b/gi);
      if (bodyPartMatches) {
        this.baseContext.injury_concerns = [
          ...(this.baseContext.injury_concerns || []),
          ...bodyPartMatches.map(p => p.toLowerCase())
        ];
      }
    }

    // Intensity preference
    if (lowerMessage.includes('easy') || lowerMessage.includes('light')) {
      this.baseContext.intensity_preference = 'light';
    } else if (lowerMessage.includes('hard') || lowerMessage.includes('challenging') || lowerMessage.includes('intense')) {
      this.baseContext.intensity_preference = 'intense';
    } else if (lowerMessage.includes('moderate') || lowerMessage.includes('medium')) {
      this.baseContext.intensity_preference = 'moderate';
    }
  }

  /**
   * Extract feedback from AI response
   */
  private extractFeedback(aiResponse: string): void {
    // Store recent feedback for context
    this.baseContext.recent_feedback = [
      ...(this.baseContext.recent_feedback || []).slice(-2), // Keep last 2 feedback items
      aiResponse.substring(0, 100) + '...' // Truncate for storage
    ];
  }

  /**
   * Generate the current dynamic context string
   */
  generateContextString(): string {
    const parts: string[] = [];

    // Basic info
    if (this.baseContext.age) parts.push(`Age: ${this.baseContext.age}`);
    if (this.baseContext.weight) parts.push(`Weight: ${this.baseContext.weight}kg`);
    if (this.baseContext.gender) parts.push(`Gender: ${this.baseContext.gender}`);
    if (this.baseContext.experience_level) parts.push(`Experience: ${this.baseContext.experience_level}`);

    // Goals
    if (this.baseContext.goals && this.baseContext.goals.length > 0) {
      parts.push(`Goals: ${this.baseContext.goals.join(', ')}`);
    }

    // Preferences
    if (this.baseContext.preferred_exercises && this.baseContext.preferred_exercises.length > 0) {
      parts.push(`Preferred exercises: ${this.baseContext.preferred_exercises.join(', ')}`);
    }

    if (this.baseContext.avoided_exercises && this.baseContext.avoided_exercises.length > 0) {
      parts.push(`Avoided exercises: ${this.baseContext.avoided_exercises.join(', ')}`);
    }

    // Constraints
    if (this.baseContext.time_constraints) {
      parts.push(`Time constraints: ${this.baseContext.time_constraints}`);
    }

    if (this.baseContext.injury_concerns && this.baseContext.injury_concerns.length > 0) {
      parts.push(`Injury concerns: ${this.baseContext.injury_concerns.join(', ')}`);
    }

    if (this.baseContext.intensity_preference) {
      parts.push(`Intensity preference: ${this.baseContext.intensity_preference}`);
    }

    // Recent context
    if (this.baseContext.recent_feedback && this.baseContext.recent_feedback.length > 0) {
      parts.push(`Recent feedback: ${this.baseContext.recent_feedback.join('; ')}`);
    }

    return parts.join(', ');
  }

  /**
   * Get the structured context data
   */
  getContextData(): UserContextData {
    return { ...this.baseContext };
  }

  /**
   * Get recent chat history
   */
  getChatHistory(): string[] {
    return [...this.chatHistory];
  }

  /**
   * Reset context to initial state
   */
  reset(): void {
    this.chatHistory = [];
    // Keep base context but clear dynamic parts
    this.baseContext.preferred_exercises = [];
    this.baseContext.avoided_exercises = [];
    this.baseContext.injury_concerns = [];
    this.baseContext.recent_feedback = [];
    this.baseContext.time_constraints = undefined;
    this.baseContext.intensity_preference = undefined;
  }
}

/**
 * Utility function to create a context manager from onboarding data
 */
export function createUserContextManager(onboardingContext: string): UserContextManager {
  return new UserContextManager(onboardingContext);
}




