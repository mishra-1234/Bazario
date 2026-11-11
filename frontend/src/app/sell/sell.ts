import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './sell.html',
  styleUrl: './sell.css'
})
export class Sell {
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Pop-up state for missing required sections
  showMissingModal = false;
  missingFields: string[] = [];

  seller = {
    fullName: '',
    email: '',
    phone: '',
    storeName: '',
    gstNumber: '', // Optional
    category: '',
    city: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private http: HttpClient) {}

  closeMissingModal(): void {
    this.showMissingModal = false;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.missingFields = [];

    // Identify missing required sections (GST is optional)
    if (!this.seller.fullName?.trim()) {
      this.missingFields.push('Full Name');
    }
    if (!this.seller.email?.trim()) {
      this.missingFields.push('Email Address');
    }
    if (!this.seller.phone?.trim()) {
      this.missingFields.push('Mobile Number');
    }
    if (!this.seller.storeName?.trim()) {
      this.missingFields.push('Store / Business Name');
    }
    if (!this.seller.category?.trim()) {
      this.missingFields.push('Primary Category');
    }
    if (!this.seller.city?.trim()) {
      this.missingFields.push('City & State');
    }
    if (!this.seller.password?.trim()) {
      this.missingFields.push('Create Password');
    }
    if (!this.seller.confirmPassword?.trim()) {
      this.missingFields.push('Confirm Password');
    }

    if (this.missingFields.length > 0) {
      this.showMissingModal = true;
      return;
    }

    if (this.seller.password !== this.seller.confirmPassword) {
      this.errorMessage = 'Passwords do not match. Please verify.';
      return;
    }

    this.isSubmitting = true;

    const payload = {
      fullName: this.seller.fullName.trim(),
      email: this.seller.email.trim(),
      phone: this.seller.phone.trim(),
      storeName: this.seller.storeName.trim(),
      gstNumber: this.seller.gstNumber?.trim() || '',
      category: this.seller.category,
      city: this.seller.city.trim(),
      password: this.seller.password
    };

    this.http.post<any>('https://bazario-io58.onrender.com/api/sellers/register', payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.message || 'Registration successful! Your seller account has been registered.';
        this.seller = {
          fullName: '',
          email: '',
          phone: '',
          storeName: '',
          gstNumber: '',
          category: '',
          city: '',
          password: '',
          confirmPassword: ''
        };
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (err.error && typeof err.error === 'object' && err.error.error) {
          this.errorMessage = err.error.error;
        } else if (err.status === 409) {
          this.errorMessage = 'A seller with this email address is already registered.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot reach backend server. Please verify Spring Boot is running on port 8080.';
        } else {
          this.errorMessage = err.message || 'Failed to submit registration. Please try again.';
        }
      }
    });
  }
}
