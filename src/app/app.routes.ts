import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login.page/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
  },
  {
    path: 'doctor-dashboard',
    loadComponent: () => import('./pages/doctor-dashboard/doctor-dashboard.page').then((m) => m.DoctorDashboardPage),
  },
  
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
  },
  {
    path: 'doctor-dashboard',
    loadComponent: () => import('./pages/doctor-dashboard/doctor-dashboard.page').then((m) => m.DoctorDashboardPage),
  },
];
