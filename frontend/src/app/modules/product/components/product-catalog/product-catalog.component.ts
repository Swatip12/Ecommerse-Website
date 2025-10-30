import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../models/product.models';
import { ProductListComponent } from '../product-list/product-list.component';
import { ProductSearchComponent } from '../product-search/product-search.component';
import { CategoryNavigationComponent } from '../category-navigation/category-navigation.component';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule,
    ProductListComponent,
    ProductSearchComponent,
    CategoryNavigationComponent
  ],
  template: `
    <div class="product-catalog-container">
      <!-- Header Section -->
      <div class="catalog-header">
        <div class="header-content">
          <h1 class="catalog-title">Product Catalog</h1>
          <p class="catalog-subtitle">Discover our wide range of products</p>
        </div>
        
        <!-- Search Component -->
        <div class="search-section">
          <app-product-search
            [placeholder]="'Search products...'"
            [maxResults]="8"
            [showSuggestions]="true"
            [showRecentSearches]="true"
            [showPopularSearches]="true"
            (searchSubmitted)="onSearchSubmitted($event)"
            (productSelected)="onProductSelected($event)"
            (searchCleared)="onSearchCleared()"
          ></app-product-search>
        </div>
      </div>

      <!-- Main Content -->
      <div class="catalog-content">
        <!-- Sidebar with Category Navigation -->
        <aside class="catalog-sidebar">
          <app-category-navigation
            [selectedCategoryId]="selectedCategoryId"
            [showProductCounts]="true"
            [collapsible]="true"
            (categorySelected)="onCategorySelected($event)"
          ></app-category-navigation>
        </aside>

        <!-- Main Product Area -->
        <main class="catalog-main">
          <!-- Current View Info -->
          <div class="view-info" *ngIf="currentSearchTerm || selectedCategoryId">
            <div class="view-details">
              <h2 *ngIf="currentSearchTerm" class="view-title">
                Search Results for "{{ currentSearchTerm }}"
              </h2>
              <h2 *ngIf="selectedCategoryId && !currentSearchTerm" class="view-title">
                {{ selectedCategoryName || 'Category Products' }}
              </h2>
              <button 
                class="clear-filters-btn"
                (click)="clearAllFilters()"
                *ngIf="currentSearchTerm || selectedCategoryId"
              >
                <i class="fas fa-times"></i>
                Clear filters
              </button>
            </div>
          </div>

          <!-- Product List -->
          <app-product-list
            [showFilters]="true"
            [categoryId]="selectedCategoryId"
            [searchTerm]="currentSearchTerm"
            [pageSize]="20"
            (productSelected)="onProductSelected($event)"
            (addToCart)="onAddToCart($event)"
          ></app-product-list>
        </main>
      </div>

      <!-- Mobile Category Toggle -->
      <div class="mobile-category-overlay" 
           [class.active]="showMobileSidebar"
           (click)="toggleMobileSidebar()">
      </div>
      
      <button 
        class="mobile-category-toggle"
        (click)="toggleMobileSidebar()"
      >
        <i class="fas fa-filter"></i>
        <span>Categories</span>
      </button>
    </div>
  `,
  styleUrls: ['./product-catalog.component.scss']
})
export class ProductCatalogComponent implements OnInit, OnDestroy {
  selectedCategoryId: number | null = null;
  selectedCategoryName: string | null = null;
  currentSearchTerm: string | null = null;
  showMobileSidebar = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscribeToRouteChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToRouteChanges(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.selectedCategoryId = params['categoryId'] ? +params['categoryId'] : null;
    });

    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(queryParams => {
      this.currentSearchTerm = queryParams['search'] || null;
    });
  }

  onSearchSubmitted(searchTerm: string): void {
    this.currentSearchTerm = searchTerm;
    this.selectedCategoryId = null;
    this.selectedCategoryName = null;
    
    // Update URL with search parameter
    this.router.navigate(['/products'], {
      queryParams: { search: searchTerm }
    });
  }

  onSearchCleared(): void {
    this.currentSearchTerm = null;
    
    // Remove search parameter from URL
    this.router.navigate(['/products']);
  }

  onCategorySelected(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.currentSearchTerm = null;
    
    if (categoryId) {
      // Navigate to category route
      this.router.navigate(['/products/category', categoryId]);
    } else {
      // Navigate to all products
      this.router.navigate(['/products']);
    }
    
    this.closeMobileSidebar();
  }

  onProductSelected(product: Product): void {
    // Navigate to product detail page
    this.router.navigate(['/products', product.id]);
  }

  onAddToCart(product: Product): void {
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', product.name);
    
    // Show success message or notification
    // This would typically integrate with a cart service
  }

  clearAllFilters(): void {
    this.currentSearchTerm = null;
    this.selectedCategoryId = null;
    this.selectedCategoryName = null;
    
    // Navigate to all products
    this.router.navigate(['/products']);
  }

  toggleMobileSidebar(): void {
    this.showMobileSidebar = !this.showMobileSidebar;
  }

  closeMobileSidebar(): void {
    this.showMobileSidebar = false;
  }
}