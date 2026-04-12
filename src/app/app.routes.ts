import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { BuilderComponent } from './components/builder/builder';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'builder', component: BuilderComponent },
  { path: '**', redirectTo: '' }
];
