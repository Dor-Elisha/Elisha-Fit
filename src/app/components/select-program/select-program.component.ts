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
  constructor(private gs: GeneralService, public exerciseService: ExerciseService) { }
  newProgram:any;

  _=_;
  containerOpen = false;
  selectedDay = 'Sunday';
  createNewProgram(): void {
    this.newProgram = {
      name: '',
      description: '',
      exercises: {
        Sunday: { programs: [] },
        Monday: { programs: [] },
        Tuesday: { programs: [] },
        Wednesday: { programs: [] },
        Thursday: { programs: [] },
        Friday: { programs: [] },
        Saturday: { programs: [] }
      },
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
    if (this.newProgram && this.newProgram.exercises && this.selectedDay) {
      this.newProgram.exercises[this.selectedDay].programs.push(exercise);
    }
  }
}
