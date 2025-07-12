import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { AnalyicComponent } from './components/analyic/analyic.component'; // Adjust path if needed

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'programs', component: ProgramsComponent },
  { path: 'analytic', component: AnalyicComponent },
  // Add more routes here if needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
