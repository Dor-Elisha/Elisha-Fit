import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { GeneralService } from '../../services/general.service';

@Component({
  selector: 'app-profile-wizard',
  templateUrl: './profile-wizard.component.html',
  styleUrls: ['./profile-wizard.component.scss']
})
export class ProfileWizardComponent {
  profile = {
    fullName: '',
    currentWeight: '',
    height: '',
    goalWeight: '',
    birthday: ''
  };
  isSaving = false;
  error = '';

  constructor(private auth: AuthService, private gs: GeneralService) {}

  onSubmit() {
    this.isSaving = true;
    this.error = '';
    this.auth.updateProfile({
      name: this.profile.fullName,
      currentWeight: this.profile.currentWeight,
      height: this.profile.height,
      goalWeight: this.profile.goalWeight,
      birthday: this.profile.birthday
    }).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        // Update global user info so sidebar/header update immediately
        if (response && response.user) {
          this.gs.setUserInfo({ user: response.user });
        }
        // The wizard will auto-hide because user.name is now set
      },
      error: (err) => {
        this.isSaving = false;
        this.error = err.error?.error || 'Failed to save profile.';
      }
    });
  }
}
