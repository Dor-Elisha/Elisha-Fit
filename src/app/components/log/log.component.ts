import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {
  logs: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(public gs: GeneralService) {}

  ngOnInit(): void {
    this.gs.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        this.logs = userInfo?.user?.logs || [];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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