import { Routes } from '@angular/router';
import { AuthGuard } from './modules/user/guards/auth.guard';
import { GuestGuard } from './modules/user/guards/guest.guard';
import { RoleGuard } from './modules/user/guards/role.guard';
import { UserRole } from './modules/user/models/auth.models';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/user/components/login/login.component').then(m => m.LoginComponent),
        canActivate: [GuestGuard]
      },
      {
        path: 'register',
        loadComponent: () => import('./modules/user/components/register/register.component').then(m => m.RegisterComponent),
        canActivate: [GuestGuard]
      }
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./shared/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: 'products',
    loadChildren: () => import('./modules/product/product.module').then(m => m.ProductModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'cart',
    loadChildren: () => import('./modules/cart/cart.module').then(m => m.CartModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadChildren: () => import('./modules/order/order.module').then(m => m.OrderModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'integration-test',
    loadComponent: () => import('./integration-test.component').then(m => m.IntegrationTestComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
