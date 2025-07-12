import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public gs: GeneralService) { }

  activeTab: 'calendar' | 'programs' = 'calendar';
  today = new Date();
  workoutsThisWeek = 3;
  activeProgram = 1;
  totalSessions = 24;
  caloriesBurned = 1543;
  _=_;

  cards = [
    {
      icon: 'fas fa-calendar',
      value: this.workoutsThisWeek,
      label: 'Workouts this week'
    },
    {
      icon: 'fas fa-book',
      value: this.activeProgram,
      label: 'Active program'
    },
    {
      icon: 'fas fa-dumbbell',
      value: this.totalSessions,
      label: 'Total sessions'
    },
    {
      icon: 'fas fa-fire',
      value: this.caloriesBurned,
      label: 'Calories burned'
    }
  ];

  ngOnInit(): void {

  }

  viewProgram = (program:any) => {

  }
}
