import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

interface TopicCard {
  icon: string;
  title: string;
  faqIndex: number;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Header, Footer],
  templateUrl: './help.html',
  styleUrl: './help.css'
})

export class Help {
  buyerFaqs: FaqItem[] = [
    { question: 'How can I track my order?', answer: 'You can track your order in the "My Orders" section. Click on the order to see real-time updates.', open: false },
    { question: 'What is the refund timeline?', answer: 'Refunds typically take 5-7 business days to reflect in your original payment method.', open: false },
    { question: 'How do I start a return process?', answer: 'Go to your order details, select the item you want to return, and click "Return Item". Follow the on-screen instructions.', open: false },
    { question: 'What payment methods are supported?', answer: 'We support UPI, Cash on Delivery (COD), Credit/Debit Cards, and Net Banking.', open: false },
    { question: 'What is the standard delivery time?', answer: 'Standard delivery time is between 3-7 days depending on your location and the seller.', open: false },
    { question: 'How can I cancel my order?', answer: 'You can cancel your order before it is shipped from the "My Orders" section. Once shipped, you will have to request a return.', open: false },
    { question: 'How do I report a seller?', answer: 'You can report a seller directly from their store page or by raising a ticket through this Help Center.', open: false },
    { question: 'I forgot my account password. What do I do?', answer: 'Click on "Forgot Password" on the login page and follow the instructions sent to your registered email or phone.', open: false },
  ];

  sellerFaqs: FaqItem[] = [
    { question: 'How do I open a store?', answer: 'Register as a seller using your GST and PAN details. Once verified, you can set up your store profile.', open: false },
    { question: 'How can I list my products?', answer: 'Use the Seller Dashboard to add products individually or bulk upload them via CSV.', open: false },
    { question: 'What is the commission rate?', answer: 'Bazario charges a commission rate between 8-15% depending on the product category.', open: false },
    { question: 'What is the payout schedule?', answer: 'Payouts are processed weekly. You must have a minimum balance of ₹500 to receive a payout.', open: false },
    { question: 'How do I manage my orders?', answer: 'All incoming orders can be viewed and managed in the "Orders" tab of your Seller Dashboard.', open: false },
    { question: 'How does KYC/GST verification work?', answer: 'Upload your GST certificate and PAN card during registration. Our team will verify them within 48 hours.', open: false },
    { question: 'What are the seller policies?', answer: 'Sellers must adhere to fair pricing, timely shipping, and authentic product listings. Read our full seller agreement for details.', open: false },
    { question: 'What are the requirements for product images?', answer: 'Images must be high resolution, have a clear white background, and accurately represent the product.', open: false },
  ];

  activeTab: 'buyer' | 'seller' = 'buyer';

  buyerTopics: TopicCard[] = [
    { icon: '📦', title: 'Track My Order', faqIndex: 0 },
    { icon: '💰', title: 'Refunds & Returns', faqIndex: 1 },
    { icon: '💳', title: 'Payment Issues', faqIndex: 3 },
    { icon: '🚚', title: 'Shipping & Delivery', faqIndex: 4 },
    { icon: '👤', title: 'Account Issues', faqIndex: 7 },
    { icon: '🚨', title: 'Report a Problem', faqIndex: 6 },
  ];

  sellerTopics: TopicCard[] = [
    { icon: '🏪', title: 'Open Your Store', faqIndex: 0 },
    { icon: '📝', title: 'List Products', faqIndex: 1 },
    { icon: '💵', title: 'Commission & Payouts', faqIndex: 2 },
    { icon: '📋', title: 'Manage Orders', faqIndex: 4 },
    { icon: '✅', title: 'KYC & Verification', faqIndex: 5 },
    { icon: '📜', title: 'Seller Policies', faqIndex: 6 },
  ];

  searchQuery: string = '';

  ticketName: string = '';
  ticketEmail: string = '';
  ticketOrderId: string = '';
  ticketIssueType: string = '';
  ticketMessage: string = '';

  issueTypes: string[] = [
    'Order Related',
    'Refund or Return',
    'Payment Issue',
    'Account Issue',
    'Selling on Bazario',
    'Other'
  ];

  isSubmitting: boolean = false;
  ticketSuccess: string = '';
  ticketError: string = '';

  lookupTicketId: string = '';
  lookupResult: any = null;
  lookupError: string = '';

  constructor(private http: HttpClient) {}

  filteredFaqs() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return [];

    const allFaqs = [
      ...this.buyerFaqs.map(f => ({ ...f, type: 'Buyer' })),
      ...this.sellerFaqs.map(f => ({ ...f, type: 'Seller' }))
    ];

    return allFaqs.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  }

  toggleFaq(tab: 'buyer' | 'seller', index: number) {
    if (tab === 'buyer') {
      this.buyerFaqs[index].open = !this.buyerFaqs[index].open;
    } else {
      this.sellerFaqs[index].open = !this.sellerFaqs[index].open;
    }
  }

  scrollToFaq(faqIndex: number) {
    const el = document.getElementById('faq-' + faqIndex);
    if (el) {
      if (this.activeTab === 'buyer') {
        this.buyerFaqs[faqIndex].open = true;
      } else {
        this.sellerFaqs[faqIndex].open = true;
      }
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  submitTicket() {
    if (!this.ticketName || !this.ticketEmail || !this.ticketIssueType || !this.ticketMessage) {
      this.ticketError = 'Please fill out all required fields.';
      return;
    }
    this.isSubmitting = true;
    this.ticketSuccess = '';
    this.ticketError = '';

    const payload = {
      name: this.ticketName,
      email: this.ticketEmail,
      orderId: this.ticketOrderId,
      issueType: this.ticketIssueType,
      message: this.ticketMessage
    };

    this.http.post<any>('https://bazario-io58.onrender.com/api/tickets', payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.ticketSuccess = `Ticket submitted successfully! Your Ticket ID is: ${res.id || res.ticketId || 'generated successfully'}`;
        this.ticketName = '';
        this.ticketEmail = '';
        this.ticketOrderId = '';
        this.ticketIssueType = '';
        this.ticketMessage = '';
      },
      error: (err) => {
        this.isSubmitting = false;
        this.ticketError = 'Failed to submit ticket. Please try again.';
      }
    });
  }

  lookupTicket() {
    if (!this.lookupTicketId.trim()) return;
    this.lookupResult = null;
    this.lookupError = '';

    this.http.get<any>(`https://bazario-io58.onrender.com/api/tickets/${this.lookupTicketId.trim()}`).subscribe({
      next: (res) => {
        this.lookupResult = res;
      },
      error: (err) => {
        this.lookupError = 'Ticket not found or error fetching details.';
      }
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-default';
    switch(status.toUpperCase()) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'RESOLVED': return 'status-resolved';
      case 'CLOSED': return 'status-closed';
      default: return 'status-default';
    }
  }
}
