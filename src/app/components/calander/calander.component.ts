import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';

@Component({
  selector: 'app-calander',
  templateUrl: './calander.component.html',
  styleUrls: ['./calander.component.scss']
})
export class CalanderComponent {
  viewDate = new Date();      // already present
  locale   = 'en';            // or 'he' etc.
  events   = [];              // your existing events
}
