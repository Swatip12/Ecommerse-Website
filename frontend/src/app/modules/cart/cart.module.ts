import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// NgRx imports removed - now configured at app level

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

// Components
import { CartComponent } from './components/cart/cart.component';
import { CartIconComponent } from './components/cart-icon/cart-icon.component';
import { CartSummaryComponent } from './components/cart-summary/cart-summary.component';

// Store configuration moved to app.config.ts

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDividerModule,
    MatBadgeModule,
    CartComponent,
    CartIconComponent,
    CartSummaryComponent,

    RouterModule.forChild([
      {
        path: '',
        component: CartComponent
      }
    ])
  ],
  declarations: [],
  exports: []
})
export class CartModule { }