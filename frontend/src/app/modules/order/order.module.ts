import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      // Order routes will be defined here
    ])
  ],
  declarations: [
    // Order components will be declared here
  ]
})
export class OrderModule { }