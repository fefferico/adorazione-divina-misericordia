import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { BuilderComponent } from './components/builder/builder';
import { LibraryComponent } from './components/library/library';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'builder', component: BuilderComponent },
  { path: 'library', component: LibraryComponent },
  { path: '**', redirectTo: '' }
];
