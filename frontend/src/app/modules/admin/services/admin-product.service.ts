import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  Product, 
  ProductRequest, 
  ProductSearchRequest, 
  ProductSearchResponse,
  ProductImage 
} from '../../product/models/product.models';

export interface BulkOperationResponse {
  deletedCount?: number;
  updatedCount?: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private readonly imageApiUrl = `${environment.apiUrl}/images`;

  constructor(private http: HttpClient) {}

  // Product CRUD operations
  createProduct(productRequest: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productRequest);
  }

  updateProduct(id: number, productRequest: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, productRequest);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Search products (including inactive ones for admin)
  searchAllProducts(searchRequest: ProductSearchRequest): Observable<ProductSearchResponse> {
    return this.http.post<ProductSearchResponse>(`${this.apiUrl}/admin/search`, searchRequest);
  }

  // Bulk operations
  bulkDeleteProducts(productIds: number[]): Observable<BulkOperationResponse> {
    return this.http.delete<BulkOperationResponse>(`${this.apiUrl}/bulk`, {
      body: productIds
    });
  }

  bulkUpdateProductStatus(productIds: number[], isActive: boolean): Observable<BulkOperationResponse> {
    const request = {
      productIds: productIds,
      isActive: isActive
    };
    return this.http.put<BulkOperationResponse>(`${this.apiUrl}/bulk/status`, request);
  }

  // Export operations
  exportProductsToCSV(categoryIds?: number[], isActive?: boolean): Observable<string> {
    let params = new HttpParams();
    
    if (categoryIds && categoryIds.length > 0) {
      categoryIds.forEach(id => {
        params = params.append('categoryIds', id.toString());
      });
    }
    
    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get(`${this.apiUrl}/export/csv`, {
      params: params,
      responseType: 'text'
    });
  }

  // Image management operations
  uploadProductImage(
    productId: number, 
    file: File, 
    altText?: string, 
    displayOrder?: number, 
    isPrimary?: boolean
  ): Observable<ProductImage> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (altText) {
      formData.append('altText', altText);
    }
    
    if (displayOrder !== undefined) {
      formData.append('displayOrder', displayOrder.toString());
    }
    
    if (isPrimary !== undefined) {
      formData.append('isPrimary', isPrimary.toString());
    }

    return this.http.post<ProductImage>(`${this.imageApiUrl}/upload/${productId}`, formData);
  }

  uploadMultipleProductImages(productId: number, files: File[]): Observable<ProductImage[]> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<ProductImage[]>(`${this.imageApiUrl}/upload-multiple/${productId}`, formData);
  }

  deleteProductImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.imageApiUrl}/${imageId}`);
  }

  setPrimaryImage(imageId: number): Observable<ProductImage> {
    return this.http.put<ProductImage>(`${this.imageApiUrl}/${imageId}/primary`, {});
  }

  updateProductImage(imageId: number, altText?: string, displayOrder?: number): Observable<ProductImage> {
    let params = new HttpParams();
    
    if (altText) {
      params = params.set('altText', altText);
    }
    
    if (displayOrder !== undefined) {
      params = params.set('displayOrder', displayOrder.toString());
    }

    return this.http.put<ProductImage>(`${this.imageApiUrl}/${imageId}`, {}, { params });
  }

  getProductImages(productId: number): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`${this.imageApiUrl}/product/${productId}`);
  }
}