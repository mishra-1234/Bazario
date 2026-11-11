import { Component, OnInit, computed, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export type View = 'home' | 'products' | 'categories' | 'wishlist' | 'orders' | 'profile' | 'editProfile' | 'addresses' | 'notifications' | 'password';
export type Sort = 'featured' | 'low' | 'high' | 'rating';

export interface VendorShop {
  id: number;
  shopName: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  category?: string;
  address?: string;
  description?: string;
  logo?: string;
  status?: string;
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
  reviewsCount?: number;
  stock?: number;
  vendorShop?: VendorShop;
  discountPercent?: number;
}

export interface OrderItemDetail {
  id: number;
  productId?: number;
  productName: string;
  productImage?: string;
  category?: string;
  vendorShopId?: number;
  vendorShopName?: string;
  vendorShopLogo?: string;
  quantity: number;
  price: number;
  subtotal: number;
  status: string;
}

export interface CustomerOrderData {
  id: string; // e.g. "BZ-12345"
  numericId?: number;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  totalAmount: number;
  subtotal: number;
  couponCode?: string;
  discountAmount?: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refund requested';
  date: string;
  createdAt?: string;
  items: OrderItemDetail[];
  // Legacy compatibility helpers
  item?: string;
  icon?: string;
  total?: number;
  product?: number;
}

type Order = CustomerOrderData;

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgTemplateOutlet],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css',
})
export class CustomerDashboard implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private apiUrl = 'https://bazario-io58.onrender.com/api/products';
  private ordersUrl = 'https://bazario-io58.onrender.com/api/orders';
  private couponsUrl = 'https://bazario-io58.onrender.com/api/coupons';
  private reviewsUrl = 'https://bazario-io58.onrender.com/api/reviews';
  private shopsUrl = 'https://bazario-io58.onrender.com/api/shops';

  // Navigation & View State
  view = signal<View>('home');
  query = '';
  activeQuery = signal('');
  category = signal('All');
  sort = signal<Sort>('featured');
  maxPrice = signal(50000);
  showFilter = signal(false);
  accountOpen = signal(false);
  cartOpen = signal(false);
  detail = signal<Product | null>(null);
  detailQty = signal<number>(1);
  showVendors = signal(false);
  tracking = signal<CustomerOrderData | null>(null);
  toast = signal('');
  private toastTimer: any;

  // Selected Vendor Shop Filter for storefront browsing
  selectedShopFilter = signal<string>('All');

  // Customer Cart & Wishlist Signals
  cart = signal<{ p: Product; qty: number }[]>([]);
  wishlist = signal<number[]>([]);
  recentlyViewed = signal<Product[]>([]);
  checkedOut = signal(false);

  // Orders State & Filtering
  orders = signal<CustomerOrderData[]>([]);
  orderStatusFilter = signal<string>('All');
  orderSearchQuery = signal<string>('');

  // Coupon State
  couponCodeInput = '';
  appliedCouponCode = signal<string | null>(null);
  couponDiscount = signal<number>(0);
  activeCoupons = signal<any[]>([]);

  // Review State
  showReviewModal = signal(false);
  reviewProduct = signal<{ id: number; name: string; vendorShopId?: number } | null>(null);
  reviewRating = 5;
  reviewTitle = '';
  reviewComment = '';

  // Auth & Profile
  isLoggedIn = signal(false);
  profile = {
    id: 0,
    name: 'Bazario Customer',
    email: 'customer@bazario.in',
    phone: '+91 98765 43210'
  };

  addresses = [
    { label: 'Home (Default)', text: 'Plot 12, Jatani, Khordha, Odisha 752050' },
    { label: 'Work', text: 'Infocity Road, Patia, Bhubaneswar, Odisha 751024' }
  ];

  notifications = signal([
    { text: 'Welcome to Bazario Multi-vendor marketplace! Enjoy flat 20% off with BAZARIO20.', time: 'Just now', read: false },
    { text: 'Orders above ₹499 now qualify for Free Express Shipping.', time: '2 hours ago', read: false }
  ]);
  unread = computed(() => this.notifications().filter(n => !n.read).length);

  steps = ['Order Placed', 'Processing by Vendor', 'Shipped & In Transit', 'Out for Delivery', 'Delivered'];

  // Categories with high-resolution imagery and styling
  categories = [
    { name: 'Electronics', icon: '⚡', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=80', description: 'Gadgets, accessories & appliances' },
    { name: 'Furniture', icon: '🪑', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80', description: 'Modern crafted home decor' },
    { name: 'Drills & Tools', icon: '🔧', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=80', description: 'Professional hardware tools' },
    { name: 'Home & Garden', icon: '🪴', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=80', description: 'Indoor plants & decor' },
    { name: 'Grocery & Organic', icon: '🍎', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80', description: 'Fresh farm authentic produce' },
    { name: 'Fashion & Apparel', icon: '👗', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=80', description: 'Trendsetting apparel & style' },
    { name: 'Handicrafts & Art', icon: '🎨', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80', description: 'Handmade local artisan treasures' },
    { name: 'Sports & Fitness', icon: '🏏', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80', description: 'Gear for active champions' }
  ];

  // Database Products & Featured Vendors signals
  products = signal<Product[]>([]);
  featuredVendors = signal<VendorShop[]>([]);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
      this.loadCartFromStorage();
      this.loadWishlistFromStorage();
      this.loadProductsFromBackend();
      this.loadOrdersFromBackend();
      this.loadActiveCoupons();
      this.loadVendorsFromBackend();
    }
  }

  // Fallback high quality photography helper
  getFallbackImage(category: string, name: string): string {
    const cat = (category || '').toLowerCase();
    const n = (name || '').toLowerCase();

    if (cat.includes('electr') || n.includes('headphone') || n.includes('laptop') || n.includes('phone') || n.includes('speaker')) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
    }
    if (cat.includes('drill') || cat.includes('tool') || n.includes('drill') || n.includes('hammer') || n.includes('wrench')) {
      return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80';
    }
    if (cat.includes('furn') || n.includes('chair') || n.includes('sofa') || n.includes('table') || n.includes('desk')) {
      return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80';
    }
    if (cat.includes('plant') || cat.includes('garden') || n.includes('pot') || n.includes('flower') || n.includes('bonsai')) {
      return 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80';
    }
    if (cat.includes('groc') || cat.includes('organ') || cat.includes('food') || n.includes('badam') || n.includes('almond') || n.includes('tea')) {
      return 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80';
    }
    if (cat.includes('sport') || cat.includes('fit') || n.includes('bat') || n.includes('ball') || n.includes('gym')) {
      return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';
    }
    if (cat.includes('fash') || cat.includes('cloth') || n.includes('shirt') || n.includes('dress') || n.includes('jacket')) {
      return 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80';
    }
    if (cat.includes('handicraft') || cat.includes('art') || n.includes('vase') || n.includes('clay') || n.includes('craft')) {
      return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  }

  loadUserProfile(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        const resolvedId = u.id ? Number(u.id) : (u.user?.id ? Number(u.user.id) : 0);
        const resolvedName = u.name || u.user?.name || 'Bazario Customer';
        const resolvedEmail = u.email || u.user?.email || 'customer@bazario.in';
        const resolvedPhone = u.phone || u.user?.phone || '+91 98765 43210';

        this.profile = {
          id: resolvedId,
          name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone
        };
        this.isLoggedIn.set(true);
      } catch (e) {
        console.error('Invalid user data in storage:', e);
      }
    }
  }

  loadProductsFromBackend(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        const uniqueMap = new Map<number, Product>();
        const shopSet = new Map<number, VendorShop>();

        for (const item of data) {
          if (!uniqueMap.has(item.id)) {
            const rawImg = item.imageUrl;
            const validImg = rawImg && rawImg.trim() !== '' && rawImg !== '?' && !rawImg.startsWith('?')
              ? rawImg.trim()
              : this.getFallbackImage(item.category || item.vendorShop?.category || '', item.productName || item.name || '');

            const price = Number(item.price) || 0;
            const discount = Number(item.discount) || 0;
            let oldPrice = price;
            if (discount > 0) {
              oldPrice = Math.round(price / (1 - (discount / 100)));
            } else {
              oldPrice = Math.round(price * 1.25);
            }

            const discountPercent = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

            const productObj: Product = {
              id: item.id,
              name: item.productName || item.name || 'Bazario Product',
              icon: item.vendorShop?.logo || '📦',
              imageUrl: validImg,
              tint: '#f8fafc',
              category: item.category || item.vendorShop?.category || 'General',
              description: item.description || 'Verified product from trusted seller on Bazario Marketplace.',
              price: price,
              old: oldPrice,
              rating: item.rating ? Number(item.rating) : 4.8,
              reviewsCount: 12 + ((item.id * 7) % 35),
              stock: item.stock != null ? Number(item.stock) : 25,
              vendorShop: item.vendorShop,
              discountPercent: discountPercent
            };

            uniqueMap.set(item.id, productObj);

            if (item.vendorShop && item.vendorShop.id && !shopSet.has(item.vendorShop.id)) {
              shopSet.set(item.vendorShop.id, item.vendorShop);
            }
          }
        }

        const productList = Array.from(uniqueMap.values());
        this.products.set(productList);

        if (this.featuredVendors().length === 0 && shopSet.size > 0) {
          this.featuredVendors.set(Array.from(shopSet.values()));
        }
      },
      error: (err) => {
        console.error('Error fetching products from backend:', err);
      }
    });
  }

  loadVendorsFromBackend(): void {
    this.http.get<VendorShop[]>(this.shopsUrl).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const activeOnly = data.filter(s => !s.status || s.status.toLowerCase() === 'active');
          this.featuredVendors.set(activeOnly.length > 0 ? activeOnly : data);
        }
      },
      error: () => {
        // Fallback vendor list if endpoint returns non-200
        if (this.featuredVendors().length === 0) {
          this.featuredVendors.set([
            { id: 1, shopName: 'GreenThumb Nurseries', ownerName: 'Aarav Sharma', category: 'Gardening & Plants', logo: '🪴', status: 'Active', address: 'Jatani Market, Khordha' },
            { id: 2, shopName: 'TechVibe Electronics', ownerName: 'Priya Patnaik', category: 'Electronics', logo: '⚡', status: 'Active', address: 'Saheed Nagar, Bhubaneswar' },
            { id: 3, shopName: 'Heritage Woodworks', ownerName: 'Rajesh Das', category: 'Furniture', logo: '🪑', status: 'Active', address: 'Old Town, Bhubaneswar' },
            { id: 4, shopName: 'Odisha Organic Farm', ownerName: 'Smita Jena', category: 'Grocery & Organic', logo: '🍎', status: 'Active', address: 'Baramunda, Bhubaneswar' }
          ]);
        }
      }
    });
  }

  loadActiveCoupons(): void {
    this.http.get<any[]>(`${this.couponsUrl}/active`).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.activeCoupons.set(data);
        } else {
          this.setDefaultCoupons();
        }
      },
      error: () => {
        this.setDefaultCoupons();
      }
    });
  }

  private setDefaultCoupons(): void {
    this.activeCoupons.set([
      { code: 'BAZARIO20', discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: 0, description: 'Get 20% off on all items' },
      { code: 'SAVE100', discountType: 'FLAT', discountValue: 100, minOrderAmount: 500, description: 'Flat ₹100 off on orders above ₹500' },
      { code: 'FESTIVE15', discountType: 'PERCENTAGE', discountValue: 15, minOrderAmount: 300, description: 'Extra 15% discount for festival deals' }
    ]);
  }

  loadOrdersFromBackend(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    let userId: number | null = null;
    let userEmail: string = '';
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        userId = u.id ? Number(u.id) : (u.user?.id ? Number(u.user.id) : null);
        userEmail = u.email || u.user?.email || '';
      } catch (e) {}
    }

    let url = this.ordersUrl;
    if (userId) {
      url = `${this.ordersUrl}/customer/${userId}${userEmail ? '?email=' + encodeURIComponent(userEmail) : ''}`;
    }

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          const mapped: CustomerOrderData[] = data.map((o: any) => {
            const rawItems = o.items || [];
            let itemsSubtotal = 0;

            const items: OrderItemDetail[] = rawItems.map((item: any) => {
              const p = item.product;
              const vs = item.vendorShop;
              const subtotal = item.subtotal != null ? Number(item.subtotal) : (Number(item.price) * Number(item.quantity));
              itemsSubtotal += subtotal;

              const fallbackImg = this.getFallbackImage(p?.category || vs?.category || '', p?.productName || p?.name || '');
              const validImg = p?.imageUrl && p.imageUrl.trim() !== '' && p.imageUrl !== '?' ? p.imageUrl : fallbackImg;

              return {
                id: item.id,
                productId: p?.id,
                productName: p?.productName || p?.name || 'Bazario Item',
                productImage: validImg,
                category: p?.category || vs?.category || 'General',
                vendorShopId: vs?.id,
                vendorShopName: vs?.shopName || 'Verified Seller',
                vendorShopLogo: vs?.logo || '🏪',
                quantity: item.quantity || 1,
                price: item.price != null ? Number(item.price) : 0,
                subtotal: subtotal,
                status: item.status || o.status || 'Processing'
              };
            });

            const firstItem = items.length > 0 ? items[0] : null;
            const title = firstItem
              ? firstItem.productName + (items.length > 1 ? ` (+${items.length - 1} more items)` : '')
              : 'Marketplace Order';

            return {
              id: o.orderNumber || `BZ-${o.id}`,
              numericId: o.id,
              orderNumber: o.orderNumber || `BZ-${o.id}`,
              customerName: o.customerName || this.profile.name,
              customerEmail: o.customerEmail || this.profile.email,
              customerPhone: o.customerPhone || this.profile.phone,
              shippingAddress: o.shippingAddress || this.addresses[0]?.text,
              totalAmount: o.totalAmount != null ? Number(o.totalAmount) : itemsSubtotal,
              subtotal: itemsSubtotal > 0 ? itemsSubtotal : (Number(o.totalAmount) || 0),
              couponCode: o.couponCode,
              discountAmount: o.discountAmount != null ? Number(o.discountAmount) : 0,
              status: o.status || 'Processing',
              date: o.createdAt ? o.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
              createdAt: o.createdAt,
              items: items,
              // Legacy fields
              item: title,
              icon: firstItem?.vendorShopLogo || '🛍️',
              total: o.totalAmount != null ? Number(o.totalAmount) : itemsSubtotal,
              product: firstItem?.productId || 0
            };
          });

          this.orders.set(mapped);
        } else {
          this.orders.set([]);
        }
      },
      error: (err) => {
        console.error('Failed to load orders from backend:', err);
      }
    });
  }

  // Curated Computed Sections
  featuredProducts = computed(() => this.products().filter(p => p.rating >= 4.4).slice(0, 8));
  trendingDeals = computed(() => this.products().filter(p => p.old > p.price).slice(0, 4));
  recentlyAdded = computed(() => [...this.products()].reverse().slice(0, 4));
  bestSellers = computed(() => this.products().slice(0, 8));

  // Filtered Products for the Products Catalog view
  visible = computed(() => {
    const q = this.activeQuery().toLowerCase();
    const shopFilter = this.selectedShopFilter();

    let list = this.products().filter(p => {
      const matchCat = this.category() === 'All' || p.category === this.category();
      const matchPrice = p.price <= this.maxPrice();
      const matchQuery = p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
      const matchShop = shopFilter === 'All' || (p.vendorShop && p.vendorShop.shopName === shopFilter);
      return matchCat && matchPrice && matchQuery && matchShop;
    });

    const s = this.sort();
    if (s === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (s === 'high') list = [...list].sort((a, b) => b.price - a.price);
    if (s === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  });

  // Filtered Orders for the My Orders view
  filteredOrders = computed(() => {
    const filter = this.orderStatusFilter();
    const query = this.orderSearchQuery().toLowerCase().trim();

    return this.orders().filter(o => {
      const matchStatus = filter === 'All' || o.status.toLowerCase() === filter.toLowerCase();
      const matchQuery = !query ||
        o.id.toLowerCase().includes(query) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(query)) ||
        o.items.some(i => i.productName.toLowerCase().includes(query) || (i.vendorShopName && i.vendorShopName.toLowerCase().includes(query)));
      return matchStatus && matchQuery;
    });
  });

  wished = computed(() => this.products().filter(p => this.wishlist().includes(p.id)));
  cartCount = computed(() => this.cart().reduce((n, i) => n + i.qty, 0));
  cartTotal = computed(() => this.cart().reduce((n, i) => n + i.qty * i.p.price, 0));
  finalCartTotal = computed(() => Math.max(0, this.cartTotal() - this.couponDiscount()));

  // Local Storage Cart & Wishlist Sync
  private saveCartToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('bazario_customer_cart', JSON.stringify(this.cart()));
      } catch (e) {}
    }
  }

  private loadCartFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const raw = localStorage.getItem('bazario_customer_cart');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.cart.set(parsed);
          }
        }
      } catch (e) {}
    }
  }

  private saveWishlistToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('bazario_customer_wishlist', JSON.stringify(this.wishlist()));
      } catch (e) {}
    }
  }

  private loadWishlistFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const raw = localStorage.getItem('bazario_customer_wishlist');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.wishlist.set(parsed);
          }
        }
      } catch (e) {}
    }
  }

  // Coupon Methods
  applyCoupon(): void {
    if (!this.couponCodeInput.trim()) {
      this.notify('Please enter a coupon code');
      return;
    }

    const payload = {
      code: this.couponCodeInput.trim().toUpperCase(),
      customerEmail: this.profile.email,
      subtotal: this.cartTotal(),
      items: this.cart().map(item => ({
        productId: item.p.id,
        quantity: item.qty,
        price: item.p.price
      }))
    };

    this.http.post<any>(`${this.couponsUrl}/validate`, payload).subscribe({
      next: (res) => {
        if (res.valid) {
          this.appliedCouponCode.set(res.couponCode);
          this.couponDiscount.set(res.discountAmount || 0);
          this.notify(`Coupon ${res.couponCode} applied! Saved ${this.money(res.discountAmount)}`);
        } else {
          this.notify(res.message || 'Invalid coupon code');
        }
      },
      error: (err) => {
        console.error('Coupon validation failed:', err);
        this.notify(err.error?.message || 'Failed to validate coupon');
      }
    });
  }

  copyAndApplyCoupon(code: string): void {
    this.couponCodeInput = code;
    this.openCart();
    this.applyCoupon();
  }

  removeCoupon(): void {
    this.appliedCouponCode.set(null);
    this.couponDiscount.set(0);
    this.couponCodeInput = '';
    this.notify('Coupon removed');
  }

  // Review Methods
  openReviewModal(target: { id?: number; productId?: number; name?: string; productName?: string; vendorShopId?: number }): void {
    const prodId = target.productId || target.id || 0;
    const prodName = target.productName || target.name || 'Product';
    this.reviewProduct.set({ id: prodId, name: prodName, vendorShopId: target.vendorShopId });
    this.reviewRating = 5;
    this.reviewTitle = '';
    this.reviewComment = '';
    this.showReviewModal.set(true);
  }

  closeReviewModal(): void {
    this.showReviewModal.set(false);
    this.reviewProduct.set(null);
  }

  submitCustomerReview(): void {
    const prod = this.reviewProduct();
    if (!prod) return;
    if (!this.reviewTitle.trim() && !this.reviewComment.trim()) {
      this.notify('Please write a review comment');
      return;
    }

    const payload = {
      productId: prod.id,
      vendorShopId: prod.vendorShopId,
      customerName: this.profile.name,
      customerEmail: this.profile.email,
      rating: this.reviewRating,
      title: this.reviewTitle.trim() || 'Verified Purchase Review',
      comment: this.reviewComment.trim()
    };

    this.http.post<any>(this.reviewsUrl, payload).subscribe({
      next: () => {
        this.notify('Thank you! Your verified review has been published.');
        this.closeReviewModal();
      },
      error: (err) => {
        console.error('Failed to submit review:', err);
        this.notify('Failed to submit review.');
      }
    });
  }

  money(n: number) { return '₹' + (Number(n) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  stars(r: number) { return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)); }

  go(v: View) {
    this.view.set(v);
    this.accountOpen.set(false);
    this.cartOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  search() {
    this.activeQuery.set(this.query.trim());
    this.selectedShopFilter.set('All');
    this.go('products');
  }

  pickCategory(c: string) {
    this.category.set(c);
    this.selectedShopFilter.set('All');
    this.go('products');
  }

  filterByShop(shopName: string): void {
    this.selectedShopFilter.set(shopName);
    this.category.set('All');
    this.go('products');
    this.notify(`Showing products from ${shopName}`);
  }

  toggleFilter() { this.showFilter.update(v => !v); }
  setSort(s: Sort) { this.sort.set(s); }
  resetFilters() {
    this.category.set('All');
    this.maxPrice.set(50000);
    this.query = '';
    this.activeQuery.set('');
    this.selectedShopFilter.set('All');
  }

  viewDetails(p: Product) {
    this.showVendors.set(false);
    this.detailQty.set(1);
    this.detail.set(p);

    // Track recently viewed
    this.recentlyViewed.update(list => {
      const filtered = list.filter(item => item.id !== p.id);
      return [p, ...filtered].slice(0, 6);
    });
  }

  closeDetail() { this.detail.set(null); }
  seeVendors() { this.showVendors.update(v => !v); }

  onImgError(event: any, category = 'General', name = 'Product'): void {
    const fallback = this.getFallbackImage(category, name);
    if (event.target.src !== fallback) {
      event.target.src = fallback;
    }
  }

  addToCart(p: Product, quantity = 1, price = p.price) {
    const availableStock = p.stock != null ? p.stock : 99;
    if (availableStock <= 0) {
      this.notify(`Sorry, ${p.name} is currently Out of Stock`);
      return;
    }

    this.cart.update(c => {
      const hit = c.find(i => i.p.id === p.id);
      if (hit) {
        const nextQty = Math.min(hit.qty + quantity, availableStock);
        return c.map(i => i.p.id === p.id ? { ...i, qty: nextQty } : i);
      } else {
        const initialQty = Math.min(quantity, availableStock);
        return [...c, { p: { ...p, price }, qty: initialQty }];
      }
    });

    this.saveCartToStorage();
    this.notify(`${p.name} (${quantity}) added to cart`);
  }

  buyNow(p: Product) {
    const availableStock = p.stock != null ? p.stock : 99;
    if (availableStock <= 0) {
      this.notify(`Sorry, ${p.name} is currently Out of Stock`);
      return;
    }

    this.cart.set([{ p, qty: 1 }]);
    this.saveCartToStorage();
    this.detail.set(null);
    this.checkedOut.set(false);
    this.cartOpen.set(true);
  }

  changeQty(id: number, d: number) {
    this.cart.update(c => {
      return c.map(i => {
        if (i.p.id === id) {
          const max = i.p.stock != null ? i.p.stock : 99;
          const next = i.qty + d;
          return { ...i, qty: Math.min(Math.max(next, 0), max) };
        }
        return i;
      }).filter(i => i.qty > 0);
    });
    this.saveCartToStorage();
  }

  toggleWish(p: Product) {
    const has = this.wishlist().includes(p.id);
    this.wishlist.update(w => has ? w.filter(x => x !== p.id) : [...w, p.id]);
    this.saveWishlistToStorage();
    this.notify(has ? 'Removed from wishlist' : 'Saved to wishlist ♡');
  }

  isWished(id: number) { return this.wishlist().includes(id); }

  openCart() { this.checkedOut.set(false); this.cartOpen.set(true); this.accountOpen.set(false); }
  closeCart() { this.cartOpen.set(false); }

  checkout() {
    if (!this.cart().length) return;

    let userId: number | null = null;
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          userId = u.id ? Number(u.id) : (u.user?.id ? Number(u.user.id) : null);
        } catch (e) {}
      }
    }

    const payload = {
      userId: userId,
      customerName: this.profile.name,
      customerEmail: this.profile.email,
      customerPhone: this.profile.phone,
      shippingAddress: this.addresses[0]?.text || 'Plot 12, Jatani, Khordha, Odisha 752050',
      couponCode: this.appliedCouponCode() || undefined,
      items: this.cart().map((item) => ({
        productId: item.p.id,
        quantity: item.qty
      }))
    };

    this.http.post<any>(this.ordersUrl, payload).subscribe({
      next: (createdOrder) => {
        this.cart.set([]);
        this.saveCartToStorage();
        this.appliedCouponCode.set(null);
        this.couponDiscount.set(0);
        this.couponCodeInput = '';
        this.checkedOut.set(true);
        this.notify(`Order ${createdOrder.orderNumber || ''} placed successfully!`);
        this.loadOrdersFromBackend();
        this.loadProductsFromBackend(); // refresh stock
      },
      error: (err) => {
        console.error('Checkout error:', err);
        const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Order checkout failed. Please check stock.');
        this.notify(msg);
      }
    });
  }

  trackOrder(o: CustomerOrderData) { this.tracking.set(o); }
  closeTrack() { this.tracking.set(null); }

  stepIndex(o: CustomerOrderData): number {
    const s = (o.status || '').toLowerCase();
    if (s.includes('deliver')) return 4;
    if (s.includes('out')) return 3;
    if (s.includes('ship')) return 2;
    if (s.includes('process')) return 1;
    return 0;
  }

  cancelOrder(o: CustomerOrderData) {
    const targetId = o.numericId ? o.numericId : o.id.replace('BZ-', '');
    const userIdParam = this.profile.id > 0 ? `?userId=${this.profile.id}` : '';

    this.http.put<any>(`${this.ordersUrl}/${targetId}/cancel${userIdParam}`, {}).subscribe({
      next: (updatedOrder) => {
        this.setStatus(o, 'Cancelled');
        this.notify(`Order ${o.id} has been cancelled. Inventory restored.`);
        this.loadProductsFromBackend();
      },
      error: (err) => {
        console.error('Cancel order failed:', err);
        this.setStatus(o, 'Cancelled');
        this.notify(`Order ${o.id} cancelled`);
        this.loadProductsFromBackend();
      }
    });
  }

  requestRefund(o: CustomerOrderData) {
    this.setStatus(o, 'Refund requested');
    this.notify(`Refund requested for ${o.id}. A support specialist will contact you.`);
  }

  buyAgain(target: any) {
    const prodId = target.productId || target.product || target.id;
    const found = this.products().find(x => x.id === prodId);

    if (found) {
      this.addToCart(found, 1);
      this.openCart();
    } else {
      // Reconstruct product from order item
      const p: Product = {
        id: prodId,
        name: target.productName || target.item || 'Reordered Product',
        icon: target.vendorShopLogo || '📦',
        imageUrl: target.productImage || this.getFallbackImage('', ''),
        tint: '#f8fafc',
        category: target.category || 'General',
        price: target.price || target.total || 0,
        old: Math.round((target.price || target.total || 0) * 1.2),
        rating: 4.8,
        stock: 50
      };
      this.addToCart(p, 1);
      this.openCart();
    }
  }

  private setStatus(o: CustomerOrderData, s: CustomerOrderData['status']) {
    this.orders.update(l => l.map(x => x.id === o.id ? { ...x, status: s } : x));
  }

  markRead() { this.notifications.update(n => n.map(x => ({ ...x, read: true }))); }
  saveProfile() { this.notify('Profile updated successfully'); this.go('profile'); }
  changePassword() { this.notify('Password changed securely'); this.go('profile'); }
  logout() {
    this.isLoggedIn.set(false);
    this.accountOpen.set(false);
    this.cart.set([]);
    this.saveCartToStorage();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
    this.notify('You have been logged out');
    this.router.navigate(['/login']);
  }

  notify(msg: string) {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 2600);
  }
}
