import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdapterService {

  // Exercise adapters
  toLegacyExercise(exercise) {
    return {
      id: exercise.id,
      name: exercise.name,
      force: null, // Not available in new model
      level: exercise.difficulty,
      mechanic: null, // Not available in new model
      equipment: exercise.equipment,
      primaryMuscles: [exercise.muscle], // Convert single muscle to array
      secondaryMuscles: [], // Not available in new model
      instructions: exercise.instructions,
      category: exercise.category,
      images: exercise.images
    };
  }

  fromLegacyExercise(legacyExercise) {
    return {
      _id: legacyExercise.id, // Use id as _id
      id: legacyExercise.id,
      name: legacyExercise.name,
      category: legacyExercise.category,
      muscle: legacyExercise.primaryMuscles[0] || '', // Use first primary muscle
      equipment: legacyExercise.equipment || '',
      difficulty: legacyExercise.level as 'beginner' | 'intermediate' | 'advanced',
      instructions: legacyExercise.instructions,
      images: legacyExercise.images,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  toLegacyExerciseArray(exercises) {
    return exercises.map(ex => this.toLegacyExercise(ex));
  }

  fromLegacyExerciseArray(legacyExercises) {
    return legacyExercises.map(ex => this.fromLegacyExercise(ex));
  }

  // Program adapters
  toLegacyProgram(program) {
    return {
      _id: program._id,
      name: program.name,
      description: program.description,
      targetMuscleGroups: program.targetMuscleGroups,
      exercises: program.exercises.map((ex: any) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest: ex.rest,
        weight: ex.weight,
        notes: ex.notes
      }))
    };
  }

  fromLegacyProgram(legacyProgram) {
    return {
      _id: legacyProgram.id,
      name: legacyProgram.name,
      description: legacyProgram.description,
      exercises: legacyProgram.exercises,
      metadata: {
        estimatedDuration: legacyProgram.estimatedDuration,
        totalExercises: legacyProgram.totalExercises,
        targetMuscleGroups: legacyProgram.targetMuscleGroups,
        equipment: legacyProgram.equipment,
        tags: legacyProgram.tags,
        isPublic: legacyProgram.isPublic,
        version: legacyProgram.version,
      },
      userId: legacyProgram.userId,
      createdAt: legacyProgram.createdAt,
      updatedAt: legacyProgram.updatedAt
    };
  }

  toLegacyProgramArray(programs) {
    return programs.map(p => this.toLegacyProgram(p));
  }

  fromLegacyProgramArray(legacyPrograms) {
    return legacyPrograms.map(p => this.fromLegacyProgram(p));
  }

  // Goal adapters
  toLegacyGoal(goal) {
    return {
      id: goal._id,
      userId: goal.userId,
      title: goal.title,
      description: goal.description,
      type: this.mapGoalCategoryToType(goal.category) as any,
      target: goal.targetValue,
      current: goal.currentValue,
      unit: goal.unit,
      startDate: goal.createdAt, // Use createdAt as startDate
      targetDate: goal.deadline || new Date(),
      completed: goal.status === 'completed',
      completedDate: goal.status === 'completed' ? goal.updatedAt : undefined,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt
    };
  }

  fromLegacyGoal(legacyGoal) {
    return {
      _id: legacyGoal.id,
      userId: legacyGoal.userId,
      title: legacyGoal.title,
      description: legacyGoal.description,
      category: this.mapGoalTypeToCategory(legacyGoal.type) as any,
      targetValue: legacyGoal.target,
      currentValue: legacyGoal.current,
      unit: legacyGoal.unit,
      deadline: legacyGoal.targetDate,
      status: legacyGoal.completed ? 'completed' : 'active',
      progressHistory: [], // Not available in legacy model
      createdAt: legacyGoal.createdAt,
      updatedAt: legacyGoal.updatedAt
    };
  }

  toLegacyGoalArray(goals) {
    return goals.map(g => this.toLegacyGoal(g));
  }

  fromLegacyGoalArray(legacyGoals) {
    return legacyGoals.map(g => this.fromLegacyGoal(g));
  }

  // Progress adapters
  toLegacyProgressEntry(progress) {
    return {
      id: progress._id,
      programId: progress.programId,
      userId: progress.userId,
      workoutDate: progress.workoutDate,
      exercises: progress.exercises,
      totalDuration: progress.totalDuration,
      notes: progress.notes,
      rating: progress.rating,
      completed: progress.completed
    };
  }

  fromLegacyProgressEntry(legacyProgress) {
    return {
      _id: legacyProgress.id,
      programId: legacyProgress.programId,
      userId: legacyProgress.userId,
      workoutDate: legacyProgress.workoutDate,
      exercises: legacyProgress.exercises,
      totalDuration: legacyProgress.totalDuration,
      notes: legacyProgress.notes,
      rating: legacyProgress.rating,
      completed: legacyProgress.completed,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  toLegacyProgressArray(progressEntries) {
    return progressEntries.map(p => this.toLegacyProgressEntry(p));
  }

  fromLegacyProgressArray(legacyProgressEntries) {
    return legacyProgressEntries.map(p => this.fromLegacyProgressEntry(p));
  }

  // Response adapters
  toLegacyExerciseResponse(response) {
    return {
      exercises: this.toLegacyExerciseArray(response.data),
      total: response.pagination.totalCount,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages
    };
  }

  toLegacyProgramResponse(response) {
    return {
      programs: this.toLegacyProgramArray(response.data),
      totalCount: response.pagination.totalCount,
      page: response.pagination.page,
      limit: response.pagination.limit
    };
  }

  toLegacyGoalResponse(response) {
    return {
      goals: this.toLegacyGoalArray(response.data),
      totalCount: response.pagination.totalCount,
      page: response.pagination.page,
      limit: response.pagination.limit
    };
  }

  toLegacyProgressResponse(response) {
    return {
      entries: this.toLegacyProgressArray(response.data),
      totalCount: response.pagination.totalCount,
      page: response.pagination.page,
      limit: response.pagination.limit
    };
  }

  // Helper methods for goal type mapping
  private mapGoalCategoryToType(category) {
    const mapping: { [key: string]: string } = {
      'strength': 'weight_goal',
      'endurance': 'reps_goal',
      'weight': 'weight_goal',
      'body_composition': 'weight_goal',
      'flexibility': 'custom',
      'custom': 'custom'
    };
    return mapping[category] || 'custom';
  }

  private mapGoalTypeToCategory(type) {
    const mapping: { [key: string]: string } = {
      'workouts_per_week': 'custom',
      'total_workouts': 'custom',
      'total_duration': 'custom',
      'weight_goal': 'weight',
      'reps_goal': 'endurance',
      'streak_goal': 'custom',
      'custom': 'custom'
    };
    return mapping[type] || 'custom';
  }

  // Utility methods for components
  getExerciseId(exercise) {
    return '_id' in exercise ? exercise._id : exercise.id;
  }

  getProgramId(program) {
    return '_id' in program ? program._id : program.id;
  }

  getGoalId(goal) {
    return '_id' in goal ? goal._id : goal.id;
  }

  getProgressId(progress) {
    return '_id' in progress ? progress._id : progress.id;
  }
} 