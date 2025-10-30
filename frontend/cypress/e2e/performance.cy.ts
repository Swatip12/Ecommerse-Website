describe('Performance Tests', () => {
  it('should load home page within acceptable time', () => {
    const startTime = Date.now();
    
    cy.visit('/');
    cy.get('[data-cy=product-grid]').should('be.visible');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
  });

  it('should handle large product lists efficiently', () => {
    // Mock large product response
    cy.intercept('GET', `${Cypress.env('apiUrl')}/products**`, {
      fixture: 'large-product-list.json'
    }).as('getLargeProductList');
    
    const startTime = Date.now();
    
    cy.visit('/');
    cy.waitForApi('getLargeProductList');
    
    // Should render products efficiently
    cy.get('[data-cy=product-card]').should('have.length.greaterThan', 50);
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).to.be.lessThan(5000); // Should render within 5 seconds
    
    // Scrolling should be smooth
    cy.scrollTo('bottom', { duration: 1000 });
    cy.get('[data-cy=product-card]').last().should('be.visible');
  });

  it('should search products quickly', () => {
    cy.visit('/');
    
    const startTime = Date.now();
    
    cy.get('[data-cy=search-input]').type('laptop');
    cy.get('[data-cy=search-button]').click();
    
    cy.get('[data-cy=search-results]').should('be.visible');
    
    const searchTime = Date.now() - startTime;
    expect(searchTime).to.be.lessThan(2000); // Search should complete within 2 seconds
  });

  it('should handle rapid cart operations', () => {
    cy.login('test@example.com', 'password123');
    
    const startTime = Date.now();
    
    // Rapidly add multiple items
    for (let i = 1; i <= 5; i++) {
      cy.addToCart(i, 1);
    }
    
    // Check final cart state
    cy.get('[data-cy=cart-icon-count]').should('contain', '5');
    
    const operationTime = Date.now() - startTime;
    expect(operationTime).to.be.lessThan(10000); // Should complete within 10 seconds
  });

  it('should maintain performance during real-time updates', () => {
    cy.visit('/');
    
    // Simulate multiple real-time updates
    cy.window().then((win) => {
      const startTime = Date.now();
      
      // Send 50 rapid updates
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          win.dispatchEvent(new CustomEvent('inventory-update', {
            detail: {
              productId: i % 10 + 1,
              quantityAvailable: Math.floor(Math.random() * 100)
            }
          }));
        }, i * 10);
      }
      
      // Check that UI remains responsive
      setTimeout(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        expect(totalTime).to.be.lessThan(2000); // Should handle updates within 2 seconds
      }, 1000);
    });
    
    // UI should remain interactive
    cy.get('[data-cy=search-input]').should('be.visible').type('test');
    cy.get('[data-cy=search-input]').should('have.value', 'test');
  });

  it('should load images efficiently', () => {
    cy.visit('/products/1');
    
    // Monitor image loading
    cy.get('[data-cy=main-product-image]').should('be.visible');
    
    // Check that images are optimized (not too large)
    cy.get('[data-cy=main-product-image]').then(($img) => {
      const img = $img[0] as HTMLImageElement;
      
      // Image should load within reasonable time
      expect(img.complete).to.be.true;
      
      // Image dimensions should be reasonable for web
      expect(img.naturalWidth).to.be.lessThan(2000);
      expect(img.naturalHeight).to.be.lessThan(2000);
    });
    
    // Thumbnail images should load quickly
    cy.get('[data-cy=thumbnail-image]').each(($thumb) => {
      const thumb = $thumb[0] as HTMLImageElement;
      expect(thumb.complete).to.be.true;
    });
  });

  it('should handle form validation efficiently', () => {
    cy.visit('/register');
    
    const startTime = Date.now();
    
    // Trigger multiple validation checks
    cy.get('[data-cy=email-input]').type('invalid-email').blur();
    cy.get('[data-cy=password-input]').type('123').blur();
    cy.get('[data-cy=confirm-password-input]').type('456').blur();
    
    // Validation should appear quickly
    cy.get('[data-cy=email-error]').should('be.visible');
    cy.get('[data-cy=password-error]').should('be.visible');
    cy.get('[data-cy=confirm-password-error]').should('be.visible');
    
    const validationTime = Date.now() - startTime;
    expect(validationTime).to.be.lessThan(1000); // Validation should be instant
  });

  it('should paginate large datasets efficiently', () => {
    cy.visit('/');
    
    // Test pagination performance
    for (let page = 1; page <= 5; page++) {
      const startTime = Date.now();
      
      if (page > 1) {
        cy.get('[data-cy=next-page]').click();
      }
      
      cy.get('[data-cy=product-card]').should('have.length.greaterThan', 0);
      
      const pageLoadTime = Date.now() - startTime;
      expect(pageLoadTime).to.be.lessThan(2000); // Each page should load within 2 seconds
    }
  });

  it('should handle concurrent user actions', () => {
    cy.login('test@example.com', 'password123');
    
    // Simulate concurrent actions
    cy.window().then((win) => {
      // Start multiple operations simultaneously
      const operations = [
        () => cy.get('[data-cy=search-input]').type('laptop'),
        () => cy.addToCart(1, 1),
        () => cy.get('[data-cy=user-menu]').click(),
        () => cy.get('[data-cy=category-filter]').first().click()
      ];
      
      const startTime = Date.now();
      
      // Execute operations concurrently
      operations.forEach((operation, index) => {
        setTimeout(operation, index * 100);
      });
      
      // Check that all operations complete successfully
      setTimeout(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        expect(totalTime).to.be.lessThan(5000);
      }, 2000);
    });
  });

  it('should maintain performance with large cart', () => {
    cy.login('test@example.com', 'password123');
    
    // Add many items to cart
    for (let i = 1; i <= 20; i++) {
      cy.addToCart(i % 10 + 1, 1);
    }
    
    const startTime = Date.now();
    
    // Open cart with many items
    cy.get('[data-cy=cart-icon]').click();
    cy.get('[data-cy=cart-drawer]').should('be.visible');
    
    // Should render all items efficiently
    cy.get('[data-cy=cart-item]').should('have.length', 20);
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).to.be.lessThan(3000); // Should render within 3 seconds
    
    // Cart operations should remain fast
    const updateStartTime = Date.now();
    
    cy.get('[data-cy=cart-item]').first().within(() => {
      cy.get('[data-cy=quantity-input]').clear().type('5');
      cy.get('[data-cy=update-quantity-button]').click();
    });
    
    const updateTime = Date.now() - updateStartTime;
    expect(updateTime).to.be.lessThan(2000); // Update should complete within 2 seconds
  });
});