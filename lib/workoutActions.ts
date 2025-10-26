import { TodayWorkout, Exercise, ExerciseSet, availableExercises } from './data';
import { WorkoutAction, WorkoutModification } from './gemini';

export class WorkoutActionHandler {
  static executeAction(
    workout: TodayWorkout,
    action: WorkoutAction
  ): TodayWorkout {
    console.log('🔄 Executing workout action:', action);
    
    // Handle new flexible modification structure
    if (action.data?.modifications && Array.isArray(action.data.modifications)) {
      return this.executeModifications(workout, action.data.modifications);
    }
    
    // Handle legacy action types for backward compatibility
    switch (action.type) {
      case 'add':
        return this.addExercise(workout, action);
      case 'delete':
        return this.removeExercise(workout, action);
      case 'modify':
        return this.modifyExercise(workout, action);
      case 'swap':
        return this.swapExercise(workout, action);
      case 'confirm':
      case 'none':
      default:
        return workout;
    }
  }

  private static executeModifications(
    workout: TodayWorkout,
    modifications: WorkoutModification[]
  ): TodayWorkout {
    let updatedWorkout = { ...workout };
    
    for (const modification of modifications) {
      console.log('🔧 Processing modification:', modification);
      
      switch (modification.type) {
        case 'add_exercise':
          updatedWorkout = this.addExerciseFromModification(updatedWorkout, modification);
          break;
        case 'modify_exercise':
          updatedWorkout = this.modifyExerciseFromModification(updatedWorkout, modification);
          break;
        case 'remove_exercise':
          updatedWorkout = this.removeExerciseFromModification(updatedWorkout, modification);
          break;
      }
    }
    
    return updatedWorkout;
  }

  private static addExerciseFromModification(
    workout: TodayWorkout,
    modification: WorkoutModification
  ): TodayWorkout {
    if (!modification.sectionId || !modification.exercise) {
      console.log('❌ Missing data for add exercise modification:', modification);
      return workout;
    }

    const section = workout.sections.find(s => s.id === modification.sectionId);
    if (!section) {
      console.log('❌ Section not found:', modification.sectionId);
      return workout;
    }

    const newExercise: Exercise = {
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: modification.exercise.name,
      category: modification.exercise.category,
      sets: modification.exercise.sets.map((set, index) => ({
        id: `set_${index + 1}`,
        reps: set.reps,
        weight: set.weight,
        completed: false
      })),
      muscleGroups: modification.exercise.muscleGroups,
      isFavorite: false
    };

    console.log('✅ Adding exercise from modification:', newExercise.name, 'to section:', section.name);

    const updatedSections = workout.sections.map(s =>
      s.id === modification.sectionId
        ? { ...s, exercises: [...s.exercises, newExercise] }
        : s
    );

    return { ...workout, sections: updatedSections };
  }

  private static modifyExerciseFromModification(
    workout: TodayWorkout,
    modification: WorkoutModification
  ): TodayWorkout {
    if (!modification.exerciseId || !modification.changes) {
      console.log('❌ Missing data for modify exercise modification:', modification);
      return workout;
    }

    const updatedSections = workout.sections.map(section => ({
      ...section,
      exercises: section.exercises.map(exercise => {
        if (exercise.id === modification.exerciseId) {
          const updatedSets = exercise.sets.map(set => ({
            ...set,
            reps: modification.changes!.reps || set.reps,
            weight: modification.changes!.weight || set.weight,
          }));
          
          console.log('✅ Modifying exercise:', exercise.name, 'with changes:', modification.changes);
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      })
    }));

    return { ...workout, sections: updatedSections };
  }

  private static removeExerciseFromModification(
    workout: TodayWorkout,
    modification: WorkoutModification
  ): TodayWorkout {
    if (!modification.exerciseId) {
      console.log('❌ Missing exerciseId for remove exercise modification:', modification);
      return workout;
    }

    const updatedSections = workout.sections.map(section => ({
      ...section,
      exercises: section.exercises.filter(exercise => {
        if (exercise.id === modification.exerciseId) {
          console.log('✅ Removing exercise:', exercise.name);
          return false;
        }
        return true;
      })
    }));

    return { ...workout, sections: updatedSections };
  }

  private static addExercise(workout: TodayWorkout, action: WorkoutAction): TodayWorkout {
    if (!action.data?.sectionId || !action.data?.newExercise) {
      console.log('❌ Missing data for add exercise:', action.data);
      return workout;
    }

    const section = workout.sections.find(s => s.id === action.data!.sectionId);
    if (!section) {
      console.log('❌ Section not found:', action.data!.sectionId);
      return workout;
    }

    const newExercise: Exercise = {
      ...action.data.newExercise,
      id: action.data.newExercise.id || `ai-${Date.now()}`,
      muscleGroups: action.data.newExercise.muscleGroups || ['general'],
      isFavorite: action.data.newExercise.isFavorite || false,
    };

    console.log('✅ Adding exercise:', newExercise.name, 'to section:', section.name);

    const updatedSections = workout.sections.map(s =>
      s.id === action.data!.sectionId
        ? { ...s, exercises: [...s.exercises, newExercise] }
        : s
    );

    return { ...workout, sections: updatedSections };
  }

  private static removeExercise(workout: TodayWorkout, action: WorkoutAction): TodayWorkout {
    if (!action.data?.exerciseId) return workout;

    const updatedSections = workout.sections.map(section => ({
      ...section,
      exercises: section.exercises.filter(exercise => exercise.id !== action.data!.exerciseId)
    }));

    return { ...workout, sections: updatedSections };
  }

  private static modifyExercise(workout: TodayWorkout, action: WorkoutAction): TodayWorkout {
    if (!action.data?.exerciseId || !action.data?.modifications) return workout;

    const updatedSections = workout.sections.map(section => ({
      ...section,
      exercises: section.exercises.map(exercise => {
        if (exercise.id === action.data!.exerciseId) {
          const updatedSets = exercise.sets.map(set => ({
            ...set,
            reps: action.data!.modifications!.reps || set.reps,
            weight: action.data!.modifications!.weight || set.weight,
          }));
          
          return { ...exercise, sets: updatedSets };
        }
        return exercise;
      })
    }));

    return { ...workout, sections: updatedSections };
  }

  private static swapExercise(workout: TodayWorkout, action: WorkoutAction): TodayWorkout {
    if (!action.data?.exerciseId || !action.data?.targetExerciseId) return workout;

    // Find a suitable replacement exercise
    const replacementExercise = availableExercises.find(ex => 
      ex.id === action.data!.targetExerciseId
    );

    if (!replacementExercise) return workout;

    const updatedSections = workout.sections.map(section => ({
      ...section,
      exercises: section.exercises.map(exercise =>
        exercise.id === action.data!.exerciseId
          ? { 
              ...replacementExercise, 
              id: exercise.id, 
              sets: exercise.sets,
              isFavorite: exercise.isFavorite 
            }
          : exercise
      )
    }));

    return { ...workout, sections: updatedSections };
  }


  // Helper method to find exercises by name or muscle group
  static findExerciseByName(workout: TodayWorkout, name: string): Exercise | null {
    for (const section of workout.sections) {
      const exercise = section.exercises.find(ex => 
        ex.name.toLowerCase().includes(name.toLowerCase())
      );
      if (exercise) return exercise;
    }
    return null;
  }

  static findExerciseByMuscleGroup(workout: TodayWorkout, muscleGroup: string): Exercise[] {
    const exercises: Exercise[] = [];
    for (const section of workout.sections) {
      exercises.push(...section.exercises.filter(ex => 
        ex.muscleGroups.some(mg => 
          mg.toLowerCase().includes(muscleGroup.toLowerCase())
        )
      ));
    }
    return exercises;
  }
}
