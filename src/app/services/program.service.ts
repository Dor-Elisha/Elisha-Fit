import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Program, ProgramDifficulty } from '../models/program.interface';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private programs: Program[] = [];

  constructor() {
    // Initialize with some sample programs
    this.initializeSamplePrograms();
  }

  private initializeSamplePrograms(): void {
    this.programs = [
      {
        id: '1',
        name: 'Full Body Strength',
        description: 'Complete full body workout targeting all major muscle groups',
        difficulty: ProgramDifficulty.INTERMEDIATE,
        exercises: [
          {
            id: 'ex1',
            name: 'Barbell Squat',
            order: 1,
            sets: 3,
            reps: 8,
            weight: 60,
            restTime: 120,
            notes: 'Focus on form and depth'
          },
          {
            id: 'ex2',
            name: 'Bench Press',
            order: 2,
            sets: 3,
            reps: 8,
            weight: 50,
            restTime: 120,
            notes: 'Keep shoulders back and down'
          }
        ],
        metadata: {
          tags: ['strength', 'full-body'],
          targetMuscleGroups: ['legs', 'chest', 'back'],
          equipment: ['barbell', 'bench'],
          estimatedDuration: 45,
          totalExercises: 2,
          isPublic: false,
          version: '1.0.0'
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        userId: 'user1'
      },
      {
        id: '2',
        name: 'Upper Body Focus',
        description: 'Intensive upper body workout for strength and definition',
        difficulty: ProgramDifficulty.ADVANCED,
        exercises: [
          {
            id: 'ex3',
            name: 'Pull-ups',
            order: 1,
            sets: 4,
            reps: 10,
            weight: 0,
            restTime: 90,
            notes: 'Full range of motion'
          }
        ],
        metadata: {
          tags: ['strength', 'upper-body'],
          targetMuscleGroups: ['back', 'biceps', 'shoulders'],
          equipment: ['pull-up bar'],
          estimatedDuration: 30,
          totalExercises: 1,
          isPublic: false,
          version: '1.0.0'
        },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-12'),
        userId: 'user1'
      }
    ];
  }

  getPrograms(): Observable<Program[]> {
    return of([...this.programs]).pipe(delay(500)); // Simulate API delay
  }

  getProgramById(id: string): Observable<Program | null> {
    const program = this.programs.find(p => p.id === id);
    return of(program || null).pipe(delay(300));
  }

  createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Observable<Program> {
    const newProgram: Program = {
      ...program,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.programs.push(newProgram);
    return of(newProgram).pipe(delay(500));
  }

  updateProgram(id: string, updates: Partial<Program>): Observable<Program> {
    const index = this.programs.findIndex(p => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Program not found'));
    }

    this.programs[index] = {
      ...this.programs[index],
      ...updates,
      updatedAt: new Date()
    };

    return of(this.programs[index]).pipe(delay(500));
  }

  deleteProgram(id: string): Observable<boolean> {
    const index = this.programs.findIndex(p => p.id === id);
    if (index === -1) {
      return throwError(() => new Error('Program not found'));
    }

    this.programs.splice(index, 1);
    return of(true).pipe(delay(300));
  }

  duplicateProgram(id: string, customName?: string): Observable<Program> {
    const originalProgram = this.programs.find(p => p.id === id);
    if (!originalProgram) {
      return throwError(() => new Error('Program not found'));
    }

    // Generate a unique name for the duplicated program
    const baseName = customName || originalProgram.name;
    const duplicatedName = this.generateUniqueName(baseName);

    const duplicatedProgram: Program = {
      ...originalProgram,
      id: this.generateId(),
      name: duplicatedName,
      description: originalProgram.description ? `${originalProgram.description} (Duplicated)` : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate new IDs for exercises to avoid conflicts
    duplicatedProgram.exercises = originalProgram.exercises.map((exercise, index) => ({
      ...exercise,
      id: this.generateId(),
      order: index + 1
    }));

    this.programs.push(duplicatedProgram);
    return of(duplicatedProgram).pipe(delay(500));
  }

  private generateUniqueName(baseName: string): string {
    let name = baseName;
    let counter = 1;
    
    // Check if name already exists
    while (this.programs.some(p => p.name === name)) {
      name = `${baseName} (Copy ${counter})`;
      counter++;
    }
    
    return name;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 