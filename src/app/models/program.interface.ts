// Program Creation and Tracking System Interfaces

export interface Program {
  id: string;
  name: string;
  description?: string;
  difficulty: ProgramDifficulty;
  exercises: ProgramExercise[];
  metadata: ProgramMetadata;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ProgramExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number; // in seconds
  weight: number; // in kg/lbs
  order: number;
  exerciseId?: string; // reference to original exercise from exercises.json
  notes?: string;
}

export interface ProgramMetadata {
  estimatedDuration: number; // in minutes
  totalExercises: number;
  targetMuscleGroups: string[];
  equipment: string[];
  tags: string[];
  isPublic: boolean;
  version: string;
}

export enum ProgramDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface ProgressEntry {
  id: string;
  programId: string;
  userId: string;
  workoutDate: Date;
  exercises: ExerciseProgress[];
  totalDuration: number; // in minutes
  notes?: string;
  rating?: number; // 1-5 scale
  completed: boolean;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  sets: SetProgress[];
  notes?: string;
}

export interface SetProgress {
  setNumber: number;
  weight: number;
  reps: number;
  restTime: number; // actual rest time taken
  completed: boolean;
  notes?: string;
}

export enum ProgramWizardStep {
  PROGRAM_DETAILS = 1,
  EXERCISE_SELECTION = 2,
  EXERCISE_CONFIGURATION = 3,
  REVIEW_AND_SAVE = 4
}

// API Response Interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ProgramListResponse {
  programs: Program[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface ProgressListResponse {
  entries: ProgressEntry[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface ProgramCreateResponse {
  program: Program;
  message: string;
}

export interface ProgramUpdateResponse {
  program: Program;
  message: string;
}

export interface ProgramDeleteResponse {
  success: boolean;
  message: string;
}

export interface ProgressCreateResponse {
  progress: ProgressEntry;
  message: string;
}

export interface ProgressUpdateResponse {
  progress: ProgressEntry;
  message: string;
}

export interface UserProgramsResponse {
  programs: Program[];
  totalCount: number;
  recentPrograms: Program[];
}

// Form Validation Interfaces
export interface ProgramFormData {
  name: string;
  description?: string;
  difficulty: ProgramDifficulty;
  exercises: ProgramExerciseFormData[];
}

export interface ProgramExerciseFormData {
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  weight: number;
  order: number;
  notes?: string;
}

export interface ProgressFormData {
  programId: string;
  exercises: ExerciseProgressFormData[];
  notes?: string;
  rating?: number;
}

export interface ExerciseProgressFormData {
  exerciseId: string;
  exerciseName: string;
  sets: SetProgressFormData[];
  notes?: string;
}

export interface SetProgressFormData {
  setNumber: number;
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  notes?: string;
}

// Utility Interfaces
export interface ExerciseSearchFilters {
  name?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  category?: string;
}

export interface ProgramSearchFilters {
  name?: string;
  difficulty?: ProgramDifficulty;
  muscleGroups?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface ProgressFilters {
  programId?: string;
  startDate?: Date;
  endDate?: Date;
  completed?: boolean;
}

// Validation Interfaces
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ProgramFormValidation {
  name: ValidationResult;
  description?: ValidationResult;
  difficulty: ValidationResult;
  exercises: ExerciseValidation[];
}

export interface ExerciseValidation {
  name: ValidationResult;
  sets: ValidationResult;
  reps: ValidationResult;
  restTime: ValidationResult;
  weight: ValidationResult;
  order: ValidationResult;
  notes?: ValidationResult;
}

export interface ProgressFormValidation {
  programId: ValidationResult;
  exercises: ExerciseProgressValidation[];
  notes?: ValidationResult;
  rating?: ValidationResult;
}

export interface ExerciseProgressValidation {
  exerciseId: ValidationResult;
  exerciseName: ValidationResult;
  sets: SetProgressValidation[];
  notes?: ValidationResult;
}

export interface SetProgressValidation {
  setNumber: ValidationResult;
  weight: ValidationResult;
  reps: ValidationResult;
  restTime: ValidationResult;
  completed: ValidationResult;
  notes?: ValidationResult;
}

// Validation Rules
export interface ValidationRules {
  programName: {
    required: boolean;
    minLength: number;
    maxLength: number;
    pattern?: RegExp;
  };
  exerciseName: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  sets: {
    required: boolean;
    min: number;
    max: number;
  };
  reps: {
    required: boolean;
    min: number;
    max: number;
  };
  restTime: {
    required: boolean;
    min: number;
    max: number;
  };
  weight: {
    required: boolean;
    min: number;
    max: number;
  };
  rating: {
    required: boolean;
    min: number;
    max: number;
  };
}

// Goal Setting and Tracking Interfaces
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: GoalType;
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum GoalType {
  WORKOUTS_PER_WEEK = 'workouts_per_week',
  TOTAL_WORKOUTS = 'total_workouts',
  TOTAL_DURATION = 'total_duration',
  WEIGHT_GOAL = 'weight_goal',
  REPS_GOAL = 'reps_goal',
  STREAK_GOAL = 'streak_goal',
  CUSTOM = 'custom'
}

export interface GoalFormData {
  title: string;
  description?: string;
  type: GoalType;
  target: number;
  unit: string;
  targetDate: Date;
}

export interface GoalProgress {
  goalId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  isCompleted: boolean;
  remainingDays: number;
} 