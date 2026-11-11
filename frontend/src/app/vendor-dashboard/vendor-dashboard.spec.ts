import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { VendorDashboard, VendorShop } from './vendor-dashboard';

describe('VendorDashboard', () => {
  let component: VendorDashboard;
  let fixture: ComponentFixture<VendorDashboard>;

  const mockShops: VendorShop[] = [
    {
      id: 1,
      shopName: 'Alpha Electronics',
      ownerName: 'Alice Sharma',
      email: 'alice@alpha.in',
      phone: '9876543210',
      category: 'Electronics',
      address: 'Shop 101, Tech Park, Bengaluru',
      description: 'Laptops and smartphones store',
      logo: '📱',
      banner: '',
      status: 'Active',
    },
    {
      id: 2,
      shopName: 'Beta Organics',
      ownerName: 'Bob Patel',
      email: 'bob@beta.in',
      phone: '9876543211',
      category: 'Grocery & Organic',
      address: 'Shop 202, Green Lane, Mumbai',
      description: 'Fresh organic groceries and spices',
      logo: '🥦',
      banner: '',
      status: 'Inactive',
    },
    {
      id: 3,
      shopName: 'Gamma Apparel',
      ownerName: 'Charlie Rao',
      email: 'charlie@gamma.in',
      phone: '9876543212',
      category: 'Fashion',
      address: 'Shop 303, Silk Street, Delhi',
      description: 'Premium clothing and accessories',
      logo: '👗',
      banner: '',
      status: 'Suspended',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDashboard],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default shop name as All Shops (Combined) when no shop is selected', () => {
    component.selectedShopId = null;
    expect(component.selectedShopName).toBe('All Shops (Combined)');
  });

  it('should filter products correctly by search keyword', () => {
    component.products = [
      { id: 1, name: 'Premium Badam', category: 'Grocery', description: '', price: 100, discount: 0, stock: 50, image: '', status: 'Active' },
      { id: 2, name: 'Cricket Bat', category: 'Sports', description: '', price: 500, discount: 0, stock: 20, image: '', status: 'Active' },
    ];
    component.searchTerm = 'Badam';
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].name).toBe('Premium Badam');
  });

  describe('My Shops Buttons & Controls', () => {
    beforeEach(() => {
      component.shops = [...mockShops];
      component.resetShopFilters();
    });

    it('should open create shop modal when addShop is called', () => {
      expect(component.showShopModal).toBe(false);
      component.addShop();
      expect(component.showShopModal).toBe(true);
      expect(component.editingShopId).toBeNull();
      expect(component.shopForm.shopName).toBe('');
      expect(component.shopForm.status).toBe('Active');
    });

    it('should open edit shop modal with populated details when editShop is called', () => {
      expect(component.showShopModal).toBe(false);
      component.editShop(mockShops[0]);
      expect(component.showShopModal).toBe(true);
      expect(component.editingShopId).toBe(1);
      expect(component.shopForm.shopName).toBe('Alpha Electronics');
      expect(component.shopForm.ownerName).toBe('Alice Sharma');
      expect(component.shopForm.email).toBe('alice@alpha.in');
    });

    it('should close shop modal and reset form when closeShopModal is called', () => {
      component.editShop(mockShops[0]);
      expect(component.showShopModal).toBe(true);
      component.closeShopModal();
      expect(component.showShopModal).toBe(false);
      expect(component.editingShopId).toBeNull();
    });

    it('should search shops by name, category, or owner in real-time', () => {
      component.shopSearchQuery = 'Alpha';
      expect(component.filteredShops.length).toBe(1);
      expect(component.filteredShops[0].shopName).toBe('Alpha Electronics');

      component.shopSearchQuery = 'organics';
      expect(component.filteredShops.length).toBe(1);
      expect(component.filteredShops[0].shopName).toBe('Beta Organics');

      component.shopSearchQuery = 'Charlie';
      expect(component.filteredShops.length).toBe(1);
      expect(component.filteredShops[0].shopName).toBe('Gamma Apparel');
    });

    it('should filter shops by status (Active, Inactive, Suspended)', () => {
      component.setShopStatusFilter('Active');
      expect(component.filteredShops.length).toBe(1);
      expect(component.filteredShops[0].shopName).toBe('Alpha Electronics');

      component.setShopStatusFilter('Inactive');
      expect(component.filteredShops.length).toBe(1);
      expect(component.filteredShops[0].shopName).toBe('Beta Organics');

      component.setShopStatusFilter('Suspended');
      expect(component.filteredShops.length).toBe(1);
      expect(component.filteredShops[0].shopName).toBe('Gamma Apparel');

      component.setShopStatusFilter('All');
      expect(component.filteredShops.length).toBe(3);
    });

    it('should filter shops by category', () => {
      component.setShopCategoryFilter('Fashion');
      expect(component.filteredShops.length).toBe(1);
      expect(component.filteredShops[0].shopName).toBe('Gamma Apparel');

      component.setShopCategoryFilter('Electronics');
      expect(component.filteredShops.length).toBe(1);
      expect(component.filteredShops[0].shopName).toBe('Alpha Electronics');
    });

    it('should sort shops correctly (name-asc, name-desc, newest, oldest, status)', () => {
      component.setShopSort('name-asc');
      expect(component.filteredShops[0].shopName).toBe('Alpha Electronics');
      expect(component.filteredShops[2].shopName).toBe('Gamma Apparel');

      component.setShopSort('name-desc');
      expect(component.filteredShops[0].shopName).toBe('Gamma Apparel');
      expect(component.filteredShops[2].shopName).toBe('Alpha Electronics');

      component.setShopSort('oldest');
      expect(component.filteredShops[0].id).toBe(1);
      expect(component.filteredShops[2].id).toBe(3);

      component.setShopSort('newest');
      expect(component.filteredShops[0].id).toBe(3);
      expect(component.filteredShops[2].id).toBe(1);
    });

    it('should reset all shop filters when resetShopFilters is called', () => {
      component.shopSearchQuery = 'Alpha';
      component.shopStatusFilter = 'Active';
      component.shopCategoryFilter = 'Electronics';
      component.shopSortBy = 'name-desc';
      expect(component.hasActiveShopFilters).toBe(true);

      component.resetShopFilters();
      expect(component.shopSearchQuery).toBe('');
      expect(component.shopStatusFilter).toBe('All');
      expect(component.shopCategoryFilter).toBe('All');
      expect(component.shopSortBy).toBe('newest');
      expect(component.hasActiveShopFilters).toBe(false);
      expect(component.filteredShops.length).toBe(3);
    });
  });
});
