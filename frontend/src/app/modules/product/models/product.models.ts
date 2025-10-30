export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  category: Category;
  brand?: string;
  weight?: number;
  dimensions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  inventory?: ProductInventory;
  images: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ProductInventory {
  productId: number;
  quantityAvailable: number;
  quantityReserved: number;
  reorderLevel: number;
  lastUpdated: string;
  isInStock: boolean;
  isLowStock: boolean;
}

export interface ProductSearchRequest {
  searchTerm?: string;
  categoryIds?: number[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}

export interface ProductSearchResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

export interface ProductFilters {
  categories: Category[];
  brands: string[];
  priceRange: PriceRange;
}

export interface ProductRequest {
  sku: string;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  brand?: string;
  weight?: number;
  dimensions?: string;
  isActive?: boolean;
}

export enum ProductSortBy {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export interface SearchSuggestionResponse {
  productSuggestions: string[];
  brandSuggestions: string[];
  categorySuggestions: string[];
  popularSearches: string[];
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'brand' | 'category' | 'popular';
  icon?: string;
}