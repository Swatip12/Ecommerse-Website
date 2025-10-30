package com.ecommerce.product.controller;

import com.ecommerce.product.dto.ProductImageResponse;
import com.ecommerce.product.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ImageController {
    
    @Autowired
    private ImageService imageService;
    
    @PostMapping("/upload/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageResponse> uploadProductImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "isPrimary", defaultValue = "false") Boolean isPrimary) {
        try {
            ProductImageResponse image = imageService.uploadProductImage(productId, file, altText, displayOrder, isPrimary);
            return ResponseEntity.status(HttpStatus.CREATED).body(image);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/upload-multiple/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductImageResponse>> uploadMultipleProductImages(
            @PathVariable Long productId,
            @RequestParam("files") MultipartFile[] files) {
        try {
            List<ProductImageResponse> images = imageService.uploadMultipleProductImages(productId, files);
            return ResponseEntity.status(HttpStatus.CREATED).body(images);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProductImage(@PathVariable Long imageId) {
        try {
            imageService.deleteProductImage(imageId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{imageId}/primary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageResponse> setPrimaryImage(@PathVariable Long imageId) {
        try {
            ProductImageResponse image = imageService.setPrimaryImage(imageId);
            return ResponseEntity.ok(image);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageResponse> updateProductImage(
            @PathVariable Long imageId,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        try {
            ProductImageResponse image = imageService.updateProductImage(imageId, altText, displayOrder);
            return ResponseEntity.ok(image);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductImageResponse>> getProductImages(@PathVariable Long productId) {
        try {
            List<ProductImageResponse> images = imageService.getProductImages(productId);
            return ResponseEntity.ok(images);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}