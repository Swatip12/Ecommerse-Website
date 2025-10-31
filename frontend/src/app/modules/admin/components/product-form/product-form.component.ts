import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

import { Product, Category, ProductRequest, ProductImage } from '../../../product/models/product.models';
import { ProductService } from '../../../product/services/product.service';
import { AdminProductService } from '../../services/admin-product.service';
import { ImageUploadComponent } from '../image-upload/image-upload.component';

export interface ProductFormData {
  mode: 'create' | 'edit';
  product?: Product;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    ImageUploadComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  loading = false;
  isEditMode = false;
  productImages: ProductImage[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private adminProductService: AdminProductService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ProductFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductFormData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    
    if (this.isEditMode && this.data.product) {
      this.populateForm(this.data.product);
      this.productImages = this.data.product.images || [];
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(100)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      price: ['', [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      brand: ['', Validators.maxLength(100)],
      weight: ['', Validators.min(0)],
      dimensions: ['', Validators.maxLength(100)],
      isActive: [true]
    });
  }

  private populateForm(product: Product): void {
    this.productForm.patchValue({
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.category?.id,
      brand: product.brand,
      weight: product.weight,
      dimensions: product.dimensions,
      isActive: product.isActive
    });
  }

  private loadCategories(): void {
    this.productService.getCategoriesWithProducts().subscribe({
      next: (categories: any) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Error loading categories', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.loading = true;
      
      const formValue = this.productForm.value;
      const productRequest: ProductRequest = {
        sku: formValue.sku,
        name: formValue.name,
        description: formValue.description || undefined,
        price: parseFloat(formValue.price),
        categoryId: formValue.categoryId,
        brand: formValue.brand || undefined,
        weight: formValue.weight ? parseFloat(formValue.weight) : undefined,
        dimensions: formValue.dimensions || undefined,
        isActive: formValue.isActive
      };

      const operation = this.isEditMode 
        ? this.adminProductService.updateProduct(this.data.product!.id, productRequest)
        : this.adminProductService.createProduct(productRequest);

      operation.subscribe({
        next: (product) => {
          this.loading = false;
          this.dialogRef.close(product);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error saving product:', error);
          
          let errorMessage = 'Error saving product';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onImagesUpdated(images: ProductImage[]): void {
    this.productImages = images;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  // Form validation helpers
  getFieldError(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} is too long`;
      }
      if (control.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be greater than ${control.errors['min'].min}`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      sku: 'SKU',
      name: 'Product Name',
      description: 'Description',
      price: 'Price',
      categoryId: 'Category',
      brand: 'Brand',
      weight: 'Weight',
      dimensions: 'Dimensions'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control?.invalid && control.touched);
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Product' : 'Create Product';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Product' : 'Create Product';
  }
}