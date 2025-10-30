import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { UserManagement, CreateUserRequest, UpdateUserRequest } from '../../models/dashboard.models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  users: UserManagement[] = [];
  totalUsers = 0;
  currentPage = 0;
  pageSize = 20;
  searchTerm = '';
  loading = true;
  error: string | null = null;
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedUser: UserManagement | null = null;
  
  // Forms
  createUserForm: FormGroup;
  editUserForm: FormGroup;
  
  constructor(
    private adminService: AdminDashboardService,
    private fb: FormBuilder
  ) {
    this.createUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['CUSTOMER', [Validators.required]]
    });
    
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.maxLength(100)]],
      lastName: ['', [Validators.maxLength(100)]],
      role: ['', [Validators.required]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getAllUsers(this.currentPage, this.pageSize, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.content;
          this.totalUsers = response.totalElements;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load users';
          this.loading = false;
          console.error('Load users error:', error);
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  openCreateModal(): void {
    this.createUserForm.reset();
    this.createUserForm.patchValue({ role: 'CUSTOMER' });
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createUserForm.reset();
  }

  onCreateUser(): void {
    if (this.createUserForm.valid) {
      const request: CreateUserRequest = this.createUserForm.value;
      
      this.adminService.createUser(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (user) => {
            this.users.unshift(user);
            this.totalUsers++;
            this.closeCreateModal();
          },
          error: (error) => {
            this.error = 'Failed to create user';
            console.error('Create user error:', error);
          }
        });
    }
  }

  openEditModal(user: UserManagement): void {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.editUserForm.reset();
  }

  onUpdateUser(): void {
    if (this.editUserForm.valid && this.selectedUser) {
      const request: UpdateUserRequest = this.editUserForm.value;
      
      this.adminService.updateUser(this.selectedUser.userId, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedUser) => {
            const index = this.users.findIndex(u => u.userId === updatedUser.userId);
            if (index !== -1) {
              this.users[index] = updatedUser;
            }
            this.closeEditModal();
          },
          error: (error) => {
            this.error = 'Failed to update user';
            console.error('Update user error:', error);
          }
        });
    }
  }

  openDeleteModal(user: UserManagement): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  onDeleteUser(): void {
    if (this.selectedUser) {
      this.adminService.deleteUser(this.selectedUser.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.users = this.users.filter(u => u.userId !== this.selectedUser!.userId);
            this.totalUsers--;
            this.closeDeleteModal();
          },
          error: (error) => {
            this.error = 'Failed to delete user';
            console.error('Delete user error:', error);
          }
        });
    }
  }

  toggleUserStatus(user: UserManagement): void {
    this.adminService.toggleUserStatus(user.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.userId === updatedUser.userId);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
        },
        error: (error) => {
          this.error = 'Failed to toggle user status';
          console.error('Toggle user status error:', error);
        }
      });
  }

  resetUserPassword(user: UserManagement): void {
    if (confirm(`Reset password for ${user.firstName} ${user.lastName}?`)) {
      this.adminService.resetUserPassword(user.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            alert(`Temporary password: ${response.temporaryPassword}`);
          },
          error: (error) => {
            this.error = 'Failed to reset password';
            console.error('Reset password error:', error);
          }
        });
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getRoleColor(role: string): string {
    return role === 'ADMIN' ? 'admin-role' : 'customer-role';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'active-status' : 'inactive-status';
  }
}