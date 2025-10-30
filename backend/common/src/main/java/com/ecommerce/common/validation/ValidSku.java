package com.ecommerce.common.validation;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = SkuValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidSku {
    String message() default "SKU must be 3-20 characters long and contain only uppercase letters, numbers, and hyphens";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}