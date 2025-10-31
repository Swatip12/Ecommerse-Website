import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  category: string;
  inStock: boolean;
}

@Component({
  selector: 'app-cart-placeholder',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatCardModule, MatButtonModule, 
    MatIconModule, MatFormFieldModule, MatInputModule, MatDividerModule, 
    MatBadgeModule, MatTooltipModule
  ],
  template: `
    <div class="cart-container">
      <!-- Modern Cart Header -->
      <div class="cart-header">
        <div class="header-content">
          <div class="header-left">
            <button mat-icon-button routerLink="/products" class="back-btn" matTooltip="Continue Shopping">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="header-text">
              <h1>Shopping Cart</h1>
              <p>{{ cartItems.length }} {{ cartItems.length === 1 ? 'item' : 'items' }} in your cart</p>
            </div>
          </div>
          <div class="header-right">
            <button mat-icon-button class="clear-cart-btn" matTooltip="Clear Cart" 
                    *ngIf="cartItems.length > 0" (click)="clearCart()">
              <mat-icon>delete_sweep</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <div class="cart-content" *ngIf="cartItems.length > 0; else emptyCart">
        <div class="cart-main">
          <!-- Cart Items Section -->
          <div class="cart-items-section">
            <div class="section-header">
              <h2>Your Items</h2>
              <span class="items-count">{{ getTotalItems() }} items</span>
            </div>

            <div class="cart-items">
              <div class="cart-item" *ngFor="let item of cartItems; trackBy: trackByItem">
                <div class="item-image">
                  <img [src]="item.image" [alt]="item.name" (error)="onImageError($event)">
                  <div class="item-badge" *ngIf="item.originalPrice">
                    <span>{{ getDiscountPercentage(item) }}% OFF</span>
                  </div>
                </div>

                <div class="item-details">
                  <div class="item-info">
                    <h3 class="item-name">{{ item.name }}</h3>
                    <p class="item-category">{{ item.category }}</p>
                    <div class="item-stock" [class.out-of-stock]="!item.inStock">
                      <mat-icon>{{ item.inStock ? 'check_circle' : 'error' }}</mat-icon>
                      <span>{{ item.inStock ? 'In Stock' : 'Out of Stock' }}</span>
                    </div>
                  </div>

                  <div class="item-actions">
                    <div class="quantity-controls">
                      <button mat-icon-button class="quantity-btn" (click)="decreaseQuantity(item)" 
                              [disabled]="item.quantity <= 1">
                        <mat-icon>remove</mat-icon>
                      </button>
                      <span class="quantity">{{ item.quantity }}</span>
                      <button mat-icon-button class="quantity-btn" (click)="increaseQuantity(item)">
                        <mat-icon>add</mat-icon>
                      </button>
                    </div>

                    <div class="item-price">
                      <div class="price-main">
                        <span class="current-price">\${{ (item.price * item.quantity).toFixed(2) }}</span>
                        <span class="original-price" *ngIf="item.originalPrice">
                          \${{ (item.originalPrice * item.quantity).toFixed(2) }}
                        </span>
                      </div>
                      <div class="price-per-unit">
                        \${{ item.price.toFixed(2) }} each
                      </div>
                    </div>

                    <button mat-icon-button class="remove-btn" (click)="removeItem(item)" 
                            matTooltip="Remove from cart">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommended Items -->
          <div class="recommended-section" *ngIf="recommendedItems.length > 0">
            <h3>You might also like</h3>
            <div class="recommended-items">
              <div class="recommended-item" *ngFor="let item of recommendedItems">
                <img [src]="item.image" [alt]="item.name">
                <div class="recommended-info">
                  <h4>{{ item.name }}</h4>
                  <span class="recommended-price">\${{ item.price.toFixed(2) }}</span>
                </div>
                <button mat-mini-fab color="primary" (click)="addRecommendedItem(item)" 
                        matTooltip="Add to cart">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary Sidebar -->
        <div class="cart-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>
            
            <div class="summary-row">
              <span>Subtotal ({{ getTotalItems() }} items)</span>
              <span>\${{ getSubtotal().toFixed(2) }}</span>
            </div>
            
            <div class="summary-row" *ngIf="getTotalSavings() > 0">
              <span class="savings">Total Savings</span>
              <span class="savings">-\${{ getTotalSavings().toFixed(2) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Shipping</span>
              <span class="free-shipping">{{ getShipping() === 0 ? 'FREE' : '$' + getShipping().toFixed(2) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Tax</span>
              <span>\${{ getTax().toFixed(2) }}</span>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="summary-row total">
              <span>Total</span>
              <span>\${{ getTotal().toFixed(2) }}</span>
            </div>

            <div class="promo-section">
              <mat-form-field appearance="outline" class="promo-field">
                <mat-label>Promo Code</mat-label>
                <input matInput [(ngModel)]="promoCode" placeholder="Enter code">
                <button mat-icon-button matSuffix (click)="applyPromoCode()" 
                        [disabled]="!promoCode">
                  <mat-icon>local_offer</mat-icon>
                </button>
              </mat-form-field>
            </div>

            <div class="checkout-actions">
              <button mat-raised-button color="primary" class="checkout-btn" 
                      (click)="proceedToCheckout()" [disabled]="!hasInStockItems()">
                <mat-icon>payment</mat-icon>
                Proceed to Checkout
              </button>
              
              <button mat-stroked-button class="continue-shopping-btn" routerLink="/products">
                <mat-icon>shopping_bag</mat-icon>
                Continue Shopping
              </button>
            </div>

            <div class="security-badges">
              <div class="security-item">
                <mat-icon>security</mat-icon>
                <span>Secure Checkout</span>
              </div>
              <div class="security-item">
                <mat-icon>local_shipping</mat-icon>
                <span>Free Shipping over $50</span>
              </div>
              <div class="security-item">
                <mat-icon>keyboard_return</mat-icon>
                <span>30-day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart State -->
      <ng-template #emptyCart>
        <div class="empty-cart">
          <div class="empty-cart-content">
            <div class="empty-cart-icon">
              <mat-icon>shopping_cart</mat-icon>
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
            
            <div class="empty-cart-actions">
              <button mat-raised-button color="primary" routerLink="/products" class="shop-now-btn">
                <mat-icon>shopping_bag</mat-icon>
                Start Shopping
              </button>
              <button mat-stroked-button (click)="addSampleItems()" class="demo-btn">
                <mat-icon>preview</mat-icon>
                View Cart Demo
              </button>
              <button mat-stroked-button routerLink="/dashboard" class="home-btn">
                <mat-icon>home</mat-icon>
                Back to Home
              </button>
            </div>

            <div class="popular-categories">
              <h3>Popular Categories</h3>
              <div class="category-links">
                <button mat-stroked-button routerLink="/products" [queryParams]="{category: 'Electronics'}">
                  <mat-icon>devices</mat-icon>
                  Electronics
                </button>
                <button mat-stroked-button routerLink="/products" [queryParams]="{category: 'Mens'}">
                  <mat-icon>person</mat-icon>
                  Men's Fashion
                </button>
                <button mat-stroked-button routerLink="/products" [queryParams]="{category: 'Womens'}">
                  <mat-icon>person</mat-icon>
                  Women's Fashion
                </button>
                <button mat-stroked-button routerLink="/products" [queryParams]="{category: 'Home & Living'}">
                  <mat-icon>home</mat-icon>
                  Home & Living
                </button>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .cart-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .cart-header {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .back-btn {
      background: rgba(102, 126, 234, 0.1) !important;
      color: #667eea !important;
    }

    .header-text h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .header-text p {
      margin: 5px 0 0 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .clear-cart-btn {
      color: #e74c3c !important;
    }

    .cart-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 30px 20px;
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 30px;
    }

    .cart-items-section {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f8f9fa;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .items-count {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .cart-item {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 15px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .cart-item:hover {
      border-color: rgba(102, 126, 234, 0.3);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
    }

    .item-image {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: white;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .item-details {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
      line-height: 1.3;
    }

    .item-category {
      margin: 0 0 12px 0;
      color: #667eea;
      font-size: 0.9rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .item-stock {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .item-stock mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #27ae60;
    }

    .item-stock.out-of-stock mat-icon {
      color: #e74c3c;
    }

    .item-stock.out-of-stock {
      color: #e74c3c;
    }

    .item-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 15px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      border-radius: 25px;
      padding: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .quantity-btn {
      width: 32px !important;
      height: 32px !important;
      background: rgba(102, 126, 234, 0.1) !important;
      color: #667eea !important;
    }

    .quantity-btn:disabled {
      background: rgba(0,0,0,0.05) !important;
      color: rgba(0,0,0,0.3) !important;
    }

    .quantity {
      min-width: 30px;
      text-align: center;
      font-weight: 600;
      color: #2c3e50;
    }

    .item-price {
      text-align: right;
    }

    .price-main {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .current-price {
      font-size: 1.3rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .original-price {
      font-size: 1rem;
      color: #95a5a6;
      text-decoration: line-through;
    }

    .price-per-unit {
      font-size: 0.8rem;
      color: #7f8c8d;
      margin-top: 4px;
    }

    .remove-btn {
      color: #e74c3c !important;
      background: rgba(231, 76, 60, 0.1) !important;
    }

    .remove-btn:hover {
      background: rgba(231, 76, 60, 0.2) !important;
    }

    .recommended-section {
      background: white;
      border-radius: 15px;
      padding: 25px;
      margin-top: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .recommended-section h3 {
      margin: 0 0 20px 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .recommended-items {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .recommended-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .recommended-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
    }

    .recommended-item img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
    }

    .recommended-info {
      flex: 1;
    }

    .recommended-info h4 {
      margin: 0 0 4px 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .recommended-price {
      font-size: 0.9rem;
      font-weight: 600;
      color: #667eea;
    }

    .cart-summary {
      position: sticky;
      top: 120px;
      height: fit-content;
    }

    .summary-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .summary-card h3 {
      margin: 0 0 20px 0;
      font-size: 1.4rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      font-size: 0.95rem;
    }

    .summary-row.total {
      font-size: 1.2rem;
      font-weight: 700;
      color: #2c3e50;
      padding: 20px 0 10px 0;
    }

    .savings {
      color: #27ae60 !important;
      font-weight: 600;
    }

    .free-shipping {
      color: #27ae60;
      font-weight: 600;
    }

    .promo-section {
      margin: 20px 0;
    }

    .promo-field {
      width: 100%;
    }

    .checkout-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 25px 0;
    }

    .checkout-btn {
      width: 100%;
      padding: 15px !important;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
    }

    .checkout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .continue-shopping-btn {
      width: 100%;
      padding: 12px !important;
      font-weight: 500 !important;
      border-radius: 12px !important;
      border-color: #667eea !important;
      color: #667eea !important;
    }

    .security-badges {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
    }

    .security-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      color: #7f8c8d;
    }

    .security-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #27ae60;
    }

    .empty-cart {
      max-width: 600px;
      margin: 0 auto;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-cart-content {
      background: white;
      border-radius: 20px;
      padding: 60px 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }

    .empty-cart-icon {
      margin-bottom: 30px;
    }

    .empty-cart-icon mat-icon {
      font-size: 5rem;
      width: 5rem;
      height: 5rem;
      color: #bdc3c7;
    }

    .empty-cart-content h2 {
      margin: 0 0 15px 0;
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .empty-cart-content p {
      margin: 0 0 40px 0;
      font-size: 1.1rem;
      color: #7f8c8d;
      line-height: 1.6;
    }

    .empty-cart-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .shop-now-btn {
      padding: 15px 30px !important;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
      border-radius: 25px !important;
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
    }

    .demo-btn {
      padding: 15px 30px !important;
      font-size: 1.1rem !important;
      font-weight: 500 !important;
      border-radius: 25px !important;
      border-color: #667eea !important;
      color: #667eea !important;
    }

    .home-btn {
      padding: 15px 30px !important;
      font-size: 1.1rem !important;
      font-weight: 500 !important;
      border-radius: 25px !important;
      border-color: #667eea !important;
      color: #667eea !important;
    }

    .popular-categories h3 {
      margin: 0 0 20px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .category-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .category-links button {
      padding: 12px 16px !important;
      border-radius: 12px !important;
      border-color: rgba(102, 126, 234, 0.3) !important;
      color: #667eea !important;
      font-weight: 500 !important;
    }

    .category-links button:hover {
      background: rgba(102, 126, 234, 0.1) !important;
      border-color: #667eea !important;
    }

    @media (max-width: 1024px) {
      .cart-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .cart-summary {
        position: static;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 15px;
      }

      .cart-content {
        padding: 20px 15px;
      }

      .cart-item {
        flex-direction: column;
        gap: 15px;
      }

      .item-image {
        width: 100%;
        height: 200px;
      }

      .item-details {
        flex-direction: column;
        gap: 15px;
      }

      .item-actions {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }

      .recommended-items {
        grid-template-columns: 1fr;
      }

      .empty-cart-content {
        padding: 40px 20px;
      }

      .empty-cart-actions {
        flex-direction: column;
      }

      .category-links {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .header-text h1 {
        font-size: 1.5rem;
      }

      .cart-items-section,
      .summary-card {
        padding: 20px;
      }

      .empty-cart-icon mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
      }

      .empty-cart-content h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class CartPlaceholderComponent implements OnInit {
  cartItems: CartItem[] = [];
  recommendedItems: CartItem[] = [];
  promoCode = '';
  taxRate = 0.08; // 8% tax
  freeShippingThreshold = 50;

  ngOnInit() {
    this.loadCartItems();
    this.loadRecommendedItems();
  }

  loadCartItems() {
    // Sample cart items for demonstration
    this.cartItems = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        price: 1199.99,
        originalPrice: 1299.99,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
        quantity: 1,
        category: 'Electronics',
        inStock: true
      },
      {
        id: 2,
        name: 'Sony WH-1000XM5 Headphones',
        price: 349.99,
        originalPrice: 399.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        quantity: 2,
        category: 'Electronics',
        inStock: true
      },
      {
        id: 3,
        name: 'Classic Denim Jacket',
        price: 89.99,
        originalPrice: 129.99,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
        quantity: 1,
        category: 'Mens Fashion',
        inStock: false
      }
    ];
  }

  loadRecommendedItems() {
    this.recommendedItems = [
      {
        id: 4,
        name: 'MacBook Pro 14"',
        price: 1999.99,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
        quantity: 1,
        category: 'Electronics',
        inStock: true
      },
      {
        id: 5,
        name: 'Leather Dress Shoes',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
        quantity: 1,
        category: 'Mens Fashion',
        inStock: true
      }
    ];
  }

  trackByItem(index: number, item: CartItem): number {
    return item.id;
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
  }

  getDiscountPercentage(item: CartItem): number {
    if (!item.originalPrice) return 0;
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  }

  increaseQuantity(item: CartItem) {
    item.quantity++;
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  removeItem(item: CartItem) {
    const index = this.cartItems.findIndex(cartItem => cartItem.id === item.id);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
  }

  clearCart() {
    this.cartItems = [];
  }

  addRecommendedItem(item: CartItem) {
    const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({ ...item, quantity: 1 });
    }
    
    // Remove from recommended items
    const index = this.recommendedItems.findIndex(recItem => recItem.id === item.id);
    if (index > -1) {
      this.recommendedItems.splice(index, 1);
    }
  }

  addSampleItems() {
    this.loadCartItems();
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalSavings(): number {
    return this.cartItems.reduce((total, item) => {
      if (item.originalPrice) {
        return total + ((item.originalPrice - item.price) * item.quantity);
      }
      return total;
    }, 0);
  }

  getShipping(): number {
    const subtotal = this.getSubtotal();
    return subtotal >= this.freeShippingThreshold ? 0 : 9.99;
  }

  getTax(): number {
    return this.getSubtotal() * this.taxRate;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping() + this.getTax();
  }

  hasInStockItems(): boolean {
    return this.cartItems.some(item => item.inStock);
  }

  applyPromoCode() {
    if (this.promoCode.toLowerCase() === 'save10') {
      alert('Promo code applied! 10% discount will be applied at checkout.');
    } else {
      alert('Invalid promo code. Please try again.');
    }
  }

  proceedToCheckout() {
    if (this.hasInStockItems()) {
      alert('Proceeding to checkout...');
      // In a real app, this would navigate to checkout
    }
  }
}