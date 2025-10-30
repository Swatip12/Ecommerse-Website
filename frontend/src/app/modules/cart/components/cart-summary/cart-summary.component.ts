import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartStoreService } from '../../services/cart-store.service';
import { CartSummary } from '../../models/cart.models';

@Component({
  selector: 'app-cart-summary',
  templateUrl: './cart-summary.component.html',
  styleUrls: ['./cart-summary.component.scss']
})
export class CartSummaryComponent implements OnInit, OnDestroy {
  @Input() showCheckoutButton = true;
  @Input() showContinueShoppingButton = false;
  @Input() compact = false;
  @Output() checkout = new EventEmitter<void>();
  @Output() continueShopping = new EventEmitter<void>();

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

  isEmpty = true;
  isFreeShipping = false;
  amountForFreeShipping = 0;
  isCloseToFreeShipping = false;

  private destroy$ = new Subject<void>();

  constructor(private cartStoreService: CartStoreService) {}

  ngOnInit(): void {
    this.cartStoreService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });

    this.cartStoreService.isEmpty$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isEmpty => {
        this.isEmpty = isEmpty;
      });

    this.cartStoreService.isFreeShipping$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isFreeShipping => {
        this.isFreeShipping = isFreeShipping;
      });

    this.cartStoreService.amountForFreeShipping$
      .pipe(takeUntil(this.destroy$))
      .subscribe(amount => {
        this.amountForFreeShipping = amount;
      });

    this.cartStoreService.isCloseToFreeShipping$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isClose => {
        this.isCloseToFreeShipping = isClose;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCheckout(): void {
    if (!this.isEmpty) {
      this.checkout.emit();
    }
  }

  onContinueShopping(): void {
    this.continueShopping.emit();
  }

  get hasItems(): boolean {
    return !this.isEmpty;
  }

  get freeShippingThreshold(): number {
    return 50; // $50 for free shipping
  }
}