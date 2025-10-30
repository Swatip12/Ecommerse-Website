import { Injectable, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from './cart.service';
import { RealTimeIntegrationService } from '../../../shared/services/realtime-integration.service';
import { RealTimeConnectionService } from '../../../shared/services/realtime-connection.service';
import { AddToCartRequest, UpdateCartItemRequest } from '../models/cart.models';

@Injectable({
  providedIn: 'root'
})
export class RealTimeCartService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private isInitialized = false;

  constructor(
    private cartService: CartService,
    private realTimeIntegrationService: RealTimeIntegrationService,
    private realTimeConnectionService: RealTimeConnectionService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize real-time cart features
   */
  initialize(userId: string, authToken: string): void {
    if (this.isInitialized) {
      return;
    }

    console.log('Initializing real-time cart service...');
    
    // Initialize real-time integration
    this.realTimeIntegrationService.initialize(userId, authToken);
    
    // Set up cart update listeners
    this.setupCartUpdateListeners();
    
    this.isInitialized = true;
  }

  /**
   * Add item to cart with real-time sync
   */
  addToCart(request: AddToCartRequest): void {
    // Add to cart via HTTP API
    this.cartService.addToCart(request).subscribe({
      next: (cartItem) => {
        console.log('Item added to cart:', cartItem);
        
        // Sync with other devices via WebSocket
        if (this.realTimeIntegrationService.isConnected()) {
          this.realTimeIntegrationService.addToCart(
            cartItem.productId,
            cartItem.productName,
            cartItem.quantity,
            cartItem.unitPrice
          );
        }
      },
      error: (error) => {
        console.error('Error adding item to cart:', error);
      }
    });
  }

  /**
   * Update cart item with real-time sync
   */
  updateCartItem(productId: number, request: UpdateCartItemRequest): void {
    const oldQuantity = this.cartService.getProductQuantityInCart(productId);
    
    this.cartService.updateCartItem(productId, request).subscribe({
      next: (cartItem) => {
        console.log('Cart item updated:', cartItem);
        
        // Sync with other devices
        if (this.realTimeIntegrationService.isConnected()) {
          const quantityDiff = cartItem.quantity - oldQuantity;
          if (quantityDiff > 0) {
            this.realTimeIntegrationService.addToCart(
              cartItem.productId,
              cartItem.productName,
              quantityDiff,
              cartItem.unitPrice
            );
          } else if (quantityDiff < 0) {
            this.realTimeIntegrationService.removeFromCart(
              cartItem.productId,
              cartItem.productName,
              Math.abs(quantityDiff)
            );
          }
        }
      },
      error: (error) => {
        console.error('Error updating cart item:', error);
      }
    });
  }

  /**
   * Remove item from cart with real-time sync
   */
  removeFromCart(productId: number): void {
    const cartItem = this.cartService.findCartItem(productId);
    
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        console.log('Item removed from cart:', productId);
        
        // Sync with other devices
        if (this.realTimeIntegrationService.isConnected() && cartItem) {
          this.realTimeIntegrationService.removeFromCart(
            cartItem.productId,
            cartItem.productName,
            cartItem.quantity
          );
        }
      },
      error: (error) => {
        console.error('Error removing item from cart:', error);
      }
    });
  }

  /**
   * Clear cart with real-time sync
   */
  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        console.log('Cart cleared');
        
        // Sync with other devices
        if (this.realTimeIntegrationService.isConnected()) {
          this.realTimeIntegrationService.clearCart();
        }
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      }
    });
  }

  /**
   * Sync current cart state with other devices
   */
  syncCartState(): void {
    const cartSummary = this.cartService.getCurrentCartSummary();
    
    if (this.realTimeIntegrationService.isConnected()) {
      this.realTimeIntegrationService.syncCart({
        items: cartSummary.items,
        totalItems: cartSummary.totalItems,
        totalQuantity: cartSummary.totalQuantity,
        subtotal: cartSummary.subtotal,
        estimatedTotal: cartSummary.estimatedTotal
      });
    }
  }

  /**
   * Check if real-time features are connected
   */
  isRealTimeConnected(): boolean {
    return this.realTimeIntegrationService.isConnected();
  }

  /**
   * Manually reconnect real-time features
   */
  reconnectRealTime(): void {
    this.realTimeIntegrationService.reconnect();
  }

  private setupCartUpdateListeners(): void {
    // Listen for cart updates from other devices
    this.realTimeConnectionService.subscribeToCartUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cartUpdate => {
        this.handleRemoteCartUpdate(cartUpdate);
      });

    // Listen for inventory updates that might affect cart
    this.realTimeConnectionService.subscribeToInventoryUpdates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(inventoryUpdate => {
        this.handleInventoryUpdate(inventoryUpdate);
      });
  }

  private handleRemoteCartUpdate(cartUpdate: any): void {
    console.log('Received remote cart update:', cartUpdate);
    
    // Refresh local cart to sync with remote changes
    // Only refresh if the update is not from this session
    if (cartUpdate.action && cartUpdate.action !== 'local_update') {
      setTimeout(() => {
        this.cartService.refreshCart();
      }, 500); // Small delay to avoid race conditions
    }
  }

  private handleInventoryUpdate(inventoryUpdate: any): void {
    console.log('Received inventory update:', inventoryUpdate);
    
    // Check if any cart items are affected by inventory changes
    const cartSummary = this.cartService.getCurrentCartSummary();
    const affectedItem = cartSummary.items.find(
      item => item.productId === inventoryUpdate.productId
    );
    
    if (affectedItem && inventoryUpdate.availableQuantity < affectedItem.quantity) {
      // Validate cart to handle inventory conflicts
      this.cartService.validateCartInventory().subscribe({
        next: (validatedItems) => {
          console.log('Cart validated after inventory update:', validatedItems);
          this.cartService.refreshCart();
        },
        error: (error) => {
          console.error('Error validating cart after inventory update:', error);
        }
      });
    }
  }
}