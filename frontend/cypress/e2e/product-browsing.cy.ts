describe('Product Browsing', () => {
  beforeEach(() => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/products**`).as('getProducts');
    cy.intercept('GET', `${Cypress.env('apiUrl')}/categories**`).as('getCategories');
  });

  it('should display product catalog on home page', () => {
    cy.visit('/');
    
    cy.waitForApi('getProducts');
    
    // Should show product grid
    cy.get('[data-cy=product-grid]').should('be.visible');
    cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0);
    
    // Each product card should have essential information
    cy.get('[data-cy=product-card]').first().within(() => {
      cy.get('[data-cy=product-image]').should('be.visible');
      cy.get('[data-cy=product-name]').should('be.visible');
      cy.get('[data-cy=product-price]').should('be.visible');
      cy.get('[data-cy=add-to-cart-button]').should('be.visible');
    });
  });

  it('should search for products', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/products/search`).as('searchProducts');
    
    cy.visit('/');
    
    // Search for products
    cy.get('[data-cy=search-input]').type('laptop');
    cy.get('[data-cy=search-button]').click();
    
    cy.waitForApi('searchProducts');
    
    // Should show search results
    cy.get('[data-cy=search-results]').should('be.visible');
    cy.get('[data-cy=search-query]').should('contain', 'laptop');
    
    // Results should contain search term
    cy.get('[data-cy=product-card]').each(($card) => {
      cy.wrap($card).find('[data-cy=product-name]').invoke('text').should('match', /laptop/i);
    });
  });

  it('should filter products by category', () => {
    cy.visit('/');
    
    cy.waitForApi('getCategories');
    
    // Click on a category filter
    cy.get('[data-cy=category-filter]').first().click();
    
    cy.waitForApi('getProducts');
    
    // Should show filtered products
    cy.get('[data-cy=active-filter]').should('be.visible');
    cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0);
    
    // Should show clear filters option
    cy.get('[data-cy=clear-filters]').should('be.visible');
  });

  it('should filter products by price range', () => {
    cy.visit('/');
    
    // Set price range
    cy.get('[data-cy=min-price-input]').type('100');
    cy.get('[data-cy=max-price-input]').type('500');
    cy.get('[data-cy=apply-price-filter]').click();
    
    cy.waitForApi('getProducts');
    
    // All products should be within price range
    cy.get('[data-cy=product-card]').each(($card) => {
      cy.wrap($card).find('[data-cy=product-price]').invoke('text').then((priceText) => {
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        expect(price).to.be.at.least(100);
        expect(price).to.be.at.most(500);
      });
    });
  });

  it('should sort products', () => {
    cy.visit('/');
    
    cy.waitForApi('getProducts');
    
    // Sort by price low to high
    cy.get('[data-cy=sort-dropdown]').select('price-asc');
    
    cy.waitForApi('getProducts');
    
    // Verify sorting
    let previousPrice = 0;
    cy.get('[data-cy=product-card]').each(($card) => {
      cy.wrap($card).find('[data-cy=product-price]').invoke('text').then((priceText) => {
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        expect(price).to.be.at.least(previousPrice);
        previousPrice = price;
      });
    });
  });

  it('should view product details', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/products/*`).as('getProduct');
    
    cy.visit('/');
    cy.waitForApi('getProducts');
    
    // Click on first product
    cy.get('[data-cy=product-card]').first().click();
    
    cy.waitForApi('getProduct');
    
    // Should be on product detail page
    cy.url().should('include', '/products/');
    
    // Should show product details
    cy.get('[data-cy=product-detail]').should('be.visible');
    cy.get('[data-cy=product-name]').should('be.visible');
    cy.get('[data-cy=product-description]').should('be.visible');
    cy.get('[data-cy=product-price]').should('be.visible');
    cy.get('[data-cy=product-images]').should('be.visible');
    cy.get('[data-cy=quantity-selector]').should('be.visible');
    cy.get('[data-cy=add-to-cart-button]').should('be.visible');
  });

  it('should handle product image gallery', () => {
    cy.goToProduct(1);
    
    // Should show main image
    cy.get('[data-cy=main-product-image]').should('be.visible');
    
    // Should show thumbnail images
    cy.get('[data-cy=product-thumbnails]').should('be.visible');
    cy.get('[data-cy=thumbnail-image]').should('have.length.greaterThan', 0);
    
    // Click on thumbnail should change main image
    cy.get('[data-cy=thumbnail-image]').eq(1).click();
    cy.get('[data-cy=main-product-image]').should('have.attr', 'src').and('not.be.empty');
  });

  it('should show product availability status', () => {
    cy.goToProduct(1);
    
    // Should show stock status
    cy.get('[data-cy=stock-status]').should('be.visible');
    
    // If in stock, should show add to cart button
    cy.get('[data-cy=stock-status]').then(($status) => {
      if ($status.text().includes('In Stock')) {
        cy.get('[data-cy=add-to-cart-button]').should('be.enabled');
      } else {
        cy.get('[data-cy=add-to-cart-button]').should('be.disabled');
        cy.get('[data-cy=out-of-stock-message]').should('be.visible');
      }
    });
  });

  it('should handle pagination', () => {
    cy.visit('/');
    cy.waitForApi('getProducts');
    
    // Should show pagination if there are multiple pages
    cy.get('[data-cy=pagination]').then(($pagination) => {
      if ($pagination.is(':visible')) {
        // Click next page
        cy.get('[data-cy=next-page]').click();
        cy.waitForApi('getProducts');
        
        // Should load new products
        cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0);
        
        // Page indicator should update
        cy.get('[data-cy=current-page]').should('contain', '2');
      }
    });
  });

  it('should show loading states', () => {
    cy.visit('/');
    
    // Should show loading spinner while fetching products
    cy.get('[data-cy=loading-spinner]').should('be.visible');
    
    cy.waitForApi('getProducts');
    
    // Loading spinner should disappear
    cy.get('[data-cy=loading-spinner]').should('not.exist');
    cy.get('[data-cy=product-grid]').should('be.visible');
  });

  it('should handle empty search results', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/products/search`, {
      body: { content: [], totalElements: 0 }
    }).as('emptySearch');
    
    cy.visit('/');
    
    cy.get('[data-cy=search-input]').type('nonexistentproduct123');
    cy.get('[data-cy=search-button]').click();
    
    cy.waitForApi('emptySearch');
    
    // Should show no results message
    cy.get('[data-cy=no-results-message]').should('be.visible');
    cy.get('[data-cy=no-results-message]').should('contain', 'No products found');
    
    // Should suggest clearing filters or browsing categories
    cy.get('[data-cy=browse-categories-link]').should('be.visible');
  });
});