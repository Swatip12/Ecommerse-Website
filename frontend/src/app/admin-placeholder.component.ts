import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto;">
      <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">⚙️ Admin Dashboard</h1>
      
      <!-- Admin Stats -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
        
        <!-- Products Stats -->
        <div style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0; font-size: 24px;">📱 Products</h3>
          <p style="margin: 0 0 5px 0; font-size: 32px; font-weight: bold;">6</p>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">Total Products</p>
        </div>

        <!-- Orders Stats -->
        <div style="background: linear-gradient(135deg, #28a745, #1e7e34); color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0; font-size: 24px;">📦 Orders</h3>
          <p style="margin: 0 0 5px 0; font-size: 32px; font-weight: bold;">127</p>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">Total Orders</p>
        </div>

        <!-- Revenue Stats -->
        <div style="background: linear-gradient(135deg, #ffc107, #e0a800); color: #212529; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0; font-size: 24px;">💰 Revenue</h3>
          <p style="margin: 0 0 5px 0; font-size: 32px; font-weight: bold;">$45,230</p>
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">This Month</p>
        </div>

        <!-- Users Stats -->
        <div style="background: linear-gradient(135deg, #6f42c1, #5a32a3); color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0; font-size: 24px;">👥 Users</h3>
          <p style="margin: 0 0 5px 0; font-size: 32px; font-weight: bold;">1,234</p>
          <p style="margin: 0; opacity: 0.9; font-size: 14px;">Registered Users</p>
        </div>
      </div>

      <!-- Management Sections -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
        
        <!-- Product Management -->
        <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
            📱 Product Management
          </h3>
          <p style="color: #6c757d; margin: 0 0 20px 0; font-size: 14px;">
            Manage your product catalog, inventory, and pricing
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              View All Products
            </button>
            <button style="padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Add New Product
            </button>
            <button style="padding: 10px; background: #ffc107; color: #212529; border: none; border-radius: 4px; cursor: pointer;">
              Manage Categories
            </button>
          </div>
        </div>

        <!-- Order Management -->
        <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
            📦 Order Management
          </h3>
          <p style="color: #6c757d; margin: 0 0 20px 0; font-size: 14px;">
            Process orders, manage shipping, and handle returns
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              View All Orders
            </button>
            <button style="padding: 10px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Pending Orders (5)
            </button>
            <button style="padding: 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Returns & Refunds
            </button>
          </div>
        </div>

        <!-- User Management -->
        <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
            👥 User Management
          </h3>
          <p style="color: #6c757d; margin: 0 0 20px 0; font-size: 14px;">
            Manage customer accounts and admin permissions
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              View All Users
            </button>
            <button style="padding: 10px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Admin Accounts
            </button>
            <button style="padding: 10px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;">
              User Analytics
            </button>
          </div>
        </div>

        <!-- Reports & Analytics -->
        <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #2c3e50; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
            📊 Reports & Analytics
          </h3>
          <p style="color: #6c757d; margin: 0 0 20px 0; font-size: 14px;">
            View sales reports, analytics, and business insights
          </p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button style="padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Sales Reports
            </button>
            <button style="padding: 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Revenue Analytics
            </button>
            <button style="padding: 10px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Customer Insights
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="color: #2c3e50; margin: 0 0 20px 0;">📈 Recent Activity</h3>
        
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #28a745;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #2c3e50;">New Order Received</p>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">Order #ORD-2024-003 - Dell XPS 13 Laptop ($1,299.99) - 2 minutes ago</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #2c3e50;">Product Updated</p>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">iPhone 15 Pro inventory updated - 15 minutes ago</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #2c3e50;">Low Stock Alert</p>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">Dell XPS 13 Laptop - Only 3 units remaining - 1 hour ago</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #6f42c1;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #2c3e50;">New User Registration</p>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">john.doe@example.com registered - 2 hours ago</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h3 style="color: #2c3e50; margin-bottom: 20px;">Quick Actions</h3>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          <button style="padding: 12px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
            📱 Add Product
          </button>
          <button style="padding: 12px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            📦 Process Orders
          </button>
          <button style="padding: 12px 20px; background: #ffc107; color: #212529; border: none; border-radius: 4px; cursor: pointer;">
            📊 View Reports
          </button>
          <button style="padding: 12px 20px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;">
            👥 Manage Users
          </button>
        </div>
      </div>

      <!-- Back to Home -->
      <div style="text-align: center;">
        <button 
          style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
          onclick="window.location.href='/status'"
        >
          🏠 Back to Home
        </button>
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
export class AdminPlaceholderComponent {}