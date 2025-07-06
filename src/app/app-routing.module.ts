import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { AnalyicComponent } from './components/analyic/analyic.component';
import { CalanderComponent } from './components/calander/calander.component';
import { SelectProgramComponent } from './components/select-program/select-program.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'programs', component: ProgramsComponent },
  { path: 'analyic', component: AnalyicComponent },
  { path: 'calander', component: CalanderComponent },
  { path: 'select-program', component: SelectProgramComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
