import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'add',
    loadComponent: () => import('./pages/add/add.page').then(m => m.AddPage)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./pages/edit/edit.page').then(m => m.EditPage)
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/details/details.page').then(m => m.DetailsPage)
  }
];
