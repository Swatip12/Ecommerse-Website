import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/status',
    pathMatch: 'full'
  },
  {
    path: 'status',
    loadComponent: () => import('./simple-status.component').then(m => m.SimpleStatusComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./user-register.component').then(m => m.UserRegisterComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./user-login.component').then(m => m.UserLoginComponent)
  },
  {
    path: 'admin-register',
    loadComponent: () => import('./admin-register.component').then(m => m.AdminRegisterComponent)
  },
  {
    path: 'test',
    loadComponent: () => import('./test-page.component').then(m => m.TestPageComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./shared/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./products-simple.component').then(m => m.ProductsSimpleComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart-placeholder.component').then(m => m.CartPlaceholderComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders-placeholder.component').then(m => m.OrdersPlaceholderComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin-placeholder.component').then(m => m.AdminPlaceholderComponent)
  },
  {
    path: 'integration-test',
    loadComponent: () => import('./integration-test.component').then(m => m.IntegrationTestComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];