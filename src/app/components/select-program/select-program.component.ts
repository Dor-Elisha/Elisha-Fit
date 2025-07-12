import { Component } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { ExerciseService } from '../../services/exercise.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-select-program',
  templateUrl: './select-program.component.html',
  styleUrls: ['./select-program.component.scss']
})
export class SelectProgramComponent {
  constructor(public gs: GeneralService, public exerciseService: ExerciseService) { }
  newProgram:any;
  dayProgramName = '';

  imageIndexes: { [key: string]: number } = {};

  _=_;
  containerOpen = false;
  selectedDay = 'Sunday';
  searchText = '';
  activeFilters: string[] = [];
  addWeightPopup:any;
  addRepsPopup: any;


  createNewProgram(): void {
    this.newProgram = {
      name: '',
      description: '',
      exercises: [],
      duration: 0,
      level: '',
      category: '',
      show: true,
      save: () => {
        console.log(this.newProgram.name);
      }
    }

    this.exerciseService.getExercises().subscribe(data => {
      this.exerciseService.exercises = data.exercises;
      this.exerciseService.categories = _.uniq(_.map(this.exerciseService.exercises, 'category'));
      this.exerciseService.muscleGroups = _.uniq(_.flatMap(this.exerciseService.exercises, 'primaryMuscles'));
      this.exerciseService.exerciseLevels = _.uniq(_.map(this.exerciseService.exercises, 'level'));
    });
  }


  onDayClick(day: string) {
    this.selectedDay = day;
    this.containerOpen = true;
    // handle day selection logic if needed
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

    this.exerciseService.exercises.forEach((exercise: any) => {
      const matchesSearch = !search || exercise.name.toLowerCase().includes(search);
      const matchesFilter = !this.activeFilters.length || this.activeFilters.includes(exercise.category) || (exercise.primaryMuscles && exercise.primaryMuscles.some((muscle: string) => this.activeFilters.includes(muscle)));
      exercise.show = !(matchesSearch && matchesFilter);
    });
  }

  addWeight = (exercise: any) => {
    this.addWeightPopup = {
      show: true,
      exercise: exercise,
      weight: 0,
      confirm: () => {
        if (this.addWeightPopup.weight > 0) {
          exercise.weight = this.addWeightPopup.weight;
        }
        this.addWeightPopup = null;
      }
    }
  }

  addRestTime = (day:any ,exercise: any) => {

  }
}
