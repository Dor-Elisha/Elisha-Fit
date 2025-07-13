import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoadingConfig } from '../components/loading/loading.component';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingConfigSubject = new BehaviorSubject<LoadingConfig>({
    type: 'spinner',
    size: 'md',
    text: 'Loading...'
  });
  private fullscreenLoadingSubject = new BehaviorSubject<boolean>(false);

  // Observable streams
  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  loadingConfig$: Observable<LoadingConfig> = this.loadingConfigSubject.asObservable();
  fullscreenLoading$: Observable<boolean> = this.fullscreenLoadingSubject.asObservable();

  // Current values
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  get currentConfig(): LoadingConfig {
    return this.loadingConfigSubject.value;
  }

  get isFullscreenLoading(): boolean {
    return this.fullscreenLoadingSubject.value;
  }

  /**
   * Show loading with default configuration
   */
  show(text?: string): void {
    const config = { ...this.currentConfig };
    if (text) {
      config.text = text;
    }
    this.loadingConfigSubject.next(config);
    this.loadingSubject.next(true);
  }

  /**
   * Show loading with custom configuration
   */
  showWithConfig(config: LoadingConfig): void {
    this.loadingConfigSubject.next(config);
    this.loadingSubject.next(true);
  }

  /**
   * Show fullscreen loading
   */
  showFullscreen(config?: LoadingConfig): void {
    const fullscreenConfig: LoadingConfig = {
      type: 'spinner',
      size: 'lg',
      text: 'Loading...',
      fullscreen: true,
      ...config
    };
    this.loadingConfigSubject.next(fullscreenConfig);
    this.fullscreenLoadingSubject.next(true);
  }

  /**
   * Show progress loading
   */
  showProgress(progress: number, text?: string): void {
    const config: LoadingConfig = {
      type: 'progress',
      size: 'md',
      text: text || 'Loading...',
      progress: progress,
      showProgress: true
    };
    this.loadingConfigSubject.next(config);
    this.loadingSubject.next(true);
  }

  /**
   * Show skeleton loading
   */
  showSkeleton(text?: string): void {
    const config: LoadingConfig = {
      type: 'skeleton',
      size: 'lg',
      text: text || 'Loading...'
    };
    this.loadingConfigSubject.next(config);
    this.loadingSubject.next(true);
  }

  /**
   * Hide loading
   */
  hide(): void {
    this.loadingSubject.next(false);
  }

  /**
   * Hide fullscreen loading
   */
  hideFullscreen(): void {
    this.fullscreenLoadingSubject.next(false);
  }

  /**
   * Hide all loading states
   */
  hideAll(): void {
    this.loadingSubject.next(false);
    this.fullscreenLoadingSubject.next(false);
  }

  /**
   * Show loading for a specific duration
   */
  showForDuration(duration: number, text?: string): void {
    this.show(text);
    setTimeout(() => {
      this.hide();
    }, duration);
  }

  /**
   * Show loading with progress simulation
   */
  showWithProgressSimulation(text?: string, duration: number = 3000): void {
    this.showProgress(0, text);
    
    const interval = 100;
    const steps = duration / interval;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 100);
      
      this.showProgress(progress, text);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          this.hide();
        }, 500);
      }
    }, interval);
  }

  /**
   * Show loading for API calls
   */
  showForApiCall(text?: string): void {
    this.show(text || 'Processing...');
  }

  /**
   * Show loading for data loading
   */
  showForDataLoading(text?: string): void {
    this.showSkeleton(text || 'Loading data...');
  }

  /**
   * Show loading for form submission
   */
  showForFormSubmission(text?: string): void {
    this.show(text || 'Submitting...');
  }

  /**
   * Show loading for file upload
   */
  showForFileUpload(text?: string): void {
    this.showProgress(0, text || 'Uploading...');
  }

  /**
   * Update progress for file upload
   */
  updateProgress(progress: number): void {
    if (this.isLoading && this.currentConfig.type === 'progress') {
      this.showProgress(progress, this.currentConfig.text);
    }
  }
} 