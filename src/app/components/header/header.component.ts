import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../services/loading.service';
import { GeneralService } from '../../services/general.service';

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
  showLogoutDialog = false;

  private destroy$ = new Subject<void>();

  constructor(
    private gs: GeneralService,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.gs.userInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userInfo => {
        if (userInfo) {
          this.currentUser = userInfo.user;
        }
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

  openWorkoutWizard(): void {
    this.router.navigate(['/workout-wizard']);
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
