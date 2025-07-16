import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { ProgramService } from '../../services/program.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AdapterService } from '../../services/adapter.service';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss']
})
export class ProgramsComponent implements OnInit, OnDestroy {
  programs: any[] = [];
  filteredPrograms: any[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  loading = false;
  showBreadcrumbs = true;

  categories = ['all', 'strength', 'cardio', 'flexibility', 'hiit', 'yoga', 'mixed'];
  difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Confirmation dialog properties
  showDeleteDialog = false;
  deleteDialogData: any = {
    title: 'Delete Program',
    message: 'Are you sure you want to delete this program? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger',
    showIcon: true
  };
  programToDelete: any | null = null;

  // Duplicate dialog properties
  showDuplicateDialog = false;
  duplicateDialogData: any | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    public gs: GeneralService,
    private programService: ProgramService,
    private router: Router,
    private toastr: ToastrService,
    private adapter: AdapterService
  ) { }

  ngOnInit(): void {
    // Hide breadcrumbs if on the root/home page
    this.showBreadcrumbs = this.router.url !== '/';
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
          this.programs = this.adapter.toLegacyProgramArray(programs);
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
                             program.tags?.some((tag: string) => tag === this.selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange(): void {
    this.filterPrograms();
  }

  onCategoryChange(): void {
    this.filterPrograms();
  }

  createNewProgram(): void {
    this.router.navigate(['/program-wizard']);
  }

  viewProgram(program: any): void {
    console.log('Navigating to program detail:', program._id);
    this.router.navigate(['/program-detail', program._id]);
  }

  editProgram(program: any): void {
    this.router.navigate(['/program-wizard', program._id]);
  }

  duplicateProgram(program: any): void {
    this.duplicateDialogData = {
      program: program,
      suggestedName: `${program.name} (Copy)`
    };
    this.showDuplicateDialog = true;
  }

  onConfirmDuplicate(programName: string): void {
    if (!this.duplicateDialogData?.program) return;

    this.programService.duplicateProgram(this.adapter.getProgramId(this.duplicateDialogData.program), programName)
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

  deleteProgram(program: any): void {
    this.programToDelete = program;
    this.deleteDialogData.message = `Are you sure you want to delete "${program.name}"? This action cannot be undone.`;
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.programToDelete) return;

    this.programService.deleteProgram(this.programToDelete._id)
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

  getProgramStats(program: any): any {
    return {
      exercises: program.exercises?.length || 0,
      estimatedDuration: program.estimatedDuration || 0,
    };
  }

  getDifficultyColor(difficulty: string): string {
    // Remove this function if not used elsewhere
    return '#6c757d';
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
