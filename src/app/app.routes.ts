import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  {
    path: '', loadComponent: () => import('./shared/layout/shell/shell.component').then(m => m.ShellComponent), canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'scan',      loadComponent: () => import('./features/scan/scan.component').then(m => m.ScanComponent) },
      { path: 'billing',   loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent) },
      { path: 'settings',  loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
    ],
  },
  { path: 'scan', loadComponent: () => import('./features/scan/scan.component').then(m => m.ScanComponent) },
  { path: '**', redirectTo: '' },
];
