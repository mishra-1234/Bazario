import { Component, OnInit, PLATFORM_ID, inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  image: string;
  status: 'Active' | 'Draft' | 'Out of Stock';
  shopId?: number;
  shopName?: string;
}

export interface Order {
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

export interface InventoryItem {
  product: string;
  currentStock: number;
  minStock: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

export interface CustomerSummary {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: string;
  customerStatus: string;
  shopName: string;
}

export interface CustomerOrderItem {
  itemId: number;
  productId: number;
  productName: string;
  productImage?: string;
  category: string;
  quantity: number;
  price: number;
  subtotal: number;
  itemStatus: string;
  shopName: string;
}

export interface CustomerOrderDetail {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  totalOrderAmount: number;
  vendorShopSubtotal: number;
  items: CustomerOrderItem[];
}

export interface CustomerDetail {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: string;
  customerStatus: string;
  orders: CustomerOrderDetail[];
}

export interface Review {
  id: number;
  product?: string;
  productId?: number;
  productName?: string;
  productImage?: string;
  shopId?: number;
  shopName?: string;
  customer?: string;
  customerName?: string;
  customerEmail?: string;
  rating: number;
  title?: string;
  review?: string;
  comment?: string;
  date?: string;
  createdAt?: string;
  reply?: string;
  vendorReply?: string;
  replyDraft?: string;
  replyDate?: string;
  verifiedPurchase?: boolean;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  count5: number;
  count4: number;
  count3: number;
  count2: number;
  count1: number;
  percent5: number;
  percent4: number;
  percent3: number;
  percent2: number;
  percent1: number;
  reviews: Review[];
}

export interface Coupon {
  id: number;
  code: string;
  title?: string;
  description?: string;
  discount?: number;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  minOrder?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  expiryDate: string;
  maxUsageLimit?: number;
  perCustomerUsageLimit?: number;
  applicableProductsType?: 'ALL' | 'SPECIFIC';
  applicableProductIds?: string;
  status: 'Active' | 'Disabled' | 'Expired';
  usageCount?: number;
  totalDiscountGiven?: number;
  shopId?: number;
  shopName?: string;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  scheduledCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
  coupons: Coupon[];
}

export interface NotificationItem {
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

export interface ChatMessage {
  sender: 'vendor' | 'ai';
  text: string;
}

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
  banner?: string;
  status: 'Active' | 'Pending' | 'Suspended' | 'Inactive' | 'Deactivated';
  productCount?: number;
  orderCount?: number;
  revenue?: number;
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
  private cdr = inject(ChangeDetectorRef);

  private shopsApiUrl = 'https://bazario-io58.onrender.com/api/shops';
  private productsApiUrl = 'https://bazario-io58.onrender.com/api/products';
  private vendorsApiUrl = 'https://bazario-io58.onrender.com/vendors';
  private ordersApiUrl = 'https://bazario-io58.onrender.com/api/orders';
  private analyticsApiUrl = 'https://bazario-io58.onrender.com/api/analytics';
  private customersApiUrl = 'https://bazario-io58.onrender.com/api/customers';
  private reviewsApiUrl = 'https://bazario-io58.onrender.com/api/reviews';
  private couponsApiUrl = 'https://bazario-io58.onrender.com/api/coupons';

  // Vendor Information
  vendorName: string = 'Vendor';
  currentFormattedDate: string = '';

  // Shop Context Management
  selectedShopId: number | null = null; // null = All Shops
  shopDropdownOpen: boolean = false;

  // Image Upload State
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isSubmittingProduct: boolean = false;

  // Loading States
  isLoadingShops: boolean = false;
  isLoadingProducts: boolean = false;

  // Theme & Appearance Management
  isDarkMode: boolean = false;
  themeMode: 'light' | 'dark' | 'system' = 'light';

  // Settings Management
  settingsTab: 'account' | 'appearance' | 'notifications' | 'security' | 'preferences' = 'account';
  isSavingAccount: boolean = false;
  isChangingPassword: boolean = false;

  accountForm = {
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
  };

  notificationSettings = {
    orderAlerts: true,
    customerAlerts: true,
    lowStockAlerts: true,
    inventoryWarningAlerts: true,
    reviewAlerts: true,
    couponAlerts: true,
    emailReports: false,
  };

  securityForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  };

  shopPreferences = {
    defaultShopId: null as number | null,
    autoSwitchToNewShop: true,
  };

  activeSection: string = 'dashboard';

  navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { key: 'shops', label: 'My Shops', icon: '🏪' },
    { key: 'products', label: 'Products', icon: '📦' },
    { key: 'orders', label: 'Orders', icon: '🛒' },
    { key: 'inventory', label: 'Inventory', icon: '📋' },
    { key: 'sales', label: 'Sales & Analytics', icon: '📊' },
    { key: 'customers', label: 'Customers', icon: '👥' },
    { key: 'reviews', label: 'Reviews & Ratings', icon: '⭐' },
    { key: 'coupons', label: 'Coupons & Offers', icon: '🎟️' },
    { key: 'ai', label: 'AI Assistant', icon: '🤖' },
    { key: 'notifications', label: 'Notifications', icon: '🔔' },
    { key: 'profile', label: 'Vendor Profile', icon: '👤' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  sidebarOpen = false;

  // Analytics filter
  analyticsRange: string = 'all';
  analyticsData: any = null;

  private getLoggedInVendorId(): number | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const vendorData = localStorage.getItem('vendor') || sessionStorage.getItem('vendor');
    if (!vendorData) return null;

    try {
      const data = JSON.parse(vendorData);
      const vendorId = data.id || (data.vendor && data.vendor.id);
      return vendorId ? Number(vendorId) : null;
    } catch (error) {
      console.error('Invalid vendor data in storage:', error);
      return null;
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
      this.loadSettingsPreferences();
      this.formatDate();
      this.loadLoggedInVendorProfile();
      this.loadShopsFromDatabase();
      this.loadCustomersFromDatabase();
      this.loadReviewsFromDatabase();
      this.loadCouponsFromDatabase();
    }
  }

  private formatDate(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    this.currentFormattedDate = now.toLocaleDateString('en-US', options);
  }

  // Load authenticated vendor profile from MySQL
  loadLoggedInVendorProfile(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    this.http.get<any>(`${this.vendorsApiUrl}/${vendorId}`).subscribe({
      next: (vendor) => {
        if (vendor) {
          this.vendorName = vendor.shopName || vendor.ownerName || vendor.name || 'Vendor';
          this.vendorProfile = {
            shopName: vendor.shopName || 'Bazario Home & Gadgets',
            ownerName: vendor.ownerName || vendor.name || 'Vendor',
            email: vendor.email || '',
            phone: vendor.phone || '',
            address: vendor.address || 'Not Provided',
            description: vendor.description || 'Curated marketplace vendor.',
          };
          this.profileDraft = { ...this.vendorProfile };
          this.accountForm = { ...this.vendorProfile };
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('Failed to load vendor profile from database:', err);
      },
    });
  }

  // ==================== SHOP CONTEXT SWITCHER ====================
  toggleShopDropdown(): void {
    this.shopDropdownOpen = !this.shopDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.shop-switcher-container')) {
      this.shopDropdownOpen = false;
    }
  }

  get selectedShop(): VendorShop | undefined {
    return this.shops.find((s) => s.id === this.selectedShopId);
  }

  get selectedShopName(): string {
    return this.selectedShop ? this.selectedShop.shopName : 'All Shops (Combined)';
  }

  selectShop(shop: VendorShop): void {
    this.selectShopContext(shop.id);
  }

  selectShopContext(shopId: number | null): void {
    this.selectedShopId = shopId;
    this.shopDropdownOpen = false;

    if (isPlatformBrowser(this.platformId)) {
      if (shopId === null) {
        localStorage.setItem('bazario_selected_shop_id', 'all');
      } else {
        localStorage.setItem('bazario_selected_shop_id', String(shopId));
      }
    }

    this.showToast(shopId ? `Active shop: ${this.selectedShopName}` : 'Viewing all shops overview');
    this.loadProductsFromDatabase();
    this.loadOrdersFromDatabase();
    this.loadAnalyticsFromDatabase();
    this.loadCustomersFromDatabase();
    this.loadReviewsFromDatabase();
    this.loadCouponsFromDatabase();
    this.cdr.markForCheck();
  }

  selectSection(key: string): void {
    this.activeSection = key;
    this.sidebarOpen = false;
    if (key === 'customers') this.loadCustomersFromDatabase();
    if (key === 'reviews') this.loadReviewsFromDatabase();
    if (key === 'coupons') this.loadCouponsFromDatabase();
    this.cdr.markForCheck();
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

  // ===== DASHBOARD STATS =====
  dashboardStats = {
    totalShops: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSales: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
  };

  salesOverview: any[] = [
    { label: 'Mon', value: 0 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 0 },
    { label: 'Thu', value: 0 },
    { label: 'Fri', value: 0 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 },
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
    return Math.max(...this.revenueStats.map((r) => r.value), 1);
  }

  bestSellingProducts: any[] = [];
  lowStockAlerts: any[] = [];

  get recentOrders(): Order[] {
    return this.orders.slice(0, 5);
  }

  get salesSummary() {
    return {
      today: this.analyticsData?.todayRevenue ?? Math.round(this.dashboardStats.totalSales * 0.08),
      weekly: this.analyticsData?.weeklyRevenue ?? Math.round(this.dashboardStats.totalSales * 0.35),
      monthly: this.dashboardStats.monthlyRevenue,
      totalRevenue: this.dashboardStats.totalSales,
      totalOrders: this.dashboardStats.totalOrders,
    };
  }

  // ==================== MULTI-SHOP MANAGEMENT ====================
  shopStatuses: VendorShop['status'][] = ['Active', 'Pending', 'Suspended', 'Inactive'];
  shops: VendorShop[] = [];

  // Shop Filters & Sorting
  shopSearchQuery: string = '';
  shopStatusFilter: string = 'All';
  shopCategoryFilter: string = 'All';
  shopSortBy: string = 'newest';

  get shopCategories(): string[] {
    const set = new Set<string>();
    this.categories.forEach(c => set.add(c));
    this.shops.forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set).sort();
  }

  get filteredShops(): VendorShop[] {
    let result = [...this.shops];

    const effectiveSearch = (this.shopSearchQuery || (this.activeSection === 'shops' ? this.searchTerm : '')).trim().toLowerCase();
    if (effectiveSearch) {
      result = result.filter(s =>
        (s.shopName && s.shopName.toLowerCase().includes(effectiveSearch)) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(effectiveSearch)) ||
        (s.category && s.category.toLowerCase().includes(effectiveSearch)) ||
        (s.email && s.email.toLowerCase().includes(effectiveSearch)) ||
        (s.phone && s.phone.toLowerCase().includes(effectiveSearch)) ||
        (s.description && s.description.toLowerCase().includes(effectiveSearch)) ||
        (s.id && String(s.id).includes(effectiveSearch))
      );
    }

    if (this.shopStatusFilter !== 'All') {
      result = result.filter(s => s.status && s.status.toLowerCase() === this.shopStatusFilter.toLowerCase());
    }

    if (this.shopCategoryFilter !== 'All') {
      result = result.filter(s => s.category === this.shopCategoryFilter);
    }

    switch (this.shopSortBy) {
      case 'newest':
        result.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
      case 'oldest':
        result.sort((a, b) => (a.id || 0) - (b.id || 0));
        break;
      case 'name-asc':
        result.sort((a, b) => (a.shopName || '').localeCompare(b.shopName || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.shopName || '').localeCompare(a.shopName || ''));
        break;
      case 'status':
        result.sort((a, b) => {
          if (a.status === b.status) return 0;
          return a.status === 'Active' ? -1 : 1;
        });
        break;
      default:
        result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }

  get shopCountAll(): number {
    return this.shops.length;
  }

  get shopCountActive(): number {
    return this.shops.filter(s => s.status === 'Active').length;
  }

  get shopCountInactive(): number {
    return this.shops.filter(s => s.status === 'Inactive').length;
  }

  get shopCountSuspended(): number {
    return this.shops.filter(s => s.status === 'Suspended').length;
  }

  get hasActiveShopFilters(): boolean {
    return !!(
      this.shopSearchQuery.trim() ||
      (this.activeSection === 'shops' && this.searchTerm.trim()) ||
      this.shopStatusFilter !== 'All' ||
      this.shopCategoryFilter !== 'All' ||
      this.shopSortBy !== 'newest'
    );
  }

  setShopStatusFilter(status: string): void {
    this.shopStatusFilter = status;
    this.cdr.markForCheck();
  }

  setShopCategoryFilter(category: string): void {
    this.shopCategoryFilter = category;
    this.cdr.markForCheck();
  }

  setShopSort(sortBy: string): void {
    this.shopSortBy = sortBy;
    this.cdr.markForCheck();
  }

  onShopFilterChange(): void {
    this.cdr.markForCheck();
  }

  resetShopFilters(): void {
    this.shopSearchQuery = '';
    if (this.activeSection === 'shops') {
      this.searchTerm = '';
    }
    this.shopStatusFilter = 'All';
    this.shopCategoryFilter = 'All';
    this.shopSortBy = 'newest';
    this.cdr.markForCheck();
  }

  refreshShops(): void {
    this.showToast('Refreshing storefronts...');
    this.loadShopsFromDatabase();
  }

  showShopModal = false;
  editingShopId: number | null = null;
  shopForm: VendorShop = this.emptyShop();
  isSubmittingShop = false;

  private emptyShop(): VendorShop {
    return {
      id: 0,
      shopName: '',
      ownerName: this.vendorName || '',
      email: '',
      phone: '',
      category: this.categories?.[0] ?? 'Electronics',
      address: '',
      description: '',
      logo: '🏪',
      banner: '',
      status: 'Active',
    };
  }

  loadShopsFromDatabase(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) {
      this.showToast('Vendor login information not found');
      return;
    }

    this.isLoadingShops = true;
    this.http.get<VendorShop[]>(`${this.shopsApiUrl}/vendor/${vendorId}`).subscribe({
      next: (data) => {
        this.shops = data || [];
        this.dashboardStats.totalShops = this.shops.length;
        this.isLoadingShops = false;

        // Restore saved shop context
        if (isPlatformBrowser(this.platformId)) {
          const stored = localStorage.getItem('bazario_selected_shop_id');
          if (stored === 'all') {
            this.selectedShopId = null;
          } else if (stored && this.shops.some((s) => s.id === Number(stored))) {
            this.selectedShopId = Number(stored);
          } else if (this.shops.length > 0) {
            this.selectedShopId = this.shops[0].id;
          } else {
            this.selectedShopId = null;
          }
        } else if (this.shops.length > 0) {
          this.selectedShopId = this.shops[0].id;
        }

        this.loadProductsFromDatabase();
        this.loadOrdersFromDatabase();
        this.loadAnalyticsFromDatabase();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoadingShops = false;
        console.error('Error fetching vendor shops:', err);
        this.cdr.markForCheck();
      },
    });
  }

  addShop(): void {
    this.editingShopId = null;
    this.shopForm = this.emptyShop();
    this.showShopModal = true;
    this.cdr.markForCheck();
  }

  editShop(shop: VendorShop): void {
    this.editingShopId = shop.id;
    this.shopForm = { ...shop };
    this.showShopModal = true;
    this.cdr.markForCheck();
  }

  saveShop(): void {
    if (this.isSubmittingShop) return;

    if (!this.shopForm.shopName.trim()) {
      this.showToast('Shop name is required');
      return;
    }

    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) {
      this.showToast('Vendor login information not found');
      return;
    }

    this.isSubmittingShop = true;

    if (!this.shopForm.ownerName.trim()) {
      this.shopForm.ownerName = this.vendorName || 'Vendor';
    }
    if (!this.shopForm.email.trim()) {
      this.shopForm.email = this.vendorProfile.email || 'vendor@bazario.in';
    }
    if (!this.shopForm.logo.trim()) {
      this.shopForm.logo = '🏪';
    }

    if (this.editingShopId) {
      // Update existing shop
      this.http
        .put<VendorShop>(`${this.shopsApiUrl}/${this.editingShopId}?vendorId=${vendorId}`, this.shopForm)
        .subscribe({
          next: (updated) => {
            this.showToast(`Shop "${updated.shopName || this.shopForm.shopName}" updated successfully!`);
            this.showShopModal = false;
            this.isSubmittingShop = false;
            this.shops = this.shops.map(s => s.id === updated.id ? updated : s);
            this.cdr.markForCheck();
            this.loadShopsFromDatabase();
          },
          error: (err) => {
            console.error('Update shop failed:', err);
            this.showToast('Failed to update shop. Check backend logs.');
            this.isSubmittingShop = false;
            this.cdr.markForCheck();
          },
        });
    } else {
      // Create new shop under this vendor (One Vendor -> Many Shops)
      const shopPayload: any = {
        shopName: this.shopForm.shopName.trim(),
        ownerName: this.shopForm.ownerName.trim(),
        email: this.shopForm.email.trim(),
        phone: this.shopForm.phone,
        category: this.shopForm.category,
        address: this.shopForm.address,
        description: this.shopForm.description,
        logo: this.shopForm.logo || '🏪',
        banner: this.shopForm.banner,
        status: this.shopForm.status || 'Active',
      };

      this.http
        .post<VendorShop>(`${this.shopsApiUrl}/vendor/${vendorId}`, shopPayload)
        .subscribe({
          next: (created) => {
            this.showToast(`Shop "${created.shopName}" created successfully!`);
            this.showShopModal = false;
            this.isSubmittingShop = false;
            this.shopForm = this.emptyShop();

            // Append created shop to shops array immediately
            this.shops = [...this.shops.filter(s => s.id !== created.id), created];
            this.dashboardStats.totalShops = this.shops.length;

            // Switch active context to newly created shop
            this.selectShopContext(created.id);
            this.cdr.markForCheck();
            this.loadShopsFromDatabase();
          },
          error: (err) => {
            console.error('Create shop failed:', err);
            const msg = err?.error?.error || err?.error || 'Failed to create shop. Check backend logs.';
            this.showToast(typeof msg === 'string' ? msg : 'Failed to create shop');
            this.isSubmittingShop = false;
            this.cdr.markForCheck();
          },
        });
    }
  }

  toggleShopStatus(shop: VendorShop): void {
    const vendorId = this.getLoggedInVendorId();
    this.http
      .patch<VendorShop>(`${this.shopsApiUrl}/${shop.id}/status?vendorId=${vendorId}`, {})
      .subscribe({
        next: (updated) => {
          shop.status = updated.status;
          this.showToast(`Shop "${shop.shopName}" is now ${shop.status}`);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to toggle status:', err);
          this.showToast('Failed to toggle shop status');
          this.cdr.markForCheck();
        },
      });
  }

  closeShopModal(): void {
    this.showShopModal = false;
    this.editingShopId = null;
    this.shopForm = this.emptyShop();
    this.cdr.markForCheck();
  }

  deleteShop(shop: VendorShop): void {
    this.confirmTarget = { type: 'shop', id: shop.id, name: shop.shopName };
    this.cdr.markForCheck();
  }

  // ==================== PRODUCTS MANAGEMENT ====================
  categories = [
    'Electronics',
    'Grocery & Organic',
    'Fashion',
    'Home & Living',
    'Beauty',
    'Sports',
    'Kitchen',
    'Tools & Hardware',
  ];
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
      stock: 50,
      image: '📦',
      status: 'Active',
      shopId: this.selectedShopId || (this.shops[0]?.id || 0),
    };
  }

  onImageFileSelected(event: any): void {
    const file: File = event.target?.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.showToast('Only JPG, PNG and WEBP images are supported');
      event.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.showToast('Image size exceeds 5MB limit');
      event.target.value = '';
      return;
    }

    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl = reader.result as string;
      this.productForm.image = this.imagePreviewUrl;
    };
    reader.readAsDataURL(file);
  }

  removeSelectedImage(): void {
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.productForm.image = '📦';
  }

  handleImgError(event: any, p: Product): void {
    event.target.style.display = 'none';
    if (event.target.nextElementSibling) {
      event.target.nextElementSibling.style.display = 'flex';
    }
  }

  loadProductsFromDatabase(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    let url: string;
    if (this.selectedShopId) {
      url = `${this.productsApiUrl}/shop/${this.selectedShopId}`;
    } else {
      url = `${this.productsApiUrl}/vendor/${vendorId}`;
    }

    this.isLoadingProducts = true;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.isLoadingProducts = false;
        this.products = (data || []).map((item) => ({
          id: item.id,
          name: item.productName || item.name,
          category: item.category || item.vendorShop?.category || 'Electronics',
          description: item.description || '',
          price: item.price || 0,
          discount: item.discount || 0,
          stock: item.stock != null ? item.stock : 50,
          image: item.imageUrl || '📦',
          status: item.status || 'Active',
          shopId: item.vendorShop?.id,
          shopName: item.vendorShop?.shopName,
        }));
        this.dashboardStats.totalProducts = this.products.length;
        this.dashboardStats.activeProducts = this.products.filter((p) => p.status === 'Active').length;
        this.dashboardStats.lowStockProducts = this.products.filter(
          (p) => p.stock > 0 && p.stock <= 10,
        ).length;
        this.syncInventoryFromProducts();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoadingProducts = false;
        console.error('Error fetching products:', err);
        this.cdr.markForCheck();
      },
    });
  }

  syncInventoryFromProducts(): void {
    this.inventory = this.products.map((p) => ({
      product: p.name,
      currentStock: p.stock,
      minStock: 10,
      status: p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'Available',
      lastUpdated: new Date().toISOString().slice(0, 10),
    }));

    this.lowStockAlerts = this.products
      .filter((p) => p.stock > 0 && p.stock <= 10)
      .map((p) => ({ name: p.name, stock: p.stock, min: 10 }));
  }

  addProduct(): void {
    this.editingProductId = null;
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.productForm = this.emptyProduct();
    if (this.selectedShopId) {
      this.productForm.shopId = this.selectedShopId;
    }
    this.showProductModal = true;
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.selectedImageFile = null;
    this.imagePreviewUrl =
      product.image &&
      (product.image.startsWith('http') ||
        product.image.startsWith('/uploads') ||
        product.image.startsWith('data:'))
        ? product.image
        : null;
    this.productForm = { ...product };
    this.showProductModal = true;
  }

  saveProduct(): void {
    if (this.isSubmittingProduct) return;

    if (!this.productForm.name.trim()) {
      this.showToast('Product name is required');
      return;
    }

    const targetShopId =
      this.productForm.shopId ||
      this.selectedShopId ||
      (this.shops.length > 0 ? this.shops[0].id : null);

    if (!targetShopId) {
      this.showToast('Pehle "My Shops" me ek shop banayein!');
      return;
    }

    this.isSubmittingProduct = true;

    const doSave = (finalImageUrl: string) => {
      const payload: any = {
        productName: this.productForm.name.trim(),
        description: this.productForm.description,
        price: Number(this.productForm.price) || 0,
        discount: Number(this.productForm.discount) || 0,
        stock: Number(this.productForm.stock) || 0,
        category: this.productForm.category,
        status: this.productForm.status || 'Active',
        imageUrl: finalImageUrl,
      };

      if (this.editingProductId !== null) {
        // Update product via PUT
        this.http
          .put<any>(`${this.productsApiUrl}/${this.editingProductId}?vendorShopId=${targetShopId}`, payload)
          .subscribe({
            next: (updatedProduct) => {
              this.showToast(`Product "${updatedProduct?.productName || payload.productName}" updated successfully in MySQL!`);
              this.isSubmittingProduct = false;
              this.showProductModal = false;

              const mappedProduct: Product = {
                id: updatedProduct?.id || this.editingProductId,
                name: updatedProduct?.productName || payload.productName,
                category: updatedProduct?.category || payload.category,
                description: updatedProduct?.description || payload.description,
                price: updatedProduct?.price || payload.price,
                discount: updatedProduct?.discount || payload.discount,
                stock: updatedProduct?.stock != null ? updatedProduct.stock : payload.stock,
                image: updatedProduct?.imageUrl || payload.imageUrl,
                status: (updatedProduct?.status as any) || payload.status,
                shopId: updatedProduct?.vendorShop?.id || targetShopId,
                shopName: updatedProduct?.vendorShop?.shopName || this.shops.find(s => s.id === targetShopId)?.shopName,
              };

              this.products = this.products.map(p => p.id === mappedProduct.id ? mappedProduct : p);
              this.syncInventoryFromProducts();
              this.resetProductForm();
              this.cdr.markForCheck();

              this.loadProductsFromDatabase();
              this.loadAnalyticsFromDatabase();
            },
            error: (err) => {
              console.error('Failed to update product:', err);
              this.showToast('Failed to update product. Check backend logs.');
              this.isSubmittingProduct = false;
              this.cdr.markForCheck();
            },
          });
      } else {
        // Add product via POST
        this.http.post<any>(`${this.productsApiUrl}/add/${targetShopId}`, payload).subscribe({
          next: (createdProduct) => {
            this.showToast(`Product "${createdProduct?.productName || payload.productName}" created successfully in MySQL!`);
            this.isSubmittingProduct = false;
            this.showProductModal = false;

            const mappedProduct: Product = {
              id: createdProduct.id,
              name: createdProduct.productName || payload.productName,
              category: createdProduct.category || payload.category,
              description: createdProduct.description || payload.description,
              price: createdProduct.price || payload.price,
              discount: createdProduct.discount || payload.discount,
              stock: createdProduct.stock != null ? createdProduct.stock : payload.stock,
              image: createdProduct.imageUrl || payload.imageUrl,
              status: (createdProduct.status as any) || payload.status,
              shopId: createdProduct.vendorShop?.id || targetShopId,
              shopName: createdProduct.vendorShop?.shopName || this.shops.find(s => s.id === targetShopId)?.shopName,
            };

            // Switch to target shop context if currently filtered to another specific shop
            if (this.selectedShopId !== null && this.selectedShopId !== targetShopId) {
              this.selectedShopId = targetShopId;
              if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem('bazario_selected_shop_id', String(targetShopId));
              }
            }

            // Immediately prepend to product list for INSTANT UI display (Zero Refresh)
            this.products = [mappedProduct, ...this.products.filter(p => p.id !== mappedProduct.id)];
            this.dashboardStats.totalProducts = this.products.length;
            this.dashboardStats.activeProducts = this.products.filter(p => p.status === 'Active').length;
            this.syncInventoryFromProducts();
            this.resetProductForm();
            this.cdr.markForCheck();

            // Background reconciliation with MySQL database
            this.loadProductsFromDatabase();
            this.loadAnalyticsFromDatabase();
          },
          error: (err) => {
            console.error('Failed to save product:', err);
            this.showToast('Failed to save product. Check backend logs.');
            this.isSubmittingProduct = false;
            this.cdr.markForCheck();
          },
        });
      }
    };

    if (this.selectedImageFile) {
      const formData = new FormData();
      formData.append('file', this.selectedImageFile);
      this.http.post<any>(`${this.productsApiUrl}/upload-image`, formData).subscribe({
        next: (res) => {
          const imgUrl = res?.imageUrl || this.productForm.image;
          doSave(imgUrl);
        },
        error: (err) => {
          console.error('Image upload failed, fallback to placeholder:', err);
          this.showToast('Image upload failed. Saving with default placeholder.');
          doSave(
            this.productForm.image ||
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          );
        },
      });
    } else {
      doSave(
        this.productForm.image ||
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      );
    }
  }

  resetProductForm(): void {
    this.editingProductId = null;
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.productForm = this.emptyProduct();
    if (this.selectedShopId) {
      this.productForm.shopId = this.selectedShopId;
    } else if (this.shops.length > 0) {
      this.productForm.shopId = this.shops[0].id;
    }
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.resetProductForm();
    this.cdr.markForCheck();
  }

  confirmTarget: { type: string; id: number | string; name: string } | null = null;

  deleteProduct(product: Product): void {
    this.confirmTarget = { type: 'product', id: product.id, name: product.name };
  }

  confirmDelete(): void {
    if (!this.confirmTarget) return;

    if (this.confirmTarget.type === 'shop') {
      const shopId = Number(this.confirmTarget.id);
      const vendorId = this.getLoggedInVendorId();
      this.http.delete(`${this.shopsApiUrl}/${shopId}?vendorId=${vendorId}`).subscribe({
        next: () => {
          this.showToast(`${this.confirmTarget!.name} deactivated`);
          this.shops = this.shops.filter(s => s.id !== shopId);
          this.dashboardStats.totalShops = this.shops.length;
          if (this.selectedShopId === shopId) {
            this.selectedShopId = this.shops.length > 0 ? this.shops[0].id : null;
          }
          this.cdr.markForCheck();
          this.loadShopsFromDatabase();
          this.confirmTarget = null;
        },
        error: (err) => {
          console.error('Delete shop failed:', err);
          this.showToast('Failed to deactivate shop');
          this.confirmTarget = null;
          this.cdr.markForCheck();
        },
      });
      return;
    }

    if (this.confirmTarget.type === 'product') {
      const prodId = Number(this.confirmTarget.id);
      this.http.delete(`${this.productsApiUrl}/${prodId}`).subscribe({
        next: () => {
          this.showToast(`${this.confirmTarget!.name} deleted from database`);
          this.products = this.products.filter((p) => p.id !== prodId);
          this.dashboardStats.totalProducts = this.products.length;
          this.dashboardStats.activeProducts = this.products.filter((p) => p.status === 'Active').length;
          this.syncInventoryFromProducts();
          this.cdr.markForCheck();
          this.loadAnalyticsFromDatabase();
          this.confirmTarget = null;
        },
        error: (err) => {
          console.error('Delete product failed:', err);
          this.showToast('Failed to delete product');
          this.confirmTarget = null;
          this.cdr.markForCheck();
        },
      });
      return;
    }

    if (this.confirmTarget.type === 'coupon') {
      const couponId = Number(this.confirmTarget.id);
      const vendorId = this.getLoggedInVendorId();
      this.http.delete(`${this.couponsApiUrl}/${couponId}?vendorId=${vendorId}`).subscribe({
        next: () => {
          this.showToast(`Coupon ${this.confirmTarget!.name} deleted from database`);
          this.coupons = this.coupons.filter((c) => c.id !== couponId);
          this.couponStats.totalCoupons = this.coupons.length;
          this.confirmTarget = null;
          this.cdr.markForCheck();
          this.loadCouponsFromDatabase();
        },
        error: (err) => {
          console.error('Delete coupon failed:', err);
          this.showToast('Failed to delete coupon');
          this.confirmTarget = null;
          this.cdr.markForCheck();
        }
      });
      return;
    }

    if (this.confirmTarget.type === 'notification') {
      this.notifications = this.notifications.filter((n) => n.id !== this.confirmTarget!.id);
    }
    this.showToast(`${this.confirmTarget.name} deleted`);
    this.confirmTarget = null;
  }

  cancelDelete(): void {
    this.confirmTarget = null;
  }

  // ==================== ORDERS MANAGEMENT ====================
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

  orders: Order[] = [];

  loadOrdersFromDatabase(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    let url: string;
    if (this.selectedShopId) {
      url = `${this.ordersApiUrl}/shop/${this.selectedShopId}`;
    } else {
      url = `${this.ordersApiUrl}/vendor/${vendorId}`;
    }

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.orders = data.map((item) => ({
            id: String(item.id),
            customer: item.order?.customerName || 'Customer',
            product: item.product?.productName || 'Product',
            quantity: item.quantity || 1,
            amount: item.subtotal || item.price * (item.quantity || 1),
            date: item.createdAt ? item.createdAt.substring(0, 10) : '2026-11-06',
            paymentStatus: 'Paid',
            status: item.status || 'Processing',
          }));
          this.dashboardStats.totalOrders = this.orders.length;
          this.dashboardStats.pendingOrders = this.orders.filter(
            (o) => o.status === 'Processing' || o.status === 'Pending',
          ).length;
          this.dashboardStats.completedOrders = this.orders.filter(
            (o) => o.status === 'Delivered',
          ).length;
        } else {
          this.orders = [];
          this.dashboardStats.totalOrders = 0;
          this.dashboardStats.pendingOrders = 0;
          this.dashboardStats.completedOrders = 0;
        }
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading orders:', err),
    });
  }

  updateOrderStatus(order: Order, newStatus: Order['status']): void {
    order.status = newStatus;
    this.cdr.markForCheck();
    const vendorId = this.getLoggedInVendorId();
    const url = `${this.ordersApiUrl}/items/${order.id}/status${vendorId ? '?vendorId=' + vendorId : ''}`;

    this.http.put(url, { status: newStatus }).subscribe({
      next: () => {
        this.showToast(`Order #${order.id} status updated to ${newStatus}`);
        this.loadAnalyticsFromDatabase();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to update order status:', err);
        this.showToast(`Order ${order.id} status updated`);
        this.cdr.markForCheck();
      },
    });
  }

  // ==================== INVENTORY MANAGEMENT ====================
  inventory: InventoryItem[] = [];

  updateStock(item: InventoryItem, value: number): void {
    if (value < 0) {
      this.showToast('Stock cannot be negative');
      return;
    }
    item.currentStock = value;
    item.status = value === 0 ? 'Out of Stock' : value <= item.minStock ? 'Low Stock' : 'Available';
    item.lastUpdated = new Date().toISOString().slice(0, 10);

    const prod = this.products.find((p) => p.name === item.product);
    if (prod) {
      prod.stock = value;
      prod.status = value === 0 ? 'Out of Stock' : 'Active';
      this.dashboardStats.activeProducts = this.products.filter(p => p.status === 'Active').length;
      this.dashboardStats.lowStockProducts = this.products.filter(p => p.stock > 0 && p.stock <= 10).length;
      this.cdr.markForCheck();

      this.http
        .put(`${this.productsApiUrl}/${prod.id}`, { stock: value, status: prod.status })
        .subscribe({
          next: () => {
            this.showToast(`Stock updated in MySQL for ${item.product}`);
            this.loadAnalyticsFromDatabase();
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Stock update failed:', err);
            this.cdr.markForCheck();
          },
        });
    } else {
      this.showToast(`Stock updated for ${item.product}`);
      this.cdr.markForCheck();
    }
  }

  // ==================== ANALYTICS MODULE ====================
  setAnalyticsRange(range: string): void {
    this.analyticsRange = range;
    this.loadAnalyticsFromDatabase();
    this.cdr.markForCheck();
  }

  loadAnalyticsFromDatabase(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    let url = `${this.analyticsApiUrl}/vendor/${vendorId}?range=${this.analyticsRange}`;
    if (this.selectedShopId) {
      url += `&shopId=${this.selectedShopId}`;
    }

    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.analyticsData = data;
        if (data) {
          this.dashboardStats.totalSales = data.totalRevenue || 0;
          this.dashboardStats.monthlyRevenue = data.monthlyRevenue || 0;
          this.dashboardStats.totalCustomers = data.totalCustomers || 0;
          if (data.salesTrends && data.salesTrends.length > 0) {
            this.salesOverview = data.salesTrends;
          }
          if (data.bestSellers && data.bestSellers.length > 0) {
            this.bestSellingProducts = data.bestSellers;
          }
        }
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading analytics:', err),
    });
  }

  exportOrdersCSV(): void {
    if (!this.orders.length) {
      this.showToast('No orders to export');
      return;
    }
    const headers = ['Order ID', 'Customer', 'Product', 'Quantity', 'Amount (INR)', 'Date', 'Status'];
    const rows = this.orders.map((o) => [
      o.id,
      `"${o.customer}"`,
      `"${o.product}"`,
      o.quantity,
      o.amount,
      o.date,
      o.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bazario_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Orders exported to CSV');
  }

  // ==================== CUSTOMERS MODULE ====================
  customers: CustomerSummary[] = [];
  customerSearch: string = '';
  customerStatusFilter: string = 'ALL';
  customerSortBy: string = 'recent';
  isLoadingCustomers: boolean = false;
  customerPage: number = 1;
  customerPageSize: number = 8;
  selectedCustomerDetail: CustomerDetail | null = null;
  isLoadingCustomerDetail: boolean = false;
  showCustomerDetailModal: boolean = false;

  loadCustomersFromDatabase(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    this.isLoadingCustomers = true;
    let url = `${this.customersApiUrl}/vendor/${vendorId}?sortBy=${this.customerSortBy}`;
    if (this.selectedShopId) {
      url += `&shopId=${this.selectedShopId}`;
    }
    if (this.customerSearch.trim()) {
      url += `&search=${encodeURIComponent(this.customerSearch.trim())}`;
    }
    if (this.customerStatusFilter !== 'ALL') {
      url += `&status=${encodeURIComponent(this.customerStatusFilter)}`;
    }

    this.http.get<CustomerSummary[]>(url).subscribe({
      next: (data) => {
        this.customers = data || [];
        this.isLoadingCustomers = false;
        this.customerPage = 1;
        this.dashboardStats.totalCustomers = this.customers.length;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
        this.isLoadingCustomers = false;
        this.customers = [];
        this.cdr.markForCheck();
      }
    });
  }

  viewCustomerDetails(customer: CustomerSummary): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    this.showCustomerDetailModal = true;
    this.isLoadingCustomerDetail = true;
    this.selectedCustomerDetail = null;

    let url = `${this.customersApiUrl}/vendor/${vendorId}/details?email=${encodeURIComponent(customer.customerEmail)}`;
    if (this.selectedShopId) {
      url += `&shopId=${this.selectedShopId}`;
    }

    this.http.get<CustomerDetail>(url).subscribe({
      next: (detail) => {
        this.selectedCustomerDetail = detail;
        this.isLoadingCustomerDetail = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load customer details:', err);
        this.isLoadingCustomerDetail = false;
        this.showToast('Could not load purchase details for this customer.');
        this.cdr.markForCheck();
      }
    });
  }

  closeCustomerDetailModal(): void {
    this.showCustomerDetailModal = false;
    this.selectedCustomerDetail = null;
    this.cdr.markForCheck();
  }

  get paginatedCustomers(): CustomerSummary[] {
    const start = (this.customerPage - 1) * this.customerPageSize;
    return this.customers.slice(start, start + this.customerPageSize);
  }

  get totalCustomerPages(): number {
    return Math.ceil(this.customers.length / this.customerPageSize) || 1;
  }

  setCustomerPage(p: number): void {
    if (p >= 1 && p <= this.totalCustomerPages) {
      this.customerPage = p;
      this.cdr.markForCheck();
    }
  }

  // ==================== REVIEWS & RATINGS MODULE ====================
  reviews: Review[] = [];
  reviewsSummary: ReviewSummary = {
    averageRating: 0.0,
    totalReviews: 0,
    count5: 0,
    count4: 0,
    count3: 0,
    count2: 0,
    count1: 0,
    percent5: 0,
    percent4: 0,
    percent3: 0,
    percent2: 0,
    percent1: 0,
    reviews: []
  };
  reviewStarFilter: number | null = null;
  reviewSearch: string = '';
  reviewSort: string = 'newest';
  isLoadingReviews: boolean = false;
  reviewPage: number = 1;
  reviewPageSize: number = 6;

  loadReviewsFromDatabase(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    this.isLoadingReviews = true;
    let url = `${this.reviewsApiUrl}/vendor/${vendorId}?sort=${this.reviewSort}`;
    if (this.selectedShopId) {
      url += `&shopId=${this.selectedShopId}`;
    }
    if (this.reviewStarFilter) {
      url += `&rating=${this.reviewStarFilter}`;
    }
    if (this.reviewSearch.trim()) {
      url += `&search=${encodeURIComponent(this.reviewSearch.trim())}`;
    }

    this.http.get<any>(url).subscribe({
      next: (data) => {
        if (data) {
          this.reviewsSummary = data;
          this.reviews = (data.reviews || []).map((r: any) => ({
            ...r,
            customer: r.customerName || r.customer || 'Customer',
            product: r.productName || r.product || 'Product',
            review: r.comment || r.review || '',
            date: r.createdAt ? r.createdAt.substring(0, 10) : (r.date || 'Today'),
            reply: r.vendorReply || r.reply || '',
            replyDraft: ''
          }));
        } else {
          this.reviews = [];
        }
        this.isLoadingReviews = false;
        this.reviewPage = 1;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        this.isLoadingReviews = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterReviewsByStar(star: number | null): void {
    this.reviewStarFilter = star;
    this.loadReviewsFromDatabase();
  }

  replyToReview(review: Review): void {
    if (!review.replyDraft?.trim()) {
      this.showToast('Write a reply before submitting');
      return;
    }

    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    const replyText = review.replyDraft.trim();
    this.http.post<any>(`${this.reviewsApiUrl}/${review.id}/reply?vendorId=${vendorId}`, { reply: replyText }).subscribe({
      next: (updated) => {
        review.reply = replyText;
        review.vendorReply = replyText;
        review.replyDraft = '';
        this.showToast('Reply posted to customer in MySQL!');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to post reply:', err);
        this.showToast('Failed to post reply. Please check connection.');
        this.cdr.markForCheck();
      }
    });
  }

  get paginatedReviews(): Review[] {
    const start = (this.reviewPage - 1) * this.reviewPageSize;
    return this.reviews.slice(start, start + this.reviewPageSize);
  }

  get totalReviewPages(): number {
    return Math.ceil(this.reviews.length / this.reviewPageSize) || 1;
  }

  setReviewPage(p: number): void {
    if (p >= 1 && p <= this.totalReviewPages) {
      this.reviewPage = p;
      this.cdr.markForCheck();
    }
  }

  // ==================== COUPONS & OFFERS MODULE ====================
  coupons: Coupon[] = [];
  couponStats: CouponStats = {
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    scheduledCoupons: 0,
    totalUsage: 0,
    totalDiscountGiven: 0,
    coupons: []
  };
  couponStatusFilter: string = 'ALL';
  couponTypeFilter: string = 'ALL';
  couponSearch: string = '';
  isLoadingCoupons: boolean = false;
  showCouponModal: boolean = false;
  editingCouponId: number | null = null;
  couponForm: Coupon = this.emptyCoupon();
  selectedCouponProducts: number[] = [];

  private emptyCoupon(): Coupon {
    return {
      id: 0,
      code: '',
      title: '',
      description: '',
      discount: 10,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrder: 0,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      startDate: new Date().toISOString().substring(0, 10),
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      maxUsageLimit: 100,
      perCustomerUsageLimit: 1,
      applicableProductsType: 'ALL',
      applicableProductIds: '',
      status: 'Active',
      shopId: this.selectedShopId || (this.shops[0]?.id || 0),
    };
  }

  loadCouponsFromDatabase(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    this.isLoadingCoupons = true;
    let url = `${this.couponsApiUrl}/vendor/${vendorId}`;
    if (this.selectedShopId) {
      url += `?shopId=${this.selectedShopId}`;
    }

    this.http.get<any>(url).subscribe({
      next: (data) => {
        if (data) {
          this.couponStats = data;
          this.coupons = (data.coupons || []).map((c: any) => ({
            ...c,
            discount: c.discountValue || c.discount || 0,
            minOrder: c.minOrderAmount || c.minOrder || 0,
            status: c.status || 'Active'
          }));
        } else {
          this.coupons = [];
        }
        this.isLoadingCoupons = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load coupons:', err);
        this.isLoadingCoupons = false;
        this.cdr.markForCheck();
      }
    });
  }

  addCoupon(): void {
    this.editingCouponId = null;
    this.couponForm = this.emptyCoupon();
    if (this.selectedShopId) {
      this.couponForm.shopId = this.selectedShopId;
    } else if (this.shops.length > 0) {
      this.couponForm.shopId = this.shops[0].id;
    }
    this.selectedCouponProducts = [];
    this.showCouponModal = true;
    this.cdr.markForCheck();
  }

  editCoupon(coupon: Coupon): void {
    this.editingCouponId = coupon.id;
    this.couponForm = {
      ...coupon,
      discountValue: coupon.discountValue || coupon.discount || 0,
      minOrderAmount: coupon.minOrderAmount || coupon.minOrder || 0,
      discountType: coupon.discountType || 'PERCENTAGE',
      applicableProductsType: coupon.applicableProductsType || 'ALL',
      startDate: coupon.startDate ? coupon.startDate.substring(0, 10) : '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.substring(0, 10) : '',
    };
    this.selectedCouponProducts = [];
    if (coupon.applicableProductIds) {
      this.selectedCouponProducts = coupon.applicableProductIds.split(',')
        .map(id => Number(id.trim()))
        .filter(id => !isNaN(id));
    }
    this.showCouponModal = true;
    this.cdr.markForCheck();
  }

  toggleProductForCoupon(prodId: number): void {
    const idx = this.selectedCouponProducts.indexOf(prodId);
    if (idx >= 0) {
      this.selectedCouponProducts.splice(idx, 1);
    } else {
      this.selectedCouponProducts.push(prodId);
    }
  }

  saveCoupon(): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    if (!this.couponForm.code.trim()) {
      this.showToast('Coupon code is required');
      return;
    }
    const targetShopId = this.couponForm.shopId || this.selectedShopId || (this.shops.length > 0 ? this.shops[0].id : null);
    if (!targetShopId) {
      this.showToast('Please select a shop for this coupon');
      return;
    }

    const payload: any = {
      code: this.couponForm.code.trim().toUpperCase(),
      title: this.couponForm.title || `${this.couponForm.code.trim().toUpperCase()} Promo`,
      description: this.couponForm.description || '',
      discountType: this.couponForm.discountType || 'PERCENTAGE',
      discountValue: Number(this.couponForm.discountValue || this.couponForm.discount) || 0,
      minOrderAmount: Number(this.couponForm.minOrderAmount || this.couponForm.minOrder) || 0,
      maxDiscountAmount: this.couponForm.maxDiscountAmount ? Number(this.couponForm.maxDiscountAmount) : null,
      startDate: this.couponForm.startDate || null,
      expiryDate: this.couponForm.expiryDate || null,
      maxUsageLimit: this.couponForm.maxUsageLimit ? Number(this.couponForm.maxUsageLimit) : null,
      perCustomerUsageLimit: Number(this.couponForm.perCustomerUsageLimit) || 1,
      applicableProductsType: this.couponForm.applicableProductsType || 'ALL',
      applicableProductIds: this.couponForm.applicableProductsType === 'SPECIFIC' ? this.selectedCouponProducts.join(',') : null,
      status: this.couponForm.status || 'Active'
    };

    if (this.editingCouponId !== null) {
      this.http.put<any>(`${this.couponsApiUrl}/${this.editingCouponId}?vendorId=${vendorId}`, payload).subscribe({
        next: (updated) => {
          this.showToast(`Coupon ${payload.code} updated in MySQL!`);
          this.showCouponModal = false;
          this.loadCouponsFromDatabase();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to update coupon:', err);
          const msg = typeof err.error === 'string' ? err.error : 'Failed to update coupon';
          this.showToast(msg);
          this.cdr.markForCheck();
        }
      });
    } else {
      this.http.post<any>(`${this.couponsApiUrl}/vendor/${vendorId}?shopId=${targetShopId}`, payload).subscribe({
        next: (created) => {
          this.showToast(`Coupon ${payload.code} created successfully!`);
          this.showCouponModal = false;
          const mapped: Coupon = {
            ...created,
            discount: created.discountValue || payload.discountValue,
            minOrder: created.minOrderAmount || payload.minOrderAmount,
            status: created.status || 'Active'
          };
          this.coupons = [mapped, ...this.coupons.filter(c => c.id !== mapped.id)];
          this.couponStats.totalCoupons = this.coupons.length;
          this.couponStats.activeCoupons = this.coupons.filter(c => c.status === 'Active').length;
          this.cdr.markForCheck();
          this.loadCouponsFromDatabase();
        },
        error: (err) => {
          console.error('Failed to create coupon:', err);
          const msg = typeof err.error === 'string' ? err.error : 'Failed to create coupon';
          this.showToast(msg);
          this.cdr.markForCheck();
        }
      });
    }
  }

  toggleCouponStatus(coupon: Coupon): void {
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) return;

    this.http.put<any>(`${this.couponsApiUrl}/${coupon.id}/status?vendorId=${vendorId}`, {}).subscribe({
      next: (updated) => {
        coupon.status = updated.status;
        this.showToast(`${coupon.code} is now ${coupon.status}`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to toggle coupon status:', err);
        coupon.status = coupon.status === 'Active' ? 'Disabled' : 'Active';
        this.cdr.markForCheck();
      }
    });
  }

  closeCouponModal(): void {
    this.showCouponModal = false;
    this.cdr.markForCheck();
  }

  deleteCoupon(coupon: Coupon): void {
    this.confirmTarget = { type: 'coupon', id: coupon.id, name: coupon.code };
  }

  get filteredCouponsList(): Coupon[] {
    return this.coupons.filter(c => {
      const matchSearch = !this.couponSearch.trim() ||
        c.code.toLowerCase().includes(this.couponSearch.trim().toLowerCase()) ||
        (c.title && c.title.toLowerCase().includes(this.couponSearch.trim().toLowerCase()));

      const matchStatus = this.couponStatusFilter === 'ALL' ||
        c.status.toUpperCase() === this.couponStatusFilter.toUpperCase();

      const matchType = this.couponTypeFilter === 'ALL' ||
        (c.discountType && c.discountType.toUpperCase() === this.couponTypeFilter.toUpperCase());

      return matchSearch && matchStatus && matchType;
    });
  }

  // ==================== AI ASSISTANT MODULE (12 FAQS) ====================
  aiInsights = {
    salesGrowth: '+24%',
    bestSeller: 'Wireless Gaming Headphones',
    slowMover: 'Badam',
  };

  faqDatabase = [
    {
      q: 'How can I create a new shop?',
      a: 'Open the My Shops section, click Create Shop, enter your shop details and submit. Your shop will be created after successful validation.'
    },
    {
      q: 'How can I add a new product?',
      a: 'Open the Products section, select your shop, click Add Product, enter product details, upload product images and save. Your product will appear in your product list after successful creation.'
    },
    {
      q: 'How can I manage my orders?',
      a: 'Open the Orders section to view incoming orders, customer details, payment status and delivery information. Update order status according to the actual order workflow.'
    },
    {
      q: 'How can I update product stock?',
      a: 'Go to Inventory, find your product and update its available stock quantity. Make sure the stock reflects your actual inventory.'
    },
    {
      q: 'How can I create a discount coupon?',
      a: 'Open Coupons & Offers, click Create Coupon, enter the coupon code, discount type, discount amount, validity and applicable products, then save it.'
    },
    {
      q: 'How can customers use my coupons?',
      a: 'Customers can enter a valid coupon code during checkout. The system verifies its validity and applicable products before applying the discount.'
    },
    {
      q: 'Where can I see my customers?',
      a: 'Open the Customers section to see customers who have purchased products from your shop. You can view their order history and purchase details.'
    },
    {
      q: 'Where can I see customer reviews and ratings?',
      a: 'Open Reviews & Ratings to see actual customer feedback, star ratings and comments about your shop and products.'
    },
    {
      q: 'How can I improve my shop rating?',
      a: 'Maintain good product quality, provide accurate product descriptions, process orders on time, maintain proper stock and provide excellent customer service.'
    },
    {
      q: 'How can I check my sales and earnings?',
      a: 'Open Sales & Earnings to view available sales statistics, order information and earnings based on actual completed transactions and the marketplace\'s existing payment calculation rules.'
    },
    {
      q: 'How can I update my shop information?',
      a: 'Open Profile or My Shops, select the shop you want to update and edit its available details. Save the changes to update your shop information.'
    },
    {
      q: 'What should I do if a product is not appearing in my shop?',
      a: 'First check whether the product was saved successfully, whether it belongs to the currently selected shop, and whether its status allows it to be displayed. If the issue continues, check the product API response or contact the platform administrator.'
    }
  ];

  chatMessages: ChatMessage[] = [
    {
      sender: 'ai',
      text: 'Hello! I am your Bazario AI Assistant. Click on any of the 12 questions below or ask me any question about running your Seller Studio.'
    }
  ];

  chatInput: string = '';

  askAI(question?: string): void {
    const query = (question ?? this.chatInput).trim();
    if (!query) return;

    this.chatMessages.push({ sender: 'vendor', text: query });
    this.chatInput = '';
    this.cdr.markForCheck();

    // Check exact match in the 12 FAQs
    const exact = this.faqDatabase.find(f => f.q.toLowerCase() === query.toLowerCase());
    if (exact) {
      setTimeout(() => {
        this.chatMessages.push({ sender: 'ai', text: exact.a });
        this.cdr.markForCheck();
      }, 200);
      return;
    }

    // Keyword matching
    const qLower = query.toLowerCase();
    const partial = this.faqDatabase.find(f => {
      const words = f.q.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
      return words.filter(w => w.length > 3).some(w => qLower.includes(w));
    });

    if (partial) {
      setTimeout(() => {
        this.chatMessages.push({ sender: 'ai', text: partial.a });
        this.cdr.markForCheck();
      }, 250);
      return;
    }

    // Friendly fallback
    setTimeout(() => {
      this.chatMessages.push({
        sender: 'ai',
        text: 'I am your Bazario Seller Studio assistant. I specialize in answering store setup, product creation, stock updates, order processing, and customer retention questions. Please select one of the 12 questions above for instant guidance!'
      });
      this.cdr.markForCheck();
    }, 250);
  }

  clearChat(): void {
    this.chatMessages = [
      {
        sender: 'ai',
        text: 'Hello! I am your Bazario AI Assistant. Click on any of the 12 questions below or ask me any question about running your Seller Studio.'
      }
    ];
    this.showToast('Chat cleared');
    this.cdr.markForCheck();
  }

  // ===== NOTIFICATIONS =====
  notifications: NotificationItem[] = [
    {
      id: 1,
      type: 'New Order',
      message: 'New order item assigned to your shop.',
      time: '15 min ago',
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
    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) {
      this.showToast('No logged in vendor found');
      return;
    }

    this.isEditingProfile = false;
    this.accountForm = { ...this.profileDraft };
    this.http.put<any>(`${this.vendorsApiUrl}/${vendorId}`, this.profileDraft).subscribe({
      next: (updated) => {
        this.vendorProfile = {
          shopName: updated.shopName || this.profileDraft.shopName,
          ownerName: updated.ownerName || this.profileDraft.ownerName || this.vendorProfile.ownerName,
          email: updated.email || this.profileDraft.email,
          phone: updated.phone || this.profileDraft.phone,
          address: updated.address || this.profileDraft.address,
          description: updated.description || this.profileDraft.description,
        };
        this.vendorName = this.vendorProfile.shopName;
        this.accountForm = { ...this.vendorProfile };
        this.showToast('Profile updated successfully in MySQL!');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        const msg = typeof err.error === 'string' ? err.error : 'Failed to update profile';
        this.showToast(msg);
        this.cdr.markForCheck();
      },
    });
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
    if (this.passwordForm.next.length < 6) {
      this.showToast('New password must be at least 6 characters long');
      return;
    }
    if (this.passwordForm.next !== this.passwordForm.confirm) {
      this.showToast('New passwords do not match');
      return;
    }

    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) {
      this.showToast('No logged in vendor found');
      return;
    }

    this.http.put<any>(`${this.vendorsApiUrl}/${vendorId}/password`, {
      currentPassword: this.passwordForm.current,
      newPassword: this.passwordForm.next,
    }).subscribe({
      next: () => {
        this.showPasswordFields = false;
        this.passwordForm = { current: '', next: '', confirm: '' };
        this.showToast('Password changed successfully in MySQL!');
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to change password:', err);
        const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to change password');
        this.showToast(msg);
        this.cdr.markForCheck();
      },
    });
  }

  // ==================== THEME & APPEARANCE ====================
  initTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('bazario_theme_mode') as 'light' | 'dark' | 'system' | null;
    this.applyTheme(saved || 'light');
  }

  applyTheme(mode: 'light' | 'dark' | 'system'): void {
    this.themeMode = mode;
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem('bazario_theme_mode', mode);

    if (mode === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = prefersDark;
    } else {
      this.isDarkMode = mode === 'dark';
    }

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
    }

    this.cdr.markForCheck();
  }

  toggleTheme(): void {
    const nextMode = this.isDarkMode ? 'light' : 'dark';
    this.applyTheme(nextMode);
    this.showToast(this.isDarkMode ? '🌙 Dark Mode activated' : '☀️ Light Mode activated');
  }

  // ==================== SETTINGS MODULE ====================
  selectSettingsTab(tab: 'account' | 'appearance' | 'notifications' | 'security' | 'preferences'): void {
    this.settingsTab = tab;
    this.cdr.markForCheck();
  }

  loadSettingsPreferences(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const storedNotifs = localStorage.getItem('bazario_vendor_notifications');
    if (storedNotifs) {
      try {
        this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(storedNotifs) };
      } catch (e) {
        console.error('Failed to parse notification preferences:', e);
      }
    }

    const defaultShop = localStorage.getItem('bazario_default_shop_id');
    if (defaultShop && defaultShop !== 'null') {
      this.shopPreferences.defaultShopId = Number(defaultShop);
    }
  }

  saveAccountSettings(): void {
    if (this.isSavingAccount) return;

    if (!this.accountForm.shopName || !this.accountForm.shopName.trim()) {
      this.showToast('Shop / Account name is required');
      return;
    }
    if (!this.accountForm.email || !this.accountForm.email.includes('@')) {
      this.showToast('Please provide a valid email address');
      return;
    }

    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) {
      this.showToast('Vendor login not found');
      return;
    }

    this.isSavingAccount = true;
    this.http.put<any>(`${this.vendorsApiUrl}/${vendorId}`, this.accountForm).subscribe({
      next: (updated) => {
        this.isSavingAccount = false;
        this.vendorProfile = {
          shopName: updated.shopName || this.accountForm.shopName,
          ownerName: updated.ownerName || this.accountForm.ownerName,
          email: updated.email || this.accountForm.email,
          phone: updated.phone || this.accountForm.phone,
          address: updated.address || this.accountForm.address,
          description: updated.description || this.accountForm.description,
        };
        this.vendorName = this.vendorProfile.shopName;
        this.profileDraft = { ...this.vendorProfile };
        this.showToast('Account settings updated successfully in MySQL!');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSavingAccount = false;
        console.error('Failed to save account settings:', err);
        const msg = typeof err.error === 'string' ? err.error : 'Failed to update account settings';
        this.showToast(msg);
        this.cdr.markForCheck();
      },
    });
  }

  resetAccountForm(): void {
    this.accountForm = { ...this.vendorProfile };
    this.showToast('Form reset to current profile values');
    this.cdr.markForCheck();
  }

  saveNotificationPreferences(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('bazario_vendor_notifications', JSON.stringify(this.notificationSettings));
    this.showToast('Notification preference saved!');
    this.cdr.markForCheck();
  }

  changeSecurityPassword(): void {
    if (this.isChangingPassword) return;

    if (!this.securityForm.currentPassword) {
      this.showToast('Please enter your current password');
      return;
    }
    if (!this.securityForm.newPassword || this.securityForm.newPassword.length < 6) {
      this.showToast('New password must be at least 6 characters');
      return;
    }
    if (this.securityForm.newPassword !== this.securityForm.confirmPassword) {
      this.showToast('New password and confirmation do not match');
      return;
    }
    if (this.securityForm.currentPassword === this.securityForm.newPassword) {
      this.showToast('New password must be different from current password');
      return;
    }

    const vendorId = this.getLoggedInVendorId();
    if (!vendorId) {
      this.showToast('Vendor login not found');
      return;
    }

    this.isChangingPassword = true;
    this.http.put<any>(`${this.vendorsApiUrl}/${vendorId}/password`, {
      currentPassword: this.securityForm.currentPassword,
      newPassword: this.securityForm.newPassword,
    }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.securityForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showCurrent: false,
          showNew: false,
          showConfirm: false,
        };
        this.showToast('Password updated successfully in database!');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isChangingPassword = false;
        console.error('Failed to change password:', err);
        const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Failed to update password');
        this.showToast(msg);
        this.cdr.markForCheck();
      },
    });
  }

  saveShopPreferences(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('bazario_default_shop_id', String(this.shopPreferences.defaultShopId));
      if (this.shopPreferences.defaultShopId !== null) {
        this.selectedShopId = this.shopPreferences.defaultShopId;
        localStorage.setItem('bazario_selected_shop_id', String(this.shopPreferences.defaultShopId));
        this.loadProductsFromDatabase();
      }
    }
    this.showToast('Storefront preferences saved!');
    this.cdr.markForCheck();
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
