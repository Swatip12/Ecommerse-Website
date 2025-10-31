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
}

@Component({
  selector: 'app-products-simple',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="products-container">
      <!-- Enhanced Header -->
      <div class="products-header">
        <div class="header-content">
          <h1>{{ getPageTitle() }}</h1>
          <p>{{ getPageSubtitle() }}</p>
          <div class="stats">
            <div class="stat">
              <span class="number">{{ getTotalProducts() }}</span>
              <span class="label">Products</span>
            </div>
            <div class="stat">
              <span class="number">{{ getAvailableProducts() }}</span>
              <span class="label">In Stock</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-bar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search products...</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="filterProducts()" placeholder="Search products">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
        
        <div class="category-filters">
          <mat-chip-listbox class="category-chips" [(ngModel)]="selectedCategory" (ngModelChange)="filterProducts()">
            <mat-chip-option value="">All Products</mat-chip-option>
            <mat-chip-option value="Electronics">Electronics</mat-chip-option>
            <mat-chip-option value="Mens">Men's</mat-chip-option>
            <mat-chip-option value="Womens">Women's</mat-chip-option>
            <mat-chip-option value="Children">Children</mat-chip-option>
            <mat-chip-option value="Home & Living">Home & Living</mat-chip-option>
            <mat-chip-option value="Groceries">Groceries</mat-chip-option>
          </mat-chip-listbox>
        </div>

        <div class="results-info">
          <span>{{ filteredProducts.length }} products found</span>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid">
        <div class="product-card" *ngFor="let product of filteredProducts">
          <div class="product-image">
            <img [src]="product.image" [alt]="product.name" loading="lazy">
            <div class="product-badge" *ngIf="product.badge || product.originalPrice">
              <span class="badge sale" *ngIf="product.originalPrice">
                -{{ getDiscountPercentage(product) }}%
              </span>
              <span class="badge" [class]="getBadgeClass(product.badge)" *ngIf="product.badge">
                {{ product.badge }}
              </span>
            </div>
            <div class="product-overlay">
              <button mat-icon-button class="overlay-btn">
                <mat-icon>favorite_border</mat-icon>
              </button>
              <button mat-icon-button class="overlay-btn">
                <mat-icon>visibility</mat-icon>
              </button>
            </div>
          </div>
          
          <div class="product-info">
            <div class="product-category">{{ product.category }}</div>
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-rating">
              <span class="stars">★★★★★</span>
              <span class="rating-text">{{ product.rating }} ({{ product.reviews }})</span>
            </div>
            <div class="product-price">
              <span class="current-price">\${{ product.price }}</span>
              <span class="original-price" *ngIf="product.originalPrice">\${{ product.originalPrice }}</span>
            </div>
            <div class="product-actions">
              <button mat-raised-button color="primary" 
                      [disabled]="!product.inStock"
                      (click)="addToCart(product)"
                      class="add-to-cart-btn">
                <mat-icon>shopping_cart</mat-icon>
                {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to Home -->
      <div class="back-to-home">
        <button mat-stroked-button routerLink="/dashboard" class="back-btn">
          <mat-icon>home</mat-icon>
          Back to Home
        </button>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .products-header {
      background: white;
      color: #333;
      padding: 40px 20px;
      border-bottom: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 10px;
      color: #2c3e50;
    }

    .header-content p {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 20px;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 20px;
    }

    .stat {
      text-align: center;
      background: #f8f9fa;
      padding: 15px 20px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .stat .number {
      display: block;
      font-size: 1.8rem;
      font-weight: 600;
      color: #007bff;
    }

    .stat .label {
      font-size: 0.9rem;
      color: #666;
    }

    .filters-section {
      background: white;
      padding: 25px 20px;
      border-bottom: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .search-field {
      max-width: 500px;
      margin: 0 auto 20px;
      width: 100%;
    }

    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-bottom: 20px;
    }

    .results-info {
      text-align: center;
      font-weight: 500;
      font-size: 1rem;
      color: #666;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      padding: 30px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .product-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      border: 1px solid #e0e0e0;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      border-color: #007bff;
    }

    .product-image {
      position: relative;
      height: 220px;
      overflow: hidden;
      background: #f8f9fa;
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.2s ease;
    }

    .product-card:hover .product-image img {
      opacity: 0.9;
    }

    .product-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 2;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      margin-right: 5px;
    }

    .badge.sale {
      background: #dc3545;
    }

    .badge.new {
      background: #28a745;
    }

    .badge.hot {
      background: #fd7e14;
    }

    .badge.trending {
      background: #6f42c1;
    }

    .product-overlay {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .product-card:hover .product-overlay {
      opacity: 1;
    }

    .overlay-btn {
      background: white;
      color: #666;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 36px;
      height: 36px;
    }

    .overlay-btn:hover {
      background: #007bff;
      color: white;
    }

    .product-info {
      padding: 16px;
    }

    .product-category {
      font-size: 0.75rem;
      color: #007bff;
      text-transform: uppercase;
      font-weight: 500;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }

    .product-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .stars {
      color: #ffc107;
      font-size: 0.9rem;
    }

    .rating-text {
      color: #666;
      font-size: 0.85rem;
    }

    .product-price {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 16px;
    }

    .current-price {
      font-size: 1.25rem;
      font-weight: 700;
      color: #B12704;
    }

    .original-price {
      font-size: 0.9rem;
      color: #999;
      text-decoration: line-through;
    }

    .add-to-cart-btn {
      width: 100%;
      padding: 10px;
      font-weight: 500;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .back-to-home {
      text-align: center;
      padding: 30px 20px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    .back-btn {
      padding: 10px 20px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .header-content h1 {
        font-size: 2.5rem;
      }
      
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        padding: 20px 15px;
      }

      .stats {
        flex-direction: column;
        gap: 15px;
      }
    }
  `]
})
export class ProductsSimpleComponent implements OnInit {
  searchTerm = '';
  selectedCategory = '';
  filteredProducts: Product[] = [];

  allProducts: Product[] = [
    // Electronics
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      category: 'Electronics',
      price: 1199.99,
      originalPrice: 1299.99,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 2341,
      description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system',
      badge: 'New',
      inStock: true
    },
    {
      id: 2,
      name: 'MacBook Pro 14"',
      category: 'Electronics',
      price: 1999.99,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      rating: 4.9,
      reviews: 1567,
      description: 'M3 Pro chip, 18GB unified memory, 512GB SSD storage',
      badge: 'Hot',
      inStock: true
    },
    {
      id: 3,
      name: 'Sony WH-1000XM5 Headphones',
      category: 'Electronics',
      price: 349.99,
      originalPrice: 399.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews: 892,
      description: 'Industry-leading noise canceling wireless headphones',
      badge: 'Sale',
      inStock: true
    },
    {
      id: 4,
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Electronics',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 1823,
      description: 'Premium Android smartphone with S Pen and AI features',
      inStock: true
    },
    {
      id: 5,
      name: 'iPad Pro 12.9"',
      category: 'Electronics',
      price: 1099.99,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 1234,
      description: 'M2 chip, Liquid Retina XDR display, Apple Pencil support',
      inStock: true
    },

    // Men's Fashion
    {
      id: 6,
      name: 'Classic Denim Jacket',
      category: 'Mens',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
      rating: 4.5,
      reviews: 234,
      description: 'Premium denim jacket with classic fit and vintage wash',
      badge: 'Sale',
      inStock: true
    },
    {
      id: 7,
      name: 'Leather Dress Shoes',
      category: 'Mens',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 456,
      description: 'Handcrafted genuine leather oxford shoes for formal occasions',
      inStock: true
    },
    {
      id: 8,
      name: 'Casual Polo Shirt',
      category: 'Mens',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop',
      rating: 4.3,
      reviews: 567,
      description: '100% cotton polo shirt in various colors',
      inStock: true
    },
    {
      id: 9,
      name: 'Slim Fit Chinos',
      category: 'Mens',
      price: 79.99,
      originalPrice: 99.99,
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
      rating: 4.4,
      reviews: 789,
      description: 'Comfortable slim fit chinos for casual wear',
      inStock: true
    },

    // Women's Fashion
    {
      id: 10,
      name: 'Elegant Evening Dress',
      category: 'Womens',
      price: 159.99,
      originalPrice: 199.99,
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 678,
      description: 'Sophisticated midi dress perfect for special occasions',
      badge: 'Trending',
      inStock: true
    },
    {
      id: 11,
      name: 'Designer Handbag',
      category: 'Womens',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews: 345,
      description: 'Luxury leather handbag with gold-tone hardware',
      inStock: true
    },
    {
      id: 12,
      name: 'Silk Blouse',
      category: 'Womens',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 456,
      description: 'Elegant silk blouse perfect for office wear',
      badge: 'Sale',
      inStock: true
    },
    {
      id: 13,
      name: 'High Heels',
      category: 'Womens',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop',
      rating: 4.4,
      reviews: 234,
      description: 'Comfortable high heels for special occasions',
      inStock: true
    },

    // Children
    {
      id: 14,
      name: 'Kids Sneakers',
      category: 'Children',
      price: 49.99,
      originalPrice: 69.99,
      image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=400&fit=crop',
      rating: 4.4,
      reviews: 123,
      description: 'Comfortable and durable sneakers for active kids',
      badge: 'Sale',
      inStock: true
    },
    {
      id: 15,
      name: 'Educational Toy Set',
      category: 'Children',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1558877385-1c4c7e9e1c6e?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 289,
      description: 'STEM learning toys for creative and educational play',
      inStock: true
    },
    {
      id: 16,
      name: 'Kids Backpack',
      category: 'Children',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      rating: 4.3,
      reviews: 234,
      description: 'Colorful and durable backpack for school',
      inStock: true
    },

    // Home & Living
    {
      id: 17,
      name: 'Modern Coffee Table',
      category: 'Home & Living',
      price: 399.99,
      originalPrice: 499.99,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
      rating: 4.5,
      reviews: 167,
      description: 'Scandinavian-style coffee table with storage compartment',
      badge: 'New',
      inStock: true
    },
    {
      id: 18,
      name: 'Luxury Bedding Set',
      category: 'Home & Living',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews: 445,
      description: '100% Egyptian cotton bedding set with premium comfort',
      inStock: true
    },
    {
      id: 19,
      name: 'Dining Table Set',
      category: 'Home & Living',
      price: 799.99,
      originalPrice: 999.99,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews: 234,
      description: 'Modern dining table set for 6 people',
      badge: 'Sale',
      inStock: true
    },

    // Groceries
    {
      id: 20,
      name: 'Organic Fruit Basket',
      category: 'Groceries',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=400&fit=crop',
      rating: 4.3,
      reviews: 89,
      description: 'Fresh organic seasonal fruits delivered to your door',
      badge: 'Fresh',
      inStock: true
    },
    {
      id: 21,
      name: 'Premium Coffee Beans',
      category: 'Groceries',
      price: 24.99,
      originalPrice: 34.99,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 234,
      description: 'Single-origin arabica coffee beans, medium roast',
      badge: 'Sale',
      inStock: true
    },
    {
      id: 22,
      name: 'Organic Vegetables Box',
      category: 'Groceries',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
      rating: 4.5,
      reviews: 123,
      description: 'Fresh organic vegetables delivered weekly',
      inStock: true
    }
  ];

  constructor(private route: ActivatedRoute) {}

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

  getTotalProducts(): number {
    return this.allProducts.length;
  }

  getAvailableProducts(): number {
    return this.allProducts.filter(p => p.inStock).length;
  }

  filterProducts() {
    this.filteredProducts = this.allProducts.filter(product => {
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
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
}