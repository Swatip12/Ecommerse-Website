package com.ecommerce.product.dto;

import java.util.List;

public class SearchSuggestionResponse {
    private List<String> productSuggestions;
    private List<String> brandSuggestions;
    private List<String> categorySuggestions;
    private List<String> popularSearches;
    
    public SearchSuggestionResponse() {}
    
    public SearchSuggestionResponse(List<String> productSuggestions, 
                                   List<String> brandSuggestions, 
                                   List<String> categorySuggestions,
                                   List<String> popularSearches) {
        this.productSuggestions = productSuggestions;
        this.brandSuggestions = brandSuggestions;
        this.categorySuggestions = categorySuggestions;
        this.popularSearches = popularSearches;
    }
    
    public List<String> getProductSuggestions() {
        return productSuggestions;
    }
    
    public void setProductSuggestions(List<String> productSuggestions) {
        this.productSuggestions = productSuggestions;
    }
    
    public List<String> getBrandSuggestions() {
        return brandSuggestions;
    }
    
    public void setBrandSuggestions(List<String> brandSuggestions) {
        this.brandSuggestions = brandSuggestions;
    }
    
    public List<String> getCategorySuggestions() {
        return categorySuggestions;
    }
    
    public void setCategorySuggestions(List<String> categorySuggestions) {
        this.categorySuggestions = categorySuggestions;
    }
    
    public List<String> getPopularSearches() {
        return popularSearches;
    }
    
    public void setPopularSearches(List<String> popularSearches) {
        this.popularSearches = popularSearches;
    }
}