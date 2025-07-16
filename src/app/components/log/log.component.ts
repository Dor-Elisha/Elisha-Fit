import { Component, OnInit } from '@angular/core';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {
  logs: any[] = [];

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.logService.getLogs().subscribe({
      next: (data) => {
        this.logs = Array.isArray(data) ? data : (data.logs || []);
      },
      error: (err) => {
        console.error('Failed to fetch logs from backend', err);
        this.logs = [];
      }
    });
  }

  get totalLogs(): number {
    return this.logs.length;
  }
  get completedLogs(): number {
    return this.logs.filter(l => l.completedAll).length;
  }
  get incompleteLogs(): number {
    return this.logs.filter(l => !l.completedAll).length;
  }
} 