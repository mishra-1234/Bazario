import { Router } from '@angular/router';
import { Component, OnInit, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type View =
  | 'home'
  | 'products'
  | 'categories'
  | 'wishlist'
  | 'orders'
  | 'profile'
  | 'editProfile'
  | 'addresses'
  | 'notifications'
  | 'password';
type Sort = 'featured' | 'low' | 'high' | 'rating';

export interface VendorShop {
  id: number;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  description: string;
  logo: string;
  status: string;
}

export interface Product {
  id: number;
  name: string;
  icon: string;
  imageUrl?: string;
  tint: string;
  category: string;
  description?: string;
  price: number;
  old: number;
  rating: number;
  vendorShop?: VendorShop; // <-- Backend se aane wala Vendor Information
}

interface Order {
  id: string;
  item: string;
  icon: string;
  total: number;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refund requested';
  product: number;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgTemplateOutlet],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css',
})
export class CustomerDashboard implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = 'http://localhost:8080/api/products';

  view = signal<View>('home');
  query = '';
  activeQuery = signal('');
  category = signal('All');
  sort = signal<Sort>('featured');
  maxPrice = signal(5000);
  showFilter = signal(false);
  accountOpen = signal(false);
  cartOpen = signal(false);
  detail = signal<Product | null>(null);
  showVendors = signal(false);
  tracking = signal<Order | null>(null);
  toast = signal('');
  private toastTimer: any;

  cart = signal<{ p: Product; qty: number }[]>([]);
  wishlist = signal<number[]>([]);
  checkedOut = signal(false);

  categories = [
    { name: 'Electronics', icon: '⚡' },
    { name: 'Drills', icon: '🔧' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Plants', icon: '🪴' },
    { name: 'Home & Garden', icon: '🏡' },
    { name: 'Kitchen', icon: '🍹' },
    { name: 'Garage Tools', icon: '🛞' },
  ];

  // Database se fetch kiye gaye products yahan store honge
  products = signal<Product[]>([]);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProductsFromBackend();
    }
  }

  // Backend MySQL se Products + Vendor information load karna
  loadProductsFromBackend(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        const mappedProducts: Product[] = data.map((item) => ({
          id: item.id,
          name: item.productName || item.name,
          icon: item.vendorShop?.logo || '📦',
          imageUrl: item.imageUrl,
          tint: '#f3f4f6',
          category: item.vendorShop?.category || 'General',
          description: item.description,
          price: item.price,
          old: item.price ? Math.round(item.price * 1.2) : 0,
          rating: 4.5,
          vendorShop: item.vendorShop, // Mapped vendor details
        }));
        this.products.set(mappedProducts);
      },
      error: (err) => {
        console.error('Error fetching products from backend:', err);
      },
    });
  }

  orders = signal<Order[]>([
    {
      id: 'BZ-10482',
      item: 'Cordless Hammer Drill 20V',
      icon: '🔧',
      total: 189,
      date: '24 Sep 2026',
      status: 'Shipped',
      product: 1,
    },
  ]);
  steps = ['Processing', 'Shipped', 'Out for delivery', 'Delivered'];

  notifications = signal([
    { text: 'Your order BZ-10482 has shipped.', time: '2h ago', read: false },
  ]);
  unread = computed(() => this.notifications().filter((n) => !n.read).length);

  profile = { name: 'Bazario Customer', email: 'customer@bazario.in', phone: '+91 98765 43210' };
  addresses = [{ label: 'Home', text: 'Plot 12, Jatani, Khordha, Odisha 752050' }];

  visible = computed(() => {
    const q = this.activeQuery().toLowerCase();
    let list = this.products().filter(
      (p) =>
        (this.category() === 'All' || p.category === this.category()) &&
        p.price <= this.maxPrice() &&
        p.name.toLowerCase().includes(q),
    );
    const s = this.sort();
    if (s === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (s === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (s === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  });

  wished = computed(() => this.products().filter((p) => this.wishlist().includes(p.id)));
  cartCount = computed(() => this.cart().reduce((n, i) => n + i.qty, 0));
  cartTotal = computed(() => this.cart().reduce((n, i) => n + i.qty * i.p.price, 0));

  money(n: number) {
    return '₹' + n.toFixed(2);
  }
  stars(r: number) {
    return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
  }

  go(v: View) {
    this.view.set(v);
    this.accountOpen.set(false);
    this.cartOpen.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  search() {
    this.activeQuery.set(this.query.trim());
    this.go('products');
  }
  pickCategory(c: string) {
    this.category.set(c);
    this.go('products');
  }
  toggleFilter() {
    this.showFilter.update((v) => !v);
  }
  setSort(s: Sort) {
    this.sort.set(s);
  }
  resetFilters() {
    this.category.set('All');
    this.maxPrice.set(5000);
    this.query = '';
    this.activeQuery.set('');
  }

  viewDetails(p: Product) {
    this.showVendors.set(false);
    this.detail.set(p);
  }
  closeDetail() {
    this.detail.set(null);
  }
  seeVendors() {
    this.showVendors.update((v) => !v);
  }

  addToCart(p: Product, price = p.price) {
    this.cart.update((c) => {
      const hit = c.find((i) => i.p.id === p.id);
      return hit
        ? c.map((i) => (i.p.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { p: { ...p, price }, qty: 1 }];
    });
    this.notify(`${p.name} added to cart`);
  }

  buyNow(p: Product) {
    this.cart.set([{ p, qty: 1 }]);
    this.detail.set(null);
    this.checkedOut.set(false);
    this.cartOpen.set(true);
  }
  changeQty(id: number, d: number) {
    this.cart.update((c) =>
      c.map((i) => (i.p.id === id ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0),
    );
  }
  toggleWish(p: Product) {
    const has = this.wishlist().includes(p.id);
    this.wishlist.update((w) => (has ? w.filter((x) => x !== p.id) : [...w, p.id]));
    this.notify(has ? 'Removed from wishlist' : 'Saved to wishlist');
  }
  isWished(id: number) {
    return this.wishlist().includes(id);
  }

  openCart() {
    this.checkedOut.set(false);
    this.cartOpen.set(true);
    this.accountOpen.set(false);
  }
  closeCart() {
    this.cartOpen.set(false);
  }
  checkout() {
    if (!this.cart().length) return;
    const n = this.orders().length + 10483;
    const added: Order[] = this.cart().map((i, k) => ({
      id: `BZ-${n + k}`,
      item: i.p.name,
      icon: i.p.icon,
      total: i.p.price * i.qty,
      date: '29 Sep 2026',
      status: 'Processing',
      product: i.p.id,
    }));
    this.orders.update((o) => [...added, ...o]);
    this.cart.set([]);
    this.checkedOut.set(true);
  }

  trackOrder(o: Order) {
    this.tracking.set(o);
  }
  closeTrack() {
    this.tracking.set(null);
  }
  stepIndex(o: Order) {
    return o.status === 'Processing'
      ? 0
      : o.status === 'Shipped'
        ? 1
        : o.status === 'Delivered'
          ? 3
          : 0;
  }
  cancelOrder(o: Order) {
    this.setStatus(o, 'Cancelled');
    this.notify(`Order ${o.id} cancelled`);
  }
  requestRefund(o: Order) {
    this.setStatus(o, 'Refund requested');
    this.notify(`Refund requested for ${o.id}`);
  }
  buyAgain(o: Order) {
    const p = this.products().find((x) => x.id === o.product);
    if (p) {
      this.addToCart(p);
      this.openCart();
    }
  }
  private setStatus(o: Order, s: Order['status']) {
    this.orders.update((l) => l.map((x) => (x.id === o.id ? { ...x, status: s } : x)));
  }

  markRead() {
    this.notifications.update((n) => n.map((x) => ({ ...x, read: true })));
  }

  saveProfile() {
    this.notify('Profile updated');
    this.go('profile');
  }

  changePassword() {
    this.notify('Password changed');
    this.go('profile');
  }

  logout(): void {
    this.accountOpen.set(false);
    this.cart.set([]);
    this.notify('You have been logged out');
    this.router.navigate(['/']);
  }

  notify(msg: string) {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 2400);
  }
}
