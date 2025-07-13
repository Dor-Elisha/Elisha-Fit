import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { AnalyicComponent } from './components/analyic/analyic.component'; // Adjust path if needed
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProgramWizardComponent } from './components/program-wizard/program-wizard/program-wizard.component';
import { ProgramEditComponent } from './components/program-edit/program-edit.component';
import { ProgressEntryComponent } from './components/progress-entry/progress-entry.component';
import { ProgressDashboardComponent } from './components/progress-dashboard/progress-dashboard.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'programs',
    component: ProgramsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'program-wizard',
    component: ProgramWizardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'program-edit/:id',
    component: ProgramEditComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'progress-entry',
    component: ProgressEntryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'progress-dashboard',
    component: ProgressDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'analytic',
    component: AnalyicComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
