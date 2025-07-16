import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, HostListener } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() sidebarOpen: boolean = false;
  @Output() sidebarClose: EventEmitter<void> = new EventEmitter();
  @Output() sidebarCollapse: EventEmitter<boolean> = new EventEmitter();
  
  user: any;
  isCollapsed = false;
  activeRoute = '';
  isMobile = false;
  
  weekWorkouts = 0;
  savedProgram = this.gs.savedPrograms.length;

  navigationItems = [
    {
      label: 'Home',
      icon: 'fas fa-home',
      route: '/',
      badge: null
    },
    {
      label: 'Programs',
      icon: 'fas fa-dumbbell',
      route: '/programs',
      badge: null
    },
    {
      label: 'Workout Logs',
      icon: 'fas fa-clipboard-list',
      route: '/logs',
      badge: null
    }
    // Progress-related items remain removed
  ];

  private destroy$ = new Subject<void>();

  constructor(
    public gs: GeneralService, 
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => this.user = u);

    // Track active route
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.url;
      });

    // Set initial active route
    this.activeRoute = this.router.url;

    // Auto-close sidebar on mobile when route changes
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.isMobile) {
          this.closeSidebar();
        }
      });

    // Check initial screen size
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    // Handle mobile transition
    if (this.isMobile && !wasMobile) {
      // Just switched to mobile
      this.isCollapsed = false;
      this.sidebarCollapse.emit(false);
    } else if (!this.isMobile && wasMobile) {
      // Just switched to desktop
      this.isCollapsed = false;
      this.sidebarCollapse.emit(false);
    }
  }

  toggleCollapse(): void {
    if (!this.isMobile) {
      this.isCollapsed = !this.isCollapsed;
      this.sidebarCollapse.emit(this.isCollapsed);
    }
  }

  closeSidebar(): void {
    this.sidebarClose.emit();
  }

  logout(): void {
    this.auth.logout();
  }

  isActiveRoute(route: string): boolean {
    if (route === '/') {
      return this.activeRoute === '/';
    }
    return this.activeRoute.startsWith(route);
  }

  get userInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name
      .split(' ')
      .map((n: string) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
