import { Component, OnInit } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { startOfWeek, addDays, endOfWeek } from 'date-fns';
import { WorkoutService } from '../../services/workout.service';
import { AdapterService } from '../../services/adapter.service';
import { GeneralService } from '../../services/general.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-calander',
  templateUrl: './calander.component.html',
  styleUrls: ['./calander.component.scss']
})
export class CalanderComponent implements OnInit {
  viewDate = new Date();
  locale = 'en';
  events: CalendarEvent[] = [];

  selectedDate: Date = new Date(); // Today's date
  logsForDate: any[] = [];
  logsByDay: { [dayKey: string]: any[] } = {};
  scheduledWorkouts: { [date: string]: any | null } = {};
  todayStartOfDay: Date;

  private destroy$ = new Subject<void>();

  constructor(
    private programService: WorkoutService,
    private adapter: AdapterService,
    public gs: GeneralService
  ) {
    // Set todayStartOfDay to midnight UTC for today
    const now = new Date();
    this.todayStartOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  }

  public getDayKey(date: Date): string {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)).toISOString();
  }

  ngOnInit(): void {
    this.gs.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        this.populateLogs(userInfo?.user?.logs || []);
        this.populateScheduledWorkouts(userInfo?.scheduledWorkouts || []);
        this.loadLogsForSelectedDate();
      });
    // Set selectedDate to midnight UTC for today using local date parts
    const now = new Date();
    this.selectedDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  populateLogs(logs: any[]) {
        this.logsByDay = {};
        for (const log of logs) {
          const key = this.getDayKey(new Date(log.date));
          if (!this.logsByDay[key]) this.logsByDay[key] = [];
          this.logsByDay[key].push(log);
        }
  }

  populateScheduledWorkouts(scheduledList: any[]) {
    this.scheduledWorkouts = {};
        for (const scheduled of scheduledList) {
          const key = this.getDayKey(new Date(scheduled.date));
          this.scheduledWorkouts[key] = scheduled;
        }
  }

  getWeekDays(date: Date): Date[] {
    const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday as start
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  onCustomDayClick(day: Date) {
    // Always set to midnight UTC for the selected day using local date parts
    this.selectedDate = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0));
    this.loadLogsForSelectedDate();
  }

  loadLogsForSelectedDate() {
    const key = this.getDayKey(this.selectedDate);
    this.logsForDate = this.logsByDay[key] || [];
  }
}
