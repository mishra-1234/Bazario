import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  // Step tracking
  currentStep: 'email' | 'reset' | 'success' = 'email';

  // Form fields
  email = '';
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;

  // UI state
  isLoading = false;
  submitted = false;
  errorMessage = '';

  currentYear = new Date().getFullYear();

  private readonly baseUrl = 'https://bazario-io58.onrender.com/users';
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // Validation
  get isEmailValid(): boolean {
    return this.emailPattern.test(this.email.trim());
  }

  get isPasswordValid(): boolean {
    return this.newPassword.trim().length >= 6;
  }

  get doPasswordsMatch(): boolean {
    return this.newPassword === this.confirmPassword;
  }

  get showEmailError(): boolean {
    return this.submitted && !this.isEmailValid;
  }

  get showPasswordError(): boolean {
    return this.submitted && !this.isPasswordValid;
  }

  get showConfirmError(): boolean {
    return this.submitted && !this.doPasswordsMatch;
  }

  // Step 1: Verify email exists
  verifyEmail(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.isEmailValid || this.isLoading) return;

    this.isLoading = true;

    // Try login with a dummy password to check if email exists
    // 404 = email not found, 401 = email exists (password wrong), 200 = also exists
    this.http.post<any>(this.baseUrl + '/login', {
      email: this.email.trim(),
      password: '__check_email_only__'
    }).subscribe({
      next: () => {
        // Email exists (unlikely to match password, but handle it)
        this.isLoading = false;
        this.submitted = false;
        this.currentStep = 'reset';
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 401) {
          // Email exists, password wrong — this is what we expect
          this.submitted = false;
          this.currentStep = 'reset';
        } else if (err.status === 404) {
          this.errorMessage = 'This email is not registered. Please sign up first.';
        } else {
          this.errorMessage = 'Unable to reach server. Please try again.';
        }
      }
    });
  }

  // Step 2: Reset password
  resetPassword(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.isPasswordValid || !this.doPasswordsMatch || this.isLoading) return;

    this.isLoading = true;

    this.http.put<any>(this.baseUrl + '/reset-password', {
      email: this.email.trim(),
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentStep = 'success';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Something went wrong. Please try again.';
      }
    });
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goBackToEmail(): void {
    this.currentStep = 'email';
    this.submitted = false;
    this.errorMessage = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
