import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../modules/user/services/auth.service';
import { User } from '../../../modules/user/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <!-- Main Hero Section -->
    <div class="hero-section">
      <div class="hero-background"></div>
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge">✨ New Collection 2024</div>
          <h1 class="hero-title">Discover Amazing Products</h1>
          <p class="hero-subtitle">Shop the latest trends with unbeatable prices and premium quality</p>
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">50K+</span>
              <span class="stat-label">Happy Customers</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">10K+</span>
              <span class="stat-label">Products</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">99%</span>
              <span class="stat-label">Satisfaction</span>
            </div>
          </div>
          <div class="hero-actions">
            <button mat-raised-button color="primary" routerLink="/products" class="primary-cta">
              <mat-icon>shopping_bag</mat-icon>
              Start Shopping
            </button>
            <button mat-stroked-button routerLink="/register" class="secondary-cta">
              <mat-icon>person_add</mat-icon>
              Join Free
            </button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="product-carousel">
            <div class="carousel-item active" *ngFor="let product of heroProducts; let i = index">
              <div class="product-showcase">
                <img [src]="product.image" [alt]="product.name" class="showcase-image">
                <div class="showcase-info">
                  <h3>{{ product.name }}</h3>
                  <div class="showcase-price">\${{ product.price }}</div>
                  <div class="showcase-rating">
                    <span class="stars">★★★★★</span>
                    <span>({{ product.reviews }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trust Indicators -->
    <div class="trust-section">
      <div class="trust-container">
        <div class="trust-item">
          <div class="trust-icon">🚚</div>
          <div class="trust-content">
            <h4>Free Shipping</h4>
            <p>On orders over $50</p>
          </div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">🔒</div>
          <div class="trust-content">
            <h4>Secure Payment</h4>
            <p>100% protected</p>
          </div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">↩️</div>
          <div class="trust-content">
            <h4>Easy Returns</h4>
            <p>30-day guarantee</p>
          </div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">⭐</div>
          <div class="trust-content">
            <h4>Top Quality</h4>
            <p>Premium products</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Categories -->
    <div class="categories-section">
      <div class="container">
        <div class="section-header">
          <h2>Shop by Category</h2>
          <p>Discover our curated collections</p>
        </div>
        <div class="categories-grid">
          <div class="category-card large" [routerLink]="['/products']" [queryParams]="{category: 'Electronics'}">
            <div class="category-image">
              <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=400&fit=crop&crop=center" alt="Electronics">
            </div>
            <div class="category-overlay">
              <h3>Electronics</h3>
              <p>Latest gadgets & tech</p>
              <span class="category-count">2,450+ items</span>
            </div>
          </div>
          
          <div class="category-card" [routerLink]="['/products']" [queryParams]="{category: 'Mens'}">
            <div class="category-image">
              <img src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=300&h=300&fit=crop&crop=center" alt="Men's Fashion">
            </div>
            <div class="category-overlay">
              <h3>Men's</h3>
              <p>Fashion & accessories</p>
              <span class="category-count">1,890+ items</span>
            </div>
          </div>
          
          <div class="category-card" [routerLink]="['/products']" [queryParams]="{category: 'Womens'}">
            <div class="category-image">
              <img src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop&crop=center" alt="Women's Fashion">
            </div>
            <div class="category-overlay">
              <h3>Women's</h3>
              <p>Style & elegance</p>
              <span class="category-count">2,340+ items</span>
            </div>
          </div>
          
          <div class="category-card" [routerLink]="['/products']" [queryParams]="{category: 'Children'}">
            <div class="category-image">
              <img src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=300&h=300&fit=crop&crop=center" alt="Children">
            </div>
            <div class="category-overlay">
              <h3>Children</h3>
              <p>Kids & baby items</p>
              <span class="category-count">1,120+ items</span>
            </div>
          </div>
          
          <div class="category-card" [routerLink]="['/products']" [queryParams]="{category: 'Home & Living'}">
            <div class="category-image">
              <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop&crop=center" alt="Home & Living">
            </div>
            <div class="category-overlay">
              <h3>Home & Living</h3>
              <p>Comfort & decor</p>
              <span class="category-count">1,567+ items</span>
            </div>
          </div>
          
          <div class="category-card" [routerLink]="['/products']" [queryParams]="{category: 'Groceries'}">
            <div class="category-image">
              <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300&h=300&fit=crop&crop=center" alt="Groceries">
            </div>
            <div class="category-overlay">
              <h3>Groceries</h3>
              <p>Fresh & organic</p>
              <span class="category-count">3,200+ items</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trending Products -->
    <div class="trending-section">
      <div class="container">
        <div class="section-header">
          <h2>Trending Now</h2>
          <p>Most popular products this week</p>
          <button mat-stroked-button routerLink="/products" class="view-all-btn">
            View All Products
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
        <div class="products-slider">
          <div class="product-card premium" *ngFor="let product of trendingProducts">
            <div class="product-image">
              <img [src]="product.image" [alt]="product.name">
              <div class="product-badges">
                <span class="badge trending">🔥 Trending</span>
                <span class="badge discount" *ngIf="product.discount">-{{ product.discount }}%</span>
              </div>
              <div class="product-actions">
                <button mat-icon-button class="action-btn wishlist">
                  <mat-icon>favorite_border</mat-icon>
                </button>
                <button mat-icon-button class="action-btn quick-view">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-raised-button color="primary" class="add-to-cart-btn">
                  <mat-icon>add_shopping_cart</mat-icon>
                  Add to Cart
                </button>
              </div>
            </div>
            <div class="product-info">
              <div class="product-category">{{ product.category }}</div>
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-rating">
                <div class="stars">
                  <mat-icon *ngFor="let star of [1,2,3,4,5]" 
                           [class.filled]="star <= product.rating">star</mat-icon>
                </div>
                <span class="rating-text">{{ product.rating }} ({{ product.reviews }})</span>
              </div>
              <div class="product-price">
                <span class="current-price">\${{ product.price }}</span>
                <span class="original-price" *ngIf="product.originalPrice">\${{ product.originalPrice }}</span>
                <span class="savings" *ngIf="product.originalPrice">Save \${{ (product.originalPrice - product.price).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Special Deals Banner -->
    <div class="deals-banner">
      <div class="deals-container">
        <div class="deal-card flash-sale">
          <div class="deal-content">
            <div class="deal-badge">⚡ Flash Sale</div>
            <h3>Up to 70% Off</h3>
            <p>Limited time offer on selected items</p>
            <div class="countdown">
              <div class="time-unit">
                <span class="time-value">23</span>
                <span class="time-label">Hours</span>
              </div>
              <div class="time-unit">
                <span class="time-value">45</span>
                <span class="time-label">Minutes</span>
              </div>
              <div class="time-unit">
                <span class="time-value">12</span>
                <span class="time-label">Seconds</span>
              </div>
            </div>
            <button mat-raised-button color="accent" class="deal-cta">Shop Flash Sale</button>
          </div>
        </div>
        
        <div class="deal-card new-arrivals">
          <div class="deal-content">
            <div class="deal-badge">🆕 New Arrivals</div>
            <h3>Fresh Collection</h3>
            <p>Discover the latest products just added</p>
            <button mat-raised-button color="primary" class="deal-cta">Explore New</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Reviews -->
    <div class="reviews-section">
      <div class="container">
        <div class="section-header">
          <h2>What Our Customers Say</h2>
          <p>Join thousands of satisfied customers</p>
        </div>
        <div class="reviews-grid">
          <div class="review-card featured" *ngFor="let review of customerReviews">
            <div class="review-content">
              <div class="review-rating">
                <mat-icon *ngFor="let star of [1,2,3,4,5]" class="star">star</mat-icon>
              </div>
              <p class="review-text">"{{ review.text }}"</p>
              <div class="reviewer-info">
                <div class="reviewer-avatar">
                  <img [src]="review.avatar" [alt]="review.name">
                </div>
                <div class="reviewer-details">
                  <h4>{{ review.name }}</h4>
                  <span>{{ review.location }}</span>
                  <div class="verified-badge">✓ Verified Purchase</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Newsletter & Social -->
    <div class="newsletter-section">
      <div class="newsletter-container">
        <div class="newsletter-content">
          <h2>Stay in the Loop</h2>
          <p>Get exclusive deals, new arrivals, and insider updates delivered to your inbox</p>
          <div class="newsletter-form">
            <div class="input-group">
              <mat-icon class="input-icon">email</mat-icon>
              <input type="email" placeholder="Enter your email address" class="email-input">
              <button mat-raised-button color="primary" class="subscribe-btn">
                Subscribe
                <mat-icon>send</mat-icon>
              </button>
            </div>
          </div>
          <div class="newsletter-benefits">
            <div class="benefit">
              <mat-icon>local_offer</mat-icon>
              <span>Exclusive Deals</span>
            </div>
            <div class="benefit">
              <mat-icon>new_releases</mat-icon>
              <span>Early Access</span>
            </div>
            <div class="benefit">
              <mat-icon>card_giftcard</mat-icon>
              <span>Special Offers</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Authentication Section (for non-logged users) -->
    <div class="auth-section" *ngIf="!currentUser">
      <div class="auth-container">
        <div class="auth-content">
          <h2>Join ShopEasy Community</h2>
          <p>Create your account and unlock exclusive member benefits</p>
          <div class="auth-benefits">
            <div class="benefit-item">
              <mat-icon>loyalty</mat-icon>
              <span>Member-only discounts</span>
            </div>
            <div class="benefit-item">
              <mat-icon>speed</mat-icon>
              <span>Faster checkout</span>
            </div>
            <div class="benefit-item">
              <mat-icon>history</mat-icon>
              <span>Order tracking</span>
            </div>
          </div>
          <div class="auth-actions">
            <button mat-raised-button color="primary" routerLink="/register" class="auth-btn primary">
              <mat-icon>person_add</mat-icon>
              Create Account
            </button>
            <button mat-stroked-button routerLink="/login" class="auth-btn secondary">
              <mat-icon>login</mat-icon>
              Sign In
            </button>
          </div>
          <div class="admin-access">
            <button mat-button routerLink="/admin-register" class="admin-link">
              <mat-icon>admin_panel_settings</mat-icon>
              Admin Portal
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Welcome Back (for logged users) -->
    <div class="welcome-section" *ngIf="currentUser">
      <div class="welcome-container">
        <div class="welcome-content">
          <div class="welcome-header">
            <h2>Welcome back, {{ currentUser.firstName }}! 🎉</h2>
            <p>Ready to discover something amazing today?</p>
          </div>
          <div class="quick-actions-grid">
            <button mat-raised-button color="primary" routerLink="/products" class="quick-action">
              <mat-icon>shopping_bag</mat-icon>
              <div class="action-text">
                <span class="action-title">Continue Shopping</span>
                <span class="action-subtitle">Explore products</span>
              </div>
            </button>
            <button mat-stroked-button routerLink="/orders" class="quick-action">
              <mat-icon>receipt_long</mat-icon>
              <div class="action-text">
                <span class="action-title">My Orders</span>
                <span class="action-subtitle">Track purchases</span>
              </div>
            </button>
            <button mat-stroked-button routerLink="/cart" class="quick-action">
              <mat-icon>shopping_cart</mat-icon>
              <div class="action-text">
                <span class="action-title">Shopping Cart</span>
                <span class="action-subtitle">3 items waiting</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Global Styles */
    * {
      box-sizing: border-box;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      min-height: 600px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow: hidden;
      display: flex;
      align-items: center;
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="100" fill="url(%23a)"/><circle cx="800" cy="300" r="150" fill="url(%23a)"/><circle cx="400" cy="700" r="120" fill="url(%23a)"/></svg>');
      opacity: 0.3;
    }

    .hero-container {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
      padding: 80px 40px;
      color: white;
    }

    .hero-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 8px 20px;
      border-radius: 25px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .hero-title {
      font-size: 4rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 20px;
      background: linear-gradient(45deg, #ffffff, #f0f0f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      line-height: 1.6;
      opacity: 0.9;
      margin-bottom: 30px;
      max-width: 500px;
    }

    .hero-stats {
      display: flex;
      gap: 40px;
      margin-bottom: 40px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #ffd700;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .hero-actions {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .primary-cta, .secondary-cta {
      padding: 16px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .primary-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }

    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .product-carousel {
      position: relative;
      width: 400px;
      height: 400px;
    }

    .carousel-item {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-showcase {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 30px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-align: center;
      animation: float 6s ease-in-out infinite;
    }

    .showcase-image {
      width: 200px;
      height: 200px;
      object-fit: cover;
      border-radius: 15px;
      margin-bottom: 20px;
    }

    .showcase-info h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .showcase-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #ffd700;
      margin-bottom: 10px;
    }

    .showcase-rating {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      font-size: 0.9rem;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(2deg); }
    }

    /* Trust Section */
    .trust-section {
      background: #f8f9fa;
      padding: 40px 0;
    }

    .trust-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .trust-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
    }

    .trust-content h4 {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .trust-content p {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    /* Categories Section */
    .categories-section {
      padding: 100px 0;
      background: white;
    }

    .section-header {
      text-align: center;
      margin-bottom: 60px;
    }

    .section-header h2 {
      font-size: 3rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 15px;
    }

    .section-header p {
      font-size: 1.2rem;
      color: #7f8c8d;
      max-width: 600px;
      margin: 0 auto;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
      height: 600px;
    }

    .category-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .category-card.large {
      grid-row: 1 / 4;
    }

    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .category-image {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .category-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .category-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      color: white;
      padding: 30px;
    }

    .category-overlay h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .category-overlay p {
      opacity: 0.9;
      margin-bottom: 10px;
    }

    .category-count {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    /* Trending Section */
    .trending-section {
      padding: 100px 0;
      background: #f8f9fa;
    }

    .view-all-btn {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }

    .section-header {
      position: relative;
    }

    .products-slider {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 30px;
    }

    .product-card.premium {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      position: relative;
    }

    .product-card.premium:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .product-image {
      position: relative;
      height: 280px;
      overflow: hidden;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-card:hover .product-image img {
      transform: scale(1.05);
    }

    .product-badges {
      position: absolute;
      top: 15px;
      left: 15px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .badge {
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge.trending {
      background: #ff4757;
      color: white;
    }

    .badge.discount {
      background: #2ed573;
      color: white;
    }

    .product-actions {
      position: absolute;
      top: 15px;
      right: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card:hover .product-actions {
      opacity: 1;
    }

    .action-btn {
      background: white;
      color: #2c3e50;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .add-to-cart-btn {
      position: absolute;
      bottom: 15px;
      left: 15px;
      right: 15px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card:hover .add-to-cart-btn {
      opacity: 1;
    }

    .product-info {
      padding: 25px;
    }

    .product-category {
      font-size: 0.8rem;
      color: #7f8c8d;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .product-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 12px;
      line-height: 1.3;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .stars mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #ddd;
    }

    .stars mat-icon.filled {
      color: #ffa502;
    }

    .rating-text {
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .product-price {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .current-price {
      font-size: 1.4rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .original-price {
      font-size: 1rem;
      color: #7f8c8d;
      text-decoration: line-through;
    }

    .savings {
      background: #2ed573;
      color: white;
      padding: 4px 8px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* Deals Banner */
    .deals-banner {
      padding: 80px 0;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    }

    .deals-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .deal-card {
      background: white;
      border-radius: 25px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    }

    .deal-badge {
      display: inline-block;
      background: #ff4757;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .deal-card h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 15px;
    }

    .deal-card p {
      color: #7f8c8d;
      margin-bottom: 25px;
      font-size: 1.1rem;
    }

    .countdown {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 30px;
    }

    .time-unit {
      text-align: center;
    }

    .time-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #ff4757;
    }

    .time-label {
      font-size: 0.8rem;
      color: #7f8c8d;
      text-transform: uppercase;
    }

    .deal-cta {
      padding: 15px 30px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 50px;
    }

    /* Reviews Section */
    .reviews-section {
      padding: 100px 0;
      background: white;
    }

    .reviews-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
    }

    .review-card.featured {
      background: white;
      border-radius: 20px;
      padding: 35px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      border: 1px solid #f0f0f0;
    }

    .review-rating {
      display: flex;
      gap: 5px;
      margin-bottom: 20px;
    }

    .review-rating .star {
      color: #ffa502;
      font-size: 20px;
    }

    .review-text {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #2c3e50;
      margin-bottom: 25px;
      font-style: italic;
    }

    .reviewer-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .reviewer-avatar img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }

    .reviewer-details h4 {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .reviewer-details span {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .verified-badge {
      background: #2ed573;
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 600;
      margin-top: 5px;
    }

    /* Newsletter Section */
    .newsletter-section {
      padding: 80px 0;
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
    }

    .newsletter-container {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      padding: 0 20px;
    }

    .newsletter-content h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .newsletter-content p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 40px;
    }

    .input-group {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 50px;
      padding: 8px;
      margin-bottom: 30px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .input-icon {
      color: #7f8c8d;
      margin-left: 15px;
    }

    .email-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 15px 20px;
      font-size: 1rem;
      background: transparent;
    }

    .subscribe-btn {
      border-radius: 50px;
      padding: 15px 25px;
      font-weight: 600;
    }

    .newsletter-benefits {
      display: flex;
      justify-content: center;
      gap: 40px;
      flex-wrap: wrap;
    }

    .benefit {
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0.8;
    }

    /* Auth Section */
    .auth-section {
      padding: 100px 0;
      background: #f8f9fa;
    }

    .auth-container {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      padding: 0 20px;
    }

    .auth-content h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 15px;
    }

    .auth-content p {
      font-size: 1.2rem;
      color: #7f8c8d;
      margin-bottom: 40px;
    }

    .auth-benefits {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #2c3e50;
    }

    .auth-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .auth-btn {
      padding: 16px 32px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 50px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .admin-access {
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .admin-link {
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    /* Welcome Section */
    .welcome-section {
      padding: 80px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .welcome-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .welcome-header {
      text-align: center;
      margin-bottom: 50px;
    }

    .welcome-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .welcome-header p {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
    }

    .quick-action {
      padding: 25px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      text-align: left;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .quick-action:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.15);
    }

    .action-text {
      display: flex;
      flex-direction: column;
    }

    .action-title {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .action-subtitle {
      opacity: 0.8;
      font-size: 0.9rem;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 50px;
      }

      .categories-grid {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto;
        height: auto;
      }

      .category-card.large {
        grid-row: auto;
        grid-column: 1 / 3;
      }

      .deals-container {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .hero-stats {
        gap: 20px;
      }

      .section-header h2 {
        font-size: 2rem;
      }

      .categories-grid {
        grid-template-columns: 1fr;
      }

      .category-card.large {
        grid-column: auto;
      }

      .trust-container {
        grid-template-columns: 1fr;
      }

      .newsletter-benefits {
        flex-direction: column;
        gap: 20px;
      }

      .auth-benefits {
        flex-direction: column;
        gap: 20px;
      }

      .input-group {
        flex-direction: column;
        border-radius: 15px;
        padding: 15px;
      }

      .email-input {
        margin-bottom: 15px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;

  heroProducts = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      reviews: 1247
    }
  ];

  trendingProducts = [
    {
      id: 1,
      name: 'Apple AirPods Pro (2nd Gen)',
      category: 'Electronics',
      price: 249.99,
      originalPrice: 299.99,
      discount: 17,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 2341
    },
    {
      id: 2,
      name: 'Nike Air Max 270 Sneakers',
      category: 'Fashion',
      price: 159.99,
      originalPrice: 199.99,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 892
    },
    {
      id: 3,
      name: 'MacBook Pro 14" M3 Chip',
      category: 'Electronics',
      price: 1999.99,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      rating: 4.9,
      reviews: 567
    },
    {
      id: 4,
      name: 'Ergonomic Office Chair Pro',
      category: 'Furniture',
      price: 449.99,
      originalPrice: 599.99,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews: 1156
    }
  ];

  customerReviews = [
    {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      location: 'New York, NY',
      text: 'Absolutely love shopping here! The quality is outstanding and delivery is always on time. Customer service went above and beyond to help me with my order.'
    },
    {
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      location: 'San Francisco, CA',
      text: 'Best online shopping experience I\'ve had. Great prices, authentic products, and the website is so easy to navigate. Highly recommend to everyone!'
    },
    {
      name: 'Emma Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      location: 'Miami, FL',
      text: 'ShopEasy has become my go-to store for everything. From electronics to fashion, they have it all. Plus, their return policy is hassle-free!'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Even if logout fails on server, redirect to login
        this.router.navigate(['/auth/login']);
      }
    });
  }
}