import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { WorkoutsComponent } from './components/workouts/workouts.component';
import { LoginComponent } from './components/login/login.component';
import { WorkoutWizardComponent } from './components/workout-wizard/workout-wizard/workout-wizard.component';
import { AuthGuard } from './auth.guard';
import { WorkoutDetailComponent } from './components/workout-detail/workout-detail.component';
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
    path: 'workouts',
    component: WorkoutsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'workout-wizard',
    component: WorkoutWizardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'workout-wizard/:id',
    component: WorkoutWizardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'workout-detail/:id',
    component: WorkoutDetailComponent,
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
