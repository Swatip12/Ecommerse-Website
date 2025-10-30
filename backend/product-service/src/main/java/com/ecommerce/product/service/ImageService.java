package com.ecommerce.product.service;

import com.ecommerce.product.dto.ProductImageResponse;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductImage;
import com.ecommerce.product.repository.ProductImageRepository;
import com.ecommerce.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ImageService {
    
    @Autowired
    private ProductImageRepository productImageRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;
    
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "gif", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    
    public ProductImageResponse uploadProductImage(Long productId, MultipartFile file, String altText, Integer displayOrder, Boolean isPrimary) {
        // Validate product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        
        // Validate file
        validateImageFile(file);
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + "." + extension;
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, "products");
            Files.createDirectories(uploadPath);
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // If this is set as primary, unset other primary images
            if (isPrimary) {
                productImageRepository.unsetPrimaryForProduct(productId);
            }
            
            // Create ProductImage entity
            ProductImage productImage = new ProductImage();
            productImage.setProduct(product);
            productImage.setImageUrl(baseUrl + "/uploads/products/" + filename);
            productImage.setAltText(altText != null ? altText : product.getName());
            productImage.setDisplayOrder(displayOrder != null ? displayOrder : 0);
            productImage.setIsPrimary(isPrimary != null ? isPrimary : false);
            productImage.setCreatedAt(LocalDateTime.now());
            
            productImage = productImageRepository.save(productImage);
            
            return new ProductImageResponse(productImage);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }
    
    public List<ProductImageResponse> uploadMultipleProductImages(Long productId, MultipartFile[] files) {
        List<ProductImageResponse> uploadedImages = new ArrayList<>();
        
        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            boolean isPrimary = i == 0; // First image is primary by default
            ProductImageResponse image = uploadProductImage(productId, file, null, i, isPrimary);
            uploadedImages.add(image);
        }
        
        return uploadedImages;
    }
    
    public void deleteProductImage(Long imageId) {
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product image not found with id: " + imageId));
        
        // Delete physical file
        try {
            String imageUrl = productImage.getImageUrl();
            String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, "products", filename);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but don't fail the operation
            System.err.println("Failed to delete physical file: " + e.getMessage());
        }
        
        productImageRepository.delete(productImage);
    }
    
    public ProductImageResponse setPrimaryImage(Long imageId) {
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product image not found with id: " + imageId));
        
        // Unset primary for all images of this product
        productImageRepository.unsetPrimaryForProduct(productImage.getProduct().getId());
        
        // Set this image as primary
        productImage.setIsPrimary(true);
        productImage = productImageRepository.save(productImage);
        
        return new ProductImageResponse(productImage);
    }
    
    public ProductImageResponse updateProductImage(Long imageId, String altText, Integer displayOrder) {
        ProductImage productImage = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product image not found with id: " + imageId));
        
        if (altText != null) {
            productImage.setAltText(altText);
        }
        
        if (displayOrder != null) {
            productImage.setDisplayOrder(displayOrder);
        }
        
        productImage = productImageRepository.save(productImage);
        
        return new ProductImageResponse(productImage);
    }
    
    public List<ProductImageResponse> getProductImages(Long productId) {
        List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        return images.stream()
                .map(ProductImageResponse::new)
                .collect(Collectors.toList());
    }
    
    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum allowed size of 5MB");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Invalid file name");
        }
        
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("File type not allowed. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new RuntimeException("Invalid file name");
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}