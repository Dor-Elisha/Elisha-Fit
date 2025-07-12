import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeneralService } from '../../services/general.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() sidebarOpen: boolean = false;
  @Output() sidebarClose: EventEmitter<void> = new EventEmitter();
  constructor(public gs: GeneralService) {}

  weekWorkouts = 0;
  savedProgram = this.gs.savedPrograms.length;

  ngOnInit(): void {

  }

  openCreateProgramPopup = () => {

  }
}
