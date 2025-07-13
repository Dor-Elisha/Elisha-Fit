import { 
  Program, 
  ProgramExercise, 
  ProgramMetadata, 
  ProgramDifficulty,
  ProgressEntry,
  ExerciseProgress,
  SetProgress,
  ProgramWizardStep,
  ApiResponse,
  ProgramListResponse,
  ProgressListResponse,
  ProgramCreateResponse,
  ProgramUpdateResponse,
  ProgramDeleteResponse,
  ProgressCreateResponse,
  ProgressUpdateResponse,
  UserProgramsResponse,
  ProgramFormData,
  ProgramExerciseFormData,
  ProgressFormData,
  ExerciseProgressFormData,
  SetProgressFormData,
  ExerciseSearchFilters,
  ProgramSearchFilters,
  ProgressFilters,
  ValidationError,
  ValidationResult,
  ProgramFormValidation,
  ExerciseValidation,
  ProgressFormValidation,
  ExerciseProgressValidation,
  SetProgressValidation,
  ValidationRules
} from './program.interface';

describe('Program Interfaces', () => {
  
  describe('Program Interface', () => {
    it('should have all required properties', () => {
      const program: Program = {
        id: 'test-id',
        name: 'Test Program',
        description: 'Test Description',
        difficulty: ProgramDifficulty.INTERMEDIATE,
        exercises: [],
        metadata: {
          estimatedDuration: 60,
          totalExercises: 0,
          targetMuscleGroups: [],
          equipment: [],
          tags: [],
          isPublic: false,
          version: '1.0.0'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-123'
      };

      expect(program.id).toBeDefined();
      expect(program.name).toBeDefined();
      expect(program.difficulty).toBeDefined();
      expect(program.exercises).toBeDefined();
      expect(program.metadata).toBeDefined();
      expect(program.createdAt).toBeDefined();
      expect(program.updatedAt).toBeDefined();
      expect(program.userId).toBeDefined();
    });
  });

  describe('ProgramExercise Interface', () => {
    it('should have all required properties', () => {
      const exercise: ProgramExercise = {
        id: 'exercise-1',
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        restTime: 60,
        weight: 0,
        order: 1,
        exerciseId: 'push-ups-123',
        notes: 'Keep proper form'
      };

      expect(exercise.id).toBeDefined();
      expect(exercise.name).toBeDefined();
      expect(exercise.sets).toBeDefined();
      expect(exercise.reps).toBeDefined();
      expect(exercise.restTime).toBeDefined();
      expect(exercise.weight).toBeDefined();
      expect(exercise.order).toBeDefined();
    });
  });

  describe('ProgramMetadata Interface', () => {
    it('should have all required properties', () => {
      const metadata: ProgramMetadata = {
        estimatedDuration: 45,
        totalExercises: 5,
        targetMuscleGroups: ['chest', 'triceps'],
        equipment: ['dumbbells', 'bench'],
        tags: ['strength', 'upper body'],
        isPublic: false,
        version: '1.0.0'
      };

      expect(metadata.estimatedDuration).toBeDefined();
      expect(metadata.totalExercises).toBeDefined();
      expect(metadata.targetMuscleGroups).toBeDefined();
      expect(metadata.equipment).toBeDefined();
      expect(metadata.tags).toBeDefined();
      expect(metadata.isPublic).toBeDefined();
      expect(metadata.version).toBeDefined();
    });
  });

  describe('ProgramDifficulty Enum', () => {
    it('should have correct values', () => {
      expect(ProgramDifficulty.BEGINNER).toBe('beginner');
      expect(ProgramDifficulty.INTERMEDIATE).toBe('intermediate');
      expect(ProgramDifficulty.ADVANCED).toBe('advanced');
    });
  });

  describe('ProgressEntry Interface', () => {
    it('should have all required properties', () => {
      const progress: ProgressEntry = {
        id: 'progress-1',
        programId: 'program-1',
        userId: 'user-123',
        workoutDate: new Date(),
        exercises: [],
        totalDuration: 45,
        notes: 'Great workout!',
        rating: 5,
        completed: true
      };

      expect(progress.id).toBeDefined();
      expect(progress.programId).toBeDefined();
      expect(progress.userId).toBeDefined();
      expect(progress.workoutDate).toBeDefined();
      expect(progress.exercises).toBeDefined();
      expect(progress.totalDuration).toBeDefined();
      expect(progress.completed).toBeDefined();
    });
  });

  describe('ExerciseProgress Interface', () => {
    it('should have all required properties', () => {
      const exerciseProgress: ExerciseProgress = {
        exerciseId: 'exercise-1',
        exerciseName: 'Push-ups',
        sets: [],
        notes: 'Felt strong today'
      };

      expect(exerciseProgress.exerciseId).toBeDefined();
      expect(exerciseProgress.exerciseName).toBeDefined();
      expect(exerciseProgress.sets).toBeDefined();
    });
  });

  describe('SetProgress Interface', () => {
    it('should have all required properties', () => {
      const setProgress: SetProgress = {
        setNumber: 1,
        weight: 50,
        reps: 12,
        restTime: 90,
        completed: true,
        notes: 'Good form'
      };

      expect(setProgress.setNumber).toBeDefined();
      expect(setProgress.weight).toBeDefined();
      expect(setProgress.reps).toBeDefined();
      expect(setProgress.restTime).toBeDefined();
      expect(setProgress.completed).toBeDefined();
    });
  });

  describe('ProgramWizardStep Enum', () => {
    it('should have correct step values', () => {
      expect(ProgramWizardStep.PROGRAM_DETAILS).toBe(1);
      expect(ProgramWizardStep.EXERCISE_SELECTION).toBe(2);
      expect(ProgramWizardStep.EXERCISE_CONFIGURATION).toBe(3);
      expect(ProgramWizardStep.REVIEW_AND_SAVE).toBe(4);
    });
  });

  describe('ApiResponse Interface', () => {
    it('should have all required properties', () => {
      const response: ApiResponse<Program> = {
        success: true,
        data: {} as Program,
        message: 'Success',
        error: undefined
      };

      expect(response.success).toBeDefined();
    });
  });

  describe('API Response Interfaces', () => {
    it('should have ProgramCreateResponse interface', () => {
      const response: ProgramCreateResponse = {
        program: {} as Program,
        message: 'Program created successfully'
      };

      expect(response.program).toBeDefined();
      expect(response.message).toBeDefined();
    });

    it('should have ProgramUpdateResponse interface', () => {
      const response: ProgramUpdateResponse = {
        program: {} as Program,
        message: 'Program updated successfully'
      };

      expect(response.program).toBeDefined();
      expect(response.message).toBeDefined();
    });

    it('should have ProgramDeleteResponse interface', () => {
      const response: ProgramDeleteResponse = {
        success: true,
        message: 'Program deleted successfully'
      };

      expect(response.success).toBeDefined();
      expect(response.message).toBeDefined();
    });

    it('should have ProgressCreateResponse interface', () => {
      const response: ProgressCreateResponse = {
        progress: {} as ProgressEntry,
        message: 'Progress recorded successfully'
      };

      expect(response.progress).toBeDefined();
      expect(response.message).toBeDefined();
    });

    it('should have ProgressUpdateResponse interface', () => {
      const response: ProgressUpdateResponse = {
        progress: {} as ProgressEntry,
        message: 'Progress updated successfully'
      };

      expect(response.progress).toBeDefined();
      expect(response.message).toBeDefined();
    });

    it('should have UserProgramsResponse interface', () => {
      const response: UserProgramsResponse = {
        programs: [],
        totalCount: 0,
        recentPrograms: []
      };

      expect(response.programs).toBeDefined();
      expect(response.totalCount).toBeDefined();
      expect(response.recentPrograms).toBeDefined();
    });
  });

  describe('Form Data Interfaces', () => {
    it('should have ProgramFormData interface', () => {
      const formData: ProgramFormData = {
        name: 'Test Program',
        description: 'Test Description',
        difficulty: ProgramDifficulty.BEGINNER,
        exercises: []
      };

      expect(formData.name).toBeDefined();
      expect(formData.difficulty).toBeDefined();
      expect(formData.exercises).toBeDefined();
    });

    it('should have ProgramExerciseFormData interface', () => {
      const exerciseFormData: ProgramExerciseFormData = {
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        restTime: 60,
        weight: 0,
        order: 1,
        notes: 'Keep proper form'
      };

      expect(exerciseFormData.name).toBeDefined();
      expect(exerciseFormData.sets).toBeDefined();
      expect(exerciseFormData.reps).toBeDefined();
      expect(exerciseFormData.restTime).toBeDefined();
      expect(exerciseFormData.weight).toBeDefined();
      expect(exerciseFormData.order).toBeDefined();
    });
  });

  describe('Search Filter Interfaces', () => {
    it('should have ExerciseSearchFilters interface', () => {
      const filters: ExerciseSearchFilters = {
        name: 'push',
        muscleGroup: 'chest',
        equipment: 'dumbbells',
        difficulty: 'intermediate',
        category: 'strength'
      };

      expect(filters).toBeDefined();
    });

    it('should have ProgramSearchFilters interface', () => {
      const filters: ProgramSearchFilters = {
        name: 'test',
        difficulty: ProgramDifficulty.INTERMEDIATE,
        muscleGroups: ['chest', 'triceps'],
        createdAfter: new Date('2023-01-01'),
        createdBefore: new Date('2023-12-31')
      };

      expect(filters).toBeDefined();
    });

    it('should have ProgressFilters interface', () => {
      const filters: ProgressFilters = {
        programId: 'program-1',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        completed: true
      };

      expect(filters).toBeDefined();
    });
  });

  describe('Validation Interfaces', () => {
    it('should have ValidationError interface', () => {
      const error: ValidationError = {
        field: 'name',
        message: 'Name is required',
        code: 'REQUIRED'
      };

      expect(error.field).toBeDefined();
      expect(error.message).toBeDefined();
    });

    it('should have ValidationResult interface', () => {
      const result: ValidationResult = {
        isValid: false,
        errors: [
          {
            field: 'name',
            message: 'Name is required',
            code: 'REQUIRED'
          }
        ]
      };

      expect(result.isValid).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should have ProgramFormValidation interface', () => {
      const validation: ProgramFormValidation = {
        name: { isValid: true, errors: [] },
        description: { isValid: true, errors: [] },
        difficulty: { isValid: true, errors: [] },
        exercises: []
      };

      expect(validation.name).toBeDefined();
      expect(validation.difficulty).toBeDefined();
      expect(validation.exercises).toBeDefined();
    });

    it('should have ExerciseValidation interface', () => {
      const validation: ExerciseValidation = {
        name: { isValid: true, errors: [] },
        sets: { isValid: true, errors: [] },
        reps: { isValid: true, errors: [] },
        restTime: { isValid: true, errors: [] },
        weight: { isValid: true, errors: [] },
        order: { isValid: true, errors: [] },
        notes: { isValid: true, errors: [] }
      };

      expect(validation.name).toBeDefined();
      expect(validation.sets).toBeDefined();
      expect(validation.reps).toBeDefined();
      expect(validation.restTime).toBeDefined();
      expect(validation.weight).toBeDefined();
      expect(validation.order).toBeDefined();
    });

    it('should have ProgressFormValidation interface', () => {
      const validation: ProgressFormValidation = {
        programId: { isValid: true, errors: [] },
        exercises: [],
        notes: { isValid: true, errors: [] },
        rating: { isValid: true, errors: [] }
      };

      expect(validation.programId).toBeDefined();
      expect(validation.exercises).toBeDefined();
    });

    it('should have ValidationRules interface', () => {
      const rules: ValidationRules = {
        programName: {
          required: true,
          minLength: 3,
          maxLength: 50,
          pattern: /^[a-zA-Z0-9\s]+$/
        },
        exerciseName: {
          required: true,
          minLength: 2,
          maxLength: 100
        },
        sets: {
          required: true,
          min: 1,
          max: 20
        },
        reps: {
          required: true,
          min: 1,
          max: 100
        },
        restTime: {
          required: true,
          min: 0,
          max: 600
        },
        weight: {
          required: true,
          min: 0,
          max: 1000
        },
        rating: {
          required: false,
          min: 1,
          max: 5
        }
      };

      expect(rules.programName).toBeDefined();
      expect(rules.exerciseName).toBeDefined();
      expect(rules.sets).toBeDefined();
      expect(rules.reps).toBeDefined();
      expect(rules.restTime).toBeDefined();
      expect(rules.weight).toBeDefined();
      expect(rules.rating).toBeDefined();
    });
  });
}); 