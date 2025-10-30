import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      // Product routes will be defined here
    ])
  ],
  declarations: [
    // Product components will be declared here
  ]
})
export class ProductModule { }