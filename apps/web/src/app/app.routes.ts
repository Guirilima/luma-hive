import { Component } from '@angular/core';
@Component({ standalone: true, template: '' })
export class NetworkRoute {}
import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'squad' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/projects.component').then((m) => m.ProjectsComponent),
  },
  {
    path: 'squad',
    component: NetworkRoute,
  },
  {
    path: 'handoffs',
    loadComponent: () =>
      import('./features/handoffs/handoffs.component').then((m) => m.HandoffsComponent),
  },
  {
    path: 'squads',
    loadComponent: () =>
      import('./features/squads/squad-editor.component').then((m) => m.SquadEditorComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
