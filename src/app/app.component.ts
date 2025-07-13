import { Component, OnInit } from '@angular/core';
import { GeneralService } from './services/general.service';
import { ExerciseService } from './services/exercise.service';
import * as _ from 'lodash';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {
  constructor(public gs: GeneralService, private exerciseService: ExerciseService, private auth: AuthService) {
  }
  user: any;
  title = 'angular-starter';
  sidebarToggle = false;
  _=_;

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => this.user = u);
    this.exerciseService.getExercises().subscribe(data => {
      this.exerciseService.exercises = data.exercises;
      this.exerciseService.categories = _.uniq(_.map(this.exerciseService.exercises, 'category'));
      this.exerciseService.muscleGroups = _.uniq(_.flatMap(this.exerciseService.exercises, 'primaryMuscles'));
      this.exerciseService.exerciseLevels = _.uniq(_.map(this.exerciseService.exercises, 'level'));
    });
  }
}
