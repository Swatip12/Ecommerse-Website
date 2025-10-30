import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      // User routes will be defined here
    ])
  ],
  declarations: [
    // User components will be declared here
  ]
})
export class UserModule { }