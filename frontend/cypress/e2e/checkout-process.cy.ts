describe('Checkout Process', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.addToCart(1, 2);
    
    cy.intercept('POST', `${Cypress.env('apiUrl')}/orders`).as('createOrder');
    cy.intercept('GET', `${Cypress.env('apiUrl')}/users/addresses`).as('getAddresses');
    cy.intercept('POST', `${Cypress.env('apiUrl')}/payment/process`).as('processPayment');
  });

  it('should complete full checkout process', () => {
    // Go to checkout
    cy.get('[data-cy=cart-icon]').click();
    cy.get('[data-cy=checkout-button]').click();
    
    cy.url().should('include', '/checkout');
    
    // Step 1: Shipping Information
    cy.get('[data-cy=checkout-step-shipping]').should('be.visible');
    
    cy.get('[data-cy=shipping-first-name]').type('John');
    cy.get('[data-cy=shipping-last-name]').type('Doe');
    cy.get('[data-cy=shipping-address]').type('123 Main St');
    cy.get('[data-cy=shipping-city]').type('Anytown');
    cy.get('[data-cy=shipping-state]').select('CA');
    cy.get('[data-cy=shipping-zip]').type('12345');
    cy.get('[data-cy=shipping-phone]').type('555-1234');
    
    cy.get('[data-cy=continue-to-payment]').click();
    
    // Step 2: Payment Information
    cy.get('[data-cy=checkout-step-payment]').should('be.visible');
    
    cy.get('[data-cy=payment-card-number]').type('4111111111111111');
    cy.get('[data-cy=payment-expiry]').type('12/25');
    cy.get('[data-cy=payment-cvv]').type('123');
    cy.get('[data-cy=payment-name]').type('John Doe');
    
    // Billing same as shipping
    cy.get('[data-cy=billing-same-as-shipping]').check();
    
    cy.get('[data-cy=continue-to-review]').click();
    
    // Step 3: Order Review
    cy.get('[data-cy=checkout-step-review]').should('be.visible');
    
    // Verify order details
    cy.get('[data-cy=review-items]').should('be.visible');
    cy.get('[data-cy=review-shipping-address]').should('contain', '123 Main St');
    cy.get('[data-cy=review-payment-method]').should('contain', '****1111');
    cy.get('[data-cy=review-total]').should('be.visible');
    
    // Place order
    cy.get('[data-cy=place-order-button]').click();
    
    cy.waitForApi('createOrder');
    
    // Should redirect to confirmation page
    cy.url().should('include', '/order-confirmation');
    
    // Should show order confirmation
    cy.get('[data-cy=order-confirmation]').should('be.visible');
    cy.get('[data-cy=order-number]').should('be.visible');
    cy.get('[data-cy=confirmation-message]').should('contain', 'Order placed successfully');
    
    // Cart should be empty
    cy.get('[data-cy=cart-icon-count]').should('not.exist');
  });

  it('should validate shipping information', () => {
    cy.get('[data-cy=cart-icon]').click();
    cy.get('[data-cy=checkout-button]').click();
    
    // Try to continue without filling required fields
    cy.get('[data-cy=continue-to-payment]').click();
    
    // Should show validation errors
    cy.get('[data-cy=first-name-error]').should('be.visible');
    cy.get('[data-cy=last-name-error]').should('be.visible');
    cy.get('[data-cy=address-error]').should('be.visible');
    cy.get('[data-cy=city-error]').should('be.visible');
    cy.get('[data-cy=zip-error]').should('be.visible');
    
    // Should not proceed to next step
    cy.get('[data-cy=checkout-step-payment]').should('not.exist');
  });

  it('should validate payment information', () => {
    // Fill shipping info and proceed
    cy.get('[data-cy=cart-icon]').click();
    cy.get('[data-cy=checkout-button]').click();
    
    cy.get('[data-cy=shipping-first-name]').type('John');
    cy.get('[data-cy=shipping-last-name]').type('Doe');
    cy.get('[data-cy=shipping-address]').type('123 Main St');
    cy.get('[data-cy=shipping-city]').type('Anytown');
    cy.get('[data-cy=shipping-state]').select('CA');
    cy.get('[data-cy=shipping-zip]').type('12345');
    
    cy.get('[data-cy=continue-to-payment]').click();
    
    // Try to continue without payment info
    cy.get('[data-cy=continue-to-review]').click();
    
    // Should show payment validation errors
    cy.get('[data-cy=card-number-error]').should('be.visible');
    cy.get('[data-cy=expiry-error]').should('be.visible');
    cy.get('[data-cy=cvv-error]').should('be.visible');
    cy.get('[data-cy=cardholder-name-error]').should('be.visible');
    
    // Test invalid card number
    cy.get('[data-cy=payment-card-number]').type('1234');
    cy.get('[data-cy=card-number-error]').should('contain', 'Invalid card number');
    
    // Test expired card
    cy.get('[data-cy=payment-card-number]').clear().type('4111111111111111');
    cy.get('[data-cy=payment-expiry]').type('01/20'); // Past date
    cy.get('[data-cy=expiry-error]').should('contain', 'Card has expired');
  });

  it('should handle payment processing errors', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/orders`, {
      statusCode: 400,
      body: { message: 'Payment processing failed' }
    }).as('paymentFailed');
    
    cy.completeCheckout(
      {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      },
      {
        cardNumber: '4111111111111111',
        expiry: '12/25',
        cvv: '123',
        cardholderName: 'John Doe'
      }
    );
    
    cy.waitForApi('paymentFailed');
    
    // Should show error message
    cy.get('[data-cy=payment-error]').should('contain', 'Payment processing failed');
    
    // Should remain on checkout page
    cy.url().should('include', '/checkout');
    
    // Should allow retry
    cy.get('[data-cy=retry-payment-button]').should('be.visible');
  });

  it('should save and use existing addresses', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/users/addresses`, {
      body: [
        {
          id: 1,
          type: 'SHIPPING',
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          isDefault: true
        }
      ]
    }).as('getAddresses');
    
    cy.get('[data-cy=cart-icon]').click();
    cy.get('[data-cy=checkout-button]').click();
    
    cy.waitForApi('getAddresses');
    
    // Should show saved addresses
    cy.get('[data-cy=saved-addresses]').should('be.visible');
    cy.get('[data-cy=address-option]').should('have.length', 1);
    
    // Select saved address
    cy.get('[data-cy=address-option]').first().click();
    
    // Form should be populated
    cy.get('[data-cy=shipping-first-name]').should('have.value', 'John');
    cy.get('[data-cy=shipping-address]').should('have.value', '123 Main St');
    
    // Should be able to proceed
    cy.get('[data-cy=continue-to-payment]').should('be.enabled');
  });

  it('should calculate shipping costs', () => {
    cy.get('[data-cy=cart-icon]').click();
    cy.get('[data-cy=checkout-button]').click();
    
    // Fill shipping address
    cy.get('[data-cy=shipping-first-name]').type('John');
    cy.get('[data-cy=shipping-last-name]').type('Doe');
    cy.get('[data-cy=shipping-address]').type('123 Main St');
    cy.get('[data-cy=shipping-city]').type('Anytown');
    cy.get('[data-cy=shipping-state]').select('CA');
    cy.get('[data-cy=shipping-zip]').type('12345');
    
    // Should show shipping options
    cy.get('[data-cy=shipping-options]').should('be.visible');
    cy.get('[data-cy=shipping-option]').should('have.length.greaterThan', 0);
    
    // Select shipping method
    cy.get('[data-cy=shipping-option]').first().click();
    
    // Should update order total
    cy.get('[data-cy=shipping-cost]').should('be.visible');
    cy.get('[data-cy=order-total]').should('be.visible');
  });

  it('should apply discount codes', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/coupons/validate`, {
      body: { valid: true, discount: 10.00, type: 'FIXED' }
    }).as('validateCoupon');
    
    cy.get('[data-cy=cart-icon]').click();
    cy.get('[data-cy=checkout-button]').click();
    
    // Apply discount code
    cy.get('[data-cy=discount-code-input]').type('SAVE10');
    cy.get('[data-cy=apply-discount-button]').click();
    
    cy.waitForApi('validateCoupon');
    
    // Should show discount applied
    cy.get('[data-cy=discount-applied]').should('be.visible');
    cy.get('[data-cy=discount-amount]').should('contain', '$10.00');
    
    // Should update order total
    cy.get('[data-cy=order-total]').should('be.visible');
  });

  it('should handle inventory changes during checkout', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/orders`, {
      statusCode: 400,
      body: { message: 'Product no longer available' }
    }).as('inventoryError');
    
    cy.completeCheckout(
      {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      },
      {
        cardNumber: '4111111111111111',
        expiry: '12/25',
        cvv: '123',
        cardholderName: 'John Doe'
      }
    );
    
    cy.waitForApi('inventoryError');
    
    // Should show inventory error
    cy.get('[data-cy=inventory-error]').should('contain', 'Product no longer available');
    
    // Should redirect back to cart
    cy.get('[data-cy=return-to-cart-button]').click();
    cy.url().should('include', '/cart');
  });

  it('should show order summary throughout checkout', () => {
    cy.get('[data-cy=cart-icon]').click();
    cy.get('[data-cy=checkout-button]').click();
    
    // Order summary should be visible on all steps
    cy.get('[data-cy=order-summary]').should('be.visible');
    cy.get('[data-cy=summary-items]').should('be.visible');
    cy.get('[data-cy=summary-subtotal]').should('be.visible');
    cy.get('[data-cy=summary-total]').should('be.visible');
    
    // Proceed to payment step
    cy.get('[data-cy=shipping-first-name]').type('John');
    cy.get('[data-cy=shipping-last-name]').type('Doe');
    cy.get('[data-cy=shipping-address]').type('123 Main St');
    cy.get('[data-cy=shipping-city]').type('Anytown');
    cy.get('[data-cy=shipping-state]').select('CA');
    cy.get('[data-cy=shipping-zip]').type('12345');
    cy.get('[data-cy=continue-to-payment]').click();
    
    // Order summary should still be visible
    cy.get('[data-cy=order-summary]').should('be.visible');
  });
});