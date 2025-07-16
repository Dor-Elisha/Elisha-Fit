import { Component, OnInit } from '@angular/core';
import { ProgramService } from '../../services/program.service';
import { Router } from '@angular/router';
import { AdapterService } from '../../services/adapter.service';

@Component({
  selector: 'app-start-workout',
  templateUrl: './start-workout.component.html',
  styleUrls: ['./start-workout.component.scss']
})
export class StartWorkoutComponent implements OnInit {
  programs: any[] = [];
  loading = false;

  constructor(
    private programService: ProgramService,
    private router: Router,
    private adapter: AdapterService
  ) {}

  ngOnInit(): void {
    this.loadPrograms();
  }

  loadPrograms(): void {
    this.loading = true;
    this.programService.getPrograms().subscribe({
      next: (programs) => {
        this.programs = this.adapter.toLegacyProgramArray(programs);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  startProgram(program: any): void {
    this.router.navigate(['/program-detail', program._id], { queryParams: { start: 'true' } });
  }

  getProgramStats(program: any): any {
    return {
      exercises: program.exercises?.length || 0,
      estimatedDuration: program.estimatedDuration || 0,
    };
  }

  getProgramCategory(program: any): string {
    const tags = program.tags || [];
    if (tags.includes('strength')) return 'strength';
    if (tags.includes('cardio')) return 'cardio';
    if (tags.includes('flexibility')) return 'flexibility';
    if (tags.includes('hiit')) return 'hiit';
    if (tags.includes('yoga')) return 'yoga';
    return 'mixed';
  }
} 