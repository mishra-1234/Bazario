import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  image: string;
  status: 'Active' | 'Draft' | 'Out of Stock';
}

interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  amount: number;
  date: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  status:
    | 'Pending'
    | 'Confirmed'
    | 'Processing'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled'
    | 'Return Requested'
    | 'Returned';
}

interface InventoryItem {
  product: string;
  currentStock: number;
  minStock: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

interface Review {
  id: number;
  product: string;
  customer: string;
  rating: number;
  review: string;
  date: string;
  reply: string;
  replyDraft: string;
}

interface Coupon {
  id: number;
  code: string;
  discount: number;
  minOrder: number;
  startDate: string;
  expiryDate: string;
  status: 'Active' | 'Disabled';
}

interface NotificationItem {
  id: number;
  type:
    | 'New Order'
    | 'Low Stock'
    | 'Out of Stock'
    | 'New Review'
    | 'Return Request'
    | 'Payment Update'
    | 'Admin Message';
  message: string;
  time: string;
  read: boolean;
}

interface ChatMessage {
  sender: 'vendor' | 'ai';
  text: string;
}

interface VendorShop {
  id: number;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  address: string;
  description: string;
  logo: string;
  status: 'Active' | 'Pending' | 'Suspended';
}

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-dashboard.html',
  styleUrl: './vendor-dashboard.css',
})
export class VendorDashboard implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private shopsApiUrl = 'http://localhost:8080/api/shops';
  private productsApiUrl = 'http://localhost:8080/api/products';
  private vendorsApiUrl = 'http://localhost:8080/vendors'; // Vendor profile fetch karne ke liye URL

  activeSection: string = 'dashboard';

  private getLoggedInVendorId(): number | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const vendorData = localStorage.getItem('vendor') || sessionStorage.getItem('vendor');

    if (!vendorData) {
      return null;
    }

    try {
      const data = JSON.parse(vendorData);

      // Yeh check karega ki ID direct hai ya nested vendor object ke andar hai
      const vendorId = data.id || (data.vendor && data.vendor.id);

      return vendorId ? Number(vendorId) : null;
    } catch (error) {
      console.error('Invalid vendor data:', error);
      return null;
    }
  }

  navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { key: 'shops', label: 'Create Vendor Shop', icon: '🏪' },
    { key: 'products', label: 'Products', icon: '📦' },
    { key: 'orders', label: 'Orders', icon: '🛒' },
    { key: 'inventory', label: 'Inventory', icon: '📋' },
    { key: 'sales', label: 'Sales & Earnings', icon: '💰' },
    { key: 'reviews', label: 'Reviews & Ratings', icon: '⭐' },
    { key: 'coupons', label: 'Coupons & Offers', icon: '🎟️' },
    { key: 'ai', label: 'AI Assistant', icon: '🤖' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'profile', label: 'Vendor Profile', icon: '👤' },
  ];

  sidebarOpen = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadShopsFromDatabase();
      this.loadProductsFromDatabase();
      this.loadLoggedInVendorProfile(); // Database se logged-in vendor profile fetch karne ke liye
    }
  }

  // Database se logged-in vendor ki details fetch karne ka method
  loadLoggedInVendorProfile(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    this.http.get<any>(`${this.vendorsApiUrl}/${vendorId}`).subscribe({
      next: (vendor) => {
        if (vendor) {
          this.vendorProfile = {
            shopName: vendor.shopName || 'Bazario Home & Gadgets',
            ownerName: vendor.ownerName || vendor.name || 'Vendor',
            email: vendor.email || '',
            phone: vendor.phone || '',
            address: vendor.address || 'Not Provided',
            description: vendor.description || 'Curated everyday essentials.',
          };
          this.profileDraft = { ...this.vendorProfile };
        }
      },
      error: (err) => {
        console.error('Failed to load vendor profile from database:', err);
      },
    });
  }

  selectSection(key: string): void {
    this.activeSection = key;
    this.sidebarOpen = false;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get activeLabel(): string {
    return this.navItems.find((n) => n.key === this.activeSection)?.label ?? 'Dashboard';
  }

  // ===== TOAST =====
  toast = { visible: false, message: '' };
  private toastTimer: any;

  showToast(message: string): void {
    this.toast = { visible: true, message };
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast.visible = false), 2600);
  }

  // ===== DASHBOARD =====
  dashboardStats = {
    totalProducts: 0,
    totalOrders: 412,
    pendingOrders: 18,
    completedOrders: 361,
    totalSales: 1284500,
    monthlyRevenue: 214300,
    lowStockProducts: 6,
  };

  recentOrders: Order[] = [
    {
      id: 'BZ-2291',
      customer: 'Ritika Sharma',
      product: 'Wireless Headphones',
      quantity: 1,
      amount: 2499,
      date: '2026-09-10',
      paymentStatus: 'Paid',
      status: 'Shipped',
    },
    {
      id: 'BZ-2290',
      customer: 'Aman Verma',
      product: 'Organic Honey Jar',
      quantity: 2,
      amount: 798,
      date: '2026-09-10',
      paymentStatus: 'Paid',
      status: 'Confirmed',
    },
    {
      id: 'BZ-2289',
      customer: 'Sneha Iyer',
      product: 'USB Keyboard',
      quantity: 1,
      amount: 899,
      date: '2026-09-09',
      paymentStatus: 'Unpaid',
      status: 'Pending',
    },
  ];

  bestSellingProducts = [
    { name: 'Wireless Headphones', sold: 214, revenue: 534650, image: '🎧' },
    { name: 'Organic Honey Jar', sold: 178, revenue: 71022, image: '🍯' },
  ];

  lowStockAlerts = [
    { name: 'USB Keyboard', stock: 4, min: 10 },
    { name: 'Wireless Mouse', stock: 5, min: 15 },
  ];

  salesOverview = [
    { label: 'Mon', value: 62 },
    { label: 'Tue', value: 48 },
    { label: 'Wed', value: 71 },
    { label: 'Thu', value: 55 },
    { label: 'Fri', value: 84 },
    { label: 'Sat', value: 96 },
    { label: 'Sun', value: 67 },
  ];

  revenueStats = [
    { label: 'Apr', value: 140000 },
    { label: 'May', value: 168000 },
    { label: 'Jun', value: 152000 },
    { label: 'Jul', value: 189000 },
    { label: 'Aug', value: 201500 },
    { label: 'Sep', value: 214300 },
  ];

  get maxRevenue(): number {
    return Math.max(...this.revenueStats.map((r) => r.value));
  }

  // ===== VENDOR SHOPS =====
  shopStatuses: VendorShop['status'][] = ['Active', 'Pending', 'Suspended'];
  shops: VendorShop[] = [];

  selectedShopId: number | null = null;
  showShopModal = false;
  editingShopId: number | null = null;
  shopForm: VendorShop = this.emptyShop();

  private emptyShop(): VendorShop {
    return {
      id: 0,
      shopName: '',
      ownerName: '',
      email: '',
      phone: '',
      category: this.categories?.[0] ?? 'Electronics',
      address: '',
      description: '',
      logo: '🏪',
      status: 'Active',
    };
  }

  loadShopsFromDatabase(): void {
    const vendorId = this.getLoggedInVendorId();

    if (!vendorId) {
      console.error('Logged-in vendor ID not found');
      this.showToast('Vendor login information not found');
      return;
    }

    this.http.get<VendorShop[]>(`${this.shopsApiUrl}/vendor/${vendorId}`).subscribe({
      next: (data) => {
        this.shops = data;

        if (this.shops.length > 0) {
          this.selectedShopId = this.shops[0].id;
        } else {
          this.selectedShopId = null;
        }
      },
      error: (err) => {
        console.error('Error fetching vendor shops:', err);
      },
    });
  }

  selectShop(shop: VendorShop): void {
    this.selectedShopId = this.selectedShopId === shop.id ? null : shop.id;
  }

  addShop(): void {
    this.editingShopId = null;
    this.shopForm = this.emptyShop();
    this.showShopModal = true;
  }

  editShop(shop: VendorShop): void {
    this.editingShopId = shop.id;
    this.shopForm = { ...shop };
    this.showShopModal = true;
  }

  saveShop(): void {
    if (!this.shopForm.shopName.trim()) {
      this.showToast('Shop name is required');
      return;
    }

    if (!this.shopForm.ownerName.trim()) {
      this.showToast('Owner name is required');
      return;
    }

    if (!this.shopForm.email.trim()) {
      this.showToast('Email is required');
      return;
    }

    if (!this.shopForm.logo.trim()) {
      this.shopForm.logo = '🏪';
    }

    const vendorId = this.getLoggedInVendorId();

    if (!vendorId) {
      this.showToast('Vendor login information not found');
      return;
    }

    const payload: any = { ...this.shopForm };

    if (!this.editingShopId) {
      delete payload.id;
    } else {
      payload.id = this.editingShopId;
    }

    this.http.post<VendorShop>(`${this.shopsApiUrl}/vendor/${vendorId}`, payload).subscribe({
      next: () => {
        this.showToast(
          this.editingShopId ? 'Shop updated in database' : 'Vendor shop created in MySQL!',
        );
        this.showShopModal = false;
        this.loadShopsFromDatabase();
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.showToast('Failed to save to database. Check backend logs.');
      },
    });
  }

  closeShopModal(): void {
    this.showShopModal = false;
  }

  deleteShop(shop: VendorShop): void {
    this.confirmTarget = { type: 'shop', id: shop.id, name: shop.shopName };
  }

  // ===== PRODUCTS (MYSQL CONNECTED) =====
  categories = ['Electronics', 'Grocery & Organic', 'Fashion', 'Home & Living', 'Beauty'];
  productStatuses: Product['status'][] = ['Active', 'Draft', 'Out of Stock'];

  products: Product[] = [];

  searchTerm = '';
  categoryFilter = 'All';
  statusFilter = 'All';

  get filteredProducts(): Product[] {
    return this.products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.categoryFilter === 'All' || p.category === this.categoryFilter;
      const matchesStatus = this.statusFilter === 'All' || p.status === this.statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  searchProduct(): void {}
  filterProducts(): void {}

  showProductModal = false;
  editingProductId: number | null = null;
  productForm: Product = this.emptyProduct();

  private emptyProduct(): Product {
    return {
      id: 0,
      name: '',
      category: this.categories[0],
      description: '',
      price: 0,
      discount: 0,
      stock: 0,
      image: '📦',
      status: 'Active',
    };
  }

  loadProductsFromDatabase(): void {
    this.http.get<any[]>(this.productsApiUrl).subscribe({
      next: (data) => {
        this.products = data.map((item) => ({
          id: item.id,
          name: item.productName || item.name,
          category: item.vendorShop?.category || 'Electronics',
          description: item.description || '',
          price: item.price || 0,
          discount: 0,
          stock: 25,
          image: item.imageUrl || '📦',
          status: 'Active',
        }));
        this.dashboardStats.totalProducts = this.products.length;
      },
      error: (err) => console.error('Error fetching products:', err),
    });
  }

  addProduct(): void {
    this.editingProductId = null;
    this.productForm = this.emptyProduct();
    this.showProductModal = true;
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.productForm = { ...product };
    this.showProductModal = true;
  }

  saveProduct(): void {
    if (!this.productForm.name.trim()) {
      this.showToast('Product name is required');
      return;
    }

    const currentShopId = this.selectedShopId || (this.shops.length > 0 ? this.shops[0].id : null);

    if (!currentShopId) {
      this.showToast('Pehle "Your Shops" me ek shop banayein ya select karein!');
      return;
    }

    const payload = {
      productName: this.productForm.name,
      description: this.productForm.description,
      price: this.productForm.price,
      imageUrl:
        this.productForm.image ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    };

    this.http.post(`${this.productsApiUrl}/add/${currentShopId}`, payload).subscribe({
      next: () => {
        this.showToast('Product saved in MySQL database!');
        this.showProductModal = false;
        this.loadProductsFromDatabase();
      },
      error: (err) => {
        console.error('Failed to save product:', err);
        this.showToast('Product save nahi ho paya. Backend logs check karein.');
      },
    });
  }

  closeProductModal(): void {
    this.showProductModal = false;
  }

  confirmTarget: { type: string; id: number | string; name: string } | null = null;

  deleteProduct(product: Product): void {
    this.confirmTarget = { type: 'product', id: product.id, name: product.name };
  }

  confirmDelete(): void {
    if (!this.confirmTarget) return;

    if (this.confirmTarget.type === 'shop') {
      const shopId = this.confirmTarget.id;
      this.http.delete(`${this.shopsApiUrl}/${shopId}`).subscribe({
        next: () => {
          this.showToast(`${this.confirmTarget!.name} deleted from database`);
          if (this.selectedShopId === shopId) this.selectedShopId = null;
          this.loadShopsFromDatabase();
          this.confirmTarget = null;
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.showToast('Failed to delete shop');
          this.confirmTarget = null;
        },
      });
      return;
    }

    if (this.confirmTarget.type === 'product') {
      const prodId = this.confirmTarget.id;
      this.http.delete(`${this.productsApiUrl}/${prodId}`).subscribe({
        next: () => {
          this.showToast(`${this.confirmTarget!.name} deleted from database`);
          this.loadProductsFromDatabase();
          this.confirmTarget = null;
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.showToast('Failed to delete product');
          this.confirmTarget = null;
        },
      });
      return;
    }

    if (this.confirmTarget.type === 'coupon') {
      this.coupons = this.coupons.filter((c) => c.id !== this.confirmTarget!.id);
    } else if (this.confirmTarget.type === 'notification') {
      this.notifications = this.notifications.filter((n) => n.id !== this.confirmTarget!.id);
    }
    this.showToast(`${this.confirmTarget.name} deleted`);
    this.confirmTarget = null;
  }

  cancelDelete(): void {
    this.confirmTarget = null;
  }

  // ===== ORDERS =====
  orderStatusOptions: Order['status'][] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Return Requested',
    'Returned',
  ];

  orders: Order[] = [
    {
      id: 'BZ-2291',
      customer: 'Ritika Sharma',
      product: 'Wireless Headphones',
      quantity: 1,
      amount: 2499,
      date: '2026-09-10',
      paymentStatus: 'Paid',
      status: 'Shipped',
    },
  ];

  updateOrderStatus(order: Order, newStatus: Order['status']): void {
    order.status = newStatus;
    this.showToast(`Order ${order.id} marked as ${newStatus}`);
  }

  // ===== INVENTORY =====
  inventory: InventoryItem[] = [
    {
      product: 'Wireless Headphones',
      currentStock: 42,
      minStock: 15,
      status: 'Available',
      lastUpdated: '2026-09-10',
    },
  ];

  updateStock(item: InventoryItem, value: number): void {
    item.currentStock = value;
    item.status = value === 0 ? 'Out of Stock' : value <= item.minStock ? 'Low Stock' : 'Available';
    item.lastUpdated = new Date().toISOString().slice(0, 10);
    this.showToast(`Stock updated for ${item.product}`);
  }

  // ===== SALES & EARNINGS =====
  salesSummary = {
    today: 18420,
    weekly: 96200,
    monthly: 214300,
    totalRevenue: 1284500,
    totalOrders: 412,
  };

  // ===== REVIEWS =====
  reviews: Review[] = [
    {
      id: 1,
      product: 'Wireless Headphones',
      customer: 'Ritika Sharma',
      rating: 5,
      review: 'Sound quality is fantastic and battery lasts all week.',
      date: '2026-09-08',
      reply: '',
      replyDraft: '',
    },
  ];

  replyToReview(review: Review): void {
    if (!review.replyDraft.trim()) {
      this.showToast('Write a reply before submitting');
      return;
    }
    review.reply = review.replyDraft;
    review.replyDraft = '';
    this.showToast('Reply posted to customer');
  }

  // ===== COUPONS =====
  coupons: Coupon[] = [
    {
      id: 1,
      code: 'BAZARIO20',
      discount: 20,
      minOrder: 999,
      startDate: '2026-09-01',
      expiryDate: '2026-09-30',
      status: 'Active',
    },
  ];

  showCouponModal = false;
  editingCouponId: number | null = null;
  couponForm: Coupon = this.emptyCoupon();

  private emptyCoupon(): Coupon {
    return {
      id: 0,
      code: '',
      discount: 0,
      minOrder: 0,
      startDate: '',
      expiryDate: '',
      status: 'Active',
    };
  }

  addCoupon(): void {
    this.editingCouponId = null;
    this.couponForm = this.emptyCoupon();
    this.showCouponModal = true;
  }

  editCoupon(coupon: Coupon): void {
    this.editingCouponId = coupon.id;
    this.couponForm = { ...coupon };
    this.showCouponModal = true;
  }

  saveCoupon(): void {
    if (!this.couponForm.code.trim()) {
      this.showToast('Coupon code is required');
      return;
    }
    this.showToast('Coupon saved');
    this.showCouponModal = false;
  }

  closeCouponModal(): void {
    this.showCouponModal = false;
  }

  deleteCoupon(coupon: Coupon): void {
    this.confirmTarget = { type: 'coupon', id: coupon.id, name: coupon.code };
  }

  toggleCouponStatus(coupon: Coupon): void {
    coupon.status = coupon.status === 'Active' ? 'Disabled' : 'Active';
    this.showToast(`${coupon.code} is now ${coupon.status}`);
  }

  // ===== AI ASSISTANT =====
  aiInsights = {
    salesGrowth: '+18%',
    bestSeller: 'Wireless Headphones',
    slowMover: 'USB Keyboard',
  };

  demandPrediction = [{ product: 'Wireless Headphones', demand: 'HIGH' }];

  stockPrediction = {
    product: 'Wireless Mouse',
    currentStock: 5,
    daysRemaining: 5,
    recommendation: 'Restock approximately 30 units.',
  };

  priceSuggestion = {
    product: 'Wireless Headphones',
    currentPrice: 999,
    suggestedMin: 899,
    suggestedMax: 949,
    demand: 'HIGH',
    applied: false,
  };

  applyPriceSuggestion(): void {
    this.priceSuggestion.applied = true;
    this.showToast(
      `Price updated to ₹${this.priceSuggestion.suggestedMin}–₹${this.priceSuggestion.suggestedMax} for ${this.priceSuggestion.product}`,
    );
  }

  descriptionForm = { name: '', category: '', features: '', keywords: '' };
  generatedDescription = '';

  generateAIDescription(): void {
    const { name, category, features, keywords } = this.descriptionForm;
    if (!name.trim()) {
      this.showToast('Enter a product name first');
      return;
    }
    const featureText = features ? features : 'thoughtful design and everyday reliability';
    const keywordText = keywords ? ` Perfect for anyone searching for ${keywords}.` : '';
    this.generatedDescription = `Meet the ${name} — a ${category || 'standout'} pick built around ${featureText}. Crafted for shoppers who care about quality, it blends everyday usability with details that make it feel a little special.${keywordText}`;
  }

  suggestedQuestions = ['Which product sells the most?', 'Which product should I restock?'];

  chatMessages: ChatMessage[] = [
    {
      sender: 'ai',
      text: 'Hi! I am your Bazario AI Assistant. Ask me anything about your store performance.',
    },
  ];

  chatInput = '';

  askAI(question?: string): void {
    const query = (question ?? this.chatInput).trim();
    if (!query) return;
    this.chatMessages.push({ sender: 'vendor', text: query });
    setTimeout(
      () => this.chatMessages.push({ sender: 'ai', text: 'Tracking store metrics.' }),
      350,
    );
    this.chatInput = '';
  }

  // ===== NOTIFICATIONS =====
  notifications: NotificationItem[] = [
    {
      id: 1,
      type: 'New Order',
      message: 'New order BZ-2291 placed.',
      time: '10 min ago',
      read: false,
    },
  ];

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  markNotificationRead(notification: NotificationItem): void {
    notification.read = true;
  }

  deleteNotification(notification: NotificationItem): void {
    this.confirmTarget = { type: 'notification', id: notification.id, name: 'this notification' };
  }

  // ===== VENDOR PROFILE =====
  vendorProfile = {
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
  };

  profileDraft = { ...this.vendorProfile };
  isEditingProfile = false;
  showPasswordFields = false;
  passwordForm = { current: '', next: '', confirm: '' };

  editProfile(): void {
    this.profileDraft = { ...this.vendorProfile };
    this.isEditingProfile = true;
  }

  saveProfile(): void {
    this.vendorProfile = { ...this.profileDraft };
    this.isEditingProfile = false;
    this.showToast('Profile updated successfully');
  }

  cancelEditProfile(): void {
    this.isEditingProfile = false;
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
    this.passwordForm = { current: '', next: '', confirm: '' };
  }

  changePassword(): void {
    if (!this.passwordForm.current || !this.passwordForm.next) {
      this.showToast('Fill in all password fields');
      return;
    }
    if (this.passwordForm.next !== this.passwordForm.confirm) {
      this.showToast('New passwords do not match');
      return;
    }
    this.showPasswordFields = false;
    this.showToast('Password changed successfully');
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      sessionStorage.clear();
    }
    this.showToast('Logging out...');
    this.router.navigate(['/login']);
  }
}
