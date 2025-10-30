import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  ProductSearchRequest, 
  Category, 
  PriceRange, 
  ProductSortBy, 
  SortDirection 
} from '../../models/product.models';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="product-filter-container">
      <!-- Filter Header -->
      <div class="filter-header">
        <h3>Filters</h3>
        <button 
          class="clear-filters-btn"
          *ngIf="hasActiveFilters"
          (click)="clearAllFilters()"
        >
          Clear All
        </button>
      </div>

      <!-- Active Filters Display -->
      <div class="active-filters" *ngIf="hasActiveFilters">
        <div class="active-filters-header">
          <span>Active Filters:</span>
        </div>
        <div class="filter-tags">
          <!-- Search Term Tag -->
          <div class="filter-tag" *ngIf="filterForm.get('searchTerm')?.value">
            <span>Search: "{{ filterForm.get('searchTerm')?.value }}"</span>
            <button (click)="removeFilter('searchTerm')">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Category Tags -->
          <div 
            class="filter-tag" 
            *ngFor="let categoryId of selectedCategoryIds; trackBy: trackByCategoryId"
          >
            <span>{{ getCategoryName(categoryId) }}</span>
            <button (click)="removeCategory(categoryId)">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Brand Tags -->
          <div 
            class="filter-tag" 
            *ngFor="let brand of selectedBrands; trackBy: trackByBrand"
          >
            <span>{{ brand }}</span>
            <button (click)="removeBrand(brand)">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Price Range Tag -->
          <div class="filter-tag" *ngIf="hasPriceFilter">
            <span>
              Price: {{ getPriceRangeText() }}
            </span>
            <button (click)="clearPriceFilter()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- In Stock Filter Tag -->
          <div class="filter-tag" *ngIf="filterForm.get('inStockOnly')?.value">
            <span>In Stock Only</span>
            <button (click)="removeFilter('inStockOnly')">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <form [formGroup]="filterForm" class="filter-form">
        <!-- Sort Options -->
        <div class="filter-section">
          <div class="section-header">
            <h4>Sort By</h4>
          </div>
          <div class="sort-options">
            <select formControlName="sortBy" class="sort-select">
              <option value="relevance">Relevance</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="createdAt">Newest</option>
            </select>
            <select formControlName="sortDirection" class="sort-direction">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        <!-- Categories Filter -->
        <div class="filter-section">
          <div class="section-header" (click)="toggleSection('categories')">
            <h4>Categories</h4>
            <i class="fas" [class.fa-chevron-down]="!sectionsExpanded.categories" 
               [class.fa-chevron-up]="sectionsExpanded.categories"></i>
          </div>
          <div class="section-content" *ngIf="sectionsExpanded.categories">
            <div class="category-search">
              <input 
                type="text" 
                placeholder="Search categories..."
                [(ngModel)]="categorySearchTerm"
                (input)="onCategorySearch($event)"
                class="category-search-input"
              >
            </div>
            <div class="category-list">
              <div 
                *ngFor="let category of filteredCategories; trackBy: trackByCategoryId"
                class="category-item"
                [class.has-children]="hasSubcategories(category)"
              >
                <label class="category-checkbox">
                  <input 
                    type="checkbox"
                    [checked]="isCategorySelected(category.id)"
                    (change)="onCategoryChange(category.id, $event)"
                  >
                  <span class="checkmark"></span>
                  <span class="category-name">{{ category.name }}</span>
                  <span class="product-count" *ngIf="getCategoryProductCount(category.id) > 0">
                    ({{ getCategoryProductCount(category.id) }})
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Brands Filter -->
        <div class="filter-section">
          <div class="section-header" (click)="toggleSection('brands')">
            <h4>Brands</h4>
            <i class="fas" [class.fa-chevron-down]="!sectionsExpanded.brands" 
               [class.fa-chevron-up]="sectionsExpanded.brands"></i>
          </div>
          <div class="section-content" *ngIf="sectionsExpanded.brands">
            <div class="brand-search">
              <input 
                type="text" 
                placeholder="Search brands..."
                [(ngModel)]="brandSearchTerm"
                (input)="onBrandSearch($event)"
                class="brand-search-input"
              >
            </div>
            <div class="brand-list">
              <label 
                *ngFor="let brand of filteredBrands; trackBy: trackByBrand"
                class="brand-checkbox"
              >
                <input 
                  type="checkbox"
                  [checked]="isBrandSelected(brand)"
                  (change)="onBrandChange(brand, $event)"
                >
                <span class="checkmark"></span>
                <span class="brand-name">{{ brand }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Price Range Filter -->
        <div class="filter-section">
          <div class="section-header" (click)="toggleSection('price')">
            <h4>Price Range</h4>
            <i class="fas" [class.fa-chevron-down]="!sectionsExpanded.price" 
               [class.fa-chevron-up]="sectionsExpanded.price"></i>
          </div>
          <div class="section-content" *ngIf="sectionsExpanded.price">
            <div class="price-inputs">
              <div class="price-input-group">
                <label>Min Price</label>
                <input 
                  type="number" 
                  formControlName="minPrice"
                  [min]="minPrice"
                  [max]="maxPrice"
                  placeholder="0"
                  class="price-input"
                >
              </div>
              <div class="price-separator">-</div>
              <div class="price-input-group">
                <label>Max Price</label>
                <input 
                  type="number" 
                  formControlName="maxPrice"
                  [min]="minPrice"
                  [max]="maxPrice"
                  [placeholder]="maxPrice.toString()"
                  class="price-input"
                >
              </div>
            </div>
            
            <!-- Price Range Slider -->
            <div class="price-slider-container">
              <div class="price-slider">
                <input 
                  type="range"
                  [min]="minPrice"
                  [max]="maxPrice"
                  [value]="filterForm.get('minPrice')?.value || minPrice"
                  (input)="onMinPriceSliderChange($event)"
                  class="slider min-slider"
                >
                <input 
                  type="range"
                  [min]="minPrice"
                  [max]="maxPrice"
                  [value]="filterForm.get('maxPrice')?.value || maxPrice"
                  (input)="onMaxPriceSliderChange($event)"
                  class="slider max-slider"
                >
              </div>
              <div class="price-range-display">
                {{ getPriceRangeText() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Filter -->
        <div class="filter-section">
          <div class="section-header" (click)="toggleSection('stock')">
            <h4>Availability</h4>
            <i class="fas" [class.fa-chevron-down]="!sectionsExpanded.stock" 
               [class.fa-chevron-up]="sectionsExpanded.stock"></i>
          </div>
          <div class="section-content" *ngIf="sectionsExpanded.stock">
            <label class="stock-checkbox">
              <input 
                type="checkbox"
                formControlName="inStockOnly"
              >
              <span class="checkmark"></span>
              <span>In Stock Only</span>
            </label>
          </div>
        </div>
      </form>

      <!-- Apply Filters Button (Mobile) -->
      <div class="mobile-apply-button" *ngIf="isMobile">
        <button 
          class="apply-filters-btn"
          (click)="applyFilters()"
          [disabled]="!hasChanges"
        >
          Apply Filters
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./product-filter.component.scss']
})
export class ProductFilterComponent implements OnInit, OnDestroy {
  @Input() initialFilters?: ProductSearchRequest;
  @Input() isMobile = false;
  @Output() filtersChanged = new EventEmitter<ProductSearchRequest>();
  @Output() filtersApplied = new EventEmitter<ProductSearchRequest>();

  filterForm: FormGroup;
  categories: Category[] = [];
  brands: string[] = [];
  filteredCategories: Category[] = [];
  filteredBrands: string[] = [];
  
  minPrice = 0;
  maxPrice = 1000;
  
  selectedCategoryIds: number[] = [];
  selectedBrands: string[] = [];
  
  categorySearchTerm = '';
  brandSearchTerm = '';
  
  sectionsExpanded = {
    categories: true,
    brands: true,
    price: true,
    stock: true
  };
  
  hasChanges = false;
  categoryProductCounts: { [key: number]: number } = {};
  
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadFilterData();
    this.setupFormSubscriptions();
    this.loadInitialFilters();
    this.loadUrlFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      minPrice: [null],
      maxPrice: [null],
      inStockOnly: [false],
      sortBy: ['relevance'],
      sortDirection: ['desc']
    });
  }

  private setupFormSubscriptions(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hasChanges = true;
      if (!this.isMobile) {
        this.emitFilters();
      }
    });
  }

  private loadFilterData(): void {
    // Load categories
    this.productService.categories$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(categories => {
      this.categories = categories;
      this.filteredCategories = categories;
      this.loadCategoryProductCounts();
    });

    // Load brands
    this.productService.brands$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(brands => {
      this.brands = brands;
      this.filteredBrands = brands;
    });

    // Load price range
    this.productService.priceRange$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(priceRange => {
      if (priceRange) {
        this.minPrice = priceRange.minPrice;
        this.maxPrice = priceRange.maxPrice;
      }
    });
  }

  private loadCategoryProductCounts(): void {
    this.categories.forEach(category => {
      this.productService.getProductCountByCategory(category.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe(response => {
        this.categoryProductCounts[category.id] = response.count;
      });
    });
  }

  private loadInitialFilters(): void {
    if (this.initialFilters) {
      this.applyInitialFilters(this.initialFilters);
    }
  }

  private loadUrlFilters(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.applyUrlFilters(params);
      }
    });
  }

  private applyInitialFilters(filters: ProductSearchRequest): void {
    this.filterForm.patchValue({
      searchTerm: filters.searchTerm || '',
      minPrice: filters.minPrice || null,
      maxPrice: filters.maxPrice || null,
      inStockOnly: filters.inStockOnly || false,
      sortBy: filters.sortBy || 'relevance',
      sortDirection: filters.sortDirection || 'desc'
    });

    this.selectedCategoryIds = filters.categoryIds || [];
    this.selectedBrands = filters.brands || [];
  }

  private applyUrlFilters(params: any): void {
    const filters: ProductSearchRequest = {
      searchTerm: params.q || '',
      categoryIds: params.categories ? params.categories.split(',').map(Number) : [],
      brands: params.brands ? params.brands.split(',') : [],
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      inStockOnly: params.inStock === 'true',
      sortBy: params.sortBy || 'relevance',
      sortDirection: params.sortDir || 'desc'
    };

    this.applyInitialFilters(filters);
  }

  private emitFilters(): void {
    const filters = this.buildFilterRequest();
    this.filtersChanged.emit(filters);
    this.updateUrl(filters);
  }

  private buildFilterRequest(): ProductSearchRequest {
    const formValue = this.filterForm.value;
    
    return {
      searchTerm: formValue.searchTerm || undefined,
      categoryIds: this.selectedCategoryIds.length > 0 ? this.selectedCategoryIds : undefined,
      brands: this.selectedBrands.length > 0 ? this.selectedBrands : undefined,
      minPrice: formValue.minPrice || undefined,
      maxPrice: formValue.maxPrice || undefined,
      inStockOnly: formValue.inStockOnly || false,
      sortBy: formValue.sortBy || 'relevance',
      sortDirection: formValue.sortDirection || 'desc',
      page: 0,
      size: 20
    };
  }

  private updateUrl(filters: ProductSearchRequest): void {
    const queryParams: any = {};
    
    if (filters.searchTerm) queryParams.q = filters.searchTerm;
    if (filters.categoryIds?.length) queryParams.categories = filters.categoryIds.join(',');
    if (filters.brands?.length) queryParams.brands = filters.brands.join(',');
    if (filters.minPrice) queryParams.minPrice = filters.minPrice;
    if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
    if (filters.inStockOnly) queryParams.inStock = 'true';
    if (filters.sortBy && filters.sortBy !== 'relevance') queryParams.sortBy = filters.sortBy;
    if (filters.sortDirection && filters.sortDirection !== 'desc') queryParams.sortDir = filters.sortDirection;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  // Event handlers
  toggleSection(section: keyof typeof this.sectionsExpanded): void {
    this.sectionsExpanded[section] = !this.sectionsExpanded[section];
  }

  onCategoryChange(categoryId: number, event: any): void {
    if (event.target.checked) {
      this.selectedCategoryIds.push(categoryId);
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== categoryId);
    }
    this.hasChanges = true;
    if (!this.isMobile) {
      this.emitFilters();
    }
  }

  onBrandChange(brand: string, event: any): void {
    if (event.target.checked) {
      this.selectedBrands.push(brand);
    } else {
      this.selectedBrands = this.selectedBrands.filter(b => b !== brand);
    }
    this.hasChanges = true;
    if (!this.isMobile) {
      this.emitFilters();
    }
  }

  onCategorySearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm)
    );
  }

  onBrandSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredBrands = this.brands.filter(brand =>
      brand.toLowerCase().includes(searchTerm)
    );
  }

  onMinPriceSliderChange(event: any): void {
    const value = Number(event.target.value);
    this.filterForm.patchValue({ minPrice: value });
  }

  onMaxPriceSliderChange(event: any): void {
    const value = Number(event.target.value);
    this.filterForm.patchValue({ maxPrice: value });
  }

  // Filter management
  applyFilters(): void {
    const filters = this.buildFilterRequest();
    this.filtersApplied.emit(filters);
    this.hasChanges = false;
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
      sortBy: 'relevance',
      sortDirection: 'desc'
    });
    this.selectedCategoryIds = [];
    this.selectedBrands = [];
    this.hasChanges = true;
    this.emitFilters();
  }

  removeFilter(filterName: string): void {
    this.filterForm.patchValue({ [filterName]: filterName === 'inStockOnly' ? false : '' });
  }

  removeCategory(categoryId: number): void {
    this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== categoryId);
    this.hasChanges = true;
    if (!this.isMobile) {
      this.emitFilters();
    }
  }

  removeBrand(brand: string): void {
    this.selectedBrands = this.selectedBrands.filter(b => b !== brand);
    this.hasChanges = true;
    if (!this.isMobile) {
      this.emitFilters();
    }
  }

  clearPriceFilter(): void {
    this.filterForm.patchValue({ minPrice: null, maxPrice: null });
  }

  // Utility methods
  get hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return !!(
      formValue.searchTerm ||
      this.selectedCategoryIds.length > 0 ||
      this.selectedBrands.length > 0 ||
      formValue.minPrice ||
      formValue.maxPrice ||
      formValue.inStockOnly
    );
  }

  get hasPriceFilter(): boolean {
    const formValue = this.filterForm.value;
    return !!(formValue.minPrice || formValue.maxPrice);
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  isBrandSelected(brand: string): boolean {
    return this.selectedBrands.includes(brand);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  }

  getCategoryProductCount(categoryId: number): number {
    return this.categoryProductCounts[categoryId] || 0;
  }

  hasSubcategories(category: Category): boolean {
    return this.categories.some(c => c.parentId === category.id);
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }

  trackByBrand(index: number, brand: string): string {
    return brand;
  }

  getPriceRangeText(): string {
    const minValue = this.filterForm.get('minPrice')?.value || this.minPrice;
    const maxValue = this.filterForm.get('maxPrice')?.value || this.maxPrice;
    return `$${minValue} - $${maxValue}`;
  }
}