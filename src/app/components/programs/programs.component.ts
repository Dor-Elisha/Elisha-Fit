import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { ProgramService } from '../../services/program.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Program, ProgramDifficulty } from '../../models/program.interface';
import { ConfirmDialogData } from '../confirm-dialog/confirm-dialog.component';
import { DuplicateProgramData } from '../duplicate-program-dialog/duplicate-program-dialog.component';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss']
})
export class ProgramsComponent implements OnInit, OnDestroy {
  programs: Program[] = [];
  filteredPrograms: Program[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  selectedDifficulty = 'all';
  loading = false;

  categories = ['all', 'strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'mixed'];
  difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Confirmation dialog properties
  showDeleteDialog = false;
  deleteDialogData: ConfirmDialogData = {
    title: 'Delete Program',
    message: 'Are you sure you want to delete this program? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
    showIcon: true
  };
  programToDelete: Program | null = null;

  // Duplicate dialog properties
  showDuplicateDialog = false;
  duplicateDialogData: DuplicateProgramData | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    public gs: GeneralService,
    private programService: ProgramService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadPrograms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPrograms(): void {
    this.loading = true;
    this.programService.getPrograms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (programs) => {
          this.programs = programs;
          this.filteredPrograms = [...this.programs];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading programs:', error);
          this.toastr.error('Failed to load programs');
          this.loading = false;
        }
      });
  }

  filterPrograms(): void {
    this.filteredPrograms = this.programs.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           program.description?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || 
                             program.metadata?.tags?.some((tag: string) => tag === this.selectedCategory);
      const matchesDifficulty = this.selectedDifficulty === 'all' || program.difficulty === this.selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }

  onSearchChange(): void {
    this.filterPrograms();
  }

  onCategoryChange(): void {
    this.filterPrograms();
  }

  onDifficultyChange(): void {
    this.filterPrograms();
  }

  createNewProgram(): void {
    this.router.navigate(['/program-wizard']);
  }

  viewProgram(program: Program): void {
    // Navigate to program detail view
    this.router.navigate(['/programs', program.id]);
  }

  editProgram(program: Program): void {
    this.router.navigate(['/program-edit', program.id]);
  }

  duplicateProgram(program: Program): void {
    this.duplicateDialogData = {
      program: program,
      suggestedName: `${program.name} (Copy)`
    };
    this.showDuplicateDialog = true;
  }

  onConfirmDuplicate(programName: string): void {
    if (!this.duplicateDialogData?.program) return;

    this.programService.duplicateProgram(this.duplicateDialogData.program.id, programName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (duplicatedProgram) => {
          this.toastr.success(`Program "${duplicatedProgram.name}" created successfully`);
          this.loadPrograms(); // Reload programs to show the new one
          this.closeDuplicateDialog();
        },
        error: (error) => {
          console.error('Error duplicating program:', error);
          this.toastr.error('Failed to duplicate program');
        }
      });
  }

  onCancelDuplicate(): void {
    this.closeDuplicateDialog();
  }

  closeDuplicateDialog(): void {
    this.showDuplicateDialog = false;
    this.duplicateDialogData = null;
  }

  deleteProgram(program: Program): void {
    this.programToDelete = program;
    this.deleteDialogData.message = `Are you sure you want to delete "${program.name}"? This action cannot be undone.`;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.programToDelete) return;

    this.programService.deleteProgram(this.programToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastr.success('Program deleted successfully');
          this.loadPrograms(); // Reload programs to reflect the deletion
          this.closeDeleteDialog();
        },
        error: (error) => {
          console.error('Error deleting program:', error);
          this.toastr.error('Failed to delete program');
        }
      });
  }

  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.programToDelete = null;
  }

  getProgramStats(program: Program): any {
    return {
      exercises: program.exercises?.length || 0,
      estimatedDuration: program.metadata?.estimatedDuration || 0,
      difficulty: program.difficulty || 'beginner'
    };
  }

  getDifficultyColor(difficulty: ProgramDifficulty): string {
    switch (difficulty) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getCategoryIcon(program: Program): string {
    const tags = program.metadata?.tags || [];
    if (tags.includes('strength')) return 'fas fa-dumbbell';
    if (tags.includes('cardio')) return 'fas fa-heartbeat';
    if (tags.includes('flexibility')) return 'fas fa-child';
    if (tags.includes('hiit')) return 'fas fa-fire';
    if (tags.includes('yoga')) return 'fas fa-pray';
    return 'fas fa-dumbbell';
  }

  getProgramCategory(program: Program): string {
    const tags = program.metadata?.tags || [];
    if (tags.includes('strength')) return 'strength';
    if (tags.includes('cardio')) return 'cardio';
    if (tags.includes('flexibility')) return 'flexibility';
    if (tags.includes('hiit')) return 'hiit';
    if (tags.includes('yoga')) return 'yoga';
    return 'mixed';
  }
}
