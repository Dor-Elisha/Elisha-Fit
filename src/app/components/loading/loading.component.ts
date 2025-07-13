import { Component, Input, Output, EventEmitter } from '@angular/core';

export type LoadingType = 'spinner' | 'skeleton' | 'progress' | 'dots' | 'pulse';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingConfig {
  type: LoadingType;
  size?: LoadingSize;
  text?: string;
  progress?: number;
  showProgress?: boolean;
  overlay?: boolean;
  fullscreen?: boolean;
}

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() config: LoadingConfig = { type: 'spinner' };
  @Input() type: LoadingType = 'spinner';
  @Input() size: LoadingSize = 'md';
  @Input() text: string = 'Loading...';
  @Input() progress: number = 0;
  @Input() showProgress: boolean = false;
  @Input() overlay: boolean = false;
  @Input() fullscreen: boolean = false;
  @Input() visible: boolean = true;

  @Output() progressComplete = new EventEmitter<void>();

  get loadingConfig(): LoadingConfig {
    return {
      type: this.config.type || this.type,
      size: this.config.size || this.size,
      text: this.config.text || this.text,
      progress: this.config.progress || this.progress,
      showProgress: this.config.showProgress || this.showProgress,
      overlay: this.config.overlay || this.overlay,
      fullscreen: this.config.fullscreen || this.fullscreen
    };
  }

  get sizeClass(): string {
    return `loading-${this.loadingConfig.size}`;
  }

  get typeClass(): string {
    return `loading-${this.loadingConfig.type}`;
  }

  get progressPercentage(): number {
    return Math.min(Math.max(this.loadingConfig.progress || 0, 0), 100);
  }

  get progressColor(): string {
    const progress = this.progressPercentage;
    if (progress >= 80) return 'var(--success-color)';
    if (progress >= 60) return 'var(--warning-color)';
    return 'var(--fitness-primary)';
  }

  onProgressComplete(): void {
    if (this.progressPercentage >= 100) {
      this.progressComplete.emit();
    }
  }
} 