import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouteService } from '../../services/route.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any;
  editing = false;
  nameInput = '';

  constructor(
    private auth: AuthService,
    private rs: RouteService,
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(u => this.user = u);
  }

  enableEdit() {
    this.editing = true;
    this.nameInput = this.user.name || '';
  }

  saveName() {
    const trimmed = this.nameInput.trim();
    if (trimmed) {
      this.rs.updateUserName(this.user._id, trimmed).subscribe(() => {
        this.user.name = trimmed;
        this.editing = false;
      });
    }
  }
}
