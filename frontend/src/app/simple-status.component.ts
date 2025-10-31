import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-simple-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #2c3e50; margin-bottom: 20px;">🛒 ShopEasy - Ecommerce Platform</h1>
      
      <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #155724; margin: 0 0 10px 0;">✅ Frontend Application Running Successfully!</h2>
        <p style="color: #155724; margin: 0;">Angular development server is active and responsive</p>
      </div>

      <!-- Quick Access Authentication -->
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center;">
        <h3 style="margin: 0 0 20px 0; font-size: 1.3rem;">🔐 Get Started</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
          <button style="padding: 15px 20px; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; font-weight: bold; backdrop-filter: blur(10px);" onclick="window.location.href='/register'">
            👤 Sign Up
          </button>
          <button style="padding: 15px 20px; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer; font-weight: bold; backdrop-filter: blur(10px);" onclick="window.location.href='/login'">
            🔑 Login
          </button>
          <button style="padding: 15px 20px; background: rgba(220,53,69,0.8); color: white; border: 2px solid rgba(220,53,69,0.5); border-radius: 8px; cursor: pointer; font-weight: bold;" onclick="window.location.href='/admin-register'">
            ⚙️ Admin
          </button>
        </div>
      </div>

      <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #495057;">🎯 Current Status</h3>
        <ul style="text-align: left; display: inline-block; color: #495057;">
          <li>✅ Angular 20 Application</li>
          <li>✅ TypeScript Compilation</li>
          <li>✅ Component Routing</li>
          <li>✅ Material UI Components</li>
          <li>✅ Mock Product Data</li>
          <li>⚠️ NgRx Store (Temporarily Disabled)</li>
        </ul>
      </div>

      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #856404;">🔧 Available Features</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
          <button style="padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.href='/dashboard'">
            🏠 Dashboard
          </button>
          <button style="padding: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.href='/products'">
            📱 Products
          </button>
          <button style="padding: 12px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.href='/admin'">
            ⚙️ Admin
          </button>
          <button style="padding: 12px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.href='/integration-test'">
            🧪 Tests
          </button>
        </div>
        
        <div style="margin-top: 20px;">
          <h4 style="color: #495057;">🔐 Authentication</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
            <button style="padding: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.href='/register'">
              👤 User Registration
            </button>
            <button style="padding: 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.href='/admin-register'">
              ⚙️ Admin Registration
            </button>
            <button style="padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.href='/login'">
              🔑 Login
            </button>
          </div>
        </div>
      </div>

      <div style="background: #e2e3e5; border: 1px solid #d6d8db; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #383d41;">📊 Sample Products Available</h3>
        <div style="text-align: left; display: inline-block; color: #383d41;">
          <p><strong>Electronics:</strong> iPhone 15 Pro, Samsung Galaxy S24, Sony Headphones, Dell XPS 13</p>
          <p><strong>Fashion:</strong> Nike Air Max 270, Adidas Ultraboost 22</p>
          <p><strong>Price Range:</strong> $149.99 - $1,299.99</p>
        </div>
      </div>

      <div style="margin-top: 30px;">
        <p style="color: #6c757d; font-size: 14px;">
          <strong>Note:</strong> This is a demonstration mode with mock data. 
          No backend server required for basic functionality.
        </p>
      </div>
    </div>
  `,
  styles: [`
    button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }
  `]
})
export class SimpleStatusComponent {}