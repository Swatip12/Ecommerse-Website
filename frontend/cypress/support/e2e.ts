// Cypress E2E support file

// Import commands
import './commands';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // that might occur during development
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});

// Custom assertions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login with email and password
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Add product to cart
       */
      addToCart(productId: number, quantity?: number): Chainable<void>;
      
      /**
       * Complete checkout process
       */
      completeCheckout(shippingInfo: any, paymentInfo: any): Chainable<void>;
      
      /**
       * Wait for API response
       */
      waitForApi(alias: string, timeout?: number): Chainable<void>;
      
      /**
       * Clear cart
       */
      clearCart(): Chainable<void>;
      
      /**
       * Navigate to product page
       */
      goToProduct(productId: number): Chainable<void>;
    }
  }
}