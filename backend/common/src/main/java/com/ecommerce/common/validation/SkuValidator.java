package com.ecommerce.common.validation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class SkuValidator implements ConstraintValidator<ValidSku, String> {
    
    private static final Pattern SKU_PATTERN = Pattern.compile(
        "^[A-Z0-9-]{3,20}$"
    );
    
    @Override
    public void initialize(ValidSku constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(String sku, ConstraintValidatorContext context) {
        if (sku == null || sku.trim().isEmpty()) {
            return false;
        }
        return SKU_PATTERN.matcher(sku.trim().toUpperCase()).matches();
    }
}