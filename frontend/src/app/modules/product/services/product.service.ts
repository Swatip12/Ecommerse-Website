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
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<ProductSearchResponse>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  searchProducts(searchRequest: ProductSearchRequest): Observable<ProductSearchResponse> {
    return this.http.post<ProductSearchResponse>(`${this.API_URL}/search`, searchRequest)
      .pipe(catchError(this.handleError));
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
    return this.http.get<Category[]>(this.CATEGORY_API_URL)
      .pipe(
        tap(categories => this.categoriesSubject.next(categories)),
        catchError(this.handleError)
      );
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
    return this.http.get<Category[]>(`${this.CATEGORY_API_URL}/with-products`)
      .pipe(catchError(this.handleError));
  }

  searchCategories(name: string): Observable<Category[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Category[]>(`${this.CATEGORY_API_URL}/search`, { params })
      .pipe(catchError(this.handleError));
  }

  // Filter data operations
  getAvailableBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/brands`)
      .pipe(
        tap(brands => this.brandsSubject.next(brands)),
        catchError(this.handleError)
      );
  }

  getPriceRange(): Observable<PriceRange> {
    return this.http.get<PriceRange>(`${this.API_URL}/price-range`)
      .pipe(
        tap(priceRange => this.priceRangeSubject.next(priceRange)),
        catchError(this.handleError)
      );
  }

  getProductCountByCategory(categoryId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.API_URL}/category/${categoryId}/count`)
      .pipe(catchError(this.handleError));
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