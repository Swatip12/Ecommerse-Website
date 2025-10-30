import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild([
      {
        path: '',
        component: OrderHistoryComponent,
        data: { title: 'My Orders' }
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        data: { title: 'Checkout' }
      },
      {
        path: 'confirmation/:orderNumber',
        component: OrderConfirmationComponent,
        data: { title: 'Order Confirmation' }
      },
      {
        path: ':id',
        component: OrderDetailComponent,
        data: { title: 'Order Details' }
      }
    ])
  ],
  declarations: [
    CheckoutComponent,
    OrderConfirmationComponent,
    OrderHistoryComponent,
    OrderDetailComponent
  ],
  exports: [
    CheckoutComponent,
    OrderConfirmationComponent,
    OrderHistoryComponent,
    OrderDetailComponent
  ]
})
export class OrderModule { }