import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminProductListComponent } from './components/admin-product-list/admin-product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { AdminOrderListComponent } from './components/admin-order-list/admin-order-list.component';
import { OrderManagementComponent } from './components/order-management/order-management.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([
            {
                path: '',
                redirectTo: 'products',
                pathMatch: 'full'
            },
            {
                path: 'products',
                component: AdminProductListComponent
            },
            {
                path: 'orders',
                component: AdminOrderListComponent
            }
        ]),
        // Import standalone components
        AdminProductListComponent,
        ProductFormComponent,
        ImageUploadComponent,
        AdminOrderListComponent,
        OrderManagementComponent
    ]
})
export class AdminModule { }