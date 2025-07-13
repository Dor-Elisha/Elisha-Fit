import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HomeComponent } from './components/home/home.component';
import { AppRoutingModule } from './app-routing.module';
import { ProgramsComponent } from './components/programs/programs.component';
import { AnalyicComponent } from './components/analyic/analyic.component';
import { SelectProgramComponent } from './components/select-program/select-program.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalanderComponent } from './components/calander/calander.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { GeneralService } from './services/general.service';
import { ExerciseService } from './services/exercise.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { RouteService } from './services/route.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './auth.guard';
import { ProgramWizardComponent } from './components/program-wizard/program-wizard/program-wizard.component';
import { ExerciseSelectorComponent } from './components/program-wizard/exercise-selector/exercise-selector.component';
import { ExerciseConfigComponent } from './components/program-wizard/exercise-config/exercise-config.component';
import { ProgramListComponent } from './components/program-list/program-list.component';
import { ProgramDetailComponent } from './components/program-detail/program-detail.component';
import { ProgramEditComponent } from './components/program-edit/program-edit.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DuplicateProgramDialogComponent } from './components/duplicate-program-dialog/duplicate-program-dialog.component';
import { ProgressEntryComponent } from './components/progress-entry/progress-entry.component';
import { ProgressHistoryComponent } from './components/progress-history/progress-history.component';
import { ProgressAnalyticsComponent } from './components/progress-analytics/progress-analytics.component';
import { ProgressDashboardComponent } from './components/progress-dashboard/progress-dashboard.component';
import { GoalManagementComponent } from './components/goal-management/goal-management.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    HomeComponent,
    ProgramsComponent,
    AnalyicComponent,
    CalanderComponent,
    SelectProgramComponent,
    DropdownComponent,
    LoginComponent,
    ProfileComponent,
    ProgramWizardComponent,
    ExerciseSelectorComponent,
    ExerciseConfigComponent,
    ProgramListComponent,
    ProgramDetailComponent,
    ProgramEditComponent,
    ConfirmDialogComponent,
    DuplicateProgramDialogComponent,
    ProgressEntryComponent,
    ProgressHistoryComponent,
    ProgressAnalyticsComponent,
    ProgressDashboardComponent,
    GoalManagementComponent,
  ],
  imports: [
    BrowserModule,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
