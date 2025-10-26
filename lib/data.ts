export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  type?: 'warmup' | 'working';
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  sets: ExerciseSet[];
  isFavorite: boolean;
  notes?: string;
}

export interface WorkoutSection {
  id: string;
  name: string;
  icon: string;
  exercises: Exercise[];
  isExpanded: boolean;
}

export interface TodayWorkout {
  date: string;
  sections: WorkoutSection[];
  ai_coach_tips?: string[];
}

// Dummy data for exercises
export const availableExercises: Exercise[] = [
  // Warmup exercises
  {
    id: 'warmup-1',
    name: 'Arm Circles',
    category: 'warmup',
    muscleGroups: ['shoulders', 'arms'],
    sets: [
      { id: 'set-1', reps: 10, weight: 0, completed: false },
      { id: 'set-2', reps: 10, weight: 0, completed: false },
    ],
    isFavorite: false,
  },
  {
    id: 'warmup-2',
    name: 'Leg Swings',
    category: 'warmup',
    muscleGroups: ['legs', 'hips'],
    sets: [
      { id: 'set-1', reps: 12, weight: 0, completed: false },
      { id: 'set-2', reps: 12, weight: 0, completed: false },
    ],
    isFavorite: false,
  },
  {
    id: 'warmup-3',
    name: 'Jumping Jacks',
    category: 'warmup',
    muscleGroups: ['full body'],
    sets: [
      { id: 'set-1', reps: 20, weight: 0, completed: false },
      { id: 'set-2', reps: 20, weight: 0, completed: false },
    ],
    isFavorite: true,
  },

  // Main workout exercises
  {
    id: 'main-1',
    name: 'Push-ups',
    category: 'strength',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    sets: [
      { id: 'set-1', reps: 12, weight: 0, completed: false },
      { id: 'set-2', reps: 10, weight: 0, completed: false },
      { id: 'set-3', reps: 8, weight: 0, completed: false },
    ],
    isFavorite: true,
  },
  {
    id: 'main-2',
    name: 'Squats',
    category: 'strength',
    muscleGroups: ['legs', 'glutes'],
    sets: [
      { id: 'set-1', reps: 15, weight: 0, completed: false },
      { id: 'set-2', reps: 12, weight: 0, completed: false },
      { id: 'set-3', reps: 10, weight: 0, completed: false },
    ],
    isFavorite: true,
  },
  {
    id: 'main-3',
    name: 'Dumbbell Rows',
    category: 'strength',
    muscleGroups: ['back', 'biceps'],
    sets: [
      { id: 'set-1', reps: 10, weight: 25, completed: false },
      { id: 'set-2', reps: 10, weight: 25, completed: false },
      { id: 'set-3', reps: 8, weight: 30, completed: false },
    ],
    isFavorite: false,
  },
  {
    id: 'main-4',
    name: 'Plank',
    category: 'strength',
    muscleGroups: ['core'],
    sets: [
      { id: 'set-1', reps: 30, weight: 0, completed: false },
      { id: 'set-2', reps: 30, weight: 0, completed: false },
    ],
    isFavorite: false,
  },

  // Cardio exercises
  {
    id: 'cardio-1',
    name: 'Burpees',
    category: 'cardio',
    muscleGroups: ['full body'],
    sets: [
      { id: 'set-1', reps: 8, weight: 0, completed: false },
      { id: 'set-2', reps: 8, weight: 0, completed: false },
      { id: 'set-3', reps: 6, weight: 0, completed: false },
    ],
    isFavorite: false,
  },
  {
    id: 'cardio-2',
    name: 'Mountain Climbers',
    category: 'cardio',
    muscleGroups: ['full body', 'core'],
    sets: [
      { id: 'set-1', reps: 20, weight: 0, completed: false },
      { id: 'set-2', reps: 20, weight: 0, completed: false },
    ],
    isFavorite: false,
  },
  {
    id: 'cardio-3',
    name: 'High Knees',
    category: 'cardio',
    muscleGroups: ['legs', 'core'],
    sets: [
      { id: 'set-1', reps: 30, weight: 0, completed: false },
      { id: 'set-2', reps: 30, weight: 0, completed: false },
    ],
    isFavorite: true,
  },

  // Cooldown exercises
  {
    id: 'cooldown-1',
    name: 'Cat-Cow Stretch',
    category: 'cooldown',
    muscleGroups: ['spine', 'core'],
    sets: [
      { id: 'set-1', reps: 10, weight: 0, completed: false },
    ],
    isFavorite: false,
  },
  {
    id: 'cooldown-2',
    name: 'Hip Flexor Stretch',
    category: 'cooldown',
    muscleGroups: ['hips', 'legs'],
    sets: [
      { id: 'set-1', reps: 30, weight: 0, completed: false },
    ],
    isFavorite: false,
  },
  {
    id: 'cooldown-3',
    name: 'Shoulder Stretch',
    category: 'cooldown',
    muscleGroups: ['shoulders', 'chest'],
    sets: [
      { id: 'set-1', reps: 20, weight: 0, completed: false },
    ],
    isFavorite: true,
  },
];

// Today's workout data
export const todaysWorkout: TodayWorkout = {
  date: new Date().toISOString().split('T')[0],
  sections: [
    {
      id: 'warmup',
      name: 'Warmup',
      icon: '🔥',
      isExpanded: true,
      exercises: availableExercises.filter(ex => ex.category === 'warmup'),
    },
    {
      id: 'main',
      name: 'Main Workout',
      icon: '💪',
      isExpanded: true,
      exercises: availableExercises.filter(ex => ex.category === 'strength'),
    },
    {
      id: 'cardio',
      name: 'Cardio',
      icon: '❤️',
      isExpanded: false,
      exercises: availableExercises.filter(ex => ex.category === 'cardio'),
    },
    {
      id: 'cooldown',
      name: 'Cooldown',
      icon: '🧘',
      isExpanded: false,
      exercises: availableExercises.filter(ex => ex.category === 'cooldown'),
    },
  ],
};
