import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProgramWizardComponent } from './components/program-wizard/program-wizard/program-wizard.component';
import { AuthGuard } from './auth.guard';
import { ProgramDetailComponent } from './components/program-detail/program-detail.component';
import { LogComponent } from './components/log/log.component';
import { StartWorkoutComponent } from './components/start-workout/start-workout.component';

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
    path: 'program-wizard/:id',
    component: ProgramWizardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'program-detail/:id',
    component: ProgramDetailComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'logs',
    component: LogComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'start-workout',
    component: StartWorkoutComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
