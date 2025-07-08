import { Component } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { ExerciseService } from '../../services/exercise.service';
import * as _ from 'lodash';



interface Exercise {
  name: string;
  muscle_group: string;
  reps: string;
  times: number;
  rest_between: string;
}

@Component({
  selector: 'app-select-program',
  templateUrl: './select-program.component.html',
  styleUrls: ['./select-program.component.scss']
})
export class SelectProgramComponent {
  constructor(private gs: GeneralService, private exerciseService: ExerciseService) { }
  newProgram:any;
  _=_;
  containerOpen = false;

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
    this.containerOpen = true;
    // handle day selection logic if needed
  }

}
