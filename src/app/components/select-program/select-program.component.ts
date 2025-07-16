import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { ExerciseService } from '../../services/exercise.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-select-program',
  templateUrl: './select-program.component.html',
  styleUrls: ['./select-program.component.scss']
})
export class SelectProgramComponent implements OnInit {
  constructor(public gs: GeneralService, public exerciseService: ExerciseService, private toaster: ToastrService) { }
  newProgram:any;
  dayProgramName = '';

  imageIndexes: { [key: string]: number } = {};
  exercises: any[] = [];

  _=_;
  searchText = '';
  activeFilters: string[] = [];
  categories: string[] = [];
  muscleGroups: string[] = [];
  addWeightPopup:any;
  addRepsPopup: any;
  addRestPopup: any;

  ngOnInit(): void {
    this.newProgram = {
      name: '',
      exercises: [],
      show: true,
      save: () => {
        if (!this.newProgram.name) {
          this.toaster.error('Please enter a program name');
          return;
        }
        if (!this.newProgram.exercises.length) {
          this.toaster.error('Please add at least one exercise to the program');
          return;
        }

        this.gs.saveProgram({name: this.newProgram.name, exercises: this.newProgram.exercises});
      }
    }

    // Load exercises and filter options
    this.exerciseService.getExercises({}).subscribe(response => {
      this.exercises = response.exercises;
      this.searchExercises();
    });

    this.exerciseService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.exerciseService.getMuscleGroups().subscribe(muscleGroups => {
      this.muscleGroups = muscleGroups;
    });
  }


  addExercise = (exercise: any) => {
    this.newProgram.exercises.push(exercise);
  }
  removeExercise = (exercise: any) => {
    const index = this.newProgram.exercises.indexOf(exercise);
    if (index > -1) {
      this.newProgram.exercises.splice(index, 1);
    }
  }

  nextImage(exercise: any) {
    const key = exercise.name;
    if (!this.imageIndexes[key]) {
      this.imageIndexes[key] = 0;
    }
    this.imageIndexes[key] = (this.imageIndexes[key] + 1) % exercise.images.length;
  }

  prevImage(exercise: any) {
    const key = exercise.name;
    if (!this.imageIndexes[key]) {
      this.imageIndexes[key] = 0;
    }
    this.imageIndexes[key] = (this.imageIndexes[key] - 1 + exercise.images.length) % exercise.images.length;
  }


  searchExercises = (filterCategory?: string) => {
    if (filterCategory) {
      // Toggle filter selection
      if (this.activeFilters.includes(filterCategory)) {
        this.activeFilters = this.activeFilters.filter(f => f !== filterCategory);
      } else {
        this.activeFilters.push(filterCategory);
      }
    }

    const search = this.searchText ? this.searchText.toLowerCase() : '';

    this.exercises.forEach((exercise: any) => {
      const matchesSearch = !search || exercise.name.toLowerCase().includes(search);
      const matchesFilter = !this.activeFilters.length || this.activeFilters.includes(exercise.category) || (exercise.primaryMuscles && exercise.primaryMuscles.some((muscle: string) => this.activeFilters.includes(muscle)));
      exercise.show = !(matchesSearch && matchesFilter);
    });
  }

  addWeight = (exercise: any) => {
    this.addWeightPopup = {
      show: true,
      exercise: exercise,
      unit: exercise.weight?.unit || 'kg',
      weight: exercise.weight?.weight || 0,
      confirm: () => {
        if (this.addWeightPopup.weight > 0) {
          exercise.weight = {weight: this.addWeightPopup.weight, unit: this.addWeightPopup.unit};
        }
        this.addWeightPopup = null;
      }
    }
  }

  addReps = (exercise: any) => {
    this.addRepsPopup = {
      show: true,
      exercise: exercise,
      timeNum: 1,
      repsNum: 1,
      restSecondsNum: 0,
      preview: [{reps: 1}],
      timesChange: () => {
        this.addRepsPopup.preview = Array.from({ length: this.addRepsPopup.timeNum }, () => ({ reps: this.addRepsPopup.repsNum, restSeconds: this.addRepsPopup.restSecondsNum }));
      },
      confirm: () => {
        exercise.reps = Array.from(
          { length: this.addRepsPopup.timeNum },
          () => ({
            reps: this.addRepsPopup.repsNum,
            restSeconds: this.addRepsPopup.restSecondsNum
          })
        );
        this.addRepsPopup = null;
      }
    }
  }

  addRestTime = (exercise: any) => {
    this.addRestPopup = {
      show: true,
      exercise: exercise,
      restSecondsNum: 0,
      confirm: () => {
        if (this.addRestPopup.restSecondsNum > 0) {
          exercise.restSeconds = this.addRestPopup.restSecondsNum;
        }
        this.addRestPopup = null;
      }
    }
  }
}
