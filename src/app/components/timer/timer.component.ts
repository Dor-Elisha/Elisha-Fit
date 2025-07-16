import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() seconds: number = 0;
  @Output() closed = new EventEmitter<void>();

  remaining: number = 0;
  intervalId: any;
  isVisible: boolean = true;

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  startCountdown() {
    this.remaining = this.seconds;
    this.intervalId = setInterval(() => {
      if (this.remaining > 0) {
        this.remaining--;
      } else {
        this.closePopup();
      }
    }, 1000);
  }

  clearTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  closePopup() {
    this.isVisible = false;
    this.clearTimer();
    this.closed.emit();
  }

  get formattedTime(): string {
    const m = Math.floor(this.remaining / 60);
    const s = this.remaining % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
} 