import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

interface LoginResponse {
  message: string;
  user?: {
    id?: string | number;
    name?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
  };
  vendor?: {
    id?: string | number;
    shopName?: string;
    email?: string;
    lastLoginTime?: string;
    [key: string]: unknown;
  };
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // ---------------- Form model ----------------
  email = '';
  password = '';
  rememberMe = false;

  // ---------------- UI state ----------------
  showPassword = false;
  isLoading = false;
  loginFailed = false;
  submitted = false;

  errorMessage = '';
  successMessage = '';

  currentYear = new Date().getFullYear();

  private readonly customerLoginUrl = 'https://bazario-io58.onrender.com/users/login';
  private readonly vendorLoginUrl = 'https://bazario-io58.onrender.com/vendors/login';
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  // ---------------- Validation helpers ----------------

  get isEmailValid(): boolean {
    return this.emailPattern.test(this.email.trim());
  }

  get isPasswordValid(): boolean {
    return this.password.trim().length > 0;
  }

  get isFormValid(): boolean {
    return this.isEmailValid && this.isPasswordValid;
  }

  get showEmailError(): boolean {
    return this.submitted && !this.isEmailValid;
  }

  get showPasswordError(): boolean {
    return this.submitted && !this.isPasswordValid;
  }

  // ---------------- UI actions ----------------

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private resetMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // ---------------- Login flow ----------------

  login(form?: NgForm): void {
    this.submitted = true;
    this.resetMessages();
    this.loginFailed = false;

    if (!this.isFormValid || this.isLoading) {
      return;
    }

    this.isLoading = true;

    const payload = {
      email: this.email.trim(),
      password: this.password,
    };

    // Step 1: Customer login try karein
    this.http.post<LoginResponse>(this.customerLoginUrl, payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.handleCustomerSuccess(response);
      },
      error: () => {
        // Step 2: Agar Customer nahi mila, toh Vendor login try karein
        this.http
          .post<LoginResponse>(this.vendorLoginUrl, payload)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
          )
          .subscribe({
            next: (response) => {
              this.handleVendorSuccess(response);
            },
            error: (err: HttpErrorResponse) => {
              this.handleLoginError(err);
            },
          });
      },
    });
  }

  private handleCustomerSuccess(response: LoginResponse): void {
    this.successMessage = response?.message || 'Customer Login successful';
    const storage = this.rememberMe ? localStorage : sessionStorage;

    const dataToStore = response.user || response;
    storage.setItem('user', JSON.stringify(dataToStore));
    storage.setItem('role', 'CUSTOMER');
    storage.setItem('isLoggedIn', 'true');

    console.log('Saved customer data:', dataToStore);

    // Dashboard navigation
    this.router.navigate(['/customer-dashboard']);
  }

  private handleVendorSuccess(response: LoginResponse): void {
    this.successMessage = response?.message || 'Vendor Login successful';
    const storage = this.rememberMe ? localStorage : sessionStorage;

    // Agar response.vendor null ho toh pure response object ko fallback rakhein
    const dataToStore = response.vendor || response;
    storage.setItem('vendor', JSON.stringify(dataToStore));
    storage.setItem('role', 'VENDOR');
    storage.setItem('isLoggedIn', 'true');

    console.log('Saved vendor data:', dataToStore);

    // Dashboard navigation
    this.router.navigate(['/vendor-dashboard']);
  }

  private handleLoginError(err: HttpErrorResponse): void {
    this.loginFailed = true;

    if (err.status === 401 || err.status === 400 || err.status === 404) {
      this.errorMessage = 'Invalid email or password';
    } else if (err.status === 0) {
      this.errorMessage = 'Unable to reach server. Please check your connection.';
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
