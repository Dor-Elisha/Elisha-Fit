import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user: any;
  editing = false;
  nameInput = '';

  constructor(private auth: AuthService) {
    this.user = this.auth.currentUser || {};
  }

  enableEdit() {
    this.editing = true;
    this.nameInput = this.user.name || '';
  }

  saveName() {
    const trimmed = this.nameInput.trim();
    if (trimmed) {
      this.user.name = trimmed;
      localStorage.setItem('currentUser', JSON.stringify(this.user));
      this.editing = false;
    }
  }
}
