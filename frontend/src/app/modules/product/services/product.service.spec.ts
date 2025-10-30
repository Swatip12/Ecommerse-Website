import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product, ProductSearchRequest } from '../models/product.models';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: 1,
    sku: 'PROD-001',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    categoryId: 1,
    categoryName: 'Electronics',
    brand: 'Test Brand',
    imageUrl: 'test-image.jpg',
    isActive: true,
    quantityAvailable: 10,
    isInStock: true,
    isLowStock: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get product by id', () => {
    service.getProductById(1).subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne('/api/products/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should search products', () => {
    const searchRequest: ProductSearchRequest = {
      keyword: 'test',
      categoryId: 1,
      minPrice: 50,
      maxPrice: 150,
      page: 0,
      size: 10
    };

    const mockResponse = {
      content: [mockProduct],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10
    };

    service.searchProducts(searchRequest).subscribe(response => {
      expect(response.content).toEqual([mockProduct]);
      expect(response.totalElements).toBe(1);
    });

    const req = httpMock.expectOne(req => req.url === '/api/products/search');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(searchRequest);
    req.flush(mockResponse);
  });

  it('should get products by category', () => {
    const mockResponse = {
      content: [mockProduct],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10
    };

    service.getProductsByCategory(1, 0, 10).subscribe(response => {
      expect(response.content).toEqual([mockProduct]);
    });

    const req = httpMock.expectOne('/api/products/category/1?page=0&size=10');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle search error', () => {
    const searchRequest: ProductSearchRequest = {
      keyword: 'test',
      page: 0,
      size: 10
    };

    service.searchProducts(searchRequest).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(req => req.url === '/api/products/search');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should get featured products', () => {
    const mockResponse = {
      content: [mockProduct],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10
    };

    service.getFeaturedProducts().subscribe(response => {
      expect(response.content).toEqual([mockProduct]);
    });

    const req = httpMock.expectOne('/api/products/featured');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should validate product availability', () => {
    service.validateProductAvailability(1, 5).subscribe(isAvailable => {
      expect(isAvailable).toBe(true);
    });

    const req = httpMock.expectOne('/api/products/1/availability?quantity=5');
    expect(req.request.method).toBe('GET');
    req.flush({ available: true });
  });
});