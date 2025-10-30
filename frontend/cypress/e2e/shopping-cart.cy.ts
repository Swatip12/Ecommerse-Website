describe('Shopping Cart', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.intercept('GET', `${Cypress.env('apiUrl')}/cart/summary`).as('getCartSummary');
    cy.intercept('POST', `${Cypress.env('apiUrl')}/cart/add`).as('addToCart');
    cy.intercept('PUT', `${Cypress.env('apiUrl')}/cart/update`).as('updateCart');
    cy.intercept('DELETE', `${Cypress.env('apiUrl')}/cart/remove/*`).as('removeFromCart');
  });

  it('should add product to cart from product page', () => {
    cy.goToProduct(1);
    
    // Add product to cart
    cy.get('[data-cy=quantity-input]').clear().type('2');
    cy.get('[data-cy=add-to-cart-button]').click();
    
    cy.waitForApi('addToCart');
    
    // Should show success message
    cy.get('[data-cy=success-message]').should('contain', 'Added to cart');
    
    // Cart icon should update
    cy.get('[data-cy=cart-icon-count]').should('contain', '2');
  });

  it('should add product to cart from product listing', () => {
    cy.visit('/');
    cy.wait('@getProducts');
    
    // Add first product to cart
    cy.get('[data-cy=product-card]').first().within(() => {
      cy.get('[data-cy=add-to-cart-button]').click();
    });
    
    cy.waitForApi('addToCart');
    
    // Cart icon should update
    cy.get('[data-cy=cart-icon-count]').should('contain', '1');
  });

  it('should view cart contents', () => {
    // Add product to cart first
    cy.addToCart(1, 2);
    
    // Open cart
    cy.get('[data-cy=cart-icon]').click();
    
    cy.waitForApi('getCartSummary');
    
    // Should show cart contents
    cy.get('[data-cy=cart-drawer]').should('be.visible');
    cy.get('[data-cy=cart-item]').should('have.length', 1);
    
    // Cart item should show product details
    cy.get('[data-cy=cart-item]').first().within(() => {
      cy.get('[data-cy=product-name]').should('be.visible');
      cy.get('[data-cy=product-price]').should('be.visible');
      cy.get('[data-cy=quantity-display]').should('contain', '2');
      cy.get('[data-cy=item-total]').should('be.visible');
    });
    
    // Should show cart totals
    cy.get('[data-cy=cart-subtotal]').should('be.visible');
    cy.get('[data-cy=cart-total]').should('be.visible');
  });

  it('should update item quantity in cart', () => {
    cy.addToCart(1, 2);
    
    // Open cart
    cy.get('[data-cy=cart-icon]').click();
    cy.waitForApi('getCartSummary');
    
    // Update quantity
    cy.get('[data-cy=cart-item]').first().within(() => {
      cy.get('[data-cy=quantity-input]').clear().type('3');
      cy.get('[data-cy=update-quantity-button]').click();
    });
    
    cy.waitForApi('updateCart');
    
    // Quantity should be updated
    cy.get('[data-cy=cart-item]').first().within(() => {
      cy.get('[data-cy=quantity-display]').should('contain', '3');
    });
    
    // Cart icon should update
    cy.get('[data-cy=cart-icon-count]').should('contain', '3');
    
    // Totals should recalculate
    cy.get('[data-cy=cart-total]').should('be.visible');
  });

  it('should remove item from cart', () => {
    cy.addToCart(1, 2);
    
    // Open cart
    cy.get('[data-cy=cart-icon]').click();
    cy.waitForApi('getCartSummary');
    
    // Remove item
    cy.get('[data-cy=cart-item]').first().within(() => {
      cy.get('[data-cy=remove-item-button]').click();
    });
    
    // Confirm removal
    cy.get('[data-cy=confirm-remove-button]').click();
    
    cy.waitForApi('removeFromCart');
    
    // Cart should be empty
    cy.get('[data-cy=cart-empty-message]').should('be.visible');
    cy.get('[data-cy=cart-icon-count]').should('not.exist');
  });

  it('should clear entire cart', () => {
    // Add multiple products
    cy.addToCart(1, 2);
    cy.addToCart(2, 1);
    
    // Open cart
    cy.get('[data-cy=cart-icon]').click();
    cy.waitForApi('getCartSummary');
    
    // Clear cart
    cy.get('[data-cy=clear-cart-button]').click();
    cy.get('[data-cy=confirm-clear-cart]').click();
    
    cy.wait('@clearCart');
    
    // Cart should be empty
    cy.get('[data-cy=cart-empty-message]').should('be.visible');
    cy.get('[data-cy=cart-icon-count]').should('not.exist');
  });

  it('should persist cart for logged in users', () => {
    cy.login('test@example.com', 'password123');
    
    // Add product to cart
    cy.addToCart(1, 2);
    
    // Refresh page
    cy.reload();
    
    // Cart should still contain items
    cy.get('[data-cy=cart-icon-count]').should('contain', '2');
    
    // Open cart to verify contents
    cy.get('[data-cy=cart-icon]').click();
    cy.waitForApi('getCartSummary');
    
    cy.get('[data-cy=cart-item]').should('have.length', 1);
  });

  it('should handle guest cart', () => {
    // Add product without logging in
    cy.addToCart(1, 1);
    
    // Cart should work for guest users
    cy.get('[data-cy=cart-icon-count]').should('contain', '1');
    
    // Open cart
    cy.get('[data-cy=cart-icon]').click();
    cy.waitForApi('getCartSummary');
    
    cy.get('[data-cy=cart-item]').should('have.length', 1);
    
    // Should show login prompt for checkout
    cy.get('[data-cy=checkout-button]').click();
    cy.get('[data-cy=login-required-message]').should('be.visible');
  });

  it('should transfer guest cart on login', () => {
    // Add product as guest
    cy.addToCart(1, 2);
    
    // Login
    cy.login('test@example.com', 'password123');
    
    // Cart should be transferred
    cy.get('[data-cy=cart-icon-count]').should('contain', '2');
    
    // Verify cart contents
    cy.get('[data-cy=cart-icon]').click();
    cy.waitForApi('getCartSummary');
    
    cy.get('[data-cy=cart-item]').should('have.length', 1);
  });

  it('should validate inventory before adding to cart', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/cart/add`, {
      statusCode: 400,
      body: { message: 'Insufficient inventory' }
    }).as('addToCartFailed');
    
    cy.goToProduct(1);
    
    // Try to add more than available
    cy.get('[data-cy=quantity-input]').clear().type('999');
    cy.get('[data-cy=add-to-cart-button]').click();
    
    cy.waitForApi('addToCartFailed');
    
    // Should show error message
    cy.get('[data-cy=error-message]').should('contain', 'Insufficient inventory');
    
    // Cart should not be updated
    cy.get('[data-cy=cart-icon-count]').should('not.exist');
  });

  it('should show cart totals correctly', () => {
    cy.addToCart(1, 2); // Assume product costs $50, total $100
    
    cy.get('[data-cy=cart-icon]').click();
    cy.waitForApi('getCartSummary');
    
    // Verify calculations
    cy.get('[data-cy=cart-subtotal]').should('be.visible');
    cy.get('[data-cy=cart-tax]').should('be.visible');
    cy.get('[data-cy=cart-shipping]').should('be.visible');
    cy.get('[data-cy=cart-total]').should('be.visible');
    
    // Total should be sum of subtotal + tax + shipping
    cy.get('[data-cy=cart-subtotal]').invoke('text').then((subtotalText) => {
      cy.get('[data-cy=cart-tax]').invoke('text').then((taxText) => {
        cy.get('[data-cy=cart-shipping]').invoke('text').then((shippingText) => {
          cy.get('[data-cy=cart-total]').invoke('text').then((totalText) => {
            const subtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
            const tax = parseFloat(taxText.replace(/[^0-9.]/g, ''));
            const shipping = parseFloat(shippingText.replace(/[^0-9.]/g, ''));
            const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));
            
            expect(total).to.equal(subtotal + tax + shipping);
          });
        });
      });
    });
  });

  it('should proceed to checkout from cart', () => {
    cy.login('test@example.com', 'password123');
    cy.addToCart(1, 2);
    
    // Open cart and proceed to checkout
    cy.get('[data-cy=cart-icon]').click();
    cy.waitForApi('getCartSummary');
    
    cy.get('[data-cy=checkout-button]').click();
    
    // Should navigate to checkout page
    cy.url().should('include', '/checkout');
    
    // Should show order summary
    cy.get('[data-cy=order-summary]').should('be.visible');
    cy.get('[data-cy=checkout-items]').should('have.length', 1);
  });
});