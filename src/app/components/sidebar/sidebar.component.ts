import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeneralService } from '../../services/general.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() sidebarOpen: boolean = false;
  @Output() sidebarClose: EventEmitter<void> = new EventEmitter();
  user: any;

  constructor(public gs: GeneralService, private auth: AuthService) {
    this.user = this.auth.currentUser || {};
  }

  weekWorkouts = 0;
  savedProgram = this.gs.savedPrograms.length;

  ngOnInit(): void {

  }

  openCreateProgramPopup = () => {

  }

  logout() {
    this.auth.logout();
  }
}
