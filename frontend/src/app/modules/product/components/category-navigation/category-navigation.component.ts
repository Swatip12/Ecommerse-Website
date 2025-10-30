import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Category } from '../../models/product.models';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-category-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-navigation">
      <!-- Mobile Category Toggle -->
      <div class="mobile-category-toggle" (click)="toggleMobileMenu()">
        <i class="fas fa-bars"></i>
        <span>Categories</span>
        <i class="fas fa-chevron-down" [class.rotated]="showMobileMenu"></i>
      </div>

      <!-- Category Menu -->
      <nav class="category-menu" [class.mobile-open]="showMobileMenu">
        <!-- All Products Link -->
        <div class="category-item all-products" [class.active]="selectedCategoryId === null">
          <a 
            [routerLink]="['/products']" 
            class="category-link"
            (click)="onCategorySelect(null)"
          >
            <i class="fas fa-th-large"></i>
            <span>All Products</span>
            <span class="product-count" *ngIf="totalProductCount > 0">({{ totalProductCount }})</span>
          </a>
        </div>

        <!-- Root Categories -->
        <div 
          *ngFor="let category of rootCategories; trackBy: trackByCategoryId"
          class="category-item"
          [class.active]="selectedCategoryId === category.id"
          [class.has-children]="hasSubcategories(category.id)"
        >
          <div class="category-link-container">
            <a 
              [routerLink]="['/products/category', category.id]"
              class="category-link"
              (click)="onCategorySelect(category.id)"
            >
              <i class="fas fa-folder"></i>
              <span>{{ category.name }}</span>
              <span class="product-count" *ngIf="getCategoryProductCount(category.id) > 0">
                ({{ getCategoryProductCount(category.id) }})
              </span>
            </a>
            
            <button 
              *ngIf="hasSubcategories(category.id)"
              class="expand-btn"
              (click)="toggleCategory(category.id)"
              [class.expanded]="isExpanded(category.id)"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <!-- Subcategories -->
          <div 
            class="subcategories"
            [class.expanded]="isExpanded(category.id)"
            *ngIf="hasSubcategories(category.id)"
          >
            <div 
              *ngFor="let subcategory of getSubcategories(category.id); trackBy: trackByCategoryId"
              class="subcategory-item"
              [class.active]="selectedCategoryId === subcategory.id"
            >
              <a 
                [routerLink]="['/products/category', subcategory.id]"
                class="subcategory-link"
                (click)="onCategorySelect(subcategory.id)"
              >
                <i class="fas fa-folder-open"></i>
                <span>{{ subcategory.name }}</span>
                <span class="product-count" *ngIf="getCategoryProductCount(subcategory.id) > 0">
                  ({{ getCategoryProductCount(subcategory.id) }})
                </span>
              </a>
            </div>
          </div>
        </div>

        <!-- Featured Categories -->
        <div class="featured-section" *ngIf="featuredCategories.length > 0">
          <h4 class="section-title">Featured</h4>
          <div 
            *ngFor="let category of featuredCategories; trackBy: trackByCategoryId"
            class="category-item featured"
            [class.active]="selectedCategoryId === category.id"
          >
            <a 
              [routerLink]="['/products/category', category.id]"
              class="category-link"
              (click)="onCategorySelect(category.id)"
            >
              <i class="fas fa-star"></i>
              <span>{{ category.name }}</span>
              <span class="product-count" *ngIf="getCategoryProductCount(category.id) > 0">
                ({{ getCategoryProductCount(category.id) }})
              </span>
            </a>
          </div>
        </div>
      </nav>

      <!-- Category Breadcrumb -->
      <div class="category-breadcrumb" *ngIf="categoryHierarchy.length > 0">
        <nav class="breadcrumb">
          <a routerLink="/products" (click)="onCategorySelect(null)">All Products</a>
          <span 
            *ngFor="let category of categoryHierarchy; let last = last"
            class="breadcrumb-item"
          >
            <span class="separator">/</span>
            <a 
              *ngIf="!last"
              [routerLink]="['/products/category', category.id]"
              (click)="onCategorySelect(category.id)"
            >
              {{ category.name }}
            </a>
            <span *ngIf="last" class="current">{{ category.name }}</span>
          </span>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading categories...</p>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button (click)="onRetry()" class="btn btn-sm">Retry</button>
    </div>
  `,
  styleUrls: ['./category-navigation.component.scss']
})
export class CategoryNavigationComponent implements OnInit, OnDestroy {
  @Input() selectedCategoryId: number | null = null;
  @Input() showProductCounts = true;
  @Input() collapsible = true;
  
  @Output() categorySelected = new EventEmitter<number | null>();

  rootCategories: Category[] = [];
  allCategories: Category[] = [];
  featuredCategories: Category[] = [];
  categoryHierarchy: Category[] = [];
  
  expandedCategories = new Set<number>();
  categoryProductCounts = new Map<number, number>();
  totalProductCount = 0;
  showMobileMenu = false;
  
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadCategoryHierarchy();
    if (this.showProductCounts) {
      this.loadProductCounts();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.loading = true;
    this.error = null;

    // Load all categories
    this.productService.getAllCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (categories) => {
        this.allCategories = categories;
        this.rootCategories = categories.filter(cat => !cat.parentId);
        this.featuredCategories = categories.filter(cat => cat.name.toLowerCase().includes('featured')).slice(0, 3);
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  private loadCategoryHierarchy(): void {
    if (!this.selectedCategoryId) {
      this.categoryHierarchy = [];
      return;
    }

    this.productService.getCategoryHierarchy(this.selectedCategoryId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (hierarchy) => {
        this.categoryHierarchy = hierarchy;
      },
      error: (error) => {
        console.error('Error loading category hierarchy:', error);
      }
    });
  }

  private loadProductCounts(): void {
    // Load total product count
    this.productService.getAllProducts(0, 1).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.totalProductCount = response.totalElements;
      },
      error: (error) => {
        console.error('Error loading total product count:', error);
      }
    });

    // Load product counts for each category
    this.allCategories.forEach(category => {
      this.productService.getProductCountByCategory(category.id).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (result) => {
          this.categoryProductCounts.set(category.id, result.count);
        },
        error: (error) => {
          console.error(`Error loading product count for category ${category.id}:`, error);
        }
      });
    });
  }

  onCategorySelect(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.categorySelected.emit(categoryId);
    this.loadCategoryHierarchy();
    this.closeMobileMenu();
  }

  toggleCategory(categoryId: number): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  hasSubcategories(categoryId: number): boolean {
    return this.allCategories.some(cat => cat.parentId === categoryId);
  }

  getSubcategories(parentId: number): Category[] {
    return this.allCategories.filter(cat => cat.parentId === parentId);
  }

  getCategoryProductCount(categoryId: number): number {
    return this.categoryProductCounts.get(categoryId) || 0;
  }

  onRetry(): void {
    this.loadCategories();
    if (this.showProductCounts) {
      this.loadProductCounts();
    }
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }
}