import { Routes } from "@angular/router";

export const routes: Routes = [
    {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    // canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tasks',
    // canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tasks/task-list/task-list.component').then(m => m.TaskListComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }

];
