import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HomeComponent } from './components/home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { WorkoutsComponent } from './components/workouts/workouts.component';
import { SelectWorkoutComponent } from './components/select-workout/select-workout.component';
import { WorkoutWizardComponent } from './components/workout-wizard/workout-wizard/workout-wizard.component';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { WorkoutDetailComponent } from './components/workout-detail/workout-detail.component';
import { DuplicateWorkoutDialogComponent } from './components/duplicate-workout-dialog/duplicate-workout-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalanderComponent } from './components/calander/calander.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { LoginComponent } from './components/login/login.component';
import { GeneralService } from './services/general.service';
import { ExerciseService } from './services/exercise.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { RouteService } from './services/route.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './auth.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoadingService } from './services/loading.service';
import { ExerciseSelectorComponent } from './components/workout-wizard/workout-wizard/exercise-selector/exercise-selector.component';
import { ExerciseConfigComponent } from './components/workout-wizard/workout-wizard/exercise-config/exercise-config.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { LoadingComponent } from './components/loading/loading.component';
import { CommonModule } from '@angular/common';
import { TimerComponent } from './components/timer/timer.component';
import { LogComponent } from './components/log/log.component';
import { StartWorkoutComponent } from './components/start-workout/start-workout.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ProfileWizardComponent } from './components/profile-wizard/profile-wizard.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    HomeComponent,
    WorkoutsComponent,
    CalanderComponent,
    SelectWorkoutComponent,
    DropdownComponent,
    LoginComponent,
    WorkoutWizardComponent,
    ExerciseSelectorComponent,
    ExerciseConfigComponent,
    WorkoutListComponent,
    WorkoutDetailComponent,
    ConfirmDialogComponent,
    DuplicateWorkoutDialogComponent,
    BreadcrumbComponent,
    LoadingComponent,
    TimerComponent,
    LogComponent,
    StartWorkoutComponent,
    ProfileWizardComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    GeneralService,
    ExerciseService,
    RouteService,
    AuthService,
    AuthGuard,
    LoadingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
