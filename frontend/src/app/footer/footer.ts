import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface PaymentMethod {
  label: string;
  icon: string;
}

interface AppBadge {
  label: string;
  sub: string;
  icon: string;
}


@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit, AfterViewInit, OnDestroy {
  currentYear = new Date().getFullYear();

  columns: FooterColumn[] = [
    {
      title: 'Shop',
      links: [
        { label: 'All Categories', href: '/categories' },
        { label: 'Trending Products', href: '/shop' },
        { label: "Today's Deals", href: '/deals' },
        { label: 'New Arrivals', href: '/new' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Bazario', href: '/about' },
        { label: 'Sell With Us', href: '/sell' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press & Media', href: '/press' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Track Your Order', href: '/track' },
        { label: 'Returns & Refunds', href: '/returns' },
        { label: 'Contact Us', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Seller Agreement', href: '/seller-agreement' },
        { label: 'Grievance Redressal', href: '/grievance' },
      ],
    },
  ];

  paymentMethods: PaymentMethod[] = [
    { label: 'UPI', icon: '🔗' },
    { label: 'Visa', icon: '💳' },
    { label: 'Mastercard', icon: '💳' },
    { label: 'RuPay', icon: '💳' },
    { label: 'COD', icon: '💵' },
    { label: 'Net Banking', icon: '🏦' },
  ];

  appBadges: AppBadge[] = [
    { label: 'Download on the', sub: 'App Store', icon: '' },
    { label: 'Get it on', sub: 'Google Play', icon: '▶' },
  ];

  socials = [
    { name: 'Facebook', short: 'f' },
    { name: 'Instagram', short: 'ig' },
    { name: 'LinkedIn', short: 'in' },
    { name: 'YouTube', short: '▶' },
    { name: 'X', short: 'x' },
  ];

  newsletterEmail = '';
  newsletterSubmitted = false;

  showBackToTop = false;

  private observer?: IntersectionObserver;

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in-view');
              this.observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );

      const revealEls = this.host.nativeElement.querySelectorAll('[reveal]');
      revealEls.forEach((el) => this.observer?.observe(el));
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showBackToTop = window.scrollY > 480;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  submitNewsletter(event: Event): void {
    event.preventDefault();
    if (!this.newsletterEmail.trim()) return;
    this.newsletterSubmitted = true;
    setTimeout(() => {
      this.newsletterSubmitted = false;
      this.newsletterEmail = '';
    }, 3000);
  }
}
