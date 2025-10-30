import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      // Admin routes will be defined here
    ])
  ],
  declarations: [
    // Admin components will be declared here
  ]
})
export class AdminModule { }