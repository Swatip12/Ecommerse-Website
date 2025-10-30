import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { ProductImage } from '../../../product/models/product.models';
import { AdminProductService } from '../../services/admin-product.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatChipsModule,
    DragDropModule
  ],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  @Input() productId!: number;
  @Input() initialImages: ProductImage[] = [];
  @Output() imagesUpdated = new EventEmitter<ProductImage[]>();

  images: ProductImage[] = [];
  uploading = false;
  uploadProgress = 0;

  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  constructor(
    private adminProductService: AdminProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.images = [...this.initialImages];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.uploadFiles(files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      this.uploadFiles(files);
    }
  }

  private uploadFiles(files: File[]): void {
    // Validate files
    const validFiles = files.filter(file => this.validateFile(file));
    
    if (validFiles.length === 0) {
      return;
    }

    if (validFiles.length === 1) {
      this.uploadSingleFile(validFiles[0]);
    } else {
      this.uploadMultipleFiles(validFiles);
    }
  }

  private validateFile(file: File): boolean {
    if (!this.allowedTypes.includes(file.type)) {
      this.snackBar.open(
        `File type ${file.type} is not allowed. Allowed types: ${this.allowedTypes.join(', ')}`,
        'Close',
        { duration: 5000 }
      );
      return false;
    }

    if (file.size > this.maxFileSize) {
      this.snackBar.open(
        `File ${file.name} is too large. Maximum size is 5MB.`,
        'Close',
        { duration: 5000 }
      );
      return false;
    }

    return true;
  }

  private uploadSingleFile(file: File): void {
    this.uploading = true;
    this.uploadProgress = 0;

    const isPrimary = this.images.length === 0; // First image is primary
    const displayOrder = this.images.length;

    this.adminProductService.uploadProductImage(
      this.productId,
      file,
      undefined,
      displayOrder,
      isPrimary
    ).subscribe({
      next: (image) => {
        this.images.push(image);
        this.imagesUpdated.emit([...this.images]);
        this.uploading = false;
        this.snackBar.open('Image uploaded successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.uploading = false;
        
        let errorMessage = 'Error uploading image';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  private uploadMultipleFiles(files: File[]): void {
    this.uploading = true;
    this.uploadProgress = 0;

    this.adminProductService.uploadMultipleProductImages(this.productId, files).subscribe({
      next: (images) => {
        this.images.push(...images);
        this.imagesUpdated.emit([...this.images]);
        this.uploading = false;
        this.snackBar.open(`${images.length} images uploaded successfully`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error uploading images:', error);
        this.uploading = false;
        
        let errorMessage = 'Error uploading images';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  deleteImage(image: ProductImage): void {
    if (confirm('Are you sure you want to delete this image?')) {
      this.adminProductService.deleteProductImage(image.id).subscribe({
        next: () => {
          this.images = this.images.filter(img => img.id !== image.id);
          this.imagesUpdated.emit([...this.images]);
          this.snackBar.open('Image deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          this.snackBar.open('Error deleting image', 'Close', { duration: 3000 });
        }
      });
    }
  }

  setPrimaryImage(image: ProductImage): void {
    this.adminProductService.setPrimaryImage(image.id).subscribe({
      next: (updatedImage) => {
        // Update all images to not be primary
        this.images.forEach(img => img.isPrimary = false);
        
        // Set the selected image as primary
        const imageIndex = this.images.findIndex(img => img.id === image.id);
        if (imageIndex !== -1) {
          this.images[imageIndex] = updatedImage;
        }
        
        this.imagesUpdated.emit([...this.images]);
        this.snackBar.open('Primary image updated', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error setting primary image:', error);
        this.snackBar.open('Error setting primary image', 'Close', { duration: 3000 });
      }
    });
  }

  onImageOrderChanged(event: CdkDragDrop<ProductImage[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.images, event.previousIndex, event.currentIndex);
      
      // Update display order for all images
      this.images.forEach((image, index) => {
        if (image.displayOrder !== index) {
          this.adminProductService.updateProductImage(image.id, undefined, index).subscribe({
            next: (updatedImage) => {
              this.images[index] = updatedImage;
            },
            error: (error) => {
              console.error('Error updating image order:', error);
            }
          });
        }
      });
      
      this.imagesUpdated.emit([...this.images]);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.click();
  }

  getPrimaryImage(): ProductImage | undefined {
    return this.images.find(img => img.isPrimary);
  }

  getSecondaryImages(): ProductImage[] {
    return this.images.filter(img => !img.isPrimary);
  }

  trackByImageId(index: number, image: ProductImage): number {
    return image.id;
  }
}