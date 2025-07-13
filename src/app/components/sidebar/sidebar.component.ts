import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() sidebarOpen: boolean = false;
  @Output() sidebarClose: EventEmitter<void> = new EventEmitter();
  constructor(public gs: GeneralService, private authService: AuthService, private router: Router) {}

  weekWorkouts = 0;
  savedProgram = this.gs.savedPrograms.length;

  ngOnInit(): void {

  }

  openCreateProgramPopup = () => {

  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
