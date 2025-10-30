import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { 
  Product, 
  ProductSearchRequest, 
  ProductSearchResponse 
} from '../../models/product.models';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-grid-container">
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading products...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="error-container">
        <div class="error-content">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Products</h3>
          <p class="error-message">{{ error }}</p>
          <button (click)="onRetry()" class="btn btn-primary">
            <i class="fas fa-redo"></i>
            Try Again
          </button>
        </div>
      </div>

      <!-- Products Content -->
      <div *ngIf="!loading && !error" class="products-content">
        <!-- Results Info -->
        <div class="results-info" *ngIf="searchResponse">
          <div class="results-summary">
            <span class="results-count">
              {{ searchResponse.numberOfElements }} of {{ searchResponse.totalElements }} products
            </span>
            <span *ngIf="filters?.searchTerm" class="search-term">
              for "{{ filters.searchTerm }}"
            </span>
          </div>
          
          <!-- Sort Options (Quick Access) -->
          <div class="quick-sort">
            <label>Sort:</label>
            <select (change)="onQuickSort($event)" [value]="currentSort">
              <option value="relevance-desc">Relevance</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low to High</option>
              <option value="price-desc">Price High to Low</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
            </select>
          </div>
        </div>

        <!-- No Results -->
        <div *ngIf="products.length === 0" class="no-results">
          <div class="no-results-content">
            <i class="fas fa-search"></i>
            <h3>No Products Found</h3>
            <p *ngIf="filters?.searchTerm">
              No products match your search for "{{ filters.searchTerm }}"
            </p>
            <p *ngIf="!filters?.searchTerm && hasActiveFilters">
              No products match your current filters
            </p>
            <p *ngIf="!filters?.searchTerm && !hasActiveFilters">
              No products available at the moment
            </p>
            <button *ngIf="hasActiveFilters" (click)="onClearFilters()" class="btn btn-primary">
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div *ngIf="products.length > 0" class="products-grid">
          <div 
            *ngFor="let product of products; trackBy: trackByProductId" 
            class="product-card"
            [class.out-of-stock]="!isProductInStock(product)"
          >
            <!-- Product Image -->
            <div class="product-image" (click)="onProductClick(product)">
              <img 
                [src]="getPrimaryImageUrl(product)" 
                [alt]="product.name"
                (error)="onImageError($event)"
                loading="lazy"
              >
              <div class="product-overlay">
                <button class="quick-view-btn" (click)="onQuickView(product, $event)">
                  <i class="fas fa-eye"></i>
                  Quick View
                </button>
              </div>
              
              <!-- Stock Badge -->
              <div class="stock-badge" [class]="getStockBadgeClass(product)">
                {{ getStockText(product) }}
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <div class="product-category">{{ product.category.name }}</div>
              <h3 class="product-name" (click)="onProductClick(product)">
                {{ product.name }}
              </h3>
              <p class="product-description" *ngIf="product.description">
                {{ product.description | slice:0:100 }}{{ product.description.length > 100 ? '...' : '' }}
              </p>
              
              <!-- Product Price -->
              <div class="product-price">
                <span class="current-price">\${{ product.price | number:'1.2-2' }}</span>
                <!-- Add sale price logic here if needed -->
              </div>

              <!-- Product Actions -->
              <div class="product-actions">
                <button 
                  class="add-to-cart-btn"
                  [disabled]="!isProductInStock(product)"
                  (click)="onAddToCart(product, $event)"
                >
                  <i class="fas fa-shopping-cart"></i>
                  {{ isProductInStock(product) ? 'Add to Cart' : 'Out of Stock' }}
                </button>
                
                <button class="wishlist-btn" (click)="onAddToWishlist(product, $event)">
                  <i class="far fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="searchResponse && searchResponse.totalPages > 1" class="pagination-container">
          <nav class="pagination">
            <!-- Previous Page -->
            <button 
              class="page-btn prev-btn"
              [disabled]="searchResponse.first"
              (click)="onPageChange(searchResponse.number - 1)"
            >
              <i class="fas fa-chevron-left"></i>
              Previous
            </button>

            <!-- Page Numbers -->
            <div class="page-numbers">
              <button 
                *ngFor="let page of getVisiblePages(); trackBy: trackByPage"
                class="page-btn"
                [class.active]="page === searchResponse.number"
                [disabled]="page === -1"
                (click)="page !== -1 && onPageChange(page)"
              >
                {{ page === -1 ? '...' : page + 1 }}
              </button>
            </div>

            <!-- Next Page -->
            <button 
              class="page-btn next-btn"
              [disabled]="searchResponse.last"
              (click)="onPageChange(searchResponse.number + 1)"
            >
              Next
              <i class="fas fa-chevron-right"></i>
            </button>
          </nav>

          <!-- Page Info -->
          <div class="page-info">
            Page {{ searchResponse.number + 1 }} of {{ searchResponse.totalPages }}
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent implements OnInit, OnDestroy, OnChanges {
  @Input() filters: ProductSearchRequest = {};
  @Input() pageSize = 20;
  @Output() productSelected = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  @Output() filtersCleared = new EventEmitter<void>();

  products: Product[] = [];
  searchResponse: ProductSearchResponse | null = null;
  loading = false;
  error: string | null = null;
  currentPage = 0;
  currentSort = 'relevance-desc';

  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.currentPage = 0;
      this.loadProducts();
    }
  }

  private loadProducts(): void {
    this.loading = true;
    this.error = null;

    const searchRequest: ProductSearchRequest = {
      ...this.filters,
      page: this.currentPage,
      size: this.pageSize
    };

    this.productService.searchProducts(searchRequest).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.searchResponse = response;
        this.products = response.content;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load products';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  onRetry(): void {
    this.loadProducts();
  }

  onProductClick(product: Product): void {
    this.productSelected.emit(product);
  }

  onAddToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(product);
  }

  onAddToWishlist(product: Product, event: Event): void {
    event.stopPropagation();
    this.addToWishlist.emit(product);
  }

  onQuickView(product: Product, event: Event): void {
    event.stopPropagation();
    this.quickView.emit(product);
  }

  onQuickSort(event: any): void {
    const sortValue = event.target.value;
    const [sortBy, sortDirection] = sortValue.split('-');
    
    this.currentSort = sortValue;
    this.filters = {
      ...this.filters,
      sortBy,
      sortDirection
    };
    
    this.currentPage = 0;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
    
    // Scroll to top of product grid
    document.querySelector('.product-grid-container')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }

  onClearFilters(): void {
    this.filtersCleared.emit();
  }

  // Utility methods
  get hasActiveFilters(): boolean {
    return !!(
      this.filters?.searchTerm ||
      (this.filters?.categoryIds && this.filters.categoryIds.length > 0) ||
      (this.filters?.brands && this.filters.brands.length > 0) ||
      this.filters?.minPrice ||
      this.filters?.maxPrice ||
      this.filters?.inStockOnly
    );
  }

  isProductInStock(product: Product): boolean {
    return product.inventory?.isInStock ?? false;
  }

  getPrimaryImageUrl(product: Product): string {
    const primaryImage = product.images?.find(img => img.isPrimary);
    return primaryImage?.imageUrl || '/assets/images/product-placeholder.svg';
  }

  getStockBadgeClass(product: Product): string {
    if (!product.inventory?.isInStock) return 'out-of-stock';
    if (product.inventory.isLowStock) return 'low-stock';
    return 'in-stock';
  }

  getStockText(product: Product): string {
    if (!product.inventory?.isInStock) return 'Out of Stock';
    if (product.inventory.isLowStock) return 'Low Stock';
    return 'In Stock';
  }

  getVisiblePages(): number[] {
    if (!this.searchResponse) return [];
    
    const totalPages = this.searchResponse.totalPages;
    const currentPage = this.searchResponse.number;
    const pages: number[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page area, and last page with ellipsis
      pages.push(0);
      
      if (currentPage > 2) {
        pages.push(-1); // Ellipsis
      }
      
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 0 && i !== totalPages - 1) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push(-1); // Ellipsis
      }
      
      pages.push(totalPages - 1);
    }
    
    return pages;
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/product-placeholder.svg';
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByPage(index: number, page: number): number {
    return page;
  }
}