describe('User Authentication', () => {
  beforeEach(() => {
    // Clear any existing session
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should register a new user successfully', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/register`).as('register');
    
    cy.visit('/register');
    
    // Fill registration form
    cy.get('[data-cy=first-name-input]').type('John');
    cy.get('[data-cy=last-name-input]').type('Doe');
    cy.get('[data-cy=email-input]').type('john.doe@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=confirm-password-input]').type('password123');
    
    // Accept terms
    cy.get('[data-cy=terms-checkbox]').check();
    
    // Submit registration
    cy.get('[data-cy=register-button]').click();
    
    cy.waitForApi('register');
    
    // Should redirect to login or dashboard
    cy.url().should('not.include', '/register');
    
    // Should show success message
    cy.get('[data-cy=success-message]').should('contain', 'Registration successful');
  });

  it('should show validation errors for invalid registration', () => {
    cy.visit('/register');
    
    // Try to submit empty form
    cy.get('[data-cy=register-button]').click();
    
    // Should show validation errors
    cy.get('[data-cy=first-name-error]').should('be.visible');
    cy.get('[data-cy=last-name-error]').should('be.visible');
    cy.get('[data-cy=email-error]').should('be.visible');
    cy.get('[data-cy=password-error]').should('be.visible');
    
    // Test invalid email format
    cy.get('[data-cy=email-input]').type('invalid-email');
    cy.get('[data-cy=email-error]').should('contain', 'Invalid email format');
    
    // Test password mismatch
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=confirm-password-input]').type('different-password');
    cy.get('[data-cy=confirm-password-error]').should('contain', 'Passwords do not match');
  });

  it('should login with valid credentials', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/login`).as('login');
    
    cy.visit('/login');
    
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();
    
    cy.waitForApi('login');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Should store authentication token
    cy.window().its('localStorage.token').should('exist');
    
    // Should show user menu
    cy.get('[data-cy=user-menu]').should('be.visible');
    cy.get('[data-cy=user-name]').should('contain', 'test@example.com');
  });

  it('should show error for invalid credentials', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/login`, {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('loginFailed');
    
    cy.visit('/login');
    
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    cy.get('[data-cy=login-button]').click();
    
    cy.waitForApi('loginFailed');
    
    // Should show error message
    cy.get('[data-cy=error-message]').should('contain', 'Invalid credentials');
    
    // Should remain on login page
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    // First login
    cy.login('test@example.com', 'password123');
    
    // Then logout
    cy.get('[data-cy=user-menu]').click();
    cy.get('[data-cy=logout-button]').click();
    
    // Should redirect to home page
    cy.url().should('not.include', '/dashboard');
    
    // Should clear authentication token
    cy.window().its('localStorage.token').should('not.exist');
    
    // Should show login button
    cy.get('[data-cy=login-link]').should('be.visible');
  });

  it('should redirect to login for protected routes', () => {
    // Try to access protected route without authentication
    cy.visit('/profile');
    
    // Should redirect to login
    cy.url().should('include', '/login');
    
    // Should show message about authentication required
    cy.get('[data-cy=auth-required-message]').should('be.visible');
  });

  it('should remember user session after page refresh', () => {
    cy.login('test@example.com', 'password123');
    
    // Refresh the page
    cy.reload();
    
    // Should still be authenticated
    cy.get('[data-cy=user-menu]').should('be.visible');
    cy.window().its('localStorage.token').should('exist');
  });

  it('should handle password reset flow', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/forgot-password`).as('forgotPassword');
    
    cy.visit('/login');
    cy.get('[data-cy=forgot-password-link]').click();
    
    cy.url().should('include', '/forgot-password');
    
    cy.get('[data-cy=email-input]').type('test@example.com');
    cy.get('[data-cy=reset-password-button]').click();
    
    cy.waitForApi('forgotPassword');
    
    cy.get('[data-cy=success-message]').should('contain', 'Password reset email sent');
  });
});