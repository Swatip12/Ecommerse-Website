import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { CartStoreService } from '../../services/cart-store.service';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './cart-icon.component.html',
  styleUrls: ['./cart-icon.component.scss']
})
export class CartIconComponent implements OnInit, OnDestroy {
  cartItemCount = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private cartStoreService: CartStoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartStoreService.cartTotalQuantity$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.cartItemCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCartClick(): void {
    this.router.navigate(['/cart']);
  }

  get hasItems(): boolean {
    return this.cartItemCount > 0;
  }

  get displayCount(): string {
    return this.cartItemCount > 99 ? '99+' : this.cartItemCount.toString();
  }
}