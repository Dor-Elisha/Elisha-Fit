import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { GeneralService } from './services/general.service';
import { ExerciseService } from './services/exercise.service';
import * as _ from 'lodash';
import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';
import { LoadingConfig } from './components/loading/loading.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit, OnDestroy {
  constructor(
    public gs: GeneralService, 
    private exerciseService: ExerciseService, 
    private auth: AuthService,
    private loadingService: LoadingService,
    private router: Router // Inject Router
  ) { }
  
  user: any;
  title = 'angular-starter';
  sidebarToggle = false;
  isSidebarCollapsed = false;
  isMobile = false;
  _ = _;
  
  // Loading states
  isLoading = false;
  isFullscreenLoading = false;
  loadingConfig: LoadingConfig = { type: 'spinner' };
  fullscreenLoadingConfig: LoadingConfig = { type: 'spinner', fullscreen: true };
  
  isLoginRoute = false;
  
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => this.user = u);
    // Load unified user info on app load if logged in
    if (this.auth.isLoggedIn) {
      this.gs.loadUserInfo(this.auth.routeService).catch(err => {
        console.error('Failed to load user info:', err);
      });
    }
    // Exercise data is now loaded on-demand by components
    // No need to pre-load here as the service handles caching
    
    // Subscribe to loading service
    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      });
    
    this.loadingService.loadingConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.loadingConfig = config;
      });
    
    this.loadingService.fullscreenLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isFullscreenLoading => {
        this.isFullscreenLoading = isFullscreenLoading;
      });

    // Track route changes to determine if on login page
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginRoute = event.urlAfterRedirects === '/login';
        // Scroll main content area to top on every navigation
        setTimeout(() => {
          const contentArea = document.querySelector('.content-area');
          if (contentArea) {
            contentArea.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          }
        }, 0);
      }
    });
    // Set initial value
    this.isLoginRoute = this.router.url === '/login';

    // Check initial screen size
    this.checkScreenSize();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    
    // Auto-close sidebar on mobile when screen size changes
    if (this.isMobile && this.sidebarToggle) {
      this.sidebarToggle = false;
    }
    
    // Reset sidebar state on desktop
    if (!this.isMobile && !this.sidebarToggle) {
      this.sidebarToggle = true;
    }
  }

  onSidebarToggle() {
    this.sidebarToggle = !this.sidebarToggle;
  }

  onSidebarClose() {
    this.sidebarToggle = false;
  }

  onSidebarCollapse(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  // Get CSS classes for content wrapper
  getContentWrapperClasses(): string {
    let classes = 'content-wrapper';
    
    if (!this.isMobile) {
      if (this.isSidebarCollapsed) {
        classes += ' sidebar-collapsed';
      } else {
        classes += ' sidebar-open';
      }
    }
    
    return classes;
  }
}
