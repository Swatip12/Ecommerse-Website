import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { 
  Product, 
  ProductSearchRequest, 
  ProductSearchResponse, 
  Category, 
  PriceRange, 
  ProductRequest,
  SearchSuggestionResponse 
} from '../models/product.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'http://localhost:8082/api/products';
  private readonly CATEGORY_API_URL = 'http://localhost:8082/api/categories';

  // Cache for frequently accessed data
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private brandsSubject = new BehaviorSubject<string[]>([]);
  private priceRangeSubject = new BehaviorSubject<PriceRange | null>(null);

  public categories$ = this.categoriesSubject.asObservable();
  public brands$ = this.brandsSubject.asObservable();
  public priceRange$ = this.priceRangeSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFiltersData();
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Mock categories
    const mockCategories: Category[] = [
      { id: 1, name: 'Electronics', description: 'Electronic devices and gadgets', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 2, name: 'Fashion', description: 'Clothing and accessories', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 3, name: 'Home & Garden', description: 'Home improvement and garden supplies', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 4, name: 'Sports & Gaming', description: 'Sports equipment and gaming', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
    ];

    // Mock brands
    const mockBrands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG', 'Dell', 'HP'];

    // Mock price range
    const mockPriceRange: PriceRange = { minPrice: 10, maxPrice: 2000 };

    // Set mock data
    this.categoriesSubject.next(mockCategories);
    this.brandsSubject.next(mockBrands);
    this.priceRangeSubject.next(mockPriceRange);
  }

  // Product CRUD operations
  createProduct(request: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.API_URL, request)
      .pipe(catchError(this.handleError));
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getProductBySku(sku: string): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/sku/${sku}`)
      .pipe(catchError(this.handleError));
  }

  updateProduct(id: number, request: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Product search and listing
  getAllProducts(page: number = 0, size: number = 20, sortBy: string = 'name', sortDirection: string = 'asc'): Observable<ProductSearchResponse> {
    // Use the same mock data as searchProducts
    const searchRequest: ProductSearchRequest = {
      page,
      size,
      sortBy,
      sortDirection
    };
    return this.searchProducts(searchRequest);
  }

  searchProducts(searchRequest: ProductSearchRequest): Observable<ProductSearchResponse> {
    // Return mock data for development
    return new Observable(observer => {
      setTimeout(() => {
        const mockProducts = this.generateMockProducts();
        const filteredProducts = this.filterMockProducts(mockProducts, searchRequest);
        
        const response: ProductSearchResponse = {
          content: filteredProducts.slice(0, searchRequest.size || 20),
          totalElements: filteredProducts.length,
          totalPages: Math.ceil(filteredProducts.length / (searchRequest.size || 20)),
          size: searchRequest.size || 20,
          number: searchRequest.page || 0,
          numberOfElements: Math.min(filteredProducts.length, searchRequest.size || 20),
          first: (searchRequest.page || 0) === 0,
          last: (searchRequest.page || 0) >= Math.ceil(filteredProducts.length / (searchRequest.size || 20)) - 1
        };
        
        observer.next(response);
        observer.complete();
      }, 500); // Simulate network delay
    });
  }

  private generateMockProducts(): Product[] {
    const categories = this.categoriesSubject.value;
    const brands = this.brandsSubject.value;
    
    return [
      {
        id: 1,
        sku: 'IPHONE15-128',
        name: 'iPhone 15 Pro 128GB',
        description: 'Latest iPhone with advanced camera system and A17 Pro chip',
        price: 999.99,
        category: categories[0],
        brand: 'Apple',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        inventory: { productId: 1, quantityAvailable: 50, quantityReserved: 5, reorderLevel: 10, lastUpdated: '2024-01-01', isInStock: true, isLowStock: false },
        images: [{ id: 1, imageUrl: 'https://via.placeholder.com/300x300/007bff/ffffff?text=iPhone+15', displayOrder: 1, isPrimary: true, createdAt: '2024-01-01' }]
      },
      {
        id: 2,
        sku: 'SAMSUNG-S24',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen and advanced AI features',
        price: 1199.99,
        category: categories[0],
        brand: 'Samsung',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        inventory: { productId: 2, quantityAvailable: 30, quantityReserved: 3, reorderLevel: 10, lastUpdated: '2024-01-01', isInStock: true, isLowStock: false },
        images: [{ id: 2, imageUrl: 'https://via.placeholder.com/300x300/28a745/ffffff?text=Galaxy+S24', displayOrder: 1, isPrimary: true, createdAt: '2024-01-01' }]
      },
      {
        id: 3,
        sku: 'NIKE-AIR-MAX',
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Max Air cushioning',
        price: 149.99,
        category: categories[1],
        brand: 'Nike',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        inventory: { productId: 3, quantityAvailable: 100, quantityReserved: 10, reorderLevel: 20, lastUpdated: '2024-01-01', isInStock: true, isLowStock: false },
        images: [{ id: 3, imageUrl: 'https://via.placeholder.com/300x300/dc3545/ffffff?text=Nike+Air+Max', displayOrder: 1, isPrimary: true, createdAt: '2024-01-01' }]
      },
      {
        id: 4,
        sku: 'SONY-WH1000XM5',
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise canceling wireless headphones',
        price: 399.99,
        category: categories[0],
        brand: 'Sony',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        inventory: { productId: 4, quantityAvailable: 25, quantityReserved: 2, reorderLevel: 10, lastUpdated: '2024-01-01', isInStock: true, isLowStock: false },
        images: [{ id: 4, imageUrl: 'https://via.placeholder.com/300x300/6f42c1/ffffff?text=Sony+Headphones', displayOrder: 1, isPrimary: true, createdAt: '2024-01-01' }]
      },
      {
        id: 5,
        sku: 'ADIDAS-ULTRA',
        name: 'Adidas Ultraboost 22',
        description: 'High-performance running shoes with Boost midsole',
        price: 189.99,
        category: categories[1],
        brand: 'Adidas',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        inventory: { productId: 5, quantityAvailable: 75, quantityReserved: 8, reorderLevel: 15, lastUpdated: '2024-01-01', isInStock: true, isLowStock: false },
        images: [{ id: 5, imageUrl: 'https://via.placeholder.com/300x300/fd7e14/ffffff?text=Adidas+Ultra', displayOrder: 1, isPrimary: true, createdAt: '2024-01-01' }]
      },
      {
        id: 6,
        sku: 'DELL-XPS13',
        name: 'Dell XPS 13 Laptop',
        description: '13-inch premium laptop with Intel Core i7 and 16GB RAM',
        price: 1299.99,
        category: categories[0],
        brand: 'Dell',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        inventory: { productId: 6, quantityAvailable: 15, quantityReserved: 1, reorderLevel: 20, lastUpdated: '2024-01-01', isInStock: true, isLowStock: true },
        images: [{ id: 6, imageUrl: 'https://via.placeholder.com/300x300/17a2b8/ffffff?text=Dell+XPS+13', displayOrder: 1, isPrimary: true, createdAt: '2024-01-01' }]
      }
    ];
  }

  private filterMockProducts(products: Product[], searchRequest: ProductSearchRequest): Product[] {
    let filtered = [...products];

    // Filter by search term
    if (searchRequest.searchTerm) {
      const term = searchRequest.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (searchRequest.categoryIds && searchRequest.categoryIds.length > 0) {
      filtered = filtered.filter(p => searchRequest.categoryIds!.includes(p.category.id));
    }

    // Filter by brand
    if (searchRequest.brands && searchRequest.brands.length > 0) {
      filtered = filtered.filter(p => p.brand && searchRequest.brands!.includes(p.brand));
    }

    // Filter by price range
    if (searchRequest.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= searchRequest.minPrice!);
    }
    if (searchRequest.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= searchRequest.maxPrice!);
    }

    // Filter by stock
    if (searchRequest.inStockOnly) {
      filtered = filtered.filter(p => p.inventory?.isInStock);
    }

    // Sort products
    if (searchRequest.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (searchRequest.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default:
            return 0;
        }

        if (searchRequest.sortDirection === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }

  searchProductsWithParams(searchRequest: ProductSearchRequest): Observable<ProductSearchResponse> {
    let params = new HttpParams();
    
    if (searchRequest.searchTerm) {
      params = params.set('searchTerm', searchRequest.searchTerm);
    }
    if (searchRequest.categoryIds && searchRequest.categoryIds.length > 0) {
      searchRequest.categoryIds.forEach(id => {
        params = params.append('categoryIds', id.toString());
      });
    }
    if (searchRequest.brands && searchRequest.brands.length > 0) {
      searchRequest.brands.forEach(brand => {
        params = params.append('brands', brand);
      });
    }
    if (searchRequest.minPrice !== undefined) {
      params = params.set('minPrice', searchRequest.minPrice.toString());
    }
    if (searchRequest.maxPrice !== undefined) {
      params = params.set('maxPrice', searchRequest.maxPrice.toString());
    }
    if (searchRequest.inStockOnly !== undefined) {
      params = params.set('inStockOnly', searchRequest.inStockOnly.toString());
    }
    
    params = params.set('sortBy', searchRequest.sortBy || 'name');
    params = params.set('sortDirection', searchRequest.sortDirection || 'asc');
    params = params.set('page', (searchRequest.page || 0).toString());
    params = params.set('size', (searchRequest.size || 20).toString());

    return this.http.get<ProductSearchResponse>(`${this.API_URL}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  getProductsByCategory(categoryId: number, page: number = 0, size: number = 20, sortBy: string = 'name', sortDirection: string = 'asc'): Observable<ProductSearchResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<ProductSearchResponse>(`${this.API_URL}/category/${categoryId}`, { params })
      .pipe(catchError(this.handleError));
  }

  getProductsByCategoryHierarchy(categoryId: number, page: number = 0, size: number = 20, sortBy: string = 'name', sortDirection: string = 'asc'): Observable<ProductSearchResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<ProductSearchResponse>(`${this.API_URL}/category/${categoryId}/hierarchy`, { params })
      .pipe(catchError(this.handleError));
  }

  getFeaturedProducts(page: number = 0, size: number = 20): Observable<ProductSearchResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProductSearchResponse>(`${this.API_URL}/featured`, { params })
      .pipe(catchError(this.handleError));
  }

  // Category operations
  getAllCategories(): Observable<Category[]> {
    // Return mock data for development
    return new Observable(observer => {
      const categories = this.categoriesSubject.value;
      observer.next(categories);
      observer.complete();
    });
  }

  getRootCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.CATEGORY_API_URL}/root`)
      .pipe(catchError(this.handleError));
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.CATEGORY_API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getSubcategories(parentId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.CATEGORY_API_URL}/${parentId}/subcategories`)
      .pipe(catchError(this.handleError));
  }

  getCategoryHierarchy(categoryId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.CATEGORY_API_URL}/${categoryId}/hierarchy`)
      .pipe(catchError(this.handleError));
  }

  getCategoriesWithProducts(): Observable<Category[]> {
    // Return mock data for development
    return new Observable(observer => {
      const categories = this.categoriesSubject.value;
      observer.next(categories);
      observer.complete();
    });
  }

  searchCategories(name: string): Observable<Category[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Category[]>(`${this.CATEGORY_API_URL}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  // Filter data operations
  getAvailableBrands(): Observable<string[]> {
    // Return mock data for development
    return new Observable(observer => {
      const brands = this.brandsSubject.value;
      observer.next(brands);
      observer.complete();
    });
  }

  getPriceRange(): Observable<PriceRange> {
    // Return mock data for development
    return new Observable(observer => {
      const priceRange = this.priceRangeSubject.value || { minPrice: 10, maxPrice: 2000 };
      observer.next(priceRange);
      observer.complete();
    });
  }

  getProductCountByCategory(categoryId: number): Observable<{ count: number }> {
    // Return mock data for development
    return new Observable(observer => {
      setTimeout(() => {
        const mockProducts = this.generateMockProducts();
        const count = mockProducts.filter(p => p.category.id === categoryId).length;
        observer.next({ count });
        observer.complete();
      }, 100);
    });
  }

  // Cache management
  private loadFiltersData(): void {
    this.getAllCategories().subscribe();
    this.getAvailableBrands().subscribe();
    this.getPriceRange().subscribe();
  }

  refreshFiltersData(): void {
    this.loadFiltersData();
  }

  // Utility methods
  getCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  getBrands(): string[] {
    return this.brandsSubject.value;
  }

  getCurrentPriceRange(): PriceRange | null {
    return this.priceRangeSubject.value;
  }

  // Search suggestions and autocomplete
  getSearchSuggestions(searchTerm?: string): Observable<SearchSuggestionResponse> {
    const params = searchTerm ? new HttpParams().set('q', searchTerm) : new HttpParams();
    return this.http.get<SearchSuggestionResponse>(`${this.API_URL}/search/suggestions`, { params })
      .pipe(catchError(this.handleError));
  }

  getPopularSearchTerms(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/search/popular`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Authentication required.';
          break;
        case 403:
          errorMessage = 'Access denied.';
          break;
        case 404:
          errorMessage = 'Product not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}