import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER'
  };

  const mockLoginResponse = {
    token: 'mock-jwt-token',
    user: mockUser
  };

  const mockRegisterRequest = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user successfully', () => {
    service.login('test@example.com', 'password123').subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      password: 'password123'
    });
    req.flush(mockLoginResponse);
  });

  it('should register user successfully', () => {
    service.register(mockRegisterRequest).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRegisterRequest);
    req.flush(mockUser);
  });

  it('should logout user', () => {
    // Set up initial state
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should check if user is authenticated', () => {
    // Not authenticated initially
    expect(service.isAuthenticated()).toBeFalse();

    // Set token
    localStorage.setItem('token', 'mock-jwt-token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should get current user', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    const currentUser = service.getCurrentUser();
    expect(currentUser).toEqual(mockUser);
  });

  it('should return null for current user when not logged in', () => {
    const currentUser = service.getCurrentUser();
    expect(currentUser).toBeNull();
  });

  it('should get auth token', () => {
    localStorage.setItem('token', 'mock-jwt-token');

    const token = service.getToken();
    expect(token).toBe('mock-jwt-token');
  });

  it('should return null for token when not logged in', () => {
    const token = service.getToken();
    expect(token).toBeNull();
  });

  it('should check if user has admin role', () => {
    const adminUser = { ...mockUser, role: 'ADMIN' };
    localStorage.setItem('user', JSON.stringify(adminUser));

    expect(service.hasRole('ADMIN')).toBeTrue();
    expect(service.hasRole('CUSTOMER')).toBeFalse();
  });

  it('should handle login error', () => {
    service.login('test@example.com', 'wrongpassword').subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(401);
        expect(localStorage.getItem('token')).toBeNull();
      }
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle register error', () => {
    service.register(mockRegisterRequest).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('/api/auth/register');
    req.flush('Email already exists', { status: 400, statusText: 'Bad Request' });
  });

  it('should refresh token', () => {
    const newToken = 'new-jwt-token';
    localStorage.setItem('token', 'old-jwt-token');

    service.refreshToken().subscribe(response => {
      expect(response.token).toBe(newToken);
      expect(localStorage.getItem('token')).toBe(newToken);
    });

    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.method).toBe('POST');
    req.flush({ token: newToken });
  });

  it('should validate token', () => {
    service.validateToken('mock-jwt-token').subscribe(isValid => {
      expect(isValid).toBeTrue();
    });

    const req = httpMock.expectOne('/api/auth/validate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'mock-jwt-token' });
    req.flush({ valid: true });
  });
});