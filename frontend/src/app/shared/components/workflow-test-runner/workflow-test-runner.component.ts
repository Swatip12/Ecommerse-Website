import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil } from 'rxjs';

import { E2EWorkflowService, WorkflowResult, WorkflowStep } from '../../services/e2e-workflow.service';

@Component({
  selector: 'app-workflow-test-runner',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatChipsModule,
    MatExpansionModule
  ],
  template: `
    <mat-card class="workflow-runner">
      <mat-card-header>
        <mat-card-title>{{ workflowName }}</mat-card-title>
        <mat-card-subtitle>{{ workflowDescription }}</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="workflow-controls" *ngIf="!isRunning && !result">
          <button mat-raised-button color="primary" (click)="runWorkflow()">
            <mat-icon>play_arrow</mat-icon>
            Run Workflow
          </button>
        </div>

        <div class="workflow-progress" *ngIf="isRunning">
          <mat-progress-bar mode="determinate" [value]="progressPercentage"></mat-progress-bar>
          <p>Running workflow... {{ completedSteps }}/{{ totalSteps }}</p>
        </div>

        <div class="workflow-results" *ngIf="result">
          <div class="result-summary">
            <mat-chip-listbox>
              <mat-chip [color]="result.overallStatus === 'success' ? 'primary' : 'warn'" selected>
                <mat-icon>{{ result.overallStatus === 'success' ? 'check_circle' : 'error' }}</mat-icon>
                {{ result.overallStatus === 'success' ? 'Success' : 'Failed' }}
              </mat-chip>
              <mat-chip>
                <mat-icon>timer</mat-icon>
                {{ result.totalDuration }}ms
              </mat-chip>
              <mat-chip color="accent">
                <mat-icon>done</mat-icon>
                {{ result.successCount }}/{{ result.steps.length }}
              </mat-chip>
            </mat-chip-listbox>
          </div>

          <mat-accordion class="workflow-steps">
            <mat-expansion-panel *ngFor="let step of result.steps; let i = index" 
                                [expanded]="step.status === 'error'">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon [ngClass]="'status-' + step.status">
                    <span [ngSwitch]="step.status">
                      <span *ngSwitchCase="'success'">check_circle</span>
                      <span *ngSwitchCase="'error'">error</span>
                      <span *ngSwitchCase="'running'">hourglass_empty</span>
                      <span *ngSwitchDefault>schedule</span>
                    </span>
                  </mat-icon>
                  {{ step.name }}
                </mat-panel-title>
                <mat-panel-description *ngIf="step.duration">
                  {{ step.duration }}ms
                </mat-panel-description>
              </mat-expansion-panel-header>
              
              <div class="step-details">
                <p *ngIf="step.message">{{ step.message }}</p>
                <div *ngIf="step.data" class="step-data">
                  <pre>{{ step.data | json }}</pre>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>

          <div class="workflow-actions">
            <button mat-raised-button (click)="resetWorkflow()">
              <mat-icon>refresh</mat-icon>
              Run Again
            </button>
            <button mat-button (click)="exportResults()" *ngIf="result">
              <mat-icon>download</mat-icon>
              Export Results
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .workflow-runner {
      margin-bottom: 20px;
    }

    .workflow-controls {
      text-align: center;
      padding: 20px 0;
    }

    .workflow-progress {
      margin: 20px 0;
      text-align: center;
    }

    .result-summary {
      margin-bottom: 20px;
    }

    .result-summary mat-chip-listbox {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .workflow-steps {
      margin-bottom: 20px;
    }

    .step-details {
      padding: 16px 0;
    }

    .step-data {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-top: 8px;
    }

    .step-data pre {
      margin: 0;
      font-size: 12px;
      white-space: pre-wrap;
    }

    .workflow-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .status-success {
      color: #4caf50;
    }

    .status-error {
      color: #f44336;
    }

    .status-running {
      color: #ff9800;
      animation: pulse 1s infinite;
    }

    .status-pending {
      color: #9e9e9e;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class WorkflowTestRunnerComponent implements OnInit, OnDestroy {
  @Input() workflowType: 'customer' | 'admin' | 'system' = 'customer';
  @Input() workflowName: string = '';
  @Input() workflowDescription: string = '';
  @Output() workflowCompleted = new EventEmitter<WorkflowResult>();

  private destroy$ = new Subject<void>();
  
  isRunning = false;
  result: WorkflowResult | null = null;
  completedSteps = 0;
  totalSteps = 0;
  progressPercentage = 0;

  constructor(private e2eWorkflowService: E2EWorkflowService) {}

  ngOnInit(): void {
    this.setWorkflowDefaults();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setWorkflowDefaults(): void {
    if (!this.workflowName) {
      switch (this.workflowType) {
        case 'customer':
          this.workflowName = 'Customer Journey Test';
          this.workflowDescription = 'Tests complete customer experience from browsing to ordering';
          break;
        case 'admin':
          this.workflowName = 'Admin Workflow Test';
          this.workflowDescription = 'Tests admin dashboard and management features';
          break;
        case 'system':
          this.workflowName = 'System Integration Test';
          this.workflowDescription = 'Tests system-wide integration and performance';
          break;
      }
    }
  }

  runWorkflow(): void {
    this.isRunning = true;
    this.result = null;
    this.completedSteps = 0;
    this.progressPercentage = 0;

    let workflowObservable;
    
    switch (this.workflowType) {
      case 'customer':
        workflowObservable = this.e2eWorkflowService.executeCustomerJourney();
        break;
      case 'admin':
        workflowObservable = this.e2eWorkflowService.executeAdminWorkflow();
        break;
      case 'system':
        workflowObservable = this.e2eWorkflowService.executeSystemIntegration();
        break;
      default:
        workflowObservable = this.e2eWorkflowService.executeCustomerJourney();
    }

    workflowObservable.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        this.result = result;
        this.totalSteps = result.steps.length;
        this.completedSteps = result.steps.filter(s => s.status !== 'pending').length;
        this.progressPercentage = (this.completedSteps / this.totalSteps) * 100;
        this.isRunning = false;
        this.workflowCompleted.emit(result);
      },
      error: (error) => {
        console.error('Workflow execution failed:', error);
        this.isRunning = false;
        // Create error result
        this.result = {
          workflowName: this.workflowName,
          steps: [{ 
            name: 'Workflow Execution', 
            status: 'error', 
            message: error.message || 'Unknown error occurred',
            duration: 0
          }],
          overallStatus: 'error',
          totalDuration: 0,
          successCount: 0,
          errorCount: 1
        };
      }
    });
  }

  resetWorkflow(): void {
    this.result = null;
    this.isRunning = false;
    this.completedSteps = 0;
    this.totalSteps = 0;
    this.progressPercentage = 0;
  }

  exportResults(): void {
    if (!this.result) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      workflow: this.result,
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-test-${this.workflowType}-${Date.now()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}