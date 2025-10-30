import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { of, throwError } from 'rxjs';

import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../../cart/services/cart.service';
import { Product } from '../../models/product.models';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let cartService: jasmine.SpyObj<CartService>;

  const mockProducts: Product[] = [
    {
      id: 1,
      sku: 'PROD-001',
      name: 'Test Product 1',
      description: 'Test Description 1',
      price: 99.99,
      categoryId: 1,
      categoryName: 'Electronics',
      brand: 'Test Brand',
      imageUrl: 'test-image-1.jpg',
      isActive: true,
      quantityAvailable: 10,
      isInStock: true,
      isLowStock: false
    },
    {
      id: 2,
      sku: 'PROD-002',
      name: 'Test Product 2',
      description: 'Test Description 2',
      price: 149.99,
      categoryId: 1,
      categoryName: 'Electronics',
      brand: 'Test Brand',
      imageUrl: 'test-image-2.jpg',
      isActive: true,
      quantityAvailable: 5,
      isInStock: true,
      isLowStock: true
    }
  ];

  const mockPageResponse = {
    content: mockProducts,
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10
  };

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getActiveProducts',
      'getProductsByCategory',
      'searchProducts'
    ]);
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['addToCart']);

    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: cartServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    productService.getActiveProducts.and.returnValue(of(mockPageResponse));

    component.ngOnInit();

    expect(productService.getActiveProducts).toHaveBeenCalledWith(0, 10);
    expect(component.products).toEqual(mockProducts);
    expect(component.totalElements).toBe(2);
    expect(component.loading).toBeFalse();
  });

  it('should load products by category', () => {
    productService.getProductsByCategory.and.returnValue(of(mockPageResponse));
    component.categoryId = 1;

    component.loadProducts();

    expect(productService.getProductsByCategory).toHaveBeenCalledWith(1, 0, 10);
    expect(component.products).toEqual(mockProducts);
  });

  it('should handle loading error', () => {
    productService.getActiveProducts.and.returnValue(throwError(() => new Error('Server error')));
    spyOn(console, 'error');

    component.ngOnInit();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Failed to load products');
    expect(console.error).toHaveBeenCalled();
  });

  it('should add product to cart', () => {
    const mockCartItem = {
      id: 1,
      productId: 1,
      productName: 'Test Product 1',
      productSku: 'PROD-001',
      productImageUrl: 'test-image-1.jpg',
      unitPrice: 99.99,
      quantity: 1,
      totalPrice: 99.99
    };

    cartService.addToCart.and.returnValue(of(mockCartItem));
    spyOn(component.productAdded, 'emit');

    component.addToCart(mockProducts[0]);

    expect(cartService.addToCart).toHaveBeenCalledWith(1, 1);
    expect(component.productAdded.emit).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should handle add to cart error', () => {
    cartService.addToCart.and.returnValue(throwError(() => new Error('Insufficient inventory')));
    spyOn(console, 'error');

    component.addToCart(mockProducts[0]);

    expect(console.error).toHaveBeenCalled();
  });

  it('should change page', () => {
    productService.getActiveProducts.and.returnValue(of(mockPageResponse));
    spyOn(component, 'loadProducts');

    component.onPageChange(1);

    expect(component.currentPage).toBe(1);
    expect(component.loadProducts).toHaveBeenCalled();
  });

  it('should change page size', () => {
    productService.getActiveProducts.and.returnValue(of(mockPageResponse));
    spyOn(component, 'loadProducts');

    component.onPageSizeChange(20);

    expect(component.pageSize).toBe(20);
    expect(component.currentPage).toBe(0);
    expect(component.loadProducts).toHaveBeenCalled();
  });

  it('should track products by id', () => {
    const result = component.trackByProductId(0, mockProducts[0]);
    expect(result).toBe(1);
  });

  it('should check if product is in stock', () => {
    expect(component.isInStock(mockProducts[0])).toBeTrue();
    
    const outOfStockProduct = { ...mockProducts[0], quantityAvailable: 0, isInStock: false };
    expect(component.isInStock(outOfStockProduct)).toBeFalse();
  });

  it('should check if product is low stock', () => {
    expect(component.isLowStock(mockProducts[1])).toBeTrue();
    expect(component.isLowStock(mockProducts[0])).toBeFalse();
  });

  it('should format price correctly', () => {
    expect(component.formatPrice(99.99)).toBe('$99.99');
    expect(component.formatPrice(100)).toBe('$100.00');
  });
});