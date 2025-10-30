// Custom Cypress commands

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  
  // Wait for successful login
  cy.url().should('not.include', '/login');
  cy.window().its('localStorage.token').should('exist');
});

Cypress.Commands.add('addToCart', (productId: number, quantity: number = 1) => {
  cy.intercept('POST', `${Cypress.env('apiUrl')}/cart/add`).as('addToCart');
  
  cy.goToProduct(productId);
  
  if (quantity > 1) {
    cy.get('[data-cy=quantity-input]').clear().type(quantity.toString());
  }
  
  cy.get('[data-cy=add-to-cart-button]').click();
  cy.waitForApi('addToCart');
  
  // Verify cart icon updates
  cy.get('[data-cy=cart-icon-count]').should('contain', quantity.toString());
});

Cypress.Commands.add('completeCheckout', (shippingInfo: any, paymentInfo: any) => {
  cy.intercept('POST', `${Cypress.env('apiUrl')}/orders`).as('createOrder');
  
  // Go to cart
  cy.get('[data-cy=cart-icon]').click();
  cy.get('[data-cy=checkout-button]').click();
  
  // Fill shipping information
  cy.get('[data-cy=shipping-first-name]').type(shippingInfo.firstName);
  cy.get('[data-cy=shipping-last-name]').type(shippingInfo.lastName);
  cy.get('[data-cy=shipping-address]').type(shippingInfo.address);
  cy.get('[data-cy=shipping-city]').type(shippingInfo.city);
  cy.get('[data-cy=shipping-state]').type(shippingInfo.state);
  cy.get('[data-cy=shipping-zip]').type(shippingInfo.zipCode);
  
  // Fill payment information
  cy.get('[data-cy=payment-card-number]').type(paymentInfo.cardNumber);
  cy.get('[data-cy=payment-expiry]').type(paymentInfo.expiry);
  cy.get('[data-cy=payment-cvv]').type(paymentInfo.cvv);
  cy.get('[data-cy=payment-name]').type(paymentInfo.cardholderName);
  
  // Complete order
  cy.get('[data-cy=place-order-button]').click();
  cy.waitForApi('createOrder');
  
  // Verify order confirmation
  cy.url().should('include', '/order-confirmation');
  cy.get('[data-cy=order-number]').should('exist');
});

Cypress.Commands.add('waitForApi', (alias: string, timeout: number = 10000) => {
  cy.wait(`@${alias}`, { timeout });
});

Cypress.Commands.add('clearCart', () => {
  cy.intercept('DELETE', `${Cypress.env('apiUrl')}/cart/clear`).as('clearCart');
  
  cy.get('[data-cy=cart-icon]').click();
  cy.get('[data-cy=clear-cart-button]').click();
  cy.get('[data-cy=confirm-clear-cart]').click();
  
  cy.waitForApi('clearCart');
  cy.get('[data-cy=cart-empty-message]').should('be.visible');
});

Cypress.Commands.add('goToProduct', (productId: number) => {
  cy.visit(`/products/${productId}`);
  cy.get('[data-cy=product-detail]').should('be.visible');
});