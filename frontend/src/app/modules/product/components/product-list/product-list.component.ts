import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, BehaviorSubject, combineLatest } from 'rxjs';
import { 
  Product, 
  ProductSearchRequest, 
  ProductSearchResponse, 
  Category, 
  ProductSortBy, 
  SortDirection 
} from '../../models/product.models';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="product-list-container">
      <!-- Search and Filters -->
      <div class="filters-section" *ngIf="showFilters">
        <form [formGroup]="searchForm" class="search-filters">
          <!-- Search Input -->
          <div class="search-input-group">
            <input 
              type="text" 
              formControlName="searchTerm"
              placeholder="Search products..."
              class="search-input"
            >
            <button type="button" class="search-button" (click)="onSearch()">
              <i class="fas fa-search"></i>
            </button>
          </div>

          <!-- Category Filter -->
          <div class="filter-group" *ngIf="categories.length > 0">
            <label>Category:</label>
            <select formControlName="categoryId" class="filter-select">
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Brand Filter -->
          <div class="filter-group" *ngIf="brands.length > 0">
            <label>Brand:</label>
            <select formControlName="brand" class="filter-select">
              <option value="">All Brands</option>
              <option *ngFor="let brand of brands" [value]="brand">
                {{ brand }}
              </option>
            </select>
          </div>

          <!-- Price Range -->
          <div class="filter-group price-range" *ngIf="priceRange">
            <label>Price Range:</label>
            <div class="price-inputs">
              <input 
                type="number" 
                formControlName="minPrice"
                [placeholder]="'Min: $' + priceRange.minPrice"
                class="price-input"
              >
              <span>-</span>
              <input 
                type="number" 
                formControlName="maxPrice"
                [placeholder]="'Max: $' + priceRange.maxPrice"
                class="price-input"
              >
            </div>
          </div>

          <!-- In Stock Only -->
          <div class="filter-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                formControlName="inStockOnly"
              >
              In Stock Only
            </label>
          </div>

          <!-- Sort Options -->
          <div class="filter-group">
            <label>Sort By:</label>
            <select formControlName="sortBy" class="filter-select">
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="createdAt">Newest</option>
            </select>
            <select formControlName="sortDirection" class="filter-select">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <!-- Filter Actions -->
          <div class="filter-actions">
            <button type="button" (click)="onSearch()" class="btn btn-primary">
              Apply Filters
            </button>
            <button type="button" (click)="onClearFilters()" class="btn btn-secondary">
              Clear
            </button>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading products...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button (click)="onRetry()" class="btn btn-primary">Retry</button>
      </div>

      <!-- Products Grid -->
      <div *ngIf="!loading && !error" class="products-section">
        <!-- Results Info -->
        <div class="results-info" *ngIf="searchResponse">
          <p>
            Showing {{ searchResponse.numberOfElements }} of {{ searchResponse.totalElements }} products
            <span *ngIf="currentSearchTerm"> for "{{ currentSearchTerm }}"</span>
          </p>
        </div>

        <!-- Products Grid with Virtual Scrolling -->
        <div class="products-grid" *ngIf="products.length > 0">
          <cdk-virtual-scroll-viewport 
            itemSize="320" 
            class="virtual-scroll-viewport"
            *ngIf="useVirtualScrolling && products.length > 50; else regularGrid"
          >
            <div 
              *cdkVirtualFor="let product of products; trackBy: trackByProductId" 
              class="product-card"
              (click)="onProductClick(product)"
            >
            <!-- Product Image -->
            <div class="product-image">
              <img 
                [src]="getPrimaryImageUrl(product)" 
                [alt]="product.name"
                (error)="onImageError($event)"
                loading="lazy"
              >
              <div class="product-badges">
                <span *ngIf="!product.inventory?.isInStock" class="badge out-of-stock">
                  Out of Stock
                </span>
                <span *ngIf="product.inventory?.isLowStock && product.inventory?.isInStock" class="badge low-stock">
                  Low Stock
                </span>
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-brand" *ngIf="product.brand">{{ product.brand }}</p>
              <p class="product-category">{{ product.category.name }}</p>
              <div class="product-price">
                <span class="price">\${{ product.price | number:'1.2-2' }}</span>
              </div>
              <p class="product-description" *ngIf="product.description">
                {{ product.description | slice:0:100 }}
                <span *ngIf="product.description && product.description.length > 100">...</span>
              </p>
            </div>

            <!-- Product Actions -->
            <div class="product-actions">
              <button 
                class="btn btn-primary btn-sm"
                [disabled]="!product.inventory?.isInStock"
                (click)="onAddToCart(product, $event)"
              >
                <i class="fas fa-shopping-cart"></i>
                {{ product.inventory?.isInStock ? 'Add to Cart' : 'Out of Stock' }}
              </button>
              <button 
                class="btn btn-outline btn-sm"
                (click)="onViewDetails(product, $event)"
              >
                View Details
              </button>
            </div>
          </cdk-virtual-scroll-viewport>
          
          <!-- Regular Grid Template -->
          <ng-template #regularGrid>
            <div 
              *ngFor="let product of products; trackBy: trackByProductId" 
              class="product-card"
              (click)="onProductClick(product)"
            >
              <!-- Product Image -->
              <div class="product-image">
                <img 
                  [src]="getPrimaryImageUrl(product)" 
                  [alt]="product.name"
                  (error)="onImageError($event)"
                  loading="lazy"
                >
                <div class="product-badges">
                  <span *ngIf="!product.inventory?.isInStock" class="badge out-of-stock">
                    Out of Stock
                  </span>
                  <span *ngIf="product.inventory?.isLowStock && product.inventory?.isInStock" class="badge low-stock">
                    Low Stock
                  </span>
                </div>
              </div>

              <!-- Product Info -->
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-brand" *ngIf="product.brand">{{ product.brand }}</p>
                <p class="product-category">{{ product.category.name }}</p>
                <div class="product-price">
                  <span class="price">\${{ product.price | number:'1.2-2' }}</span>
                </div>
                <p class="product-description" *ngIf="product.description">
                  {{ product.description | slice:0:100 }}
                  <span *ngIf="product.description && product.description.length > 100">...</span>
                </p>
              </div>

              <!-- Product Actions -->
              <div class="product-actions">
                <button 
                  class="btn btn-primary btn-sm"
                  [disabled]="!product.inventory?.isInStock"
                  (click)="onAddToCart(product, $event)"
                >
                  <i class="fas fa-shopping-cart"></i>
                  {{ product.inventory?.isInStock ? 'Add to Cart' : 'Out of Stock' }}
                </button>
                <button 
                  class="btn btn-outline btn-sm"
                  (click)="onViewDetails(product, $event)"
                >
                  View Details
                </button>
              </div>
            </div>
          </ng-template>
        </div>

        <!-- No Products Found -->
        <div *ngIf="products.length === 0 && !loading" class="no-products">
          <div class="no-products-content">
            <i class="fas fa-search fa-3x"></i>
            <h3>No products found</h3>
            <p>Try adjusting your search criteria or browse our categories.</p>
            <button (click)="onClearFilters()" class="btn btn-primary">
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" *ngIf="searchResponse && searchResponse.totalPages > 1">
          <nav class="pagination">
            <button 
              class="page-btn"
              [disabled]="searchResponse.first"
              (click)="onPageChange(searchResponse.number - 1)"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <span class="page-info">
              Page {{ searchResponse.number + 1 }} of {{ searchResponse.totalPages }}
            </span>
            
            <button 
              class="page-btn"
              [disabled]="searchResponse.last"
              (click)="onPageChange(searchResponse.number + 1)"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  @Input() showFilters: boolean = true;
  @Input() categoryId?: number;
  @Input() searchTerm?: string;
  @Input() pageSize: number = 20;
  @Input() useVirtualScrolling: boolean = true;
  
  @Output() productSelected = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  searchForm: FormGroup;
  products: Product[] = [];
  searchResponse: ProductSearchResponse | null = null;
  categories: Category[] = [];
  brands: string[] = [];
  priceRange: any = null;
  
  loading = false;
  error: string | null = null;
  currentSearchTerm = '';
  
  private destroy$ = new Subject<void>();
  private searchSubject = new BehaviorSubject<ProductSearchRequest>({});

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.setupFormSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      categoryId: [''],
      brand: [''],
      minPrice: [''],
      maxPrice: [''],
      inStockOnly: [false],
      sortBy: ['name'],
      sortDirection: ['asc']
    });
  }

  private initializeComponent(): void {
    // Set initial values if provided
    if (this.searchTerm) {
      this.searchForm.patchValue({ searchTerm: this.searchTerm });
      this.currentSearchTerm = this.searchTerm;
    }
    if (this.categoryId) {
      this.searchForm.patchValue({ categoryId: this.categoryId });
    }
  }

  private setupFormSubscriptions(): void {
    // Subscribe to search subject for debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchRequest => {
      this.performSearch(searchRequest);
    });

    // Subscribe to search term changes for real-time search
    this.searchForm.get('searchTerm')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentSearchTerm = searchTerm || '';
      this.onSearch();
    });
  }

  private loadInitialData(): void {
    // Load filter data
    combineLatest([
      this.productService.categories$,
      this.productService.brands$,
      this.productService.priceRange$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([categories, brands, priceRange]) => {
      this.categories = categories;
      this.brands = brands;
      this.priceRange = priceRange;
      this.cdr.markForCheck();
    });

    // Perform initial search
    this.onSearch();
  }

  onSearch(): void {
    const formValue = this.searchForm.value;
    const searchRequest: ProductSearchRequest = {
      searchTerm: formValue.searchTerm || undefined,
      categoryIds: formValue.categoryId ? [formValue.categoryId] : undefined,
      brands: formValue.brand ? [formValue.brand] : undefined,
      minPrice: formValue.minPrice || undefined,
      maxPrice: formValue.maxPrice || undefined,
      inStockOnly: formValue.inStockOnly || false,
      sortBy: formValue.sortBy || 'name',
      sortDirection: formValue.sortDirection || 'asc',
      page: 0,
      size: this.pageSize
    };

    this.searchSubject.next(searchRequest);
  }

  onClearFilters(): void {
    this.searchForm.reset({
      searchTerm: '',
      categoryId: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStockOnly: false,
      sortBy: 'name',
      sortDirection: 'asc'
    });
    this.currentSearchTerm = '';
    this.onSearch();
  }

  onPageChange(page: number): void {
    const formValue = this.searchForm.value;
    const searchRequest: ProductSearchRequest = {
      searchTerm: formValue.searchTerm || undefined,
      categoryIds: formValue.categoryId ? [formValue.categoryId] : undefined,
      brands: formValue.brand ? [formValue.brand] : undefined,
      minPrice: formValue.minPrice || undefined,
      maxPrice: formValue.maxPrice || undefined,
      inStockOnly: formValue.inStockOnly || false,
      sortBy: formValue.sortBy || 'name',
      sortDirection: formValue.sortDirection || 'asc',
      page: page,
      size: this.pageSize
    };

    this.searchSubject.next(searchRequest);
  }

  onRetry(): void {
    this.error = null;
    this.onSearch();
  }

  onProductClick(product: Product): void {
    this.productSelected.emit(product);
  }

  onViewDetails(product: Product, event: Event): void {
    event.stopPropagation();
    this.productSelected.emit(product);
  }

  onAddToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(product);
  }

  private performSearch(searchRequest: ProductSearchRequest): void {
    this.loading = true;
    this.error = null;

    this.productService.searchProducts(searchRequest).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.searchResponse = response;
        this.products = response.content;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        this.products = [];
        this.cdr.markForCheck();
      }
    });
  }

  getPrimaryImageUrl(product: Product): string {
    const primaryImage = product.images.find(img => img.isPrimary);
    return primaryImage?.imageUrl || '/assets/images/product-placeholder.svg';
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/product-placeholder.svg';
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}