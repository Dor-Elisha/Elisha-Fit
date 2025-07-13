import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() sidebarOpen: boolean = false;
  @Output() sidebarToggle = new EventEmitter();

  currentUser: any = null;
  showUserMenu = false;
  showNotifications = false;
  showLogoutDialog = false;
  notifications = [
    { id: 1, message: 'Time for your workout!', time: '2 min ago', read: false },
    { id: 2, message: 'You\'ve completed 5 workouts this week!', time: '1 hour ago', read: true },
    { id: 3, message: 'New program available: Advanced Strength', time: '3 hours ago', read: false }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar = () => {
    this.sidebarToggle.emit();
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  logout(): void {
    this.showLogoutDialog = true;
    this.showUserMenu = false;
  }

  confirmLogout(): void {
    this.loadingService.showForFormSubmission('Logging out...');
    
    // Simulate logout process
    setTimeout(() => {
      this.authService.logout();
      this.showLogoutDialog = false;
      this.loadingService.hide();
    }, 500);
  }

  cancelLogout(): void {
    this.showLogoutDialog = false;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.showUserMenu = false;
  }

  navigateToSettings(): void {
    // TODO: Implement settings page
    this.showUserMenu = false;
  }

  markNotificationAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get userInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name
      .split(' ')
      .map((n: string) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
