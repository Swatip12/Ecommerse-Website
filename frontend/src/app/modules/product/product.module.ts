import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CategoryNavigationComponent } from './components/category-navigation/category-navigation.component';
import { ProductSearchComponent } from './components/product-search/product-search.component';
import { ProductCatalogComponent } from './components/product-catalog/product-catalog.component';

const routes: Routes = [
  {
    path: '',
    component: ProductCatalogComponent
  },
  {
    path: 'category/:categoryId',
    component: ProductCatalogComponent
  },
  {
    path: 'search',
    component: ProductCatalogComponent
  },
  {
    path: ':id',
    component: ProductDetailComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    // Import standalone components
    ProductListComponent,
    ProductDetailComponent,
    CategoryNavigationComponent,
    ProductSearchComponent,
    ProductCatalogComponent
  ],
  exports: [
    // Export components for use in other modules
    ProductListComponent,
    ProductDetailComponent,
    CategoryNavigationComponent,
    ProductSearchComponent,
    ProductCatalogComponent
  ]
})
export class ProductModule { }