import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, of } from 'rxjs';
import { Product, ProductSearchRequest } from '../../models/product.models';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="product-search-container">
      <!-- Search Input -->
      <div class="search-input-container">
        <form [formGroup]="searchForm" class="search-form">
          <div class="search-input-group">
            <input 
              type="text" 
              formControlName="searchTerm"
              placeholder="Search products..."
              class="search-input"
              [class.has-results]="searchResults.length > 0"
              (focus)="onSearchFocus()"
              (blur)="onSearchBlur()"
            >
            <button 
              type="button" 
              class="search-button"
              (click)="onSearchSubmit()"
              [disabled]="searching"
            >
              <i class="fas fa-search" *ngIf="!searching"></i>
              <i class="fas fa-spinner fa-spin" *ngIf="searching"></i>
            </button>
            <button 
              type="button" 
              class="clear-button"
              *ngIf="searchForm.get('searchTerm')?.value"
              (click)="onClearSearch()"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </form>

        <!-- Search Suggestions/Results Dropdown -->
        <div 
          class="search-dropdown"
          *ngIf="showDropdown && (searchSuggestions.length > 0 || searchResults.length > 0 || searching)"
        >
          <!-- Loading State -->
          <div class="dropdown-loading" *ngIf="searching">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Searching...</span>
          </div>

          <!-- Search Suggestions -->
          <div class="suggestions-section" *ngIf="searchSuggestions.length > 0 && !searching">
            <div class="section-header">
              <i class="fas fa-search"></i>
              <span>Suggestions</span>
            </div>
            <div 
              *ngFor="let suggestion of searchSuggestions; trackBy: trackBySuggestion"
              class="suggestion-item"
              (click)="onSuggestionClick(suggestion)"
            >
              <i class="fas fa-search"></i>
              <span [innerHTML]="highlightSearchTerm(suggestion)"></span>
            </div>
          </div>

          <!-- Product Results -->
          <div class="results-section" *ngIf="searchResults.length > 0 && !searching">
            <div class="section-header">
              <i class="fas fa-box"></i>
              <span>Products ({{ searchResults.length }})</span>
            </div>
            <div 
              *ngFor="let product of searchResults; trackBy: trackByProductId"
              class="result-item"
              (click)="onProductClick(product)"
            >
              <div class="product-image">
                <img 
                  [src]="getPrimaryImageUrl(product)" 
                  [alt]="product.name"
                  (error)="onImageError($event)"
                >
              </div>
              <div class="product-info">
                <h4 class="product-name" [innerHTML]="highlightSearchTerm(product.name)"></h4>
                <p class="product-category">{{ product.category.name }}</p>
                <p class="product-price">\${{ product.price | number:'1.2-2' }}</p>
              </div>
              <div class="product-stock">
                <span 
                  class="stock-badge"
                  [class]="getStockBadgeClass(product)"
                >
                  {{ getStockText(product) }}
                </span>
              </div>
            </div>
            
            <!-- View All Results -->
            <div class="view-all-section" *ngIf="hasMoreResults">
              <button 
                class="view-all-btn"
                (click)="onViewAllResults()"
              >
                View all {{ totalResults }} results
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- No Results -->
          <div class="no-results-section" *ngIf="!searching && searchResults.length === 0 && searchSuggestions.length === 0 && searchForm.get('searchTerm')?.value">
            <div class="no-results-content">
              <i class="fas fa-search"></i>
              <p>No products found for "{{ searchForm.get('searchTerm')?.value }}"</p>
              <button class="btn btn-sm" (click)="onClearSearch()">
                Clear search
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Searches -->
      <div class="recent-searches" *ngIf="recentSearches.length > 0 && !searchForm.get('searchTerm')?.value">
        <div class="recent-header">
          <span>Recent searches</span>
          <button class="clear-recent-btn" (click)="clearRecentSearches()">
            Clear all
          </button>
        </div>
        <div class="recent-items">
          <button 
            *ngFor="let search of recentSearches; trackBy: trackByRecentSearch"
            class="recent-item"
            (click)="onRecentSearchClick(search)"
          >
            <i class="fas fa-history"></i>
            <span>{{ search }}</span>
            <button 
              class="remove-recent"
              (click)="removeRecentSearch(search, $event)"
            >
              <i class="fas fa-times"></i>
            </button>
          </button>
        </div>
      </div>

      <!-- Popular Searches -->
      <div class="popular-searches" *ngIf="popularSearches.length > 0 && !searchForm.get('searchTerm')?.value">
        <div class="popular-header">
          <span>Popular searches</span>
        </div>
        <div class="popular-items">
          <button 
            *ngFor="let search of popularSearches; trackBy: trackByPopularSearch"
            class="popular-item"
            (click)="onPopularSearchClick(search)"
          >
            <i class="fas fa-fire"></i>
            <span>{{ search }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-search.component.scss']
})
export class ProductSearchComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search products...';
  @Input() maxResults = 5;
  @Input() showSuggestions = true;
  @Input() showRecentSearches = true;
  @Input() showPopularSearches = true;
  
  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() productSelected = new EventEmitter<Product>();
  @Output() searchCleared = new EventEmitter<void>();

  searchForm: FormGroup;
  searchResults: Product[] = [];
  searchSuggestions: string[] = [];
  recentSearches: string[] = [];
  popularSearches: string[] = [];
  
  showDropdown = false;
  searching = false;
  hasMoreResults = false;
  totalResults = 0;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private readonly RECENT_SEARCHES_KEY = 'product_recent_searches';
  private readonly MAX_RECENT_SEARCHES = 5;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadRecentSearches();
    this.loadPopularSearches();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      searchTerm: ['']
    });
  }

  private setupSearchSubscription(): void {
    // Real-time search with debouncing
    this.searchForm.get('searchTerm')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      if (searchTerm && searchTerm.trim().length > 0) {
        this.searchSubject.next(searchTerm.trim());
      } else {
        this.clearSearchResults();
      }
    });

    // Handle search requests
    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        if (!searchTerm || searchTerm.length < 2) {
          return of({ products: [], suggestions: [] });
        }
        
        this.searching = true;
        return this.performSearch(searchTerm);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (results) => {
        this.handleSearchResults(results);
        this.searching = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searching = false;
        this.clearSearchResults();
      }
    });
  }

  private performSearch(searchTerm: string): any {
    const searchRequest: ProductSearchRequest = {
      searchTerm: searchTerm,
      page: 0,
      size: this.maxResults + 1, // Get one extra to check if there are more results
      sortBy: 'relevance', // Use relevance-based sorting for better results
      sortDirection: 'desc'
    };

    // Perform both product search and get suggestions in parallel
    const productSearch$ = this.productService.searchProducts(searchRequest);
    const suggestions$ = this.productService.getSearchSuggestions(searchTerm);

    return productSearch$.pipe(
      switchMap(response => {
        const products = response.content;
        const hasMore = products.length > this.maxResults;
        const limitedProducts = hasMore ? products.slice(0, this.maxResults) : products;
        
        return suggestions$.pipe(
          switchMap(suggestionsResponse => {
            // Combine all suggestion types into a single array
            const allSuggestions = [
              ...suggestionsResponse.productSuggestions,
              ...suggestionsResponse.brandSuggestions,
              ...suggestionsResponse.categorySuggestions
            ].slice(0, 5); // Limit to 5 suggestions
            
            return of({
              products: limitedProducts,
              suggestions: allSuggestions,
              hasMore: hasMore,
              totalResults: response.totalElements
            });
          })
        );
      })
    );
  }



  private handleSearchResults(results: any): void {
    this.searchResults = results.products || [];
    this.searchSuggestions = this.showSuggestions ? (results.suggestions || []) : [];
    this.hasMoreResults = results.hasMore || false;
    this.totalResults = results.totalResults || 0;
    this.showDropdown = true;
  }

  private clearSearchResults(): void {
    this.searchResults = [];
    this.searchSuggestions = [];
    this.hasMoreResults = false;
    this.totalResults = 0;
    this.showDropdown = false;
  }

  private loadRecentSearches(): void {
    if (!this.showRecentSearches) return;
    
    try {
      const stored = localStorage.getItem(this.RECENT_SEARCHES_KEY);
      this.recentSearches = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading recent searches:', error);
      this.recentSearches = [];
    }
  }

  private saveRecentSearch(searchTerm: string): void {
    if (!this.showRecentSearches || !searchTerm.trim()) return;
    
    const term = searchTerm.trim();
    const filtered = this.recentSearches.filter(s => s !== term);
    this.recentSearches = [term, ...filtered].slice(0, this.MAX_RECENT_SEARCHES);
    
    try {
      localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }

  private loadPopularSearches(): void {
    if (!this.showPopularSearches) return;
    
    this.productService.getPopularSearchTerms().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (popularTerms) => {
        this.popularSearches = popularTerms.slice(0, 5); // Limit to 5 popular searches
      },
      error: (error) => {
        console.error('Error loading popular searches:', error);
        // Fallback to default popular searches
        this.popularSearches = [
          'laptop',
          'smartphone',
          'headphones',
          'gaming',
          'books'
        ];
      }
    });
  }

  onSearchFocus(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    if (searchTerm || this.searchResults.length > 0) {
      this.showDropdown = true;
    }
  }

  onSearchBlur(): void {
    // Delay hiding dropdown to allow clicks on dropdown items
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  onSearchSubmit(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value?.trim();
    if (searchTerm) {
      this.saveRecentSearch(searchTerm);
      this.searchSubmitted.emit(searchTerm);
      this.showDropdown = false;
    }
  }

  onClearSearch(): void {
    this.searchForm.patchValue({ searchTerm: '' });
    this.clearSearchResults();
    this.searchCleared.emit();
  }

  onSuggestionClick(suggestion: string): void {
    this.searchForm.patchValue({ searchTerm: suggestion });
    this.saveRecentSearch(suggestion);
    this.searchSubmitted.emit(suggestion);
    this.showDropdown = false;
  }

  onProductClick(product: Product): void {
    this.productSelected.emit(product);
    this.showDropdown = false;
  }

  onViewAllResults(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value?.trim();
    if (searchTerm) {
      this.saveRecentSearch(searchTerm);
      this.searchSubmitted.emit(searchTerm);
      this.showDropdown = false;
    }
  }

  onRecentSearchClick(search: string): void {
    this.searchForm.patchValue({ searchTerm: search });
    this.searchSubmitted.emit(search);
  }

  onPopularSearchClick(search: string): void {
    this.searchForm.patchValue({ searchTerm: search });
    this.searchSubmitted.emit(search);
  }

  removeRecentSearch(search: string, event: Event): void {
    event.stopPropagation();
    this.recentSearches = this.recentSearches.filter(s => s !== search);
    try {
      localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  }

  clearRecentSearches(): void {
    this.recentSearches = [];
    try {
      localStorage.removeItem(this.RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }

  getPrimaryImageUrl(product: Product): string {
    const primaryImage = product.images.find(img => img.isPrimary);
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

  highlightSearchTerm(text: string): string {
    const searchTerm = this.searchForm.get('searchTerm')?.value?.trim();
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/product-placeholder.svg';
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackBySuggestion(index: number, suggestion: string): string {
    return suggestion;
  }

  trackByRecentSearch(index: number, search: string): string {
    return search;
  }

  trackByPopularSearch(index: number, search: string): string {
    return search;
  }
}