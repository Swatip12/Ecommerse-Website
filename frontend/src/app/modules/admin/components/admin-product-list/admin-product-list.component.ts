import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';

import { Product, Category, ProductSearchRequest } from '../../../product/models/product.models';
import { ProductService } from '../../../product/services/product.service';
import { AdminProductService } from '../../services/admin-product.service';
import { ProductFormComponent } from '../product-form/product-form.component';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatChipsModule
  ],
  templateUrl: './admin-product-list.component.html',
  styleUrls: ['./admin-product-list.component.scss']
})
export class AdminProductListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'select',
    'image',
    'sku',
    'name',
    'category',
    'brand',
    'price',
    'inventory',
    'status',
    'actions'
  ];

  dataSource = new MatTableDataSource<Product>();
  selection = new SelectionModel<Product>(true, []);
  
  categories: Category[] = [];
  brands: string[] = [];
  
  // Filters
  searchTerm = '';
  selectedCategory: number | null = null;
  selectedBrand: string | null = null;
  selectedStatus: boolean | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  
  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;
  
  loading = false;

  constructor(
    private productService: ProductService,
    private adminProductService: AdminProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    this.paginator.page.subscribe(() => {
      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.loadProducts();
    });
    
    this.sort.sortChange.subscribe(() => {
      this.pageIndex = 0;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    
    const searchRequest: ProductSearchRequest = {
      searchTerm: this.searchTerm || undefined,
      categoryIds: this.selectedCategory ? [this.selectedCategory] : undefined,
      brands: this.selectedBrand ? [this.selectedBrand] : undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      page: this.pageIndex,
      size: this.pageSize,
      sortBy: this.sort.active || 'name',
      sortDirection: this.sort.direction || 'asc'
    };

    this.adminProductService.searchAllProducts(searchRequest).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadBrands(): void {
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
      }
    });
  }

  applyFilter(): void {
    this.pageIndex = 0;
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.selectedBrand = null;
    this.selectedStatus = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.applyFilter();
  }

  // Selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // CRUD operations
  createProduct(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
        this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '800px',
      data: { mode: 'edit', product: product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
        this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.adminProductService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Bulk operations
  bulkDelete(): void {
    const selectedProducts = this.selection.selected;
    if (selectedProducts.length === 0) {
      this.snackBar.open('Please select products to delete', 'Close', { duration: 3000 });
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      const productIds = selectedProducts.map(p => p.id);
      
      this.adminProductService.bulkDeleteProducts(productIds).subscribe({
        next: (response) => {
          this.loadProducts();
          this.selection.clear();
          this.snackBar.open(`${response.deletedCount} products deleted successfully`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting products:', error);
          this.snackBar.open('Error deleting products', 'Close', { duration: 3000 });
        }
      });
    }
  }

  bulkActivate(): void {
    this.bulkUpdateStatus(true);
  }

  bulkDeactivate(): void {
    this.bulkUpdateStatus(false);
  }

  private bulkUpdateStatus(isActive: boolean): void {
    const selectedProducts = this.selection.selected;
    if (selectedProducts.length === 0) {
      this.snackBar.open('Please select products to update', 'Close', { duration: 3000 });
      return;
    }

    const productIds = selectedProducts.map(p => p.id);
    const action = isActive ? 'activate' : 'deactivate';
    
    this.adminProductService.bulkUpdateProductStatus(productIds, isActive).subscribe({
      next: (response) => {
        this.loadProducts();
        this.selection.clear();
        this.snackBar.open(`${response.updatedCount} products ${action}d successfully`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error(`Error ${action}ing products:`, error);
        this.snackBar.open(`Error ${action}ing products`, 'Close', { duration: 3000 });
      }
    });
  }

  exportToCSV(): void {
    const categoryIds = this.selectedCategory ? [this.selectedCategory] : undefined;
    const isActive = this.selectedStatus;
    
    this.adminProductService.exportProductsToCSV(categoryIds, isActive).subscribe({
      next: (csvData) => {
        this.downloadCSV(csvData, 'products.csv');
        this.snackBar.open('Products exported successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error exporting products:', error);
        this.snackBar.open('Error exporting products', 'Close', { duration: 3000 });
      }
    });
  }

  private downloadCSV(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  getInventoryStatus(product: Product): string {
    if (!product.inventory) return 'Unknown';
    
    const available = product.inventory.quantityAvailable;
    if (available === 0) return 'Out of Stock';
    if (product.inventory.isLowStock) return 'Low Stock';
    return 'In Stock';
  }

  getInventoryClass(product: Product): string {
    if (!product.inventory) return 'inventory-unknown';
    
    const available = product.inventory.quantityAvailable;
    if (available === 0) return 'inventory-out';
    if (product.inventory.isLowStock) return 'inventory-low';
    return 'inventory-good';
  }

  getPrimaryImageUrl(product: Product): string {
    const primaryImage = product.images?.find(img => img.isPrimary);
    return primaryImage?.imageUrl || '/assets/images/no-image.png';
  }
}