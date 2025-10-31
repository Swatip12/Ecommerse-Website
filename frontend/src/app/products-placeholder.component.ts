import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  badge?: string;
  inStock: boolean;
  colors?: string[];
  sizes?: string[];
  brand?: string;
  tags?: string[];
}

@Component({
  selector: 'app-products-placeholder',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatFormFieldModule, MatInputModule,
    MatSliderModule, MatSelectModule, MatButtonToggleModule, MatBadgeModule,
    MatProgressSpinnerModule, MatTooltipModule, MatMenuModule, MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="products-container">
      <!-- Ultra Modern Header -->
      <div class="products-header">
        <div class="header-content">
          <h1>{{ getPageTitle() }}</h1>
          <p>{{ getPageSubtitle() }}</p>
          <div class="stats">
            <div class="stat">
              <span class="number">{{ getTotalProducts() }}</span>
              <span class="label">Products</span>
            </div>
          </div>
        </div>
      </div>   
   <!-- Modern Filters -->
      <div class="filters-section">
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search products...</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="filterProducts()" 
                   placeholder="Search by name or category">
            <mat-icon matPrefix>search</mat-icon>
            <button mat-icon-button matSuffix *ngIf="searchTerm" (click)="clearSearch()">
              <mat-icon>clear</mat-icon>
            </button>
          </mat-form-field>
        </div>
        
        <div class="category-filters">
          <div class="category-grid">
            <div class="category-card" [class.active]="selectedCategory === ''"
                 (click)="selectedCategory = ''; filterProducts()">
              <mat-icon>apps</mat-icon>
              <span>All Products</span>
              <span class="count">{{ allProducts.length }}</span>
            </div>
            <div class="category-card" [class.active]="selectedCategory === 'Electronics'"
                 (click)="selectedCategory = 'Electronics'; filterProducts()">
              <mat-icon>devices</mat-icon>
              <span>Electronics</span>
              <span class="count">{{ getCategoryCount('Electronics') }}</span>
            </div>
            <div class="category-card" [class.active]="selectedCategory === 'Mens'"
                 (click)="selectedCategory = 'Mens'; filterProducts()">
              <mat-icon>person</mat-icon>
              <span>Men's</span>
              <span class="count">{{ getCategoryCount('Mens') }}</span>
            </div>
            <div class="category-card" [class.active]="selectedCategory === 'Womens'"
                 (click)="selectedCategory = 'Womens'; filterProducts()">
              <mat-icon>person</mat-icon>
              <span>Women's</span>
              <span class="count">{{ getCategoryCount('Womens') }}</span>
            </div>
            <div class="category-card" [class.active]="selectedCategory === 'Children'"
                 (click)="selectedCategory = 'Children'; filterProducts()">
              <mat-icon>child_care</mat-icon>
              <span>Children</span>
              <span class="count">{{ getCategoryCount('Children') }}</span>
            </div>
            <div class="category-card" [class.active]="selectedCategory === 'Home & Living'"
                 (click)="selectedCategory = 'Home & Living'; filterProducts()">
              <mat-icon>home</mat-icon>
              <span>Home & Living</span>
              <span class="count">{{ getCategoryCount('Home & Living') }}</span>
            </div>
            <div class="category-card" [class.active]="selectedCategory === 'Groceries'"
                 (click)="selectedCategory = 'Groceries'; filterProducts()">
              <mat-icon>local_grocery_store</mat-icon>
              <span>Groceries</span>
              <span class="count">{{ getCategoryCount('Groceries') }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Products Grid -->
      <div class="products-section">
        <div class="products-grid">
          <div class="product-card" *ngFor="let product of filteredProducts; trackBy: trackByProduct">
            <div class="product-image">
              <img [src]="product.image" [alt]="product.name" loading="lazy" (error)="onImageError($event)">
              <div class="product-badges" *ngIf="product.originalPrice || product.badge">
                <span class="badge discount" *ngIf="product.originalPrice">
                  -{{ getDiscountPercentage(product) }}%
                </span>
                <span class="badge" [class]="getBadgeClass(product.badge)" *ngIf="product.badge">
                  {{ product.badge }}
                </span>
              </div>
              <div class="product-actions">
                <button mat-mini-fab class="action-btn" matTooltip="Add to Wishlist" 
                        (click)="toggleWishlist(product)">
                  <mat-icon>{{ isInWishlist(product) ? 'favorite' : 'favorite_border' }}</mat-icon>
                </button>
                <button mat-mini-fab class="action-btn" matTooltip="Quick View" 
                        (click)="quickView(product)">
                  <mat-icon>visibility</mat-icon>
                </button>
              </div>
            </div>
            
            <div class="product-info">
              <div class="product-category">{{ product.category }}</div>
              <h3 class="product-name">{{ product.name }}</h3>
              
              <div class="product-rating">
                <div class="stars">
                  <mat-icon *ngFor="let star of getStarArray(product.rating)" 
                           [class.filled]="star <= product.rating">
                    {{ star <= product.rating ? 'star' : 'star_border' }}
                  </mat-icon>
                </div>
                <span class="rating-text">{{ product.rating }}</span>
                <span class="reviews-count">({{ product.reviews }})</span>
              </div>
              
              <div class="product-price">
                <span class="current-price">\${{ product.price.toFixed(2) }}</span>
                <span class="original-price" *ngIf="product.originalPrice">
                  \${{ product.originalPrice.toFixed(2) }}
                </span>
              </div>
              
              <button mat-raised-button color="primary" class="add-to-cart-btn"
                      [disabled]="!product.inStock" (click)="addToCart(product)">
                <mat-icon>shopping_cart</mat-icon>
                {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="empty-state" *ngIf="filteredProducts.length === 0">
          <mat-icon class="empty-icon">search_off</mat-icon>
          <h3>No products found</h3>
          <p>Try adjusting your search criteria</p>
          <button mat-raised-button color="primary" (click)="clearFilters()">Clear Filters</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .products-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .header-content h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 15px;
      text-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .header-content p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 30px;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }

    .stat {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 20px;
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-align: center;
      transition: transform 0.3s ease;
    }

    .stat:hover {
      transform: translateY(-5px);
    }

    .stat .number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #ffd700;
      margin-bottom: 5px;
    }

    .stat .label {
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .filters-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      padding: 30px 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .search-container {
      max-width: 600px;
      margin: 0 auto 30px;
    }

    .search-field {
      width: 100%;
    }

    .category-filters {
      max-width: 1200px;
      margin: 0 auto;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .category-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.8);
      padding: 15px 20px;
      border-radius: 15px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .category-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
      border-color: rgba(102, 126, 234, 0.3);
    }

    .category-card.active {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .category-card mat-icon {
      font-size: 24px;
      color: #667eea;
    }

    .category-card.active mat-icon {
      color: white;
    }

    .category-card span {
      font-weight: 600;
    }

    .category-card .count {
      margin-left: auto;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      padding: 4px 8px;
      border-radius: 10px;
      font-size: 0.8rem;
    }

    .category-card.active .count {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .products-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .products-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .results-count {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .sort-field {
      min-width: 180px;
    }

    .view-toggle .view-buttons {
      border-radius: 10px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 25px;
    }

    .product-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.2);
      border-color: rgba(102, 126, 234, 0.3);
    }

    .product-image {
      position: relative;
      height: 250px;
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
      padding: 6px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      text-transform: uppercase;
    }

    .badge.discount {
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    }

    .badge.new {
      background: linear-gradient(135deg, #2ed573, #17a2b8);
    }

    .badge.hot {
      background: linear-gradient(135deg, #ff9ff3, #f368e0);
    }

    .badge.trending {
      background: linear-gradient(135deg, #ffa502, #ff6348);
    }

    .badge.fresh {
      background: linear-gradient(135deg, #26de81, #20bf6b);
    }

    .badge.sale {
      background: linear-gradient(135deg, #ff4757, #c44569);
    }    
.product-actions {
      position: absolute;
      top: 15px;
      right: 15px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card:hover .product-actions {
      opacity: 1;
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.9) !important;
      color: #667eea !important;
      width: 40px !important;
      height: 40px !important;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
      color: white !important;
      transform: scale(1.1);
    }

    .stock-indicator {
      position: absolute;
      bottom: 10px;
      right: 10px;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .stock-indicator.in-stock {
      background: rgba(46, 213, 115, 0.9);
      color: white;
    }

    .stock-indicator.out-of-stock {
      background: rgba(255, 71, 87, 0.9);
      color: white;
    }

    .products-grid.list-view {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .product-card.list-card {
      display: flex;
      flex-direction: row;
      max-width: none;
    }

    .list-card .product-image {
      width: 200px;
      height: 150px;
      flex-shrink: 0;
    }

    .list-card .product-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-info {
      padding: 20px;
    }

    .product-category {
      font-size: 0.8rem;
      color: #667eea;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }

    .product-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 12px 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
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
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .reviews-count {
      color: #7f8c8d;
      font-size: 0.8rem;
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 20px;
    }

    .current-price {
      font-size: 1.5rem;
      font-weight: 800;
      color: #2c3e50;
    }

    .original-price {
      font-size: 1rem;
      color: #95a5a6;
      text-decoration: line-through;
    }

    .add-to-cart-btn {
      width: 100%;
      padding: 12px !important;
      font-weight: 600 !important;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
      transition: all 0.3s ease;
    }

    .add-to-cart-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .add-to-cart-btn:disabled {
      background: linear-gradient(135deg, #95a5a6, #7f8c8d) !important;
      transform: none;
      box-shadow: none;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: #7f8c8d;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 20px;
      opacity: 0.5;
      color: #667eea;
    }

    .empty-state h3 {
      font-size: 1.8rem;
      margin-bottom: 10px;
      color: #2c3e50;
      font-weight: 700;
    }

    .empty-state p {
      font-size: 1.1rem;
      margin-bottom: 30px;
    }

    .empty-state button {
      padding: 15px 30px !important;
      font-size: 1.1rem !important;
      font-weight: 600 !important;
      border-radius: 25px !important;
    }

    @media (max-width: 768px) {
      .header-content h1 {
        font-size: 2.5rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }

      .category-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .stats {
        flex-direction: column;
        gap: 15px;
        max-width: 300px;
        margin: 0 auto;
      }
    }

    @media (max-width: 480px) {
      .products-section {
        padding: 20px 10px;
      }

      .filters-section {
        padding: 20px 15px;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .header-content h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class ProductsPlaceholderComponent implements OnInit {
  searchTerm = '';
  selectedCategory = '';
  filteredProducts: Product[] = [];
  wishlist: number[] = [];
  compareList: number[] = [];
  sortBy = 'name';
  viewMode = 'grid';

  allProducts: Product[] = [
    // Electronics
    {
      id: 1, name: 'iPhone 15 Pro Max', category: 'Electronics', price: 1199.99, originalPrice: 1299.99,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      rating: 4.8, reviews: 2341, description: 'Latest iPhone with A17 Pro chip', badge: 'New', inStock: true
    },
    {
      id: 2, name: 'MacBook Pro 14"', category: 'Electronics', price: 1999.99,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      rating: 4.9, reviews: 1567, description: 'M3 Pro chip, 18GB unified memory', badge: 'Hot', inStock: true
    },
    {
      id: 3, name: 'Sony WH-1000XM5', category: 'Electronics', price: 349.99, originalPrice: 399.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.7, reviews: 892, description: 'Noise canceling wireless headphones', badge: 'Sale', inStock: true
    },
    {
      id: 4, name: 'Samsung Galaxy S24', category: 'Electronics', price: 1299.99, originalPrice: 1399.99,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
      rating: 4.6, reviews: 1823, description: 'Premium Android smartphone', badge: 'Sale', inStock: true
    },

    // Men's Fashion
    {
      id: 5, name: 'Classic Denim Jacket', category: 'Mens', price: 89.99, originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
      rating: 4.5, reviews: 234, description: 'Premium denim jacket', badge: 'Sale', inStock: true
    },
    {
      id: 6, name: 'Leather Dress Shoes', category: 'Mens', price: 199.99,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      rating: 4.6, reviews: 456, description: 'Handcrafted leather shoes', inStock: true
    },
    {
      id: 7, name: 'Wool Blend Suit', category: 'Mens', price: 399.99, originalPrice: 599.99,
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
      rating: 4.7, reviews: 123, description: 'Tailored wool blend suit', badge: 'Hot', inStock: true
    },
    {
      id: 8, name: 'Casual Polo Shirt', category: 'Mens', price: 49.99,
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop',
      rating: 4.3, reviews: 567, description: '100% cotton polo shirt', inStock: true
    },

    // Women's Fashion
    {
      id: 9, name: 'Elegant Evening Dress', category: 'Womens', price: 159.99, originalPrice: 199.99,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
      rating: 4.8, reviews: 678, description: 'Sophisticated midi dress', badge: 'Trending', inStock: true
    },
    {
      id: 10, name: 'Designer Handbag', category: 'Womens', price: 299.99,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
      rating: 4.7, reviews: 345, description: 'Luxury leather handbag', inStock: false
    },
    {
      id: 11, name: 'Silk Blouse', category: 'Womens', price: 89.99, originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
      rating: 4.6, reviews: 456, description: 'Elegant silk blouse', badge: 'Sale', inStock: true
    },
    {
      id: 12, name: 'High Heels', category: 'Womens', price: 149.99,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop',
      rating: 4.4, reviews: 234, description: 'Comfortable high heels', inStock: true
    },

    // Children
    {
      id: 13, name: 'Kids Sneakers', category: 'Children', price: 49.99, originalPrice: 69.99,
      image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=400&fit=crop',
      rating: 4.4, reviews: 123, description: 'Comfortable sneakers for kids', badge: 'Sale', inStock: true
    },
    {
      id: 14, name: 'Educational Toy Set', category: 'Children', price: 79.99,
      image: 'https://images.unsplash.com/photo-1558877385-1c4c7e9e1c6e?w=400&h=400&fit=crop',
      rating: 4.6, reviews: 289, description: 'STEM learning toys', badge: 'New', inStock: true
    },
    {
      id: 15, name: 'Kids Backpack', category: 'Children', price: 39.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      rating: 4.3, reviews: 234, description: 'Colorful school backpack', inStock: true
    },
    {
      id: 16, name: 'Baby Onesie Set', category: 'Children', price: 29.99, originalPrice: 39.99,
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop',
      rating: 4.6, reviews: 456, description: 'Soft cotton onesie set', badge: 'Sale', inStock: true
    },

    // Home & Living
    {
      id: 17, name: 'Modern Coffee Table', category: 'Home & Living', price: 399.99, originalPrice: 499.99,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
      rating: 4.5, reviews: 167, description: 'Scandinavian-style coffee table', badge: 'New', inStock: true
    },
    {
      id: 18, name: 'Luxury Bedding Set', category: 'Home & Living', price: 149.99,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop',
      rating: 4.7, reviews: 445, description: '100% Egyptian cotton bedding', inStock: true
    },
    {
      id: 19, name: 'Floor Lamp', category: 'Home & Living', price: 129.99,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      rating: 4.4, reviews: 456, description: 'Elegant adjustable floor lamp', inStock: true
    },
    {
      id: 20, name: 'Throw Pillows Set', category: 'Home & Living', price: 49.99,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      rating: 4.3, reviews: 567, description: 'Decorative throw pillows', badge: 'Trending', inStock: true
    },

    // Groceries
    {
      id: 21, name: 'Organic Fruit Basket', category: 'Groceries', price: 29.99,
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop',
      rating: 4.3, reviews: 89, description: 'Fresh organic seasonal fruits', badge: 'Fresh', inStock: true
    },
    {
      id: 22, name: 'Premium Coffee Beans', category: 'Groceries', price: 24.99, originalPrice: 34.99,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
      rating: 4.8, reviews: 234, description: 'Single-origin arabica coffee', badge: 'Sale', inStock: true
    },
    {
      id: 23, name: 'Organic Vegetables Box', category: 'Groceries', price: 34.99,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
      rating: 4.5, reviews: 123, description: 'Fresh organic vegetables', badge: 'Fresh', inStock: true
    },
    {
      id: 24, name: 'Artisan Bread', category: 'Groceries', price: 8.99,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
      rating: 4.6, reviews: 234, description: 'Freshly baked artisan bread', inStock: true
    }
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.filterProducts();
    });
  }

  getPageTitle(): string {
    return this.selectedCategory ? `${this.selectedCategory} Products` : 'All Products';
  }

  getPageSubtitle(): string {
    return this.selectedCategory
      ? `Discover amazing ${this.selectedCategory.toLowerCase()} products`
      : 'Discover amazing products at unbeatable prices';
  }

  filterProducts() {
    this.filteredProducts = this.allProducts.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }

  getTotalProducts(): number {
    return this.allProducts.length;
  }

  getCategoryCount(category: string): number {
    return this.allProducts.filter(p => p.category === category).length;
  }

  trackByProduct(_index: number, product: Product): number {
    return product.id;
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
  }

  getStarArray(_rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  getDiscountPercentage(product: Product): number {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  getBadgeClass(badge?: string): string {
    if (!badge) return '';
    return badge.toLowerCase();
  }

  addToCart(product: Product) {
    console.log('Adding to cart:', product);
    alert(`${product.name} added to cart!`);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filterProducts();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterProducts();
  }

  toggleWishlist(product: Product) {
    const index = this.wishlist.indexOf(product.id);
    if (index > -1) {
      this.wishlist.splice(index, 1);
    } else {
      this.wishlist.push(product.id);
    }
  }

  isInWishlist(product: Product): boolean {
    return this.wishlist.includes(product.id);
  }

  quickView(product: Product) {
    console.log('Quick view for:', product);
    alert(`Quick view for ${product.name}`);
  }

  addToCompare(product: Product) {
    const index = this.compareList.indexOf(product.id);
    if (index > -1) {
      this.compareList.splice(index, 1);
      alert(`${product.name} removed from comparison`);
    } else {
      if (this.compareList.length >= 3) {
        alert('You can only compare up to 3 products');
        return;
      }
      this.compareList.push(product.id);
      alert(`${product.name} added to comparison`);
    }
  }

  sortProducts() {
    switch (this.sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => b.id - a.id);
        break;
      default:
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
}