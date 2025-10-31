import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { CartStoreService } from '../../services/cart-store.service';
import { CartSummary, CartItem, UpdateCartItemRequest } from '../../models/cart.models';

@Component({
  selector: 'app-cart',
  standalone: true,
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
    MatBadgeModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartSummary: CartSummary = {
    items: [],
    totalItems: 0,
    totalQuantity: 0,
    subtotal: 0,
    estimatedTax: 0,
    estimatedShipping: 0,
    estimatedTotal: 0,
    currency: 'USD'
  };
  
  loading = false;
  error: string | null = null;
  isEmpty = true;
  isProcessing = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private cartStoreService: CartStoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart state
    this.cartStoreService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });

    this.cartStoreService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    this.cartStoreService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.error = error;
      });

    this.cartStoreService.isEmpty$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isEmpty => {
        this.isEmpty = isEmpty;
      });

    this.cartStoreService.isProcessing$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isProcessing => {
        this.isProcessing = isProcessing;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    this.cartStoreService.loadCart();
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    if (newQuantity === item.quantity) {
      return;
    }

    const request: UpdateCartItemRequest = { quantity: newQuantity };
    this.cartStoreService.updateCartItem(item.productId, request);
  }

  removeItem(item: CartItem): void {
    this.cartStoreService.removeFromCart(item.productId);
  }

  clearCart(): void {
    if (!confirm('Are you sure you want to remove all items from your cart?')) {
      return;
    }

    this.cartStoreService.clearCart();
  }

  proceedToCheckout(): void {
    if (this.isEmpty) {
      return;
    }
    
    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  onQuantityChange(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value, 10);
    
    if (isNaN(newQuantity) || newQuantity < 0) {
      input.value = item.quantity.toString();
      return;
    }
    
    this.updateQuantity(item, newQuantity);
  }

  incrementQuantity(item: CartItem): void {
    this.cartStoreService.incrementQuantity(item.productId);
  }

  decrementQuantity(item: CartItem): void {
    this.cartStoreService.decrementQuantity(item.productId);
  }

  isItemUpdating(productId: number): boolean {
    let isUpdating = false;
    this.cartStoreService.isItemUpdating(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(updating => isUpdating = updating);
    return isUpdating;
  }

  isItemRemoving(productId: number): boolean {
    let isRemoving = false;
    this.cartStoreService.isItemRemoving(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(removing => isRemoving = removing);
    return isRemoving;
  }

  get hasItems(): boolean {
    return !this.isEmpty;
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }
}