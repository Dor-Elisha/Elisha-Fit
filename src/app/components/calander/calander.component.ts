import { Component, OnInit } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { LogService } from '../../services/log.service';
import { startOfWeek, addDays, endOfWeek } from 'date-fns';
import { ProgramService } from '../../services/program.service';
import { AdapterService } from '../../services/adapter.service';
import { ScheduledWorkoutService, ScheduledWorkout } from '../../services/scheduled-workout.service';

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
  loadingLogs = false;
  logsByDay: { [dayKey: string]: any[] } = {};

  showAddWorkoutPopup = false;
  programs: any[] = [];
  loadingPrograms = false;
  scheduledPrograms: { [date: string]: ScheduledWorkout | null } = {};
  loadingScheduled = false;
  errorScheduled: string | null = null;
  todayStartOfDay: Date;

  constructor(
    private logService: LogService,
    private programService: ProgramService,
    private adapter: AdapterService,
    private scheduledWorkoutService: ScheduledWorkoutService
  ) {
    // Set todayStartOfDay to midnight UTC for today
    const now = new Date();
    this.todayStartOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  }

  public getDayKey(date: Date): string {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)).toISOString();
  }

  ngOnInit(): void {
    this.loadEventsFromLogs();
    // Set selectedDate to midnight UTC for today using local date parts
    const now = new Date();
    this.selectedDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
    this.loadLogsForWeek(this.viewDate);
    this.loadScheduledWorkoutsForWeek(this.viewDate);
  }

  loadEventsFromLogs() {
    this.logService.getLogs().subscribe({
      next: (logs) => {
        this.events = (Array.isArray(logs) ? logs : (logs.logs || [])).map(log => ({
          start: new Date(log.date || log.createdAt),
          title: log.programName || 'Workout',
          meta: log
        }));
      },
      error: () => {
        this.events = [];
      }
    });
  }

  // Fetch all logs for the week containing the given date
  loadLogsForWeek(date: Date) {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = endOfWeek(date, { weekStartsOn: 0 });
    const startISO = this.getDayKey(start);
    const endISO = this.getDayKey(end);
    this.loadingLogs = true;
    this.logService.getLogsForRange(startISO, endISO).subscribe({
      next: (result) => {
        // Group logs by dayKey
        this.logsByDay = {};
        const logs = Array.isArray(result.logs) ? result.logs : [];
        for (const log of logs) {
          const key = this.getDayKey(new Date(log.date));
          if (!this.logsByDay[key]) this.logsByDay[key] = [];
          this.logsByDay[key].push(log);
        }
        this.loadLogsForSelectedDate();
        this.loadingLogs = false;
      },
      error: () => {
        this.logsByDay = {};
        this.logsForDate = [];
        this.loadingLogs = false;
      }
    });
  }

  // When the week view changes, fetch new week data
  onWeekChange() {
    this.loadScheduledWorkoutsForWeek(this.viewDate);
    this.loadLogsForWeek(this.viewDate);
  }

  // Use the cache to load logs for the selected date
  loadLogsForSelectedDate() {
    const key = this.getDayKey(this.selectedDate);
    this.logsForDate = this.logsByDay[key] || [];
  }

  loadScheduledWorkoutsForWeek(date: Date) {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = endOfWeek(date, { weekStartsOn: 0 });
    const startISO = this.getDayKey(start);
    const endISO = this.getDayKey(end);
    this.loadingScheduled = true;
    this.scheduledWorkoutService.getScheduledWorkoutsForRange(startISO, endISO).subscribe({
      next: (scheduledList) => {
        // Clear only the current week from scheduledPrograms
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          this.scheduledPrograms[this.getDayKey(new Date(d))] = null;
        }
        // Populate scheduledPrograms for the week
        for (const scheduled of scheduledList) {
          const key = this.getDayKey(new Date(scheduled.date));
          this.scheduledPrograms[key] = scheduled;
        }
        this.loadingScheduled = false;
      },
      error: (err) => {
        this.loadingScheduled = false;
        this.errorScheduled = 'Failed to load scheduled workouts for week.';
      }
    });
  }

  getWeekDays(date: Date): Date[] {
    const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday as start
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }

  onCustomDayClick(day: Date) {
    // Always set to midnight UTC for the selected day using local date parts
    this.selectedDate = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0));
    this.loadLogsForSelectedDate();
    // No need to call backend for this day; data is already loaded for the week
  }

  addWorkoutForDate() {
    this.showAddWorkoutPopup = true;
    if (this.programs.length === 0) {
      this.loadingPrograms = true;
      this.programService.getPrograms().subscribe({
        next: (programs) => {
          this.programs = this.adapter.toLegacyProgramArray(programs);
          this.loadingPrograms = false;
        },
        error: () => {
          this.loadingPrograms = false;
        }
      });
    }
  }

  selectProgram(program: any) {
    const dateKey = this.getDayKey(this.selectedDate);
    // Use selectedDate as-is (do not convert to midnight UTC) when scheduling
    this.scheduledWorkoutService.scheduleWorkout(
      dateKey,
      program._id,
      program
    ).subscribe({
      next: (scheduled) => {
        this.scheduledPrograms[dateKey] = scheduled;
        this.closePopup();
      },
      error: () => {
        this.errorScheduled = 'Failed to schedule workout.';
      }
    });
  }

  removeScheduledWorkoutForDate(date: Date) {
    const dateKey = this.getDayKey(date);
    this.scheduledWorkoutService.removeScheduledWorkout(dateKey).subscribe({
      next: () => {
        this.scheduledPrograms[dateKey] = null;
      },
      error: () => {
        this.errorScheduled = 'Failed to remove scheduled workout.';
      }
    });
  }

  closePopup() {
    this.showAddWorkoutPopup = false;
  }
}
