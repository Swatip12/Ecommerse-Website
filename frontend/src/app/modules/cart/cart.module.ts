import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      // Cart routes will be defined here
    ])
  ],
  declarations: [
    // Cart components will be declared here
  ]
})
export class CartModule { }