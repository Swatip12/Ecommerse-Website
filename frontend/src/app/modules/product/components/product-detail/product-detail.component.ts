import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Product, ProductImage } from '../../models/product.models';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-detail-container" *ngIf="product">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a routerLink="/products">Products</a>
        <span class="separator">/</span>
        <a [routerLink]="['/products/category', product.category.id]">{{ product.category.name }}</a>
        <span class="separator">/</span>
        <span class="current">{{ product.name }}</span>
      </nav>

      <div class="product-detail-content">
        <!-- Product Images -->
        <div class="product-images">
          <!-- Main Image -->
          <div class="main-image">
            <img 
              [src]="selectedImage?.imageUrl || getPrimaryImageUrl()" 
              [alt]="selectedImage?.altText || product.name"
              (error)="onImageError($event)"
              class="main-product-image"
            >
            <div class="image-badges">
              <span *ngIf="!product.inventory?.isInStock" class="badge out-of-stock">
                Out of Stock
              </span>
              <span *ngIf="product.inventory?.isLowStock && product.inventory?.isInStock" class="badge low-stock">
                Low Stock
              </span>
            </div>
          </div>

          <!-- Image Gallery -->
          <div class="image-gallery" *ngIf="product.images.length > 1">
            <div class="gallery-thumbnails">
              <div 
                *ngFor="let image of product.images; trackBy: trackByImageId"
                class="thumbnail"
                [class.active]="selectedImage?.id === image.id"
                (click)="selectImage(image)"
              >
                <img 
                  [src]="image.imageUrl" 
                  [alt]="image.altText || product.name"
                  (error)="onImageError($event)"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Product Information -->
        <div class="product-info">
          <div class="product-header">
            <h1 class="product-title">{{ product.name }}</h1>
            <p class="product-sku">SKU: {{ product.sku }}</p>
            <p class="product-brand" *ngIf="product.brand">Brand: {{ product.brand }}</p>
          </div>

          <div class="product-pricing">
            <div class="price-section">
              <span class="current-price">\${{ product.price | number:'1.2-2' }}</span>
            </div>
            
            <div class="availability-section">
              <div class="stock-status" [class]="getStockStatusClass()">
                <i [class]="getStockStatusIcon()"></i>
                <span>{{ getStockStatusText() }}</span>
              </div>
              <p class="stock-quantity" *ngIf="product.inventory?.isInStock">
                {{ product.inventory?.quantityAvailable }} in stock
              </p>
            </div>
          </div>

          <div class="product-description" *ngIf="product.description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="product-specifications" *ngIf="hasSpecifications()">
            <h3>Specifications</h3>
            <div class="specs-grid">
              <div class="spec-item" *ngIf="product.weight">
                <span class="spec-label">Weight:</span>
                <span class="spec-value">{{ product.weight }} kg</span>
              </div>
              <div class="spec-item" *ngIf="product.dimensions">
                <span class="spec-label">Dimensions:</span>
                <span class="spec-value">{{ product.dimensions }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Category:</span>
                <span class="spec-value">{{ product.category.name }}</span>
              </div>
            </div>
          </div>

          <!-- Purchase Actions -->
          <div class="purchase-actions">
            <div class="quantity-selector" *ngIf="product.inventory?.isInStock">
              <label for="quantity">Quantity:</label>
              <div class="quantity-controls">
                <button 
                  type="button" 
                  class="quantity-btn"
                  (click)="decreaseQuantity()"
                  [disabled]="selectedQuantity <= 1"
                >
                  -
                </button>
                <input 
                  id="quantity"
                  type="number" 
                  [(ngModel)]="selectedQuantity"
                  [min]="1"
                  [max]="product.inventory?.quantityAvailable || 1"
                  class="quantity-input"
                  (change)="validateQuantity()"
                >
                <button 
                  type="button" 
                  class="quantity-btn"
                  (click)="increaseQuantity()"
                  [disabled]="selectedQuantity >= (product.inventory?.quantityAvailable || 0)"
                >
                  +
                </button>
              </div>
            </div>

            <div class="action-buttons">
              <button 
                class="btn btn-primary btn-large"
                [disabled]="!product.inventory?.isInStock || addingToCart"
                (click)="onAddToCart()"
              >
                <i class="fas fa-shopping-cart"></i>
                {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
              </button>
              
              <button 
                class="btn btn-outline btn-large"
                (click)="onAddToWishlist()"
                [disabled]="addingToWishlist"
              >
                <i class="fas fa-heart"></i>
                {{ addingToWishlist ? 'Adding...' : 'Add to Wishlist' }}
              </button>
            </div>

            <div class="additional-actions">
              <button class="btn btn-link" (click)="onShare()">
                <i class="fas fa-share"></i>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Section -->
      <div class="related-products" *ngIf="relatedProducts.length > 0">
        <h3>Related Products</h3>
        <div class="related-products-grid">
          <div 
            *ngFor="let relatedProduct of relatedProducts; trackBy: trackByProductId"
            class="related-product-card"
            (click)="onRelatedProductClick(relatedProduct)"
          >
            <img 
              [src]="getProductPrimaryImage(relatedProduct)" 
              [alt]="relatedProduct.name"
              (error)="onImageError($event)"
            >
            <div class="related-product-info">
              <h4>{{ relatedProduct.name }}</h4>
              <p class="price">\${{ relatedProduct.price | number:'1.2-2' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading product details...</p>
    </div>

    <!-- Error State -->
    <div *ngIf="error" class="error-container">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Product Not Found</h3>
        <p>{{ error }}</p>
        <button (click)="onRetry()" class="btn btn-primary">Retry</button>
        <button (click)="goBack()" class="btn btn-secondary">Go Back</button>
      </div>
    </div>
  `,
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  @Input() productId?: number;

  product: Product | null = null;
  selectedImage: ProductImage | null = null;
  selectedQuantity = 1;
  relatedProducts: Product[] = [];
  
  loading = false;
  error: string | null = null;
  addingToCart = false;
  addingToWishlist = false;

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    // Get product ID from route or input
    if (this.productId) {
      this.loadProduct(this.productId);
    } else {
      this.route.params.pipe(
        takeUntil(this.destroy$)
      ).subscribe(params => {
        const id = params['id'];
        if (id) {
          this.loadProduct(+id);
        }
      });
    }
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage = this.getPrimaryImage();
        this.loading = false;
        this.loadRelatedProducts();
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  private loadRelatedProducts(): void {
    if (!this.product) return;

    this.productService.getProductsByCategory(this.product.category.id, 0, 4).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        // Filter out current product from related products
        this.relatedProducts = response.content.filter(p => p.id !== this.product?.id);
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  selectImage(image: ProductImage): void {
    this.selectedImage = image;
  }

  increaseQuantity(): void {
    if (this.product?.inventory && this.selectedQuantity < this.product.inventory.quantityAvailable) {
      this.selectedQuantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  validateQuantity(): void {
    if (!this.product?.inventory) return;

    if (this.selectedQuantity < 1) {
      this.selectedQuantity = 1;
    } else if (this.selectedQuantity > (this.product.inventory?.quantityAvailable || 0)) {
      this.selectedQuantity = this.product.inventory?.quantityAvailable || 1;
    }
  }

  onAddToCart(): void {
    if (!this.product || !this.product.inventory?.isInStock) return;

    this.addingToCart = true;
    
    // Simulate add to cart API call
    setTimeout(() => {
      this.addingToCart = false;
      // TODO: Implement actual cart service integration
      console.log(`Added ${this.selectedQuantity} of ${this.product?.name} to cart`);
    }, 1000);
  }

  onAddToWishlist(): void {
    if (!this.product) return;

    this.addingToWishlist = true;
    
    // Simulate add to wishlist API call
    setTimeout(() => {
      this.addingToWishlist = false;
      // TODO: Implement actual wishlist service integration
      console.log(`Added ${this.product?.name} to wishlist`);
    }, 500);
  }

  onShare(): void {
    if (navigator.share && this.product) {
      navigator.share({
        title: this.product.name,
        text: this.product.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  }

  onRelatedProductClick(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  onRetry(): void {
    if (this.productId) {
      this.loadProduct(this.productId);
    } else {
      const id = this.route.snapshot.params['id'];
      if (id) {
        this.loadProduct(+id);
      }
    }
  }

  goBack(): void {
    window.history.back();
  }

  getPrimaryImageUrl(): string {
    return this.getPrimaryImage()?.imageUrl || '/assets/images/product-placeholder.svg';
  }

  private getPrimaryImage(): ProductImage | null {
    if (!this.product?.images.length) return null;
    return this.product.images.find(img => img.isPrimary) || this.product.images[0];
  }

  getProductPrimaryImage(product: Product): string {
    const primaryImage = product.images.find(img => img.isPrimary);
    return primaryImage?.imageUrl || '/assets/images/product-placeholder.svg';
  }

  getStockStatusClass(): string {
    if (!this.product?.inventory) return 'unknown';
    if (!this.product.inventory.isInStock) return 'out-of-stock';
    if (this.product.inventory.isLowStock) return 'low-stock';
    return 'in-stock';
  }

  getStockStatusIcon(): string {
    if (!this.product?.inventory) return 'fas fa-question-circle';
    if (!this.product.inventory.isInStock) return 'fas fa-times-circle';
    if (this.product.inventory.isLowStock) return 'fas fa-exclamation-triangle';
    return 'fas fa-check-circle';
  }

  getStockStatusText(): string {
    if (!this.product?.inventory) return 'Stock status unknown';
    if (!this.product.inventory.isInStock) return 'Out of stock';
    if (this.product.inventory.isLowStock) return 'Low stock';
    return 'In stock';
  }

  hasSpecifications(): boolean {
    return !!(this.product?.weight || this.product?.dimensions);
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/product-placeholder.svg';
  }

  trackByImageId(index: number, image: ProductImage): number {
    return image.id;
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}