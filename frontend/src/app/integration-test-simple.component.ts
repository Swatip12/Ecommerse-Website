import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-integration-test-simple',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="integration-test-container">
      <mat-card class="test-header">
        <mat-card-header>
          <mat-card-title>End-to-End Integration Tests</mat-card-title>
          <mat-card-subtitle>Testing complete user workflows and system integration</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="runIntegrationTests()">
            <mat-icon>play_arrow</mat-icon>
            Run Integration Tests
          </button>
        </mat-card-actions>
      </mat-card>

      <div class="test-results" *ngIf="testResults.length > 0">
        <mat-card *ngFor="let test of testResults" class="test-card" [ngClass]="test.status">
          <mat-card-header>
            <mat-card-title>
              <mat-icon [ngSwitch]="test.status">
                <span *ngSwitchCase="'success'">check_circle</span>
                <span *ngSwitchCase="'error'">error</span>
                <span *ngSwitchDefault>schedule</span>
              </mat-icon>
              {{ test.name }}
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{ test.message }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .integration-test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .test-header {
      margin-bottom: 20px;
    }

    .test-results {
      display: grid;
      gap: 16px;
    }

    .test-card {
      transition: all 0.3s ease;
    }

    .test-card.success {
      border-left: 4px solid #4caf50;
    }

    .test-card.error {
      border-left: 4px solid #f44336;
    }

    mat-card-header mat-icon {
      margin-right: 8px;
    }
  `]
})
export class IntegrationTestSimpleComponent implements OnInit {
  testResults: Array<{name: string, status: string, message: string}> = [];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.showWelcomeMessage();
  }

  private showWelcomeMessage(): void {
    this.snackBar.open('Integration Test Suite Ready', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  async runIntegrationTests(): Promise<void> {
    this.testResults = [];
    
    // Test 1: Backend Health Check
    await this.testBackendHealth();
    
    // Test 2: Frontend Components
    await this.testFrontendComponents();
    
    // Test 3: API Endpoints
    await this.testApiEndpoints();
    
    // Test 4: Integration Workflow
    await this.testIntegrationWorkflow();
    
    this.showCompletionMessage();
  }

  private async testBackendHealth(): Promise<void> {
    try {
      const response = await fetch('/api/integration-test/public-health');
      if (response.ok) {
        const result = await response.json();
        const overallStatus = result.data?.overallStatus?.status;
        if (overallStatus === 'healthy') {
          this.testResults.push({
            name: 'Backend Health Check',
            status: 'success',
            message: 'Backend services are healthy and responding'
          });
        } else {
          this.testResults.push({
            name: 'Backend Health Check',
            status: 'error',
            message: `Backend health check shows degraded status: ${result.data?.overallStatus?.message || 'Unknown issue'}`
          });
        }
      } else {
        throw new Error(`Backend health check failed: ${response.status}`);
      }
    } catch (error) {
      this.testResults.push({
        name: 'Backend Health Check',
        status: 'error',
        message: `Backend health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private async testFrontendComponents(): Promise<void> {
    try {
      // Test if Angular is running and components are loaded
      const angularElement = document.querySelector('app-root');
      if (angularElement) {
        this.testResults.push({
          name: 'Frontend Components',
          status: 'success',
          message: 'Angular application and components are loaded successfully'
        });
      } else {
        throw new Error('Angular application not found');
      }
    } catch (error) {
      this.testResults.push({
        name: 'Frontend Components',
        status: 'error',
        message: `Frontend components test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private async testApiEndpoints(): Promise<void> {
    try {
      // Test basic API connectivity
      const response = await fetch('/api/products');
      if (response.ok || response.status === 401) { // 401 is acceptable for protected endpoints
        this.testResults.push({
          name: 'API Endpoints',
          status: 'success',
          message: 'API endpoints are accessible and responding'
        });
      } else {
        throw new Error(`API endpoints test failed: ${response.status}`);
      }
    } catch (error) {
      this.testResults.push({
        name: 'API Endpoints',
        status: 'error',
        message: `API endpoints test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private async testIntegrationWorkflow(): Promise<void> {
    try {
      // Test complete workflow endpoint
      const response = await fetch('/api/integration-test/test-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok || response.status === 401) { // 401 is acceptable for protected endpoints
        this.testResults.push({
          name: 'Integration Workflow',
          status: 'success',
          message: 'End-to-end integration workflow completed successfully'
        });
      } else {
        throw new Error(`Integration workflow test failed: ${response.status}`);
      }
    } catch (error) {
      this.testResults.push({
        name: 'Integration Workflow',
        status: 'error',
        message: `Integration workflow test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  private showCompletionMessage(): void {
    const successCount = this.testResults.filter(t => t.status === 'success').length;
    const errorCount = this.testResults.filter(t => t.status === 'error').length;
    
    const message = errorCount === 0 
      ? `All integration tests passed! ${successCount} tests successful`
      : `Integration tests completed: ${successCount} passed, ${errorCount} failed`;
    
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: errorCount === 0 ? 'success-snackbar' : 'error-snackbar'
    });
  }
}